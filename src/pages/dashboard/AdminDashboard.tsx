import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Scissors, Calendar, CreditCard,
  AlertTriangle, TrendingUp, Search, MoreVertical, Check,
  X, Eye, Ban, Shield, Star, ChevronUp, ChevronDown,
  Download, RefreshCw, Filter, Bell, Settings, LogOut,
  ArrowUpRight, ArrowDownRight, Circle
} from 'lucide-react'
import { getInitials, formatDate, formatPrice, getBookingStatusLabel, getBookingStatusColor } from '@/lib/utils'
import { BookingStatus } from '@/types'

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_STATS = {
  revenue: { value: 12840, change: +18.2, label: 'Revenus du mois' },
  bookings: { value: 347, change: +12.5, label: 'Réservations' },
  users: { value: 1243, change: +24.1, label: 'Utilisateurs' },
  hairdressers: { value: 89, change: +8.3, label: 'Coiffeurs actifs' },
}

const MOCK_USERS = [
  { id: '1', full_name: 'Marie Dupont', email: 'marie.dupont@email.com', role: 'client' as const, is_active: true, created_at: '2024-01-15', bookings: 12, spent: 480 },
  { id: '2', full_name: 'Sophie Martin', email: 'sophie@email.com', role: 'hairdresser' as const, is_active: true, created_at: '2024-02-03', bookings: 156, spent: 0 },
  { id: '3', full_name: 'Lucas Bernard', email: 'lucas@email.com', role: 'client' as const, is_active: true, created_at: '2024-03-10', bookings: 5, spent: 210 },
  { id: '4', full_name: 'Emma Petit', email: 'emma@email.com', role: 'hairdresser' as const, is_active: false, created_at: '2024-01-28', bookings: 34, spent: 0 },
  { id: '5', full_name: 'Thomas Leroy', email: 'thomas@email.com', role: 'client' as const, is_active: true, created_at: '2024-04-05', bookings: 8, spent: 320 },
  { id: '6', full_name: 'Clara Moreau', email: 'clara@email.com', role: 'moderator' as const, is_active: true, created_at: '2024-01-01', bookings: 0, spent: 0 },
]

const MOCK_HAIRDRESSERS = [
  { id: '1', name: 'Amara Diallo', city: 'Paris', plan: 'vip', rating: 4.9, reviews: 187, revenue: 3240, bookings: 89, is_verified: true, joined: '2024-01-15' },
  { id: '2', name: 'Yasmine Benhaddad', city: 'Lyon', plan: 'pro', rating: 4.7, reviews: 64, revenue: 1890, bookings: 52, is_verified: true, joined: '2024-02-10' },
  { id: '3', name: 'Léa Fontaine', city: 'Paris', plan: 'free', rating: 4.5, reviews: 23, revenue: 650, bookings: 18, is_verified: false, joined: '2024-04-01' },
  { id: '4', name: 'Rania Khaled', city: 'Marseille', plan: 'pro', rating: 4.8, reviews: 112, revenue: 2100, bookings: 61, is_verified: true, joined: '2024-01-28' },
  { id: '5', name: 'Julie Marchand', city: 'Bordeaux', plan: 'vip', rating: 4.6, reviews: 78, revenue: 1750, bookings: 45, is_verified: true, joined: '2024-03-05' },
]

const MOCK_BOOKINGS = [
  { id: 'BK001', client: 'Marie Dupont', hairdresser: 'Amara Diallo', service: 'Balayage complet', date: '2024-06-15', amount: 85, status: 'completed' as BookingStatus, commission: 12.75 },
  { id: 'BK002', client: 'Thomas Leroy', hairdresser: 'Yasmine Benhaddad', service: 'Coupe + Brushing', date: '2024-06-15', amount: 65, status: 'confirmed' as BookingStatus, commission: 9.75 },
  { id: 'BK003', client: 'Lucas Bernard', hairdresser: 'Rania Khaled', service: 'Coloration', date: '2024-06-14', amount: 95, status: 'cancelled' as BookingStatus, commission: 0 },
  { id: 'BK004', client: 'Sophie Martin', hairdresser: 'Léa Fontaine', service: 'Coiffure mariée', date: '2024-06-13', amount: 180, status: 'completed' as BookingStatus, commission: 27 },
  { id: 'BK005', client: 'Emma Petit', hairdresser: 'Julie Marchand', service: 'Lissage brésilien', date: '2024-06-12', amount: 120, status: 'pending' as BookingStatus, commission: 18 },
]

const MOCK_REPORTS = [
  { id: '1', type: 'review', reporter: 'Marie D.', reported: 'Commentaire offensant', target: 'Avis sur Amara Diallo', date: '2024-06-10', status: 'pending', severity: 'medium' },
  { id: '2', type: 'profile', reporter: 'Admin système', reported: 'Fausse identité suspectée', target: 'Profil: Jean Untel', date: '2024-06-09', status: 'pending', severity: 'high' },
  { id: '3', type: 'message', reporter: 'Lucas B.', reported: 'Harcèlement', target: 'Message de Thomas L.', date: '2024-06-08', status: 'resolved', severity: 'high' },
  { id: '4', type: 'review', reporter: 'Sophie M.', reported: 'Avis non authentique', target: 'Avis sur Léa Fontaine', date: '2024-06-07', status: 'dismissed', severity: 'low' },
]

const REVENUE_DATA = [
  { month: 'Jan', revenue: 3200, commissions: 480 },
  { month: 'Fév', revenue: 5100, commissions: 765 },
  { month: 'Mar', revenue: 7800, commissions: 1170 },
  { month: 'Avr', revenue: 9200, commissions: 1380 },
  { month: 'Mai', revenue: 11400, commissions: 1710 },
  { month: 'Juin', revenue: 12840, commissions: 1926 },
]

const MAX_REVENUE = Math.max(...REVENUE_DATA.map(d => d.revenue))

// ─── Types ─────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'users' | 'hairdressers' | 'bookings' | 'revenue' | 'moderation'

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ stat, icon: Icon, color }: {
  stat: { value: number; change: number; label: string }
  icon: React.FC<{ className?: string }>
  color: string
}) {
  const isPositive = stat.change >= 0
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{stat.label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">
          {stat.label.includes('Revenu') ? formatPrice(stat.value) : stat.value.toLocaleString()}
        </p>
        <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {Math.abs(stat.change)}% ce mois
        </div>
      </div>
    </div>
  )
}

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    free: 'bg-slate-100 text-slate-600',
    pro: 'bg-violet-100 text-violet-700',
    vip: 'bg-amber-100 text-amber-700',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[plan] ?? styles.free}`}>{plan.toUpperCase()}</span>
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    client: 'bg-blue-50 text-blue-600',
    hairdresser: 'bg-violet-50 text-violet-600',
    moderator: 'bg-orange-50 text-orange-600',
    admin: 'bg-red-50 text-red-600',
  }
  const labels: Record<string, string> = {
    client: 'Client',
    hairdresser: 'Coiffeur',
    moderator: 'Modérateur',
    admin: 'Admin',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[role] ?? styles.client}`}>{labels[role] ?? role}</span>
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, { label: string; class: string }> = {
    low: { label: 'Faible', class: 'bg-slate-100 text-slate-600' },
    medium: { label: 'Moyen', class: 'bg-amber-100 text-amber-700' },
    high: { label: 'Élevé', class: 'bg-red-100 text-red-700' },
  }
  const { label, class: cls } = map[severity] ?? map.low
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{label}</span>
}

function ReportStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; class: string }> = {
    pending: { label: 'En attente', class: 'bg-amber-100 text-amber-700' },
    resolved: { label: 'Résolu', class: 'bg-emerald-100 text-emerald-700' },
    dismissed: { label: 'Rejeté', class: 'bg-slate-100 text-slate-500' },
  }
  const { label, class: cls } = map[status] ?? map.pending
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{label}</span>
}

// ─── Tabs Content ──────────────────────────────────────────────────────────────

function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard stat={MOCK_STATS.revenue} icon={CreditCard} color="bg-violet-500" />
        <StatCard stat={MOCK_STATS.bookings} icon={Calendar} color="bg-blue-500" />
        <StatCard stat={MOCK_STATS.users} icon={Users} color="bg-emerald-500" />
        <StatCard stat={MOCK_STATS.hairdressers} icon={Scissors} color="bg-pink-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900">Revenus & Commissions</h3>
              <p className="text-sm text-slate-400 mt-0.5">6 derniers mois</p>
            </div>
            <button className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
          <div className="flex items-end gap-3 h-48">
            {REVENUE_DATA.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col gap-0.5" style={{ height: '180px' }}>
                  <div className="flex-1 flex items-end gap-0.5">
                    <div
                      className="flex-1 bg-violet-500 rounded-t opacity-90 transition-all hover:opacity-100"
                      style={{ height: `${(d.revenue / MAX_REVENUE) * 100}%` }}
                      title={formatPrice(d.revenue)}
                    />
                    <div
                      className="flex-1 bg-pink-400 rounded-t opacity-90 transition-all hover:opacity-100"
                      style={{ height: `${(d.commissions / MAX_REVENUE) * 100}%` }}
                      title={formatPrice(d.commissions)}
                    />
                  </div>
                </div>
                <span className="text-xs text-slate-400">{d.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-violet-500" /><span className="text-xs text-slate-500">Volume total</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-pink-400" /><span className="text-xs text-slate-500">Commissions (15%)</span></div>
          </div>
        </div>

        {/* Quick actions & recent alerts */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 mb-3">Actions rapides</h3>
            <div className="space-y-2">
              {[
                { label: 'Valider coiffeurs en attente', count: 3, icon: Check, color: 'text-emerald-500' },
                { label: 'Signalements à traiter', count: 2, icon: AlertTriangle, color: 'text-amber-500' },
                { label: 'Profils à vérifier', count: 5, icon: Shield, color: 'text-violet-500' },
              ].map((item) => (
                <button key={item.label} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                  <div className="flex items-center gap-2.5">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-sm text-slate-700">{item.label}</span>
                  </div>
                  <span className="text-xs font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">{item.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 mb-3">Réservations récentes</h3>
            <div className="space-y-3">
              {MOCK_BOOKINGS.slice(0, 3).map((b) => (
                <div key={b.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-700">{b.client}</p>
                    <p className="text-xs text-slate-400">{b.service}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-900">{formatPrice(b.amount)}</p>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${getBookingStatusColor(b.status)}`}>{getBookingStatusLabel(b.status)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function UsersTab() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const filtered = MOCK_USERS.filter(u => {
    const matchSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input-field pl-9 text-sm w-full"
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field text-sm w-full sm:w-40"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
        >
          <option value="all">Tous les rôles</option>
          <option value="client">Clients</option>
          <option value="hairdresser">Coiffeurs</option>
          <option value="moderator">Modérateurs</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {['Utilisateur', 'Rôle', 'Statut', 'Inscription', 'Activité', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {getInitials(user.full_name)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{user.full_name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Circle className={`w-2 h-2 fill-current ${user.is_active ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <span className={`text-xs ${user.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {user.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{formatDate(user.created_at)}</td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {user.role === 'client' ? `${user.bookings} résa · ${formatPrice(user.spent)}` : `${user.bookings} résa`}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button title="Voir profil" className="p-1.5 hover:bg-violet-50 rounded-lg text-slate-400 hover:text-violet-600 transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button title={user.is_active ? 'Désactiver' : 'Activer'} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function HairdressersTab() {
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')

  const filtered = MOCK_HAIRDRESSERS.filter(h => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) || h.city.toLowerCase().includes(search.toLowerCase())
    const matchPlan = planFilter === 'all' || h.plan === planFilter
    return matchSearch && matchPlan
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input-field pl-9 text-sm w-full"
            placeholder="Nom, ville..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field text-sm w-full sm:w-36"
          value={planFilter}
          onChange={e => setPlanFilter(e.target.value)}
        >
          <option value="all">Tous les plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="vip">VIP</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {['Coiffeur', 'Plan', 'Note', 'Réservations', 'Revenus', 'Vérifié', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((h) => (
              <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {getInitials(h.name)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{h.name}</p>
                      <p className="text-xs text-slate-400">{h.city}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><PlanBadge plan={h.plan} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold text-slate-900">{h.rating}</span>
                    <span className="text-xs text-slate-400">({h.reviews})</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">{h.bookings}</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{formatPrice(h.revenue)}</td>
                <td className="px-4 py-3">
                  {h.is_verified
                    ? <span className="flex items-center gap-1 text-xs text-emerald-600"><Check className="w-3.5 h-3.5" /> Vérifié</span>
                    : <button className="text-xs text-violet-600 font-medium hover:underline flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Vérifier</button>
                  }
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-violet-50 rounded-lg text-slate-400 hover:text-violet-600 transition-colors" title="Voir profil"><Eye className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors" title="Suspendre"><Ban className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BookingsTab() {
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = statusFilter === 'all' ? MOCK_BOOKINGS : MOCK_BOOKINGS.filter(b => b.status === statusFilter)

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s === 'all' ? 'Toutes' : getBookingStatusLabel(s as BookingStatus)}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {['ID', 'Client', 'Coiffeur', 'Service', 'Date', 'Montant', 'Commission', 'Statut'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{b.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-800">{b.client}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{b.hairdresser}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{b.service}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{formatDate(b.date)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-900">{formatPrice(b.amount)}</td>
                <td className="px-4 py-3 text-sm text-violet-600 font-medium">{b.commission > 0 ? formatPrice(b.commission) : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getBookingStatusColor(b.status)}`}>
                    {getBookingStatusLabel(b.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Commission summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Volume total', value: MOCK_BOOKINGS.reduce((s, b) => s + b.amount, 0), color: 'text-slate-900' },
          { label: 'Commissions totales', value: MOCK_BOOKINGS.reduce((s, b) => s + b.commission, 0), color: 'text-violet-700' },
          { label: 'Taux moyen', value: '15%', raw: true, color: 'text-slate-700' },
          { label: 'Réservations annulées', value: MOCK_BOOKINGS.filter(b => b.status === 'cancelled').length, raw: true, color: 'text-red-500' },
        ].map(item => (
          <div key={item.label} className="card p-4 text-center">
            <p className="text-xs text-slate-400 mb-1">{item.label}</p>
            <p className={`text-xl font-bold ${item.color}`}>
              {item.raw ? item.value : formatPrice(item.value as number)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ModerationTab() {
  const [reports, setReports] = useState(MOCK_REPORTS)
  const [filter, setFilter] = useState('all')

  const resolve = (id: string) => setReports(r => r.map(x => x.id === id ? { ...x, status: 'resolved' } : x))
  const dismiss = (id: string) => setReports(r => r.map(x => x.id === id ? { ...x, status: 'dismissed' } : x))

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['all', 'pending', 'resolved', 'dismissed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {{ all: 'Tous', pending: 'En attente', resolved: 'Résolus', dismissed: 'Rejetés' }[f]}
            </button>
          ))}
        </div>
        {reports.filter(r => r.status === 'pending').length > 0 && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            {reports.filter(r => r.status === 'pending').length} signalement(s) en attente
          </div>
        )}
      </div>

      <div className="space-y-3">
        {filtered.map((report) => (
          <div key={report.id} className="card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <SeverityBadge severity={report.severity} />
                  <ReportStatusBadge status={report.status} />
                  <span className="text-xs text-slate-400 capitalize">{report.type === 'review' ? 'Avis' : report.type === 'profile' ? 'Profil' : 'Message'}</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">{report.reported}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Signalé par <span className="font-medium text-slate-700">{report.reporter}</span> • {report.target}
                </p>
                <p className="text-xs text-slate-400 mt-1">{formatDate(report.date)}</p>
              </div>
              {report.status === 'pending' && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => resolve(report.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Résoudre
                  </button>
                  <button
                    onClick={() => dismiss(report.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Rejeter
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucun signalement dans cette catégorie</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'overview', label: 'Vue générale', icon: LayoutDashboard },
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'hairdressers', label: 'Coiffeurs', icon: Scissors },
  { id: 'bookings', label: 'Réservations', icon: Calendar },
  { id: 'moderation', label: 'Modération', icon: AlertTriangle },
]

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('overview')

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Admin topbar */}
      <div className="bg-[#1C1C3A] text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-wide">Stylio Admin</span>
            <span className="hidden sm:block text-xs text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">Console</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold">A</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gérez la plateforme Stylio en temps réel</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-slate-100 mb-6 overflow-x-auto scrollbar-hide">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                tab === id
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {tab === 'overview' && <OverviewTab />}
            {tab === 'users' && <UsersTab />}
            {tab === 'hairdressers' && <HairdressersTab />}
            {tab === 'bookings' && <BookingsTab />}
            {tab === 'moderation' && <ModerationTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
