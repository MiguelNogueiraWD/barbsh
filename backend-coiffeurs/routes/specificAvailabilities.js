const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middlewares/auth');

// Ajouter une dispo spécifique (coiffeur uniquement)
router.post('/', authMiddleware(['COIFFEUR']), async (req, res) => {
  const { date, startTime, endTime } = req.body;

  try {
    const avail = await prisma.specificAvailability.create({
      data: {
        date: new Date(date),
        startTime,
        endTime,
        coiffeurId: req.user.userId
      }
    });
    res.json(avail);
  } catch (err) {
    res.status(500).json({ error: "Erreur ajout disponibilité ponctuelle" });
  }
});

// Voir les créneaux spécifiques d’un coiffeur
router.get('/coiffeur/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const list = await prisma.specificAvailability.findMany({
    where: { coiffeurId: id },
    orderBy: { date: 'asc' }
  });

  res.json(list);
});

// Modifier un créneau spécifique (coiffeur uniquement)
router.put('/:id', authMiddleware(['COIFFEUR']), async (req, res) => {
  const id = parseInt(req.params.id);
  const { date, startTime, endTime } = req.body;

  try {
    // Vérifie que ce créneau appartient au coiffeur connecté
    const availability = await prisma.specificAvailability.findUnique({
      where: { id }
    });

    if (!availability || availability.coiffeurId !== req.user.userId) {
      return res.status(403).json({ error: "Accès refusé à ce créneau." });
    }

    const updated = await prisma.specificAvailability.update({
      where: { id },
      data: {
        date: new Date(date),
        startTime,
        endTime
      }
    });

    res.json({ message: "Créneau mis à jour", updated });
  } catch (err) {
    res.status(500).json({ error: "Erreur mise à jour" });
  }
});

// Supprimer un créneau spécifique (coiffeur uniquement)
router.delete('/:id', authMiddleware(['COIFFEUR']), async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const availability = await prisma.specificAvailability.findUnique({
      where: { id }
    });

    if (!availability || availability.coiffeurId !== req.user.userId) {
      return res.status(403).json({ error: "Créneau introuvable ou accès refusé." });
    }

    await prisma.specificAvailability.delete({
      where: { id }
    });

    res.json({ message: "Créneau supprimé avec succès." });
  } catch (err) {
    res.status(500).json({ error: "Erreur suppression du créneau." });
  }
});

module.exports = router;
