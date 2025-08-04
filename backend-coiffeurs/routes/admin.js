const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middlewares/auth');


/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Statistiques globales (admin)
 *     tags: [Admin]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200: { description: Statistiques retournées }
 */


router.get('/stats', authMiddleware(['ADMIN']), async (req, res) => {
  try {
    const [users, coiffeurs, clients, bookings, payments, reviews] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'COIFFEUR' } }),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.booking.count(),
      prisma.payment.aggregate({
        _sum: { amount: true, platformFee: true, coiffeurShare: true }
      }),
      prisma.review.aggregate({
        _avg: { rating: true },
        _count: { rating: true }
      })
    ]);

    const subscriptions = await prisma.user.groupBy({
      by: ['subscription'],
      _count: true
    });

    res.json({
      totalUsers: users,
      coiffeurs,
      clients,
      totalBookings: bookings,
      revenue: {
        total: payments._sum.amount || 0,
        platform: payments._sum.platformFee || 0,
        coiffeurs: payments._sum.coiffeurShare || 0
      },
      reviews: {
        moyenne: Number(reviews._avg.rating?.toFixed(1) || 0),
        total: reviews._count.rating
      },
      abonnements: subscriptions.reduce((acc, s) => {
        acc[s.subscription] = s._count;
        return acc;
      }, {})
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur dashboard admin" });
  }
});

// Liste complète des réservations (admin uniquement)
router.get('/admin/bookings', authMiddleware(['ADMIN']), async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  try {
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          client: true,
          service: { include: { coiffeur: true } }
        }
      }),
      prisma.booking.count()
    ]);

    res.json({ bookings, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur chargement réservations admin' });
  }
});

router.get('/bookings', authMiddleware(['ADMIN']), async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { date: 'desc' },
      include: {
        service: {
          select: {
            title: true,
            coiffeur: {
              select: {
                name: true
              }
            }
          }
        },
        client: {
          select: { email: true }
        }
      }
    });

    res.json(bookings);
  } catch (err) {
    console.error("Erreur chargement des réservations admin :", err);
    res.status(500).json({ error: "Erreur chargement réservations" });
  }
});


router.get("/newsletter-logs", authMiddleware(["ADMIN"]), async (req, res) => {
  const logs = await prisma.newsletterLog.findMany({
    orderBy: { sentAt: 'desc' }
  });
  res.json(logs);
});

router.put('/admin/bookings/:id/status', authMiddleware(['ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['VALIDATED', 'REFUSED'].includes(status)) {
    return res.status(400).json({ error: 'Statut invalide' });
  }

  try {
    const booking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

router.put('/admin/bookings/:id', authMiddleware(['ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { date, serviceId } = req.body;

  try {
    const booking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: {
        date: new Date(date),
        serviceId: parseInt(serviceId),
      },
    });
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur modification réservation" });
  }
});

router.delete('/admin/bookings/:id', authMiddleware(['ADMIN']), async (req, res) => {
  try {
    await prisma.booking.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: "Supprimée" });
  } catch (err) {
    res.status(500).json({ error: "Erreur suppression" });
  }
});

// GET /admin/users – liste des coiffeurs
router.get("/users", authMiddleware(["ADMIN"]), async (req, res) => {
  const users = await prisma.user.findMany({
    where: { role: "COIFFEUR" },
    select: {
      id: true,
      email: true,
      subscriptionType: true
    }
  });
  res.json(users);
});

// PUT /admin/users/:id/subscription – changer l’abonnement
router.put("/users/:id/subscription", authMiddleware(["ADMIN"]), async (req, res) => {
  const { subscriptionType } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { subscriptionType }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Erreur de mise à jour" });
  }
});

router.get('/stats', authMiddleware(['ADMIN']), async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);

    const prestationsCount = await prisma.booking.count({
      where: { status: 'VALIDATED' }
    });

    const usersCount = await prisma.user.count();

    const monthlyStats = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', b."date") AS month,
        COUNT(*) AS "bookingsCount",
        SUM(s."price") AS revenue
      FROM "Booking" b
      JOIN "Service" s ON b."serviceId" = s.id
      WHERE b.status = 'VALIDATED' AND b."date" >= ${startOfYear}
      GROUP BY month
      ORDER BY month ASC;
    `;

    const totalRevenue = monthlyStats.reduce((sum, m) => sum + parseFloat(m.revenue || 0), 0);

    res.json({
      prestationsCount,
      totalRevenue,
      usersCount,
      monthlyStats
    });

  } catch (err) {
    console.error("Erreur stats:", err);
    res.status(500).json({ error: "Erreur chargement statistiques" });
  }
});

module.exports = router;
