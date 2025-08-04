import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";

function AdminNewsletterLogs() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("/newsletter-logs")
      .then((res) => setLogs(res.data))
      .catch(() => setError("Erreur chargement des logs"));
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4"> Historique des envois de newsletters</h2>
      {error && <p className="text-red-500">{error}</p>}
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border p-2">Email</th>
            <th className="border p-2">Sujet</th>
            <th className="border p-2">Statut</th>
            <th className="border p-2">Erreur</th>
            <th className="border p-2">Tentatives</th>
            <th className="border p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td className="border p-2">{log.email}</td>
              <td className="border p-2">{log.subject}</td>
              <td className="border p-2">{log.status}</td>
              <td className="border p-2 text-red-600">{log.errorMessage || "—"}</td>
              <td className="border p-2">{log.retryCount}</td>
              <td className="border p-2">{new Date(log.sentAt).toLocaleString()}</td>
              <td>
                {log.retryCount > 0 ? (
                  <span className="text-red-500 font-semibold">
                     Erreur
                    <span title={log.errorMessage} className="ml-2 cursor-help">🛈</span>
                  </span>
                ) : (
                  <span className="text-green-600 font-semibold"> Envoyé</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminNewsletterLogs;
