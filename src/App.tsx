import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

import Home from '@/pages/Home'
import Search from '@/pages/Search'
import HairdresserProfile from '@/pages/HairdresserProfile'
import Booking from '@/pages/Booking'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ClientDashboard from '@/pages/dashboard/ClientDashboard'
import HairdresserDashboard from '@/pages/dashboard/HairdresserDashboard'
import AdminDashboard from '@/pages/dashboard/AdminDashboard'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
})

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppContent() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recherche" element={<Search />} />
          <Route path="/coiffeur/:id" element={<HairdresserProfile />} />
          <Route path="/reservation/:hairdresserId/:serviceId" element={<Booking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          <Route
            path="/espace-client"
            element={
              <ProtectedRoute requiredRole="client">
                <ClientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/espace-coiffeur"
            element={
              <ProtectedRoute requiredRole="hairdresser">
                <HairdresserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
