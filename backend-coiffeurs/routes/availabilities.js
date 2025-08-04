const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middlewares/auth');

// Ajouter un créneau (coiffeur uniquement)
router.post('/', authMiddleware(['COIFFEUR']), async (req, res) => {
  const { dayOfWeek, startTime, endTime } = req.body;

  if (startTime >= endTime) {
  return res.status(400).json({ error: "L'heure de fin doit être après l'heure de début" });
  }

  try {
    const avail = await prisma.availability.create({
      data: {
        dayOfWeek,
        startTime,
        endTime,
        coiffeurId: req.user.userId
      }
    });

    res.json(avail);
  } catch (err) {
    res.status(500).json({ error: "Erreur création disponibilité" });
  }
});

// Voir ses créneaux (coiffeur)
router.get('/me', authMiddleware(['COIFFEUR']), async (req, res) => {
  const list = await prisma.availability.findMany({
    where: { coiffeurId: req.user.userId },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
  });

  res.json(list);
});

// Voir les créneaux d’un coiffeur donné (pour client)
router.get('/coiffeur/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const list = await prisma.availability.findMany({
    where: { coiffeurId: id },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
  });

  res.json(list);
});

// GET /availabilities/me – voir ses propres créneaux
router.get('/me', authMiddleware(['COIFFEUR']), async (req, res) => {
  const avail = await prisma.availability.findMany({
    where: { coiffeurId: req.user.userId },
    orderBy: { dayOfWeek: 'asc' },
  });
  res.json(avail);
});

// POST /availabilities – ajouter un créneau
router.post('/', authMiddleware(['COIFFEUR']), async (req, res) => {
  const { dayOfWeek, startTime, endTime } = req.body;
  const created = await prisma.availability.create({
    data: {
      dayOfWeek,
      startTime,
      endTime,
      coiffeurId: req.user.userId,
    },
  });
  res.json(created);
});

// DELETE /availabilities/:id – supprimer un créneau
router.delete('/:id', authMiddleware(['COIFFEUR']), async (req, res) => {
  const id = parseInt(req.params.id);
  const deleted = await prisma.availability.delete({ where: { id } });
  res.json({ success: true, deleted });
});

// GET /availabilities/reserved – affiche aussi les réservations liées
router.get('/reserved', authMiddleware(['COIFFEUR']), async (req, res) => {
  const data = await prisma.availability.findMany({
    where: { coiffeurId: req.user.userId },
    include: {
      bookings: true
    }
  });
  res.json(data);
});

// POST /availabilities/duplicate/:id
router.post('/duplicate/:id', authMiddleware(['COIFFEUR']), async (req, res) => {
  const original = await prisma.availability.findUnique({ where: { id: +req.params.id } });
  const copy = await prisma.availability.create({
    data: {
      coiffeurId: original.coiffeurId,
      dayOfWeek: original.dayOfWeek,
      startTime: original.startTime,
      endTime: original.endTime
    }
  });
  res.json(copy);
});

// routes/availabilities.js
router.put("/:id", authMiddleware(["COIFFEUR"]), async (req, res) => {
  const { id } = req.params;
  const { dayOfWeek, startTime, endTime } = req.body;

  try {
    const updated = await prisma.availability.update({
      where: { id: parseInt(id) },
      data: { dayOfWeek, startTime, endTime }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur modification créneau" });
  }
});


module.exports = router;