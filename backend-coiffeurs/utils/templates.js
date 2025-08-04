function reservationReceived(name, date) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5">
      <h2> Merci pour votre réservation, ${name} !</h2>
      <p>Votre demande de rendez-vous est bien enregistrée pour le <strong>${date}</strong>.</p>
      <p>Nous attendons maintenant la validation d’un modérateur.</p>
      <hr />
      <p style="font-size: 12px; color: #777;">Barbsh App</p>
    </div>
  `;
}

function reservationValidated(date) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5">
      <h2> Réservation validée !</h2>
      <p>Votre réservation du <strong>${date}</strong> a été validée.</p>
      <p>Merci de votre confiance.</p>
    </div>
  `;
}

function paymentConfirmed(amount) {
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2> Paiement confirmé</h2>
      <p>Votre paiement de <strong>${amount} €</strong> a été reçu.</p>
      <p>Merci pour votre réservation chez Barbsh.</p>
    </div>
  `;
}

module.exports = { reservationReceived, reservationValidated, paymentConfirmed };
