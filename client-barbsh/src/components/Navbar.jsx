import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (token) {
      axios.get('/messages/inbox')
        .then(res => {
          const count = res.data.filter(m => !m.read).length;
          setUnreadCount(count);
        });
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center">
      <div className="text-lg font-bold">Barbsh</div>
      <div className="space-x-4 flex items-center">
        <Link to="/services" className="hover:underline">Prestations</Link>
        <Link to="/map" className="hover:underline"> Carte</Link>

        {token && (
          <>
            <Link to="/messages">
              Messages {unreadCount > 0 && <span className="text-red-500">({unreadCount})</span>}
            </Link>
            <Link to="/messages/sent">Envoyés</Link>
            <Link to="/messages/new">Nouveau</Link>
            <Link to="/bookings">Mes réservations</Link>
            <Link to="/profile">Profil</Link>
            <Link to="/admin">Admin</Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-sm"
            >
              Déconnexion
            </button>
          </>
        )}

        {!token && (
          <>
            <Link to="/login">Connexion</Link>
            <Link to="/register">Inscription</Link>
          </>
        )}

      </div>
    </nav>
  );
}

export default Navbar;
