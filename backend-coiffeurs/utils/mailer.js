const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

async function sendMail({ to, subject, html }) {
  return transporter.sendMail({
    from: `"Barbsh App" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html
  });
}

async function sendMailWithAttachment({ to, subject, html, filename, pdfBuffer }) {
  return transporter.sendMail({
    from: `"Barbsh App" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
    attachments: [
      {
        filename,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  });
}

module.exports = { sendMail, sendMailWithAttachment };
