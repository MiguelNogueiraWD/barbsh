import { useState } from "react";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "CLIENT",
    acceptedCGU: false
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.acceptedCGU) {
      return setError("Vous devez accepter les CGU.");
    }

    try {
      await axios.post("/auth/register", form);
      navigate("/login");
    } catch {
      setError("Erreur lors de l’inscription.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Inscription</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full border px-3 py-2"
          value={form.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          className="w-full border px-3 py-2"
          value={form.password}
          onChange={handleChange}
        />

        <select name="role" value={form.role} onChange={handleChange} className="w-full border px-3 py-2">
          <option value="CLIENT">Client</option>
          <option value="COIFFEUR">Coiffeur</option>
        </select>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="acceptedCGU"
            checked={form.acceptedCGU}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="acceptedCGU">
            J’accepte les <a href="/cgu" target="_blank" className="underline text-blue-600">Conditions Générales</a>
          </label>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">S’inscrire</button>
      </form>
    </div>
  );
}

export default Register;
