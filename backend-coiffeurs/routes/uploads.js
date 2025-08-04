const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = `uploads/${req.user.userId}`;
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });

// Upload d’un avatar
router.post('/avatar', authMiddleware(['COIFFEUR']), upload.single('image'), async (req, res) => {
  const filePath = req.file.path.replace(/\\/g, '/');

  await prisma.user.update({
    where: { id: req.user.userId },
    data: { avatarUrl: '/' + filePath }
  });

  res.json({ message: "Avatar uploadé", url: '/' + filePath });
});


// Upload d’une photo de coupe
router.post('/galerie', authMiddleware(['COIFFEUR']), upload.single('image'), async (req, res) => {
  const filePath = req.file.path.replace(/\\/g, '/');

  await prisma.galleryImage.create({
    data: {
      coiffeurId: req.user.userId,
      imageUrl: '/' + filePath
    }
  });
  res.json({ message: "Image ajoutée à la galerie", url: '/' + filePath });
});

// Avatar (1 image)
router.post('/avatar', authMiddleware(), upload.single('avatar'), async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { avatar: req.file.filename }
    });
    res.json({ message: 'Avatar mis à jour', avatar: user.avatar });
  } catch {
    res.status(500).json({ error: "Erreur mise à jour avatar" });
  }
});

// Galerie coiffeur (plusieurs photos)
router.post('/gallery', authMiddleware(['COIFFEUR']), upload.single('image'), async (req, res) => {
  try {
    const image = await prisma.gallery.create({
      data: {
        url: req.file.filename,
        coiffeurId: req.user.userId
      }
    });
    res.json(image);
  } catch {
    res.status(500).json({ error: "Erreur ajout photo" });
  }
});

// Supprimer une image
router.delete('/gallery/:id', authMiddleware(['COIFFEUR']), async (req, res) => {
  const id = parseInt(req.params.id);
  const image = await prisma.gallery.findUnique({ where: { id } });

  if (image.coiffeurId !== req.user.userId)
    return res.status(403).json({ error: "Accès interdit" });

  fs.unlinkSync(`uploads/${image.url}`); // Supprime fichier
  await prisma.gallery.delete({ where: { id } });

  res.json({ message: "Image supprimée" });
});

module.exports = router;
