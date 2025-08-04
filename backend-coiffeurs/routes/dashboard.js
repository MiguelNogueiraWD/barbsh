const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middlewares/auth');

// Revenus mensuels pour un coiffeur ou pour tous (si admin)
router.get('/revenues', authMiddleware(['COIFFEUR', 'ADMIN']), async (req, res) => {
  const { role, userId } = req.user;

  const where = role === 'COIFFEUR' ? { booking: { service: { coiffeurId: userId } } } : {};

  try {
    const revenues = await prisma.payment.groupBy({
      by: ['createdAt'],
      _sum: {
        amount: true,
        platformFee: true,
        coiffeurShare: true
      },
      where,
    });

    const monthlyData = {};

    for (const record of revenues) {
      const date = new Date(record.createdAt);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          total: 0,
          platformFee: 0,
          coiffeurShare: 0
        };
      }

      monthlyData[monthKey].total += Number(record._sum.amount || 0);
      monthlyData[monthKey].platformFee += Number(record._sum.platformFee || 0);
      monthlyData[monthKey].coiffeurShare += Number(record._sum.coiffeurShare || 0);
    }

    const sorted = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
    res.json(sorted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur récupération des revenus' });
  }
});

module.exports = router;
