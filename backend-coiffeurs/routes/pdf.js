const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const authMiddleware = require('../middlewares/auth');
const prisma = new PrismaClient();
const { sendMailWithAttachment } = require('../utils/mailer');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
//const getStream = require('get-stream');

// Générer la facture d’une commande
router.get('/order/:id', authMiddleware(['CLIENT']), async (req, res) => {
  const id = parseInt(req.params.id);
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      client: true,
      items: { include: { product: true } }
    }
  });

  if (!order || order.clientId !== req.user.userId) {
    return res.status(403).json({ error: "Commande non trouvée" });
  }

  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="commande-${id}.pdf"`);

  doc.pipe(res);

  doc.fontSize(18).text(`Facture de commande #${order.id}`, { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Client : ${order.client.email}`);
  doc.text(`Date : ${order.createdAt.toLocaleDateString()}`);
  doc.text(`Total : ${order.total.toFixed(2)} €`);
  doc.moveDown();

  doc.fontSize(14).text('Produits :');
  doc.moveDown(0.5);

  order.items.forEach(item => {
    doc.fontSize(12).text(`${item.quantity} x ${item.product.title} — ${item.product.price} €`);
  });

  doc.end();
});


//  Générer + envoyer par e-mail
router.get('/order/:id/send', authMiddleware(['CLIENT']), async (req, res) => {
  const id = parseInt(req.params.id);
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      client: true,
      items: { include: { product: true } }
    }
  });

  if (!order || order.clientId !== req.user.userId) {
    return res.status(403).json({ error: "Commande non trouvée" });
  }

  // Générer le PDF en mémoire
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument();
  const buffers = [];

  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', async () => {
    const pdfBuffer = Buffer.concat(buffers);

    await sendMailWithAttachment({
      to: order.client.email,
      subject: `Votre facture Barbsh - Commande #${order.id}`,
      html: `<p>Bonjour, veuillez trouver ci-joint votre facture pour la commande #${order.id}.</p>`,
      filename: `facture-${order.id}.pdf`,
      pdfBuffer
    });

    res.json({ message: "Facture envoyée par e-mail." });
  });

  doc.fontSize(18).text(`Facture de commande #${order.id}`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Client : ${order.client.email}`);
  doc.text(`Date : ${order.createdAt.toLocaleDateString()}`);
  doc.text(`Total : ${order.total.toFixed(2)} €`);
  doc.moveDown();
  doc.fontSize(14).text('Produits :');
  doc.moveDown(0.5);

  order.items.forEach(item => {
    doc.fontSize(12).text(`${item.quantity} x ${item.product.title} — ${item.product.price} €`);
  });

  doc.end();
});

// Télécharger sa facture PDF
router.get('/invoice/:orderId', authMiddleware(['CLIENT']), async (req, res) => {
  const { orderId } = req.params;

  const order = await prisma.order.findUnique({
    where: { id: parseInt(orderId) },
    include: {
      client: true,
      items: {
        include: { product: true }
      }
    }
  });

  if (!order || order.clientId !== req.user.userId) {
    return res.status(404).json({ error: 'Commande introuvable ou non autorisée' });
  }

  generateInvoicePDF(res, order);
});

module.exports = router;