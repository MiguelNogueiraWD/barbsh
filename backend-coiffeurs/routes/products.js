const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middlewares/auth');

//  Ajouter un produit (admin)
router.post('/', authMiddleware(['ADMIN']), async (req, res) => {
  const { title, description, price, imageUrl } = req.body;

  try {
    const product = await prisma.product.create({
      data: { title, description, price, imageUrl }
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Erreur création produit" });
  }
});

//  Voir tous les produits (public)
router.get('/', async (req, res) => {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(products);
});

// Modifier un produit (admin)
router.put('/:id', authMiddleware(['ADMIN']), async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description, price, imageUrl } = req.body;

  try {
    const updated = await prisma.product.update({
      where: { id },
      data: { title, description, price, imageUrl }
    });

    
//Supprimer un produit (admin)
router.delete('/:id', authMiddleware(['ADMIN']), async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await prisma.product.delete({ where: { id } });
    res.json({ message: "Produit supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ error: "Erreur suppression du produit" });
  }
});

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Erreur mise à jour du produit" });
  }
});

module.exports = router;
