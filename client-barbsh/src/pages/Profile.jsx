import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import AvailabilitiesManager from "../components/AvailabilitiesManager";


function Profile() {
  const [userInfo, setUserInfo] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    //  Extrait les infos depuis le token
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const payload = JSON.parse(atob(token.split(".")[1]));
    setUserInfo({ email: payload.email, role: payload.role });

    //  Récupérer les commandes
    axios.get("/orders/me")
      .then((res) => setOrders(res.data))
      .catch(() => setError("Erreur chargement commandes"));
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">👤 Mon profil</h2>

      {userInfo && (
        <>
          <p><strong>Email :</strong> {userInfo.email || "(dans token)"}</p>
          <p><strong>Rôle :</strong> {userInfo.role}</p>
          <button
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={logout}
          >
            Se déconnecter
          </button>
        </>
      )}

      <h3 className="mt-8 text-xl font-semibold">🛍️ Mes commandes</h3>
      {error && <p className="text-red-500">{error}</p>}
      <ul className="mt-4 space-y-2">
        {orders.map(order => (
          <li key={order.id} className="border p-3 rounded">
            <strong>Commande #{order.id}</strong> — {order.total} €
            <br />
            {new Date(order.createdAt).toLocaleDateString()}
          </li>
        ))}
      </ul>
       {userInfo?.role === "COIFFEUR" && (
          <>
            <h3 className="mt-8 text-xl font-semibold"> Mes créneaux</h3>
            <AvailabilitiesManager />
          </>
        )}
    </div>
    
  );
}

export default Profile;
