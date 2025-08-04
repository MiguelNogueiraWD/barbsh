const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middlewares/auth');

// Envoyer un message
router.post('/', authMiddleware(), async (req, res) => {
  const { toId, content } = req.body;
  try {
    const message = await prisma.message.create({
      data: {
        fromId: req.user.userId,
        toId,
        content
      }
    });
    res.json(message);
  } catch {
    res.status(500).json({ error: "Erreur lors de l'envoi du message" });
  }
});

// Voir messages reçus
router.get('/inbox', authMiddleware(), async (req, res) => {
  console.log("Utilisateur connecté :", req.user); // ← AJOUTE ICI

  const messages = await prisma.message.findMany({
    where: { toId: req.user.userId },
    orderBy: { createdAt: 'desc' },
    include: { from: true }
  });
  res.json(messages);
});


// Voir messages envoyés
router.get('/sent', authMiddleware(), async (req, res) => {
  const messages = await prisma.message.findMany({
    where: { fromId: req.user.userId },
    orderBy: { createdAt: 'desc' },
    include: { to: true } // Pour afficher le destinataire
  });
  res.json(messages);
});

router.put('/:id/read', authMiddleware(), async (req, res) => {
  try {
    const updated = await prisma.message.update({
      where: { id: parseInt(req.params.id) },
      data: { read: true }
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Erreur mise à jour lecture" });
  }
});

module.exports = router;
