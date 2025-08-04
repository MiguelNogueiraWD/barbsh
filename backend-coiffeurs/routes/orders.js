const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const authMiddleware = require('../middlewares/auth');

//  Route GET /orders/me — doit être EN DEHORS de la route POST
router.get('/me', authMiddleware(['CLIENT']), async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { clientId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Erreur récupération commandes" });
  }
});

// Créer une commande (checkout Stripe)
router.post('/', authMiddleware(['CLIENT']), async (req, res) => {
  const { items } = req.body; // [{ productId, quantity }]

  try {
    const productData = await Promise.all(items.map(async item => {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      return {
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(product.price * 100),
          product_data: { name: product.title }
        },
        quantity: item.quantity
      };
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: productData,
      success_url: `${process.env.FRONT_URL}/success`,
      cancel_url: `${process.env.FRONT_URL}/cancel`,
      metadata: {
        userId: req.user.userId,
        items: JSON.stringify(items)
      }
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: "Erreur création commande", details: err.message });
  }
});

module.exports = router;
