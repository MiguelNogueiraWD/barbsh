import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from 'react-leaflet-cluster';
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function MapServices() {
  const [position, setPosition] = useState(null);
  const [services, setServices] = useState([]);
  const [radius, setRadius] = useState(10); // km
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState("");
  const [disponibilites, setDisponibilites] = useState({});



  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        fetchNearby(latitude, longitude);
      },
      () => alert("Autorisez la géolocalisation")
    );
  }, []);

  const fetchNearby = async (lat, lng) => {
  try {
    const res = await axios.get(`/services/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
    setServices(res.data);
    const sansPosition = res.data.filter(s => !s.lat || !s.lng);
      if (sansPosition.length > 0) {
        console.warn(`${sansPosition.length} services ignorés car sans position.`);
      }


    const dispoPromises = res.data.map(service =>
      axios.get(`/availabilities?coiffeurId=${service.coiffeurId}`)
        .then(d => ({ id: service.id, hasDispo: d.data.length > 0 }))
        .catch(() => ({ id: service.id, hasDispo: false }))
    );

    const dispoResults = await Promise.all(dispoPromises);
    const dispoMap = {};
        dispoResults.forEach(d => {
        dispoMap[d.id] = d.hasDispo;
        });
        setDisponibilites(dispoMap);
    } catch {
        alert("Erreur chargement services");
    }
  };


  const handleRadiusChange = (e) => {
    const r = parseInt(e.target.value);
    setRadius(r);
    if (position) fetchNearby(position[0], position[1]);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Services près de chez vous</h2>

      <label>Rayon : {radius} km</label>
      <input
        type="range"
        min="1"
        max="50"
        value={radius}
        onChange={handleRadiusChange}
        className="block w-full mb-4"
      />
        <label className="block mb-2">Filtrer par type :</label>
            <select
            className="border px-3 py-1 mb-4"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            >
            <option value="">Tous</option>
            {[...new Set(services.map(s => s.type))].map(type =>
                <option key={type} value={type}>{type}</option>
            )}
            </select>

      {position && (
        <MapContainer center={position} zoom={13} style={{ height: "500px", width: "100%" }}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={position}>
            <Popup> Vous êtes ici</Popup>
          </Marker>

          <MarkerClusterGroup chunkedLoading>
            {services
              .filter(s => s.lat && s.lng)
              .filter(s => !typeFilter || s.type === typeFilter)

                .map((s) => (
              <Marker key={s.id} position={[s.lat, s.lng]}>
                <Popup>
                  <b>{s.title}</b><br />
                  {s.coiffeur?.email}<br />
                  {s.price} €<br />
                  <button
                    onClick={() => navigate(`/bookings/${s.id}`)}
                    className="mt-2 bg-blue-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Réserver ici
                  </button>
                  {disponibilites[s.id] !== undefined && (
                    <div>
                        <strong>
                        {disponibilites[s.id] ? " Créneaux disponibles" : " Aucune disponibilité"}
                        </strong>
                    </div>
                    )}
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      )}
    </div>
  );
}
