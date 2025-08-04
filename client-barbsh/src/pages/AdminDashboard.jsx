import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { Link } from "react-router-dom";
import { toast } from "react-toastify";


function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ date: "", serviceId: "" });
  const [filtre, setFiltre] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [filterCoiffeur, setFilterCoiffeur] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [coiffeurs, setCoiffeurs] = useState([]);


  useEffect(() => {
    axios.get(`/admin/bookings?page=${page}`)
      .then(res => {
        setBookings(res.data.bookings);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => setError("Erreur chargement réservations"));
  }, [page]);

  useEffect(() => {
      axios.get("/admin/users")
        .then(res => setCoiffeurs(res.data))
        .catch(() => toast.error("Erreur chargement utilisateurs"));
  }, []);


  const getStatusColor = (status) => {
    switch (status) {
      case 'VALIDATED': return 'green';
      case 'REFUSED': return 'red';
      default: return 'orange';
    }
  };

  const updateStatus = async (id, status) => {
    const confirm = window.confirm(`Confirmer le statut ${status} ?`);
    if (!confirm) return;

    try {
      const res = await axios.put(`/admin/bookings/${id}/status`, { status });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: res.data.status } : b));
      toast.success(`Réservation ${status.toLowerCase()}`);
    } catch {
      toast.error("Erreur de mise à jour");
    }
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`/admin/bookings/${id}`, editForm);
      setEditId(null);
      toast.success("Réservation modifiée");
      // recharger
      const res = await axios.get('/admin/bookings');
      setBookings(res.data);
    } catch {
      toast.error("Erreur modification");
    }
  };

  const confirmDelete = async (id) => {
    if (!window.confirm("Confirmer suppression ?")) return;
    try {
      await axios.delete(`/admin/bookings/${id}`);
      setBookings(bookings.filter(b => b.id !== id));
      toast.success("Supprimée");
    } catch {
      toast.error("Erreur suppression");
    }
  };

  const updateSubscription = async (userId, subscriptionType) => {
  const confirm = window.confirm(`Confirmer le changement d’abonnement vers ${subscriptionType} ?`);
    if (!confirm) return;

    try {
      await axios.put(`/admin/users/${userId}/subscription`, { subscriptionType });
      toast.success("Abonnement mis à jour !");
      setCoiffeurs(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, subscriptionType } : u
        )
      );
    } catch {
      toast.error("Erreur mise à jour");
    }
  };


  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Tableau de bord Administrateur</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white shadow p-4 rounded text-center">
            <h3 className="text-sm text-gray-600">Total Réservations</h3>
            <p className="text-2xl font-bold">{bookings.length}</p>
          </div>
          <div className="bg-white shadow p-4 rounded text-center">
            <h3 className="text-sm text-gray-600">Coiffeurs inscrits</h3>
            <p className="text-2xl font-bold">{coiffeurs.length}</p>
          </div>
          <div className="bg-white shadow p-4 rounded text-center">
            <h3 className="text-sm text-gray-600">Revenus estimés (€)</h3>
            <p className="text-2xl font-bold">
              {bookings.reduce((sum, b) => sum + (b.service?.price || 0), 0)}
            </p>
          </div>
          <div className="bg-white shadow p-4 rounded text-center">
            <h3 className="text-sm text-gray-600">Réservations validées</h3>
            <p className="text-2xl font-bold">
              {bookings.filter(b => b.status === 'VALIDATED').length}
            </p>
          </div>
        </div>


      {/* Navigation admin */}
      <div className="bg-gray-100 p-4 rounded mb-8 shadow">
        <ul className="space-y-2">
          <li><Link to="/admin/bookings" className="text-blue-600 underline"> Voir les réservations</Link></li>
          <li><Link to="/admin/newsletter-logs" className="text-blue-600 underline"> Historique des newsletters</Link></li>
          <li><Link to="/admin/users" className="text-blue-600 underline"> Gérer les utilisateurs</Link></li>
          <li><Link to="/admin/products" className="text-blue-600 underline"> Produits & commandes</Link></li>
          <li><Link to="/admin/posts" className="text-blue-600 underline"> Blog / Publications</Link></li>
          <li>
            <Link to="/admin/reports" className="text-blue-600 underline">
              Voir les signalements
            </Link>
          </li>
          <li>
            <Link to="/admin/stats" className="text-blue-600 underline">
              Statistiques & Dashboard
            </Link>
          </li>

        </ul>
      </div>
        
      <h2 className="text-xl font-semibold mb-4"> Réservations récentes</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="overflow-x-auto">
        <div className="flex gap-4 items-center mb-4">
          <label htmlFor="filtre">Filtrer :</label>
          <select
            id="filtre"
            className="border px-2 py-1"
            value={filtre}
            onChange={e => setFiltre(e.target.value)}
          >
            <option value="">-- Tous --</option>
            <option value="PENDING">En attente</option>
            <option value="VALIDATED">Validées</option>
            <option value="REFUSED">Refusées</option>
          </select>
          {/* Nouveau : Période */}
            <select
              onChange={e => {
                const days = parseInt(e.target.value);
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - days);
                setBookings(prev =>
                  prev.filter(b => new Date(b.date) >= cutoff)
                );
              }}
              className="border px-2 py-1"
            >
              <option value="">Toutes périodes</option>
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">3 derniers mois</option>
            </select>
          </div>
        
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/*  Recherche Email Client */}
            <input
              type="text"
              placeholder="Rechercher par email client"
              className="border px-3 py-1 rounded"
              value={searchEmail}
              onChange={e => setSearchEmail(e.target.value)}
            />

            {/*  Filtrer par coiffeur */}
            <select
              className="border px-3 py-1 rounded"
              value={filterCoiffeur}
              onChange={e => setFilterCoiffeur(e.target.value)}
            >
              <option value="">— Tous les coiffeurs —</option>
              {[...new Set(bookings.map(b => b.service?.coiffeur?.email))].map(email =>
                email ? (
                  <option key={email} value={email}>{email}</option>
                ) : null
              )}
            </select>

            {/*  Tri dates */}
            <button
              onClick={() => setSortDesc(prev => !prev)}
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              Trier par date {sortDesc ? "↓" : "↑"}
            </button>
          </div>

        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">Client</th>
              <th className="border p-2">Service</th>
              <th className="border p-2">Coiffeur</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Statut</th>
            </tr>
          </thead>
          <tbody>
            {bookings
              .filter(b =>
                (!searchEmail || b.client?.email?.toLowerCase().includes(searchEmail.toLowerCase())) &&
                (!filterCoiffeur || b.service?.coiffeur?.email === filterCoiffeur)
              )
              .sort((a, b) => sortDesc
                ? new Date(b.date) - new Date(a.date)
                : new Date(a.date) - new Date(b.date)
              )
              .map(b => (
              <tr key={b.id} className="bg-white">
                <td>
                  {b.client?.email}
                  <span
                    className={`ml-2 px-2 py-0.5 rounded text-white text-xs ${
                      b.client?.role === 'ADMIN'
                        ? 'bg-red-500'
                        : b.client?.role === 'COIFFEUR'
                        ? 'bg-blue-500'
                        : 'bg-green-500'
                    }`}
                  >
                    {b.client?.role}
                  </span>
                </td>
                <td className="border p-2">{b.service?.title}</td>
                <td className="border p-2">{b.service?.coiffeur?.email}</td>
                <td className="border p-2">{new Date(b.date).toLocaleString()}</td>
                <td style={{ color: getStatusColor(b.status), fontWeight: 'bold' }}>
                  {b.status}
                  {b.status === "PENDING" && (
                    <div className="mt-1 space-x-2">
                      <button
                        className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                        onClick={() => updateStatus(b.id, "VALIDATED")}
                      >
                        Valider
                      </button>
                      <button
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                        onClick={() => updateStatus(b.id, "REFUSED")}
                      >
                        Refuser
                      </button>
                    </div>
                  )}
                </td>
                    <td>
                        <button
                            className={`text-sm underline ${b.service?.coiffeur?.subscriptionType === "FREE" ? "text-gray-400 cursor-not-allowed" : "text-blue-600"}`}
                            onClick={() => {
                              if (b.service?.coiffeur?.subscriptionType === "FREE") return;
                              setEditId(b.id);
                              setEditForm({ date: b.date.slice(0, 16), serviceId: b.serviceId });
                            }}
                          >
                            Modifier
                        </button>

                        {b.service?.coiffeur?.subscriptionType === "FREE" && (
                            <div className="text-xs text-red-500 mt-1">
                              Coiffeur FREE – modification non autorisée
                            </div>
                          )}

                        {editId === b.id && (
                          <div className="space-x-2 mt-1">
                            <input
                              type="datetime-local"
                              value={editForm.date}
                              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                            />
                            <input
                              type="number"
                              value={editForm.serviceId}
                              onChange={(e) => setEditForm({ ...editForm, serviceId: e.target.value })}
                            />
                            <button onClick={() => saveEdit(b.id)}>Enregistrer</button>
                          </div>
                        )}
                      </td>

                    <td>
                      <button
                        className="text-sm text-red-500 underline"
                        onClick={() => confirmDelete(b.id)}
                      >
                        Supprimer
                      </button>
                    </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
          <div className="flex justify-center mt-4 space-x-4">
      <button
        disabled={page === 1}
        onClick={() => setPage(prev => prev - 1)}
        className="px-3 py-1 bg-gray-200 rounded"
      >
         Précédent
      </button>
      <span>Page {page} / {totalPages}</span>
      <button
        disabled={page === totalPages}
        onClick={() => setPage(prev => prev + 1)}
        className="px-3 py-1 bg-gray-200 rounded"
      >
        Suivant 
      </button>
    </div>
      <hr className="my-10" />
      <h2 className="text-xl font-semibold mb-4">Abonnements des coiffeurs</h2>

      <table className="min-w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Email</th>
            <th className="border p-2">Abonnement</th>
            <th className="border p-2">Changer</th>
          </tr>
        </thead>
        <tbody>
          {(coiffeurs || []).map(coiffeur => (
            <tr key={coiffeur.id}>
              <td className="border p-2">{coiffeur.email}</td>
              <td className="border p-2 font-bold">
                {coiffeur.subscriptionType}
                {coiffeur.subscriptionType === "VIP" && (
                  <span className="ml-2 px-2 py-0.5 text-white bg-purple-600 rounded text-xs">
                     Top Coiffeur
                  </span>
                )}
              </td>

              <td className="border p-2">
                <select
                  value={coiffeur.subscriptionType}
                  onChange={e => updateSubscription(coiffeur.id, e.target.value)}
                  className="border px-2 py-1"
                >
                  <option value="FREE">FREE</option>
                  <option value="PRO">PRO</option>
                  <option value="VIP">VIP</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default AdminDashboard;
