const PDFDocument = require('pdfkit');
const moment = require('moment');

/**
 * Génère un PDF de facture pour une commande donnée
 */
function generateInvoicePDF(res, orderData) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${orderData.id}.pdf`);

  doc.pipe(res);

  doc.fontSize(20).text('FACTURE', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Date : ${moment(orderData.createdAt).format('DD/MM/YYYY')}`);
  doc.text(`Client : ${orderData.client.email}`);
  doc.text(`Commande n° : ${orderData.id}`);
  doc.moveDown();

  doc.text('--- Détail de la commande ---');

  orderData.items.forEach(item => {
    doc.text(`${item.product.title} x${item.quantity} — ${item.product.price}€`);
  });

  const total = orderData.items.reduce((sum, i) => sum + i.quantity * i.product.price, 0);
  doc.moveDown();
  doc.text(`Total : ${total.toFixed(2)}€`, { align: 'right' });

  doc.end();
}

module.exports = { generateInvoicePDF };
