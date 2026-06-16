import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, Star, MessageCircle, Search, CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { MOCK_HAIRDRESSERS, MOCK_SERVICES } from '@/lib/mockData'
import { formatPrice, getInitials, getBookingStatusColor, getBookingStatusLabel } from '@/lib/utils'
import type { Booking } from '@/types'
import { format, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'

// Mock client bookings
const mockBookings: Booking[] = [
  {
    id: 'b1',
    client_id: 'c1',
    hairdresser_id: '1',
    service_id: 's1',
    hairdresser: MOCK_HAIRDRESSERS[0],
    service: MOCK_SERVICES[0],
    date: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    time_slot: '14:00',
    status: 'confirmed',
    total_price: 65,
    location_type: 'salon',
    created_at: new Date().toISOString(),
  },
  {
    id: 'b2',
    client_id: 'c1',
    hairdresser_id: '2',
    service_id: 's4',
    hairdresser: MOCK_HAIRDRESSERS[1],
    service: MOCK_SERVICES[3],
    date: format(addDays(new Date(), -7), 'yyyy-MM-dd'),
    time_slot: '10:30',
    status: 'completed',
    total_price: 28,
    location_type: 'salon',
    created_at: new Date().toISOString(),
  },
  {
    id: 'b3',
    client_id: 'c1',
    hairdresser_id: '3',
    service_id: 's7',
    hairdresser: MOCK_HAIRDRESSERS[2],
    service: MOCK_SERVICES[6],
    date: format(addDays(new Date(), -30), 'yyyy-MM-dd'),
    time_slot: '11:00',
    status: 'completed',
    total_price: 120,
    location_type: 'home',
    created_at: new Date().toISOString(),
  },
]

export default function ClientDashboard() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming')

  const upcoming = mockBookings.filter((b) => ['pending', 'confirmed'].includes(b.status))
  const history = mockBookings.filter((b) => ['completed', 'cancelled', 'no_show'].includes(b.status))

  const totalSpent = history.reduce((sum, b) => sum + b.total_price, 0)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-dark">
            Bonjour, {user?.full_name.split(' ')[0]} 👋
          </h1>
          <p className="text-muted mt-1">Gérez vos rendez-vous et découvrez de nouveaux coiffeurs</p>
        </div>
        <Link to="/recherche" className="btn-primary hidden sm:flex items-center gap-2">
          <Search className="w-4 h-4" />
          Réserver
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'RDV à venir', value: upcoming.length, icon: Calendar, color: 'bg-primary-50 text-primary' },
          { label: 'Visites totales', value: history.length, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Total dépensé', value: formatPrice(totalSpent), icon: Star, color: 'bg-amber-50 text-amber-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card text-center">
            <div className={`inline-flex w-10 h-10 rounded-xl ${color} items-center justify-center mb-2 mx-auto`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="font-display text-xl font-bold text-dark">{value}</p>
            <p className="text-xs text-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        {[
          { key: 'upcoming', label: 'À venir', count: upcoming.length },
          { key: 'history', label: 'Historique', count: history.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all ${
              activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-dark'
            }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.key ? 'bg-primary-50 text-primary' : 'bg-gray-100 text-muted'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Booking list */}
      <div className="space-y-4">
        {(activeTab === 'upcoming' ? upcoming : history).length === 0 ? (
          <div className="card text-center py-14">
            <Calendar className="w-12 h-12 text-primary-200 mx-auto mb-3" />
            <p className="font-semibold text-dark mb-1">Aucun rendez-vous</p>
            <p className="text-muted text-sm mb-5">
              {activeTab === 'upcoming' ? 'Réservez votre prochain coiffeur !' : "Votre historique apparaîtra ici"}
            </p>
            <Link to="/recherche" className="btn-primary inline-flex items-center gap-2">
              <Search className="w-4 h-4" />
              Trouver un coiffeur
            </Link>
          </div>
        ) : (
          (activeTab === 'upcoming' ? upcoming : history).map((booking) => {
            const hName = booking.hairdresser?.user?.full_name ?? 'Coiffeur'
            const avatar = booking.hairdresser?.user?.avatar_url
            return (
              <div key={booking.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {avatar ? (
                      <img src={avatar} alt={hName} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold shrink-0">
                        {getInitials(hName)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-dark">{booking.service?.name}</p>
                      <p className="text-sm text-muted">{hName}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-muted">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(booking.date), 'dd MMM yyyy', { locale: fr })}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted">
                          <Clock className="w-3.5 h-3.5" />
                          {booking.time_slot}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-dark">{formatPrice(booking.total_price)}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getBookingStatusColor(booking.status)}`}>
                      {getBookingStatusLabel(booking.status)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <Link
                    to={`/coiffeur/${booking.hairdresser_id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-sm font-medium hover:border-primary hover:text-primary transition-all"
                  >
                    Voir le profil <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  {booking.status === 'confirmed' && (
                    <button className="flex items-center gap-1.5 py-2 px-4 rounded-xl border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-all">
                      <XCircle className="w-4 h-4" />
                      Annuler
                    </button>
                  )}
                  {booking.status === 'completed' && (
                    <button className="flex items-center gap-1.5 py-2 px-4 rounded-xl border border-amber-200 text-sm font-medium text-amber-600 hover:bg-amber-50 transition-all">
                      <Star className="w-4 h-4" />
                      Laisser un avis
                    </button>
                  )}
                  <Link
                    to={`/messages/${booking.hairdresser_id}`}
                    className="p-2 rounded-xl border border-border hover:border-primary hover:text-primary transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Quick search CTA */}
      <div className="mt-8 rounded-3xl bg-gradient-primary p-6 text-white text-center sm:hidden">
        <p className="font-display text-lg font-bold mb-2">Prêt pour votre prochain look ?</p>
        <Link to="/recherche" className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors mt-2">
          <Search className="w-4 h-4" />
          Réserver maintenant
        </Link>
      </div>
    </div>
  )
}
