import { type ClassValue, clsx } from 'clsx'
import { format, parseISO, isToday, isTomorrow, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'

// ─── CSS class merging ────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

export const formatDate = (date: string | Date) => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd MMMM yyyy', { locale: fr })
}

export const formatTime = (time: string) => {
  return time.slice(0, 5) // HH:mm from HH:mm:ss
}

export const formatDateTime = (date: string, time: string) => {
  const d = parseISO(date)
  if (isToday(d)) return `Aujourd'hui à ${formatTime(time)}`
  if (isTomorrow(d)) return `Demain à ${formatTime(time)}`
  return `${formatDate(date)} à ${formatTime(time)}`
}

export const getWeekDays = (startDate = new Date()) => {
  return Array.from({ length: 7 }, (_, i) => addDays(startDate, i))
}

// ─── Price formatting ─────────────────────────────────────────────────────────

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

// ─── Rating helpers ───────────────────────────────────────────────────────────

export const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => i + 1 <= Math.round(rating))
}

// ─── String helpers ───────────────────────────────────────────────────────────

export const truncate = (str: string, length = 100) => {
  if (str.length <= length) return str
  return str.slice(0, length) + '…'
}

export const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ─── Status helpers ───────────────────────────────────────────────────────────

export const getBookingStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmé',
    cancelled: 'Annulé',
    completed: 'Terminé',
    no_show: 'Absent',
  }
  return labels[status] ?? status
}

export const getBookingStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700',
    confirmed: 'bg-primary-50 text-primary-700',
    cancelled: 'bg-red-50 text-red-700',
    completed: 'bg-emerald-50 text-emerald-700',
    no_show: 'bg-gray-100 text-gray-600',
  }
  return colors[status] ?? 'bg-gray-100 text-gray-600'
}

// ─── Distance ─────────────────────────────────────────────────────────────────

export const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Mock data helpers ────────────────────────────────────────────────────────

export const AVATAR_PLACEHOLDER = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7C5CFC&color=fff&size=128`

export const HAIRDRESSER_IMAGES = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop',
]
