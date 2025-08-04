const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Le secret du webhook généré par Stripe
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  //  Traitement de l’événement
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    // Extrait bookingId depuis description
    const description = paymentIntent.description;
    const bookingId = parseInt(description.split('#')[1]);

    console.log(`Paiement reçu pour booking ${bookingId}`);

    // Mise à jour en BDD (exemple : confirmer le paiement)
    await prisma.payment.updateMany({
      where: { bookingId },
      data: {
        amount: paymentIntent.amount / 100,
        createdAt: new Date()
      }
    });
    

    // Optionnel : mettre à jour le statut du booking
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'VALIDATED' }
    });

    console.log(`Paiement validé : 
  Total : ${paymentIntent.amount / 100} € 
  Commission : ${platformFee} € 
  Coiffeur : ${coiffeurShare} €`);

  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = parseInt(session.metadata.userId);
    const type = session.metadata.subscriptionType;
    const items = JSON.parse(session.metadata?.items || '[]');
    const metadata = session.metadata;

    const order = await prisma.order.create({
      data: {
        clientId: userId,
        total: session.amount_total / 100,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        }
      }
    });

    await prisma.payment.create({
      data: {
        bookingId: parseInt(metadata.bookingId),
        amount: parseInt(metadata.amount),
        platformFee: parseInt(metadata.platformFee),
        coiffeurShare: parseInt(metadata.coiffeurShare),
        status: 'PAID'
      }
    });

    console.log("Commande enregistrée :", order.id);

    await prisma.user.update({
        where: { id: userId },
        data: { subscription: type }
    });

    console.log(`Abonnement ${type} activé pour utilisateur ${userId}`);
    }

    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;

        // Récupère les metadata si disponibles
        const userId = parseInt(subscription.metadata?.userId || '0');

        if (userId) {
            await prisma.user.update({
            where: { id: userId },
            data: { subscription: 'FREE' }
            });

            console.log(` Abonnement résilié pour utilisateur ${userId}, repassé en FREE`);
        } else {
            console.warn(' Résiliation sans userId en metadata.');
        }
    }

  res.json({ received: true });
});

module.exports = router;
