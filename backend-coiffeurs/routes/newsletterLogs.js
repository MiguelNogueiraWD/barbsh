const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authMiddleware = require("../middlewares/auth");

//  GET : liste tous les logs d’envoi de newsletter
router.get("/", authMiddleware(["ADMIN"]), async (req, res) => {
  try {
    const logs = await prisma.newsletterLog.findMany({
      orderBy: { sentAt: "desc" },
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Erreur chargement des logs" });
  }
});

module.exports = router;
