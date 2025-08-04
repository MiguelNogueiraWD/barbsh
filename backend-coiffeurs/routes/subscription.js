const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middlewares/auth');


/**
 * @swagger
 * /subscription:
 *   post:
 *     summary: Souscrire à un abonnement
 *     tags: [Abonnement]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required: [subscriptionType]
 *             properties:
 *               subscriptionType: { type: string, enum: [PRO, VIP] }
 *     responses:
 *       200: { description: Lien de paiement généré }
 */


// Démarrer un abonnement Stripe
router.post('/', authMiddleware(['COIFFEUR']), async (req, res) => {
  const { subscriptionType } = req.body;

  const prices = {
    PRO: process.env.STRIPE_PRICE_PRO,
    VIP: process.env.STRIPE_PRICE_VIP
  };

  if (!['PRO', 'VIP'].includes(subscriptionType) || !prices[subscriptionType]) {
    return res.status(400).json({ error: 'Type d’abonnement invalide' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: prices[subscriptionType],
          quantity: 1
        }
      ],
      success_url: `${process.env.FRONT_URL}/abonnement/success`,
      cancel_url: `${process.env.FRONT_URL}/abonnement/cancel`,
      metadata: {
        userId: req.user.userId,
        subscriptionType
      }
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: 'Erreur Stripe', details: err.message });
  }
});
