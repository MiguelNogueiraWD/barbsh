const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middlewares/auth');

// Créer un article (ADMIN uniquement)
router.post('/', authMiddleware(['ADMIN']), async (req, res) => {
  const { title, content, imageUrl } = req.body;

  try {
    const post = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl,
        authorId: req.user.userId
      }
    });

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Erreur création article" });
  }
});

// Voir tous les articles (public)
router.get('/', async (req, res) => {
  const posts = await prisma.post.findMany({
    include: {
      author: { select: { email: true, role: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(posts);
});

// Supprimer un article
router.delete('/:id', authMiddleware(['ADMIN']), async (req, res) => {
  try {
    await prisma.post.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Article supprimé" });
  } catch (err) {
    res.status(500).json({ error: "Erreur suppression" });
  }
});

module.exports = router;