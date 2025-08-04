import { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get('/messages/inbox')
      .then(res => setMessages(res.data))
      .catch(() => setError("Erreur chargement messages"));
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4"> Boîte de réception</h2>
      {error && <p className="text-red-500">{error}</p>}
      <ul className="space-y-3">
        {messages.map(m => (
          <li key={m.id} className="border p-3 rounded bg-white shadow">
            <p className="text-sm text-gray-500">De : {m.from?.email}</p>
            <p className="text-gray-800">{m.content}</p>
            <p className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
