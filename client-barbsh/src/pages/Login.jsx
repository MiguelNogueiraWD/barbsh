import { useState } from "react";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

        try {
            const res = await axios.post("/auth/login", { email, password });

            // Affiche dans la console ce que le backend a répondu :
            console.log("Réponse backend :", res.data);

            localStorage.setItem("token", res.data.token);
            alert("Connexion réussie !");
            navigate("/services");
        } catch (err) {
            console.error("Erreur de connexion :", err);
            if (err.response?.data?.error) {
            setError(err.response.data.error);
            } else {
            setError("Erreur inconnue");
            console.error("Erreur inconnue :", err);
            }
        }
    };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Connexion</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
}

export default Login;
