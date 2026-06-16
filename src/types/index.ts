// ─── Users & Auth ─────────────────────────────────────────────────────────────

export type UserRole = 'client' | 'hairdresser' | 'moderator' | 'admin'

export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: UserRole
  phone?: string
  created_at: string
  is_active: boolean
}

export interface AuthState {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, data: Partial<User>) => Promise<void>
  signOut: () => Promise<void>
  setUser: (user: User | null) => void
}

// ─── Hairdresser Profile ───────────────────────────────────────────────────────

export interface HairdresserProfile {
  id: string
  user_id: string
  user?: User
  bio: string
  specialties: string[]
  years_experience: number
  portfolio_images: string[]
  salon_name?: string
  salon_address?: string
  home_service: boolean
  salon_service: boolean
  latitude?: number
  longitude?: number
  city: string
  zip_code: string
  subscription_plan: 'free' | 'pro' | 'vip'
  rating: number
  review_count: number
  is_verified: boolean
  is_featured: boolean
  created_at: string
}

// ─── Services ─────────────────────────────────────────────────────────────────

export interface Service {
  id: string
  hairdresser_id: string
  name: string
  description?: string
  duration_minutes: number
  price: number
  category: ServiceCategory
  is_available: boolean
}

export type ServiceCategory =
  | 'coupe_femme'
  | 'coupe_homme'
  | 'coupe_enfant'
  | 'coloration'
  | 'meches'
  | 'balayage'
  | 'permanente'
  | 'lissage'
  | 'coiffure_mariee'
  | 'brushing'
  | 'soin'
  | 'autre'

export const SERVICE_CATEGORIES: Record<ServiceCategory, string> = {
  coupe_femme: 'Coupe femme',
  coupe_homme: 'Coupe homme',
  coupe_enfant: 'Coupe enfant',
  coloration: 'Coloration',
  meches: 'Mèches',
  balayage: 'Balayage',
  permanente: 'Permanente',
  lissage: 'Lissage',
  coiffure_mariee: 'Coiffure mariée',
  brushing: 'Brushing',
  soin: 'Soin',
  autre: 'Autre',
}

// ─── Availability ─────────────────────────────────────────────────────────────

export interface Availability {
  id: string
  hairdresser_id: string
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6
  start_time: string
  end_time: string
  is_available: boolean
}

export const DAYS_OF_WEEK = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

// ─── Bookings ─────────────────────────────────────────────────────────────────

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'

export interface Booking {
  id: string
  client_id: string
  hairdresser_id: string
  service_id: string
  client?: User
  hairdresser?: HairdresserProfile
  service?: Service
  date: string
  time_slot: string
  status: BookingStatus
  total_price: number
  location_type: 'salon' | 'home'
  client_address?: string
  notes?: string
  created_at: string
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface Review {
  id: string
  client_id: string
  hairdresser_id: string
  booking_id: string
  client?: User
  rating: number
  comment: string
  is_visible: boolean
  created_at: string
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export type PaymentStatus = 'pending' | 'completed' | 'refunded' | 'failed'

export interface Payment {
  id: string
  booking_id: string
  client_id: string
  hairdresser_id: string
  amount: number
  commission_amount: number
  hairdresser_amount: number
  status: PaymentStatus
  stripe_payment_id?: string
  created_at: string
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read: boolean
  created_at: string
}

export interface Conversation {
  id: string
  participant_ids: string[]
  last_message?: string
  last_message_at: string
  created_at: string
}

// ─── Search & Filters ─────────────────────────────────────────────────────────

export interface SearchFilters {
  query?: string
  city?: string
  category?: ServiceCategory
  min_price?: number
  max_price?: number
  max_distance_km?: number
  home_service?: boolean
  salon_service?: boolean
  min_rating?: number
  sort_by?: 'rating' | 'price_asc' | 'price_desc' | 'distance' | 'new'
}

// ─── Dashboard Stats ───────────────────────────────────────────────────────────

export interface HairdresserStats {
  total_bookings: number
  confirmed_bookings: number
  completed_bookings: number
  total_revenue: number
  monthly_revenue: number
  average_rating: number
  total_reviews: number
  upcoming_bookings: Booking[]
}

export interface AdminStats {
  total_users: number
  total_hairdressers: number
  total_clients: number
  total_bookings: number
  total_revenue: number
  monthly_revenue: number
  pending_reports: number
}

// ─── Subscription Plans ───────────────────────────────────────────────────────

export interface Plan {
  id: 'free' | 'pro' | 'vip'
  name: string
  price: number
  features: string[]
  max_bookings_per_month?: number
  badge?: string
}

export const SUBSCRIPTION_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    features: ['5 réservations/mois', 'Profil de base', 'Messagerie'],
    max_bookings_per_month: 5,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    features: ['Réservations illimitées', 'Visibilité boostée', 'Statistiques', 'Support prioritaire'],
    badge: 'Pro',
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 59,
    features: ['Tout Pro +', 'Top position', 'Badge Top Coiffeur', 'Promotion offerte'],
    badge: 'Top Coiffeur',
  },
]
