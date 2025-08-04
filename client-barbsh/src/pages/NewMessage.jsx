import { useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

export default function NewMessage() {
  const [toId, setToId] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/messages', { toId: parseInt(toId), content });
      navigate('/messages'); // Redirection vers boîte de réception
    } catch {
      setError("Erreur lors de l'envoi");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
      <h2 className="text-xl font-semibold mb-4"> Nouveau message</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="number"
          value={toId}
          onChange={e => setToId(e.target.value)}
          placeholder="ID du destinataire"
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Votre message..."
          className="w-full border p-2 rounded"
          required
        ></textarea>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Envoyer
        </button>
      </form>
    </div>
  );
}
