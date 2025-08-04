const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middlewares/auth');

// Voir la galerie d’un coiffeur
router.get('/:coiffeurId', async (req, res) => {
  const id = parseInt(req.params.coiffeurId);
  const images = await prisma.galleryImage.findMany({
    where: { coiffeurId: id },
    orderBy: { createdAt: 'desc' }
  });

  res.json(images);
});

// DELETE /gallery/:id — supprimer une image (coiffeur uniquement)
router.delete('/:id', authMiddleware(['COIFFEUR']), async (req, res) => {
  const imageId = parseInt(req.params.id);

  const image = await prisma.galleryImage.findUnique({ where: { id: imageId } });

  // Vérifie que l’image existe et appartient au bon coiffeur
  if (!image || image.coiffeurId !== req.user.userId) {
    return res.status(403).json({ error: "Accès interdit ou image inexistante" });
  }

  // Supprimer le fichier local si possible
  const fullPath = path.join(__dirname, '..', image.imageUrl);
  fs.unlink(fullPath, (err) => {
    if (err) console.warn("Image non trouvée localement :", fullPath);
  });

  await prisma.galleryImage.delete({ where: { id: imageId } });

  res.json({ message: "Image supprimée de la galerie" });
});

module.exports = router;