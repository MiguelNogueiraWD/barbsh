import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { toast } from "react-toastify";

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/reports", { withCredentials: true })
      .then(res => setReports(res.data))
      .catch(() => toast.error("Erreur chargement des signalements"))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/reports/${id}/status`, { status }, { withCredentials: true });
      setReports(prev =>
        prev.map(r => r.id === id ? { ...r, status } : r)
      );
      toast.success("Statut mis à jour");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const getBadgeColor = (status) => {
    switch (status) {
      case "BLOCKED": return "bg-red-500";
      case "REVIEWED": return "bg-green-500";
      default: return "bg-yellow-500";
    }
  };

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">🛡️ Signalements</h2>
      {reports.length === 0 && <p>Aucun signalement pour le moment.</p>}
      <table className="min-w-full border text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Signalé</th>
            <th className="p-2 border">Signalant</th>
            <th className="p-2 border">Raison</th>
            <th className="p-2 border">Statut</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(r => (
            <tr key={r.id} className="bg-white">
              <td className="p-2 border">{r.reported.email} <span className="text-xs text-gray-500">({r.reported.role})</span></td>
              <td className="p-2 border">{r.reporter.email}</td>
              <td className="p-2 border">{r.reason}</td>
              <td className="p-2 border">
                <span className={`text-white px-2 py-1 rounded text-xs ${getBadgeColor(r.status)}`}>
                  {r.status}
                </span>
              </td>
              <td className="p-2 border">
                <select
                  value={r.status}
                  onChange={(e) => updateStatus(r.id, e.target.value)}
                  className="border px-2 py-1 rounded"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="REVIEWED">REVIEWED</option>
                  <option value="BLOCKED">BLOCKED</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
