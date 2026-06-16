import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, Scissors, ChevronDown, User, LayoutDashboard, LogOut, Settings } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { getInitials, AVATAR_PLACEHOLDER } from '@/lib/utils'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const handleSignOut = async () => {
    await signOut()
    setProfileOpen(false)
    navigate('/')
  }

  const dashboardPath =
    user?.role === 'admin' ? '/admin' : user?.role === 'hairdresser' ? '/espace-coiffeur' : '/espace-client'

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-card group-hover:shadow-violet-glow transition-shadow">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-dark">
              Styli<span className="text-gradient">o</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`btn-ghost text-sm ${isActive('/') ? 'bg-primary-50 text-primary' : ''}`}
            >
              Accueil
            </Link>
            <Link
              to="/recherche"
              className={`btn-ghost text-sm ${isActive('/recherche') ? 'bg-primary-50 text-primary' : ''}`}
            >
              Trouver un coiffeur
            </Link>
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-primary-50 transition-colors"
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(user.full_name)}
                    </div>
                  )}
                  <span className="text-sm font-medium text-dark">{user.full_name.split(' ')[0]}</span>
                  <ChevronDown className={`w-4 h-4 text-muted transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-card-hover border border-border z-50 overflow-hidden animate-fade-in">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-semibold text-dark">{user.full_name}</p>
                        <p className="text-xs text-muted truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to={dashboardPath}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark hover:bg-primary-50 hover:text-primary transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Mon espace
                        </Link>
                        <Link
                          to="/profil"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark hover:bg-primary-50 hover:text-primary transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Paramètres
                        </Link>
                      </div>
                      <div className="py-1 border-t border-border">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Se déconnecter
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">
                  Connexion
                </Link>
                <Link to="/inscription" className="btn-primary text-sm py-2 px-5">
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-primary-50 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            <Link to="/" className="block py-2.5 px-3 rounded-xl text-dark hover:bg-primary-50 font-medium" onClick={() => setMobileOpen(false)}>Accueil</Link>
            <Link to="/recherche" className="block py-2.5 px-3 rounded-xl text-dark hover:bg-primary-50 font-medium" onClick={() => setMobileOpen(false)}>Trouver un coiffeur</Link>
            {user ? (
              <>
                <Link to={dashboardPath} className="block py-2.5 px-3 rounded-xl text-dark hover:bg-primary-50 font-medium" onClick={() => setMobileOpen(false)}>Mon espace</Link>
                <button onClick={handleSignOut} className="block w-full text-left py-2.5 px-3 rounded-xl text-red-600 hover:bg-red-50 font-medium">Se déconnecter</button>
              </>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link to="/login" className="flex-1 btn-secondary text-center text-sm" onClick={() => setMobileOpen(false)}>Connexion</Link>
                <Link to="/inscription" className="flex-1 btn-primary text-center text-sm" onClick={() => setMobileOpen(false)}>S'inscrire</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
