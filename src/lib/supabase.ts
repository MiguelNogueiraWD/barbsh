import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase environment variables are missing. Check your .env file.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
)

// ─── Auth helpers ──────────────────────────────────────────────────────────────

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export const signUp = async (email: string, password: string, metadata: Record<string, unknown>) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  })
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ─── Database helpers ─────────────────────────────────────────────────────────

export const getHairdressers = async (filters?: Record<string, unknown>) => {
  let query = supabase
    .from('hairdresser_profiles')
    .select(`
      *,
      user:users (id, full_name, avatar_url, email),
      services (*)
    `)
    .eq('is_active', true)

  if (filters?.city) {
    query = query.ilike('city', `%${filters.city}%`)
  }
  if (filters?.min_rating) {
    query = query.gte('rating', filters.min_rating)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export const getHairdresserById = async (id: string) => {
  const { data, error } = await supabase
    .from('hairdresser_profiles')
    .select(`
      *,
      user:users (id, full_name, avatar_url, email, phone),
      services (*),
      reviews (
        *,
        client:users (full_name, avatar_url)
      ),
      availabilities (*)
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const createBooking = async (booking: Record<string, unknown>) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single()
  if (error) throw error
  return data
}

export const getClientBookings = async (clientId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      service:services (name, price, duration_minutes),
      hairdresser:hairdresser_profiles (
        salon_name, city,
        user:users (full_name, avatar_url)
      )
    `)
    .eq('client_id', clientId)
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

export const getHairdresserBookings = async (hairdresserId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      service:services (name, price, duration_minutes),
      client:users (full_name, avatar_url, phone)
    `)
    .eq('hairdresser_id', hairdresserId)
    .order('date', { ascending: false })
  if (error) throw error
  return data
}
