import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import { Star } from 'lucide-react'
import type { HairdresserProfile } from '@/types'

// Fix leaflet default marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const customIcon = (color = '#7C5CFC') => L.divIcon({
  html: `<div style="
    width: 36px; height: 36px;
    background: ${color};
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  "></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -38],
  className: '',
})

function MapController({ center }: { center?: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, 13, { animate: true, duration: 1 })
  }, [center, map])
  return null
}

interface MapViewProps {
  hairdressers: HairdresserProfile[]
  center?: [number, number]
  className?: string
}

export default function MapView({ hairdressers, center, className = '' }: MapViewProps) {
  const defaultCenter: [number, number] = [48.8566, 2.3522]
  const validHairdressers = hairdressers.filter((h) => h.latitude && h.longitude)

  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-card ${className}`}>
      <MapContainer
        center={center ?? defaultCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={center} />

        {validHairdressers.map((h) => (
          <Marker
            key={h.id}
            position={[h.latitude!, h.longitude!]}
            icon={customIcon(h.subscription_plan === 'vip' ? '#F4A261' : '#7C5CFC')}
          >
            <Popup>
              <div className="min-w-48 font-body">
                <div className="flex items-center gap-2.5 mb-2">
                  {h.user?.avatar_url && (
                    <img
                      src={h.user.avatar_url}
                      alt={h.user.full_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-sm text-dark">{h.user?.full_name}</p>
                    <p className="text-xs text-muted">{h.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold">{h.rating.toFixed(1)}</span>
                  <span className="text-xs text-muted">({h.review_count} avis)</span>
                </div>
                <Link
                  to={`/coiffeur/${h.id}`}
                  className="block w-full text-center py-1.5 px-3 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-600 transition-colors"
                >
                  Voir le profil
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-card px-3 py-2 z-[1000]">
        <div className="flex items-center gap-2 text-xs text-muted">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span>Coiffeur</span>
          <div className="w-3 h-3 rounded-full bg-gold-500 ml-1" />
          <span>Top Coiffeur</span>
        </div>
      </div>
    </div>
  )
}
