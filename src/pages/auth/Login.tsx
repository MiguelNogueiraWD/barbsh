import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Scissors, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const { signIn, loading } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await signIn(email, password)
      navigate(redirect)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Email ou mot de passe incorrect')
    }
  }

  // Demo login helper
  const fillDemo = (role: 'client' | 'hairdresser' | 'admin') => {
    const demos: Record<string, [string, string]> = {
      client: ['client@demo.fr', 'demo1234'],
      hairdresser: ['coiffeur@demo.fr', 'demo1234'],
      admin: ['admin@demo.fr', 'demo1234'],
    }
    const [e, p] = demos[role]
    setEmail(e)
    setPassword(p)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-primary items-center justify-center mb-4 shadow-violet-glow">
            <Scissors className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-dark">Bienvenue sur Stylio</h1>
          <p className="text-muted text-sm mt-1">Connectez-vous à votre compte</p>
        </div>

        {/* Demo accounts */}
        <div className="mb-6 p-4 rounded-2xl bg-primary-50 border border-primary-100">
          <p className="text-xs font-semibold text-primary mb-2">🎭 Comptes démo</p>
          <div className="flex gap-2">
            {(['client', 'hairdresser', 'admin'] as const).map((role) => (
              <button
                key={role}
                onClick={() => fillDemo(role)}
                className="flex-1 py-1.5 px-2 rounded-lg bg-white text-xs font-medium text-dark hover:bg-primary hover:text-white transition-all border border-border capitalize"
              >
                {role === 'hairdresser' ? 'Coiffeur' : role === 'admin' ? 'Admin' : 'Client'}
              </button>
            ))}
          </div>
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-dark">Mot de passe</label>
              <a href="#" className="text-xs text-primary hover:underline">Oublié ?</a>
            </div>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Connexion…
              </span>
            ) : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Pas encore de compte ?{' '}
          <Link to="/inscription" className="text-primary font-semibold hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}
