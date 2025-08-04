import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';

const Moderation = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/bookings/pending')
      .then(res => setBookings(res.data))
      .catch(err => setError("Erreur de chargement"));
  }, []);

  const handleAction = async (id, action) => {
    try {
      await axios.put(`/bookings/${id}/${action}`);
      setBookings(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      alert("Erreur lors de la validation/refus.");
    }
  };

  return (
    <div>
      <h2>Réservations à valider</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {bookings.length === 0 && <p>Aucune réservation en attente.</p>}
      <ul>
        {bookings.map(booking => (
          <li key={booking.id} style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem' }}>
            <p><strong>Client :</strong> {booking.client.email}</p>
            <p><strong>Service :</strong> {booking.service.title}</p>
            <p><strong>Date :</strong> {new Date(booking.date).toLocaleString()}</p>
            <button onClick={() => handleAction(booking.id, 'validate')}> Valider</button>
            <button onClick={() => handleAction(booking.id, 'refuse')}> Refuser</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Moderation;
