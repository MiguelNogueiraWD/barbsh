import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, Calendar, Star, Euro, Users, Clock,
  CheckCircle, XCircle, Bell, Settings, Crown, ChevronRight
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { MOCK_SERVICES } from '@/lib/mockData'
import { formatPrice, getInitials, getBookingStatusColor, getBookingStatusLabel } from '@/lib/utils'
import { format, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'

const mockStats = {
  totalRevenue: 3840,
  monthRevenue: 640,
  totalBookings: 89,
  upcomingBookings: 6,
  avgRating: 4.9,
  totalReviews: 42,
  newClients: 8,
}

const mockUpcoming = [
  { id: 'b1', clientName: 'Marie L.', service: 'Balayage complet', date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), time: '10:00', price: 140, status: 'confirmed' as const, locationType: 'salon' },
  { id: 'b2', clientName: 'Laure M.', service: 'Coupe + Brushing', date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), time: '14:00', price: 65, status: 'confirmed' as const, locationType: 'home' },
  { id: 'b3', clientName: 'Sarah K.', service: 'Coloration', date: format(addDays(new Date(), 2), 'yyyy-MM-dd'), time: '09:30', price: 95, status: 'pending' as const, locationType: 'salon' },
  { id: 'b4', clientName: 'Emma R.', service: 'Balayage complet', date: format(addDays(new Date(), 3), 'yyyy-MM-dd'), time: '11:00', price: 140, status: 'confirmed' as const, locationType: 'salon' },
]

const CHART_DATA = [
  { month: 'Jan', rev: 420 },
  { month: 'Fév', rev: 580 },
  { month: 'Mar', rev: 720 },
  { month: 'Avr', rev: 490 },
  { month: 'Mai', rev: 820 },
  { month: 'Juin', rev: 640 },
]

const maxRev = Math.max(...CHART_DATA.map((d) => d.rev))

export default function HairdresserDashboard() {
  const { user } = useAuthStore()
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending'>('all')

  const filteredBookings = bookingFilter === 'pending'
    ? mockUpcoming.filter((b) => b.status === 'pending')
    : mockUpcoming

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-dark">
              Mon espace
            </h1>
            <span className="badge-gold text-xs">
              <Crown className="w-3 h-3" />
              Top Coiffeur
            </span>
          </div>
          <p className="text-muted">{user?.full_name} · Coiffeuse</p>
        </div>
        <div className="flex gap-2">
          <button className="relative p-2.5 rounded-xl border border-border hover:border-primary hover:text-primary transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
          </button>
          <Link to="/profil-coiffeur" className="p-2.5 rounded-xl border border-border hover:border-primary hover:text-primary transition-all">
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Revenus ce mois', value: formatPrice(mockStats.monthRevenue), icon: Euro, color: 'text-primary bg-primary-50', trend: '+12%' },
          { label: 'RDV à venir', value: mockStats.upcomingBookings, icon: Calendar, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Note moyenne', value: `${mockStats.avgRating}/5 ⭐`, icon: Star, color: 'text-amber-600 bg-amber-50' },
          { label: 'Nouveaux clients', value: mockStats.newClients, icon: Users, color: 'text-accent bg-accent-50', trend: '+3' },
        ].map(({ label, value, icon: Icon, color, trend }) => (
          <div key={label} className="card">
            <div className={`inline-flex w-10 h-10 rounded-xl ${color} items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="font-display text-2xl font-bold text-dark">{value}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted">{label}</p>
              {trend && <span className="text-xs font-medium text-emerald-600">{trend}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left: Bookings ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-dark">Réservations à venir</h2>
            <div className="flex gap-1">
              {[
                { key: 'all', label: 'Toutes' },
                { key: 'pending', label: 'En attente' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setBookingFilter(f.key as typeof bookingFilter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    bookingFilter === f.key ? 'bg-primary text-white' : 'text-muted hover:text-dark'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filteredBookings.map((booking) => (
            <div key={booking.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {getInitials(booking.clientName)}
                  </div>
                  <div>
                    <p className="font-semibold text-dark text-sm">{booking.clientName}</p>
                    <p className="text-muted text-xs">{booking.service}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-xs text-muted">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(booking.date), 'EEE d MMM', { locale: fr })}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted">
                        <Clock className="w-3.5 h-3.5" />
                        {booking.time}
                      </span>
                      <span className={`text-xs ${booking.locationType === 'home' ? 'text-accent' : 'text-primary'}`}>
                        {booking.locationType === 'home' ? '🏠 Domicile' : '✂️ Salon'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-mono font-bold text-dark">{formatPrice(booking.price)}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getBookingStatusColor(booking.status)}`}>
                    {getBookingStatusLabel(booking.status)}
                  </span>
                </div>
              </div>

              {booking.status === 'pending' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary-50 text-primary text-sm font-medium hover:bg-primary hover:text-white transition-all">
                    <CheckCircle className="w-4 h-4" />
                    Accepter
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-600 hover:text-white transition-all">
                    <XCircle className="w-4 h-4" />
                    Refuser
                  </button>
                </div>
              )}
            </div>
          ))}

          {filteredBookings.length === 0 && (
            <div className="card text-center py-10 text-muted">
              Aucune réservation en attente
            </div>
          )}
        </div>

        {/* ── Right: Revenue + Services ── */}
        <div className="space-y-4">
          {/* Revenue chart */}
          <div className="card">
            <h3 className="font-display text-base font-bold text-dark mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Revenus 2024
            </h3>
            <div className="flex items-end gap-1.5 h-28">
              {CHART_DATA.map((d) => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-lg bg-primary/20 hover:bg-primary transition-colors relative group"
                    style={{ height: `${(d.rev / maxRev) * 100}%` }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono font-bold text-primary opacity-0 group-hover:opacity-100 whitespace-nowrap">
                      {d.rev}€
                    </div>
                  </div>
                  <span className="text-[10px] text-muted">{d.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
              <div>
                <p className="text-muted text-xs">Total 2024</p>
                <p className="font-mono font-bold text-dark">{formatPrice(mockStats.totalRevenue)}</p>
              </div>
              <div className="text-right">
                <p className="text-muted text-xs">Commissions (15%)</p>
                <p className="font-mono font-bold text-dark">{formatPrice(mockStats.totalRevenue * 0.15)}</p>
              </div>
            </div>
          </div>

          {/* My services */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-base font-bold text-dark">Mes prestations</h3>
              <button className="text-xs text-primary hover:underline">Modifier</button>
            </div>
            <div className="space-y-2">
              {MOCK_SERVICES.filter((s) => s.hairdresser_id === '1').slice(0, 3).map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-dark">{s.name}</p>
                    <p className="text-xs text-muted">{s.duration_minutes} min</p>
                  </div>
                  <span className="font-mono font-bold text-dark">{formatPrice(s.price)}</span>
                </div>
              ))}
            </div>
            <Link to="/espace-coiffeur/services" className="flex items-center gap-1 text-xs text-primary mt-3 hover:underline">
              Gérer mes prestations <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Upgrade card */}
          <div className="rounded-2xl bg-gradient-primary p-5 text-white">
            <Crown className="w-6 h-6 text-gold-400 mb-2" />
            <p className="font-display font-bold text-base mb-1">Passez en VIP</p>
            <p className="text-white/80 text-xs mb-3">Position top + badge "Top Coiffeur" + promo offerte</p>
            <button className="w-full py-2 rounded-xl bg-white text-primary text-sm font-bold hover:bg-white/90 transition-colors">
              59€/mois – Essayer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
