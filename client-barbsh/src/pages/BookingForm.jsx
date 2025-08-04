import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function BookingForm() {
  const { id } = useParams(); // id du service
  const [service, setService] = useState(null);
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);

  const handleDateChange = async (e) => {
  const date = e.target.value;
  setSelectedDate(date);

  const res = await axios.get(`/services/${serviceId}/slots?date=${date}`);
  setSlots(res.data.slots);
 };

  const fullDateTime = new Date(`${selectedDate}T${selectedTime}:00.000Z`);

  // Récupérer les infos du service
  useEffect(() => {
    axios.get(`/services`)
      .then((res) => {
        const found = res.data.find(s => s.id === parseInt(id));
        if (found) setService(found);
        else setError("Service introuvable");
      })
      .catch(() => setError("Erreur chargement service"));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post("/bookings", {
        serviceId: parseInt(id),
        date: new Date(date).toISOString()
      });
      toast.success("Réservation envoyée avec succès !");
      setErrorMessage('');

      alert("Réservation effectuée avec succès ");
      navigate("/profile");
    } catch (err) {
        toast.error("Une erreur est survenue lors de la réservation.");
        setSuccessMessage('');
  console.log("Erreur complète :", error);
  
  if (error.response) {
    console.error("Réponse du serveur :", error.response.data);
    setError(error.response.data?.error || "Erreur côté serveur");
  } else if (error.request) {
    console.error("Pas de réponse du serveur");
    setError("Aucune réponse du serveur");
  } else {
    console.error("Erreur inconnue :", error.message);
    setError("Erreur inconnue");
  }
}

  };

  if (error) return <p className="text-red-500 text-center mt-8">{error}</p>;
  if (!service) return <p className="text-center mt-8">Chargement…</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Réserver : {service.title}</h2>

      <p className="mb-2 text-gray-700">{service.description}</p>
      <p className="text-blue-600 font-semibold mb-4">{service.price} € — {service.duration} min</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm">Choisis une date et une heure :</span>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full border p-2 rounded mt-1"
          />
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Confirmer la réservation
        </button>
      </form>
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <>
    <input type="date" value={selectedDate} onChange={handleDateChange} />

    {slots.length > 0 && (
      <div>
        <p>Créneaux disponibles :</p>
        {slots.map(slot => (
          <button key={slot} onClick={() => setSelectedTime(slot)}>
            {slot}
          </button>
        ))}
      </div>
    )}
  </>

      <Modal isOpen={show} onRequestClose={() => setShow(false)}>
        <h2>Annuler cette réservation ?</h2>
        <button onClick={confirmCancel}>Oui</button>
        <button onClick={() => setShow(false)}>Non</button>
      </Modal>

        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="Pp"
        />
    </div>
    
  );
}

export default BookingForm;
