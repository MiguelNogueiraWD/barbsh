// src/components/AvailabilitiesManager.jsx

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const jours = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export default function AvailabilitiesManager() {
  const [dispos, setDispos] = useState([]);
  const [form, setForm] = useState({ dayOfWeek: 1, startTime: "09:00", endTime: "12:00" });

  const loadDispos = async () => {
    try {
      const res = await axios.get('http://localhost:3000/availabilities/me', { withCredentials: true });
      setDispos(res.data);
    } catch {
      toast.error("Erreur chargement des disponibilités");
    }
  };


  const addDispo = async () => {
    try {
      const res = await axios.post('http://localhost:3000/availabilities', form, { withCredentials: true });
      setDispos([...dispos, res.data]);
      toast.success("Créneau ajouté !");
    } catch {
      toast.error("Erreur ajout créneau");
    }
  };

  const deleteDispo = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/availabilities/${id}`, { withCredentials: true });
      setDispos(dispos.filter(d => d.id !== id));
      toast.success("Créneau supprimé");
    } catch {
      toast.error("Erreur suppression");
    }
  };

  function handleEdit(id, updatedData) {
  axios.put(`http://localhost:3000/availabilities/${id}`, updatedData, { withCredentials: true })
    .then(res => {
      toast.success("Créneau modifié !");
      setDispos(prev => prev.map(s => s.id === id ? res.data : s));
    })
    .catch(() => toast.error("Erreur lors de l’édition"));
  }


  return (
    <div>
      <h2>Mes disponibilités</h2>
      <button onClick={loadDispos} className="mb-4 bg-gray-200 px-2 py-1 rounded">
          Charger mes créneaux
        </button>

      <table>
        <thead>
          <tr><th>Jour</th><th>Début</th><th>Fin</th><th>Action</th></tr>
        </thead>
        <tbody>
          {dispos.map(d => (
            <tr key={d.id}>
              <td>{jours[d.dayOfWeek]}</td>
              <td>{d.startTime}</td>
              <td>{d.endTime}</td>
              <td>
                <button onClick={() => deleteDispo(d.id)}>Supprimer</button>
                <button onClick={() => handleEdit(d.id, {
                  dayOfWeek: d.dayOfWeek,
                  startTime: prompt("Nouvelle heure de début", d.startTime),
                  endTime: prompt("Nouvelle heure de fin", d.endTime)
                })}>Modifier</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Ajouter un créneau</h3>
      <select value={form.dayOfWeek} onChange={e => setForm({ ...form, dayOfWeek: parseInt(e.target.value) })}>
        {jours.map((j, i) => <option key={i} value={i}>{j}</option>)}
      </select>
      <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
      <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
      <button onClick={addDispo}>Ajouter</button>
    </div>
  );
}
