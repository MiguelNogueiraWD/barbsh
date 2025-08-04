const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendMail } = require('./utils/mailer');
const cron = require('node-cron');

// Tâche tous les lundis à 9h du matin
if (process.env.NODE_ENV !== 'test') {
cron.schedule('0 9 * * 1', async () => {
  const subscribers = await prisma.user.findMany({
    where: { subscribed: true }
  });

  for (const user of subscribers) {
    await sendMail({
      to: user.email,
      subject: "Newsletter Barbsh ",
      html: `
        <h2>Salut ${user.name || 'cher client'},</h2>
        <p>Voici les dernières nouveautés chez Barbsh :</p>
        <ul>
          <li>Nouveaux services</li>
          <li>Promos du mois</li>
          <li>Disponibilités mises à jour</li>
        </ul>
        <p><a href="http://localhost:5173">Accéder à la plateforme</a></p>
        <hr>
        <small><a href="http://localhost:3000/newsletter/unsubscribe/${user.id}">Se désabonner</a></small>
      `
    });
  }

  console.log(` ${subscribers.length} newsletters envoyées.`);
});
}
