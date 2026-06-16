import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Scissors, User, Crown, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types'

const ROLES = [
  {
    id: 'client' as UserRole,
    label: 'Je suis client',
    description: 'Je recherche un coiffeur',
    icon: User,
    color: 'border-primary bg-primary',
  },
  {
    id: 'hairdresser' as UserRole,
    label: 'Je suis coiffeur',
    description: 'Je propose mes services',
    icon: Scissors,
    color: 'border-accent bg-accent',
  },
]

export default function Register() {
  const [searchParams] = useSearchParams()
  const defaultRole = (searchParams.get('role') as UserRole) ?? 'client'

  const [role, setRole] = useState<UserRole>(defaultRole)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [accepted, setAccepted] = useState(false)

  const { signUp, loading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accepted) { setError('Veuillez accepter les CGU'); return }
    if (password.length < 6) { setError('Le mot de passe doit faire au moins 6 caractères'); return }
    setError('')
    try {
      await signUp(email, password, role, fullName)
      navigate(role === 'hairdresser' ? '/espace-coiffeur' : '/espace-client')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription')
    }
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-primary items-center justify-center mb-4 shadow-violet-glow">
            <Scissors className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-dark">Rejoindre Stylio</h1>
          <p className="text-muted text-sm mt-1">Créez votre compte gratuitement</p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {ROLES.map(({ id, label, description, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => setRole(id)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                role === id ? `${color} text-white` : 'border-border text-dark hover:border-primary'
              }`}
            >
              {role === id && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}
              <Icon className="w-6 h-6" />
              <div className="text-center">
                <p className="text-sm font-semibold">{label}</p>
                <p className={`text-xs ${role === id ? 'text-white/80' : 'text-muted'}`}>{description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Nom complet</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Marie Dupont"
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.fr"
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Mot de passe</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 caractères"
                required
                className="input-field pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-dark"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* CGU */}
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 accent-primary"
            />
            <span className="text-xs text-muted leading-relaxed">
              J'accepte les{' '}
              <a href="#" className="text-primary hover:underline">Conditions Générales d'Utilisation</a>
              {' '}et la{' '}
              <a href="#" className="text-primary hover:underline">Politique de confidentialité</a>
            </span>
          </label>

          {role === 'hairdresser' && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
              <Crown className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Commencez gratuitement. Vous pourrez passer à une formule Pro ou VIP à tout moment depuis votre espace.
              </p>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Création du compte…
              </span>
            ) : `Créer mon compte ${role === 'hairdresser' ? 'coiffeur' : 'client'}`}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
