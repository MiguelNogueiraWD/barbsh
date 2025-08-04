import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default function AdminStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(() => alert("Erreur chargement des stats"));
  }, []);

  if (!stats) return <p className="p-6">Chargement...</p>;

  const chartData = {
  labels: stats.monthlyStats.map(m => new Date(m.month).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })),
  datasets: [
        {
        label: "Revenus (€)",
        data: stats.monthlyStats.map(m => parseFloat(m.revenue || 0)),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.2)",
        tension: 0.3,
        fill: true
        },
        {
        label: "Réservations",
        data: stats.monthlyStats.map(m => m.bookingsCount || 0),
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.2)",
        tension: 0.3,
        fill: true
        }
    ]
    };



  return (
    <div className="max-w-5xl mx-auto p-6">
        <label className="block mb-2 font-semibold">Filtrer par année :</label>
            <select
            className="border px-3 py-1 mb-4"
            onChange={(e) => {
                const year = e.target.value;
                axios.get(`/admin/stats?year=${year}`)
                .then(res => setStats(res.data))
                .catch(() => alert("Erreur filtre"));
            }}
            >
            <option value="">Toutes les années</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            </select>

      <h2 className="text-2xl font-bold mb-6">Statistiques générales</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-4 shadow rounded">
          <h3 className="text-lg font-semibold">Prestations</h3>
          <p className="text-3xl">{stats.prestationsCount}</p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <h3 className="text-lg font-semibold">Revenus</h3>
          <p className="text-3xl text-green-600">{stats.totalRevenue} €</p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <h3 className="text-lg font-semibold">Utilisateurs</h3>
          <p className="text-3xl">{stats.usersCount}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-xl font-bold mb-4">Évolution mensuelle (Revenus & Réservations)</h3>
        <Line data={chartData} />
      </div>
    </div>
  );
}
