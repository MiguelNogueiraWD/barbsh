const express = require('express');
const router = express.Router();
const { PrismaClient, ReportStatus } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middlewares/auth');


/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Signaler un utilisateur
 *     tags: [Modération]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required: [reportedId, reason]
 *             properties:
 *               reportedId: { type: integer }
 *               reason: { type: string }
 *     responses:
 *       200: { description: Signalement enregistré }
 */


//  Créer un signalement
router.post('/', authMiddleware(), async (req, res) => {
  const { reportedId, reason } = req.body;

  if (!reason || !reportedId) {
    return res.status(400).json({ error: "Champs obligatoires manquants." });
  }

  try {
    const bannedWords = ["insulte", "arnaque", "raciste"];
      const lowered = reason.toLowerCase();
      const containsBadWord = bannedWords.some(word => lowered.includes(word));
        const existing = await prisma.report.findFirst({
          where: {
            reporterId: req.user.userId,
            reportedId,
            createdAt: {
              gte: new Date(Date.now() - 1000 * 60 * 10) // 10 minutes
            }
          }
        });
        if (existing) return res.status(400).json({ error: "Déjà signalé récemment." });

      const report = await prisma.report.create({
        data: {
          reporterId: req.user.userId,
          reportedId,
          reason,
          status: containsBadWord ? 'BLOCKED' : 'PENDING'
        }
      });

    res.json({ message: "Signalement transmis", report });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors du signalement." });
  }
});

// Liste pour modérateur
router.get('/', authMiddleware(['MODERATEUR']), async (req, res) => {
  const reports = await prisma.report.findMany({
    include: {
      reporter: { select: { email: true } },
      reported: { select: { email: true, role: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(reports);
});

// Mise à jour du statut
router.put('/:id/status', authMiddleware(['MODERATEUR']), async (req, res) => {
  const { status } = req.body;
  const id = parseInt(req.params.id);

  if (!['PENDING', 'REVIEWED', 'BLOCKED'].includes(status)) {
    return res.status(400).json({ error: "Statut invalide." });
  }

  try {
    const updated = await prisma.report.update({
      where: { id },
      data: { status }
    });

    res.json({ message: "Statut mis à jour", updated });
  } catch (err) {
    res.status(500).json({ error: "Erreur mise à jour du statut." });
  }
});

module.exports = router;