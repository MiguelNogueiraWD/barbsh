import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/bookings/me')
      .then(res => setBookings(res.data))
      .catch(err => {
        console.error(err);
        setError("Erreur chargement réservations");
      });
  }, []);

const handleCancel = async (id) => {
  try {
    await axios.delete(`/bookings/${id}`);
    setBookings(prev => prev.filter(b => b.id !== id));
  } catch (err) {
    alert("Erreur lors de l'annulation.");
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'VALIDATED': return 'green';
    case 'REFUSED': return 'red';
    default: return 'orange';
  }
};

const handleStripePayment = async (bookingId) => {
  try {
    const res = await axios.post('/payments/initiate', { bookingId });
    window.location.href = res.data.url; // Redirection vers Stripe
  } catch {
    alert("Erreur lors du paiement");
  }
};

  return (
    <div>
      <h2>Mes réservations</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {bookings.length === 0 && <p>Aucune réservation trouvée.</p>}
      <ul>
        {bookings.map(booking => (
            <li key={booking.id} style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
            <strong>Service :</strong> {booking.service?.title}<br />
            <strong>Date :</strong> {new Date(booking.date).toLocaleString()}<br />
            <strong>Statut :</strong>{' '}
            <span style={{ color: getStatusColor(booking.status), fontWeight: 'bold' }}>
                {booking.status}
            </span><br />

            {/* Bouton d’annulation uniquement si PENDING */}
            {booking.status === 'PENDING' && (
                <button onClick={() => handleCancel(booking.id)}>
                Annuler
                </button>
            )}
            {booking.status === 'VALIDATED' && (
                <button onClick={() => handleStripePayment(booking.id)}>
                  Payer
                </button>
              )}

            </li>
        ))}
        </ul>
    </div>
  );
};


export default MyBookings;
