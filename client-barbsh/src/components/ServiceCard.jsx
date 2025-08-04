import { useNavigate } from "react-router-dom";

function ServiceCard({ service }) {
    const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleBook = () => {
    if (!token) return navigate("/login");
    navigate(`/bookings/${service.id}`);
  };
  return (
    <div className="border rounded p-4 shadow hover:shadow-lg transition">
      <h3 className="text-xl font-semibold">{service.title}</h3>
      <p className="text-sm text-gray-600 mb-2">{service.description}</p>
      <p className="font-bold text-blue-600">{service.price}€</p>
      <p className="text-sm text-gray-500">Durée : {service.duration} min</p>
      <p className="text-sm text-gray-500 mt-1">Lieu : {service.location}</p>
      <button
        onClick={handleBook}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Réserver
      </button>
      
    </div>
  );
}

export default ServiceCard;
