const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET /map/coiffeurs
router.get("/coiffeurs", async (req, res) => {
  const { serviceId } = req.query;

  const where = {
    role: "COIFFEUR",
    latitude: { not: null },
    longitude: { not: null }
  };

  if (serviceId) {
    where.services = {
      some: { id: parseInt(serviceId) }
    };
  }

  const coiffeurs = await prisma.user.findMany({
    where,
    include: { services: true }
  });

  res.json(coiffeurs);
});

module.exports = router;
