const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middlewares/auth');


/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Créer un paiement pour une réservation
 *     tags: [Paiement]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required: [bookingId, amount]
 *             properties:
 *               bookingId: { type: integer }
 *               amount: { type: number }
 *     responses:
 *       200: { description: Paiement initié }
 */


// Créer un paiement pour une réservation
router.post('/', authMiddleware(['CLIENT']), async (req, res) => {
  const { bookingId, amount } = req.body;

  try {
    // Calcul de la commission
    const platformFee = parseFloat((amount * 0.15).toFixed(2));
    const coiffeurShare = parseFloat((amount - platformFee).toFixed(2));
    // Stripe charge (exemple de simulation)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // en centimes
      currency: 'eur',
      description: `Paiement réservation #${bookingId}`
    });

    // Enregistrer le paiement côté DB
    const payment = await prisma.payment.create({
      data: {
        amount,
        platformFee,
        coiffeurShare,
        clientId: req.user.userId,
        bookingId
      }
    });
    await sendMail({
      to: req.user.email,
      subject: "Paiement confirmé ",
      html: paymentConfirmed(amount)
    });

    res.json({ message: "Paiement enregistré", stripeClientSecret: paymentIntent.client_secret });
    
  } catch (err) {
    res.status(500).json({ error: "Erreur paiement Stripe", details: err.message });
  }
});

// Lancer un paiement Stripe
router.post('/initiate', authMiddleware(['CLIENT']), async (req, res) => {
  const { bookingId } = req.body;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: {
          include: { coiffeur: true }
        }
      }
    });

    if (!booking) return res.status(404).json({ error: "Réservation introuvable" });
    if (booking.status !== 'VALIDATED') return res.status(400).json({ error: "Réservation non validée" });

    const amount = Math.round(booking.service.price * 100); // en centimes
    const platformFee = Math.round(amount * 0.15);
    const coiffeurShare = amount - platformFee;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          unit_amount: amount,
          product_data: {
            name: booking.service.title,
            description: `Prestation avec ${booking.service.coiffeur.email}`
          }
        },
        quantity: 1
      }],
      metadata: {
        bookingId: booking.id,
        userId: booking.clientId,
        amount,
        platformFee,
        coiffeurShare
      },
      success_url: `${process.env.FRONT_URL}/success`,
      cancel_url: `${process.env.FRONT_URL}/cancel`
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur Stripe" });
  }
});
module.exports = router;
