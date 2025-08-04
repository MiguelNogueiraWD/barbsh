const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middlewares/auth');


router.get('/unsubscribe/:id', async (req, res) => {
  const { id } = req.params;

  await prisma.user.update({
    where: { id: parseInt(id) },
    data: { subscribed: false }
  });

  res.send("<h3>Vous êtes bien désabonné de la newsletter.</h3>");
});

router.post('/send', authMiddleware(['ADMIN']), async (req, res) => {
  const { subject, html } = req.body;
  const subscribers = await prisma.user.findMany({
    where: { subscribedToNewsletter: true }
  });

  for (const user of subscribers) {
    await sendMail({
      to: user.email,
      subject,
      html
    });

    await prisma.newsletterLog.create({
      data: {
        email: user.email,
        subject,
        status: 'SENT'
      }
    });
  }

  res.json({ success: true, total: subscribers.length });
});

router.get('/logs', authMiddleware(['ADMIN']), async (req, res) => {
  const logs = await prisma.newsletterLog.findMany({
    orderBy: { sentAt: 'desc' },
    include: { user: true },
  });
  res.json(logs);
});

module.exports = router;
