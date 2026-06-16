import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User, UserRole } from '@/types'

interface AuthStore {
  user: User | null
  loading: boolean
  initialized: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, role: UserRole, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      initialized: false,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),

      initialize: async () => {
        if (get().initialized) return
        set({ loading: true })
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
            set({ user: profile ?? null })
          }
        } catch (err) {
          console.error('Auth init error:', err)
        } finally {
          set({ loading: false, initialized: true })
        }
      },

      signIn: async (email, password) => {
        set({ loading: true })
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) throw error
          if (data.user) {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single()
            set({ user: profile ?? null })
          }
        } finally {
          set({ loading: false })
        }
      },

      signUp: async (email, password, role, fullName) => {
        set({ loading: true })
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName, role },
            },
          })
          if (error) throw error
          if (data.user) {
            // Insert user profile
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                email,
                full_name: fullName,
                role,
              })
              .select()
              .single()
            if (profileError) throw profileError

            // If hairdresser, create basic profile
            if (role === 'hairdresser') {
              await supabase.from('hairdresser_profiles').insert({
                user_id: data.user.id,
                city: '',
                zip_code: '',
                bio: '',
              })
            }
            set({ user: profile })
          }
        } finally {
          set({ loading: false })
        }
      },

      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null })
      },
    }),
    {
      name: 'stylio-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
