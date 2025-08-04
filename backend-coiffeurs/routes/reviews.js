const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middlewares/auth');


/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Laisser un avis sur un service
 *     tags: [Avis]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required: [serviceId, rating]
 *             properties:
 *               serviceId: { type: integer }
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       200: { description: Avis enregistré }
 *       403: { description: Réservation non validée }
 */


// Créer un avis (client uniquement)
router.post('/', authMiddleware(['CLIENT']), async (req, res) => {
  const { serviceId, rating, comment } = req.body;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Note invalide (1 à 5)" });
  }

  try {
    // Vérifie que le client a une réservation validée pour ce service
    const booking = await prisma.booking.findFirst({
      where: {
        clientId: req.user.userId,
        serviceId,
        status: 'VALIDATED'
      }
    });

    if (!booking) {
      return res.status(403).json({ error: "Vous devez avoir réservé ce service pour laisser un avis." });
    }

    // Vérifie qu'il n'a pas déjà noté ce service
    const existing = await prisma.review.findFirst({
      where: {
        clientId: req.user.userId,
        serviceId
      }
    });

    if (existing) {
      return res.status(409).json({ error: "Avis déjà publié pour ce service." });
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        clientId: req.user.userId,
        serviceId
      }
    });

    res.json({ message: "Avis enregistré", review });
  } catch (err) {
    res.status(500).json({ error: "Erreur création de l'avis" });
  }
});


/**
 * @swagger
 * /reviews/service/{id}:
 *   get:
 *     summary: Voir les avis pour un service
 *     tags: [Avis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Liste des avis }
 */


// Récupérer les avis d’un service
router.get('/service/:id', async (req, res) => {
  const serviceId = parseInt(req.params.id);
  const reviews = await prisma.review.findMany({
    where: { serviceId },
    include: {
      client: { select: { email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(reviews);
});

module.exports = router;
