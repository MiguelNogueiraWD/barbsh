const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middlewares/auth');


/**
 * @swagger
 * /services:
 *   post:
 *     summary: Créer un nouveau service (réservé aux coiffeurs)
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - duration
 *               - location
 *               - city
 *             properties:
 *               title:
 *                 type: string
 *                 example: Coupe homme
 *               description:
 *                 type: string
 *                 example: Coupe classique, dégradé ou personnalisé
 *               price:
 *                 type: number
 *                 example: 25
 *               duration:
 *                 type: integer
 *                 example: 30
 *               location:
 *                 type: string
 *                 enum: [SALON, DOMICILE, LES_DEUX]
 *                 example: SALON
 *               city:
 *                 type: string
 *                 example: Paris
 *     responses:
 *       200:
 *         description: Service créé avec succès
 *       401:
 *         description: Accès non autorisé
 *       400:
 *         description: Données invalides
 */


// POST /services (Coiffeur uniquement)
router.post('/', authMiddleware(['COIFFEUR']), async (req, res) => {
  const { title, description, price, duration, location, city, zipcode } = req.body;

  try {
    const service = await prisma.service.create({
      data: {
        title,
        description,
        price,
        duration,
        location,
        city,
        zipcode,
        coiffeurId: req.user.userId
      }
    });

    res.json(service);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la création du service." });
  }
});


/**
 * @swagger
 * /services:
 *   get:
 *     summary: Obtenir la liste des services disponibles
 *     tags:
 *       - Services
 *     responses:
 *       200:
 *         description: Liste des services retournée
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   duration:
 *                     type: integer
 *                   location:
 *                     type: string
 *                     enum: [SALON, DOMICILE, LES_DEUX]
 *                   city:
 *                     type: string
 */


// GET /services
router.get('/', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      include: { coiffeur: true },
    });

    const ordered = services.sort((a, b) => {
      const rank = { VIP: 0, PRO: 1, FREE: 2 };
      return rank[a.coiffeur.subscriptionType] - rank[b.coiffeur.subscriptionType];
    });

    res.json(ordered);
  } catch {
    res.status(500).json({ error: "Erreur chargement services" });
  }
});


router.get('/search', async (req, res) => {
  const { city, maxPrice, location } = req.query;

  const filters = {};

  if (city) filters.city = { contains: city, mode: 'insensitive' };
  if (maxPrice) filters.price = { lte: parseFloat(maxPrice) };
  if (location) filters.location = location;

  try {
    const results = await prisma.service.findMany({
      where: filters,
      include: { coiffeur: true }
    });

router.get('/:id/ratings', async (req, res) => {
    const serviceId = parseInt(req.params.id);
    const reviews = await prisma.review.findMany({
        where: { serviceId }
    });

    const count = reviews.length;
    const average = count > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / count
        : 0;

    res.json({ serviceId, average: Number(average.toFixed(1)), count });
});

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
});

// Obtenir les créneaux disponibles pour un service donné à une date
router.get('/:id/slots', async (req, res) => {
  const serviceId = parseInt(req.params.id);
  const dateParam = req.query.date; // YYYY-MM-DD

  if (!dateParam) return res.status(400).json({ error: "Date requise" });

  const parsedDate = new Date(dateParam);
  const day = parsedDate.getDay(); // 0 (dimanche) → 6 (samedi)
  const dateOnly = new Date(parsedDate.toDateString()); // reset time

  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) return res.status(404).json({ error: "Service introuvable" });

    const duration = service.duration;
    const coiffeurId = service.coiffeurId;

    // 1. Créneaux spécifiques
    const specific = await prisma.specificAvailability.findMany({
      where: {
        coiffeurId,
        date: dateOnly
      }
    });

    // 2. Ou créneaux classiques
    let availableSlots = [];

    if (specific.length > 0) {
      availableSlots = specific.map(slot => ({
        start: slot.startTime,
        end: slot.endTime
      }));
    } else {
      const general = await prisma.availability.findMany({
        where: {
          coiffeurId,
          dayOfWeek: day
        }
      });
      availableSlots = general.map(slot => ({
        start: slot.startTime,
        end: slot.endTime
      }));
    }

    // 3. Créneaux déjà réservés
    const existing = await prisma.booking.findMany({
      where: {
        serviceId,
        date: {
          gte: new Date(dateOnly),
          lt: new Date(dateOnly.getTime() + 86400000) // +1 jour
        },
        status: { in: ['PENDING', 'VALIDATED'] }
      }
    });

    const reservedTimes = existing.map(b => b.date.toISOString().substring(11, 16)); // HH:MM

    // 4. Génère les créneaux de réservation disponibles
    const slots = [];

    for (const range of availableSlots) {
      const [startH, startM] = range.start.split(':').map(Number);
      const [endH, endM] = range.end.split(':').map(Number);

      let start = new Date(dateOnly);
      start.setHours(startH, startM, 0);

      const end = new Date(dateOnly);
      end.setHours(endH, endM, 0);

      while (start < end) {
        const timeStr = start.toTimeString().substring(0, 5); // HH:MM

        if (!reservedTimes.includes(timeStr)) {
          slots.push(timeStr);
        }

        start = new Date(start.getTime() + duration * 60000);
      }
    }

    res.json({ date: dateParam, slots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur chargement créneaux" });
  }
});

/**
 * Calcule la distance entre deux points (Haversine)
 */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon terrestre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Route GET /services/nearby?lat=...&lng=...&radius=...
 */
router.get('/nearby', async (req, res) => {
  const { lat, lng, radius = 10 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Position requise" });
  }

  const all = await prisma.service.findMany({
    where: {
      lat: { not: null },
      lng: { not: null }
    },
    include: { coiffeur: true }
  });

  const filtered = all.filter(s =>
    haversine(lat, lng, s.lat, s.lng) <= radius
  );

  res.json(filtered);
});

module.exports = router;
