const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middlewares/auth');
const { sendMail } = require('../utils/mailer');


/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Réserver un service (client uniquement)
 *     tags: [Réservations]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required: [serviceId, date]
 *             properties:
 *               serviceId: { type: integer }
 *               date: { type: string, example: "2025-07-01T10:00:00.000Z" }
 *     responses:
 *       200: { description: Réservation créée }
 *       400: { description: Créneau indisponible ou données manquantes }
 */


router.post('/', authMiddleware(['CLIENT']), async (req, res) => {
  const { serviceId, date } = req.body;

  try {
    // 1. Analyse date
    const parsedDate = new Date(date);
    const hour = parsedDate.toTimeString().substring(0, 5); // HH:MM
    const day = parsedDate.getDay(); // 0 = dimanche, 1 = lundi, ...

    console.log(" Requête reçue pour réservation");
    console.log(" serviceId :", serviceId);
    console.log(" date envoyée :", date);
    console.log(" Date interprétée (locale) :", parsedDate.toLocaleString());
    console.log(" Heure extraite :", hour);
    console.log(" Jour de la semaine :", day);

    // 2. Récupère le service
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        coiffeur: true,
        bookings: true,
        reviews: true
      }
    });

    if (!service) {
      return res.status(404).json({ error: "Service introuvable" });
    }

    console.log(" Service trouvé :", service?.id, "| CoiffeurId :", service?.coiffeurId);
      // Limite à 10 réservations pour les coiffeurs FREE
    if (service.coiffeur.subscriptionType === "FREE") {
      const count = await prisma.booking.count({
        where: {
          service: {
            coiffeurId: service.coiffeurId
          }
        }
      });

      if (count >= 10) {
        return res.status(403).json({
          error: "Limite atteinte pour l’abonnement FREE. Passez à Pro ou VIP."
        });
      }
    }

    // 3. Vérifie les créneaux spécifiques
    const specific = await prisma.specificAvailability.findFirst({
      where: {
        coiffeurId: service.coiffeurId,
        date: new Date(parsedDate.toDateString()),
        startTime: { lte: hour },
        endTime: { gte: hour }
      }
    });

    // 4. Sinon, vérifie les créneaux classiques
    let available = null;

    if (!specific) {
      available = await prisma.availability.findFirst({
        where: {
          coiffeurId: service.coiffeurId,
          dayOfWeek: day,
          startTime: { lte: hour },
          endTime: { gte: hour }
        }
      });

      if (!available) {
        console.log(" Refus de réservation :", {
          raison: "Aucune disponibilité trouvée",
          date,
          serviceId
        });
        return res.status(400).json({
          error: "Ce créneau horaire n'est pas disponible pour ce coiffeur."
        });
      }
    }

    // 5. OK, crée la réservation
    const booking = await prisma.booking.create({
      data: {
        serviceId,
        clientId: req.user.userId,
        date: parsedDate,
        status: 'PENDING'
      }
    });

    console.log(" Réservation enregistrée :", booking);

    // 6. Envoie les emails
    await sendMail({
      to: req.user.email,
      subject: "Réservation reçue",
      html: `<p>Merci pour votre réservation du ${parsedDate.toLocaleString()} !</p>`
    });

    await sendMail({
      to: process.env.MAIL_USER,
      subject: "Nouvelle réservation",
      html: `<p>Le client ${req.user.email} a réservé pour le ${parsedDate.toLocaleString()}.</p>`
    });

    res.json(booking);

  } catch (err) {
    console.error(" Erreur lors de la réservation :", err);
    res.status(500).json({ error: "Erreur lors de la réservation" });
  }

});

router.put('/:id/validate', authMiddleware(['MODERATEUR']), async (req, res) => {
    const { id } = req.params;
    try {
        const booking = await prisma.booking.update({
            where: { id: parseInt(id) },
            data: { status: 'VALIDATED' }
        });
        res.json({ message: 'Réservation validée', booking });
    } catch {
        res.status(404).json({ error: "Réservation introuvable"});
    }

    await sendMail({
        to: booking.client.email,
        subject: 'Réservation validée ',
        html: `<p>Votre réservation du ${booking.date.toLocaleString()} a été validée par le modérateur.</p>`
        });
});

router.put('/:id/refuse', authMiddleware(['MODERATEUR']), async (req, res) => {
    const { id } = req.params;
    try {
        const booking = await prisma.booking.update({
            where: { id: parseInt(id) },
            data: { status: 'REFUSED' }
        });
        res.json({ message: 'Réservation refusée', booking });
    } catch {
        res.status(404).json({ error: "Réservation introuvable" });
    }
});

router.get('/me', authMiddleware(['CLIENT']), async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { clientId: req.user.userId },
      include: { service: true },
      orderBy: { date: 'desc' }
    });
    res.json(bookings);
  } catch (err) {
    console.error("Erreur chargement réservations:", err); // 
    res.status(500).json({ error: 'Erreur chargement réservations' });
  }
});


router.delete('/:id', authMiddleware(['CLIENT']), async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
    });

    // Vérifie que l'utilisateur est bien le propriétaire
    if (!booking || booking.clientId !== req.user.userId) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    // Supprimer seulement si non validée
    if (booking.status !== 'PENDING') {
      return res.status(400).json({ error: "Impossible d’annuler une réservation déjà validée ou refusée." });
    }

    await prisma.booking.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Réservation annulée" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l’annulation" });
  }
});

router.get('/pending', authMiddleware(['MODERATEUR']), async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { status: 'PENDING' },
      orderBy: { date: 'asc' },
      include: {
        service: true,
        client: true
      }
    });

    res.json(bookings);
  } catch {
    res.status(500).json({ error: 'Erreur chargement réservations' });
  }
});

module.exports = router;