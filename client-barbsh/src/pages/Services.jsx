import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import ServiceCard from "../components/ServiceCard";

function Services() {
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("/services")
      .then((res) => setServices(res.data))
      .catch((err) => {
        console.error("Erreur chargement des services :", err);
        setError("Impossible de charger les services.");
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Prestations disponibles</h2>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map(service => (
          <div key={service.id} className="border rounded p-4 shadow hover:shadow-lg transition">
            <ServiceCard key={service.id} service={service} />
            <h3 className="text-xl font-semibold">{service.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{service.description}</p>
            <p className="font-bold text-blue-600">{service.price}€</p>
            <p className="text-sm text-gray-500">Durée : {service.duration} min</p>
            <p className="text-sm text-gray-500 mt-1">Lieu : {service.location}</p>
            <p className="text-sm text-gray-500 mt-1">
              Coiffeur : {service.coiffeur.email}
              <span className={`ml-2 px-2 py-0.5 rounded text-white text-xs ${
                service.coiffeur.subscriptionType === 'VIP' ? 'bg-yellow-500' :
                service.coiffeur.subscriptionType === 'PRO' ? 'bg-blue-500' : 'bg-gray-500'
              }`}>
                {service.coiffeur.subscriptionType}
              </span>
            </p>

          </div>
        ))}
      </div>
    </div>
  );
}

export default Services;
