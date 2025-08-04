import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get("http://localhost:3000/admin/bookings", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setBookings(res.data);
      } catch (err) {
        console.error("Erreur chargement réservations admin :", err);
      }
    };

    fetchBookings();
  }, []);

  const handleAction = async (id, action) => {
    try {
      await axios.put(`http://localhost:3000/bookings/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      // Refresh
      setBookings(prev => prev.map(b =>
        b.id === id ? { ...b, status: action === 'validate' ? 'VALIDATED' : 'REFUSED' } : b
      ));
    } catch (err) {
      console.error("Erreur action admin :", err);
    }
  };

  return (
    <div>
      <h2> Réservations (Admin)</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Client</th>
            <th>Service</th>
            <th>Coiffeur</th>
            <th>Date</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.client.email}</td>
              <td>{b.service.title}</td>
              <td>{b.service.coiffeur.name}</td>
              <td>{new Date(b.date).toLocaleString()}</td>
              <td style={{ color: 
                b.status === 'VALIDATED' ? 'green' :
                b.status === 'REFUSED' ? 'red' : 'orange'
              }}>{b.status}</td>
              <td>
                {b.status === 'PENDING' && (
                  <>
                    <button onClick={() => handleAction(b.id, 'validate')}></button>
                    <button onClick={() => handleAction(b.id, 'refuse')}></button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminBookings;
