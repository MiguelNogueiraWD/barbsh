import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Search, MapPin, Star, Scissors, Shield, Zap, Heart,
  ArrowRight, CheckCircle, Crown, Sparkles, Users, Calendar
} from 'lucide-react'
import HairdresserCard from '@/components/search/HairdresserCard'
import { MOCK_HAIRDRESSERS, MOCK_SERVICES } from '@/lib/mockData'
import { SUBSCRIPTION_PLANS } from '@/types'
import { formatPrice } from '@/lib/utils'

const CITIES = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille', 'Nantes', 'Toulouse', 'Strasbourg']

const STATS = [
  { value: '12 000+', label: 'Coiffeurs inscrits', icon: Scissors },
  { value: '94 000+', label: 'Clients satisfaits', icon: Users },
  { value: '4.8/5', label: 'Note moyenne', icon: Star },
  { value: '150+', label: 'Villes couvertes', icon: MapPin },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Cherchez',
    description: 'Entrez votre ville et le service souhaité. Notre carte interactive affiche les coiffeurs proches.',
    icon: Search,
    color: 'bg-primary-50 text-primary',
  },
  {
    step: '02',
    title: 'Choisissez',
    description: 'Consultez les profils, portfolios, avis clients et tarifs pour trouver votre match parfait.',
    icon: Heart,
    color: 'bg-accent-50 text-accent',
  },
  {
    step: '03',
    title: 'Réservez',
    description: 'Sélectionnez un créneau, payez en ligne en toute sécurité. Confirmation instantanée.',
    icon: Calendar,
    color: 'bg-emerald-50 text-emerald-600',
  },
]

const FEATURED_HAIRDRESSERS = MOCK_HAIRDRESSERS.filter((h) => h.is_featured)

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (selectedCity) params.set('ville', selectedCity)
    if (searchQuery) params.set('q', searchQuery)
    navigate(`/recherche?${params.toString()}`)
  }

  return (
    <div className="overflow-x-hidden">
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center bg-background overflow-hidden">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 bg-hero-mesh pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text + search */}
            <div className="animate-slide-up">
              {/* Tag */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-primary text-sm font-semibold">#1 Plateforme coiffure en France</span>
              </div>

              <h1 className="font-display text-5xl md:text-6xl lg:text-[4rem] font-bold text-dark leading-tight mb-6">
                Trouvez votre
                <br />
                <span className="text-gradient">coiffeur idéal</span>
                <br />
                en 2 minutes
              </h1>

              <p className="text-lg text-muted leading-relaxed mb-8 max-w-xl">
                Des milliers de coiffeurs professionnels près de chez vous. Réservez en ligne, à domicile ou en salon, avec paiement sécurisé.
              </p>

              {/* Search box */}
              <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-card-hover p-3 flex flex-col sm:flex-row gap-3 mb-8">
                <div className="flex items-center gap-2 flex-1 px-3">
                  <Search className="w-5 h-5 text-muted shrink-0" />
                  <input
                    type="text"
                    placeholder="Coupe, balayage, tresses…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 text-sm placeholder-muted focus:outline-none text-dark bg-transparent"
                  />
                </div>
                <div className="flex items-center gap-2 px-3 sm:border-l border-border">
                  <MapPin className="w-5 h-5 text-muted shrink-0" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="text-sm text-dark bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="">Toutes les villes</option>
                    {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn-primary whitespace-nowrap">
                  Rechercher
                </button>
              </form>

              {/* Popular searches */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted">Tendance :</span>
                {['Balayage', 'Coupe femme', 'Barbe', 'Tresses'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => { setSearchQuery(tag); navigate(`/recherche?q=${tag}`) }}
                    className="px-3 py-1 rounded-full bg-white border border-border text-sm text-dark hover:border-primary hover:text-primary transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Floating cards */}
            <div className="relative hidden lg:block h-[520px]">
              {/* Main card */}
              <div className="absolute top-8 left-4 w-64 card shadow-card-hover animate-float">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60&h=60&fit=crop"
                    alt="Sofia"
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-semibold text-dark text-sm">Sofia Martini</p>
                    <p className="text-xs text-muted">Paris 1er</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-semibold ml-1">4.9</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {['Balayage', 'Coloration', 'Coupe'].map((sp) => (
                    <span key={sp} className="badge-violet text-xs">{sp}</span>
                  ))}
                </div>
                <button className="mt-3 w-full py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-600 transition-colors">
                  Réserver
                </button>
              </div>

              {/* Stats card */}
              <div className="absolute top-4 right-0 w-48 card shadow-card">
                <p className="text-xs text-muted mb-1">Réservations aujourd'hui</p>
                <p className="font-display text-3xl font-bold text-gradient">1 284</p>
                <p className="text-xs text-emerald-600 font-medium mt-1">↑ +12% ce mois</p>
              </div>

              {/* Review card */}
              <div className="absolute bottom-20 right-4 w-56 card shadow-card-hover">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold">ML</div>
                  <div>
                    <p className="text-xs font-semibold text-dark">Marie L.</p>
                    <div className="flex">
                      {[1,2,3,4,5].map((s) => <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted">"Résultat magnifique, je recommande à 100% !"</p>
              </div>

              {/* Verified badge */}
              <div className="absolute bottom-4 left-8 flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-card">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-dark">Profils vérifiés</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────── */}
      <section className="py-16 bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 mb-3 mx-auto">
                  <Icon className="w-6 h-6 text-primary-300" />
                </div>
                <p className="font-display text-3xl font-bold text-white mb-1">{value}</p>
                <p className="text-dark-300 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED HAIRDRESSERS ────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="badge-violet mb-3">⭐ Sélection Stylio</span>
              <h2 className="section-title">Coiffeurs en vedette</h2>
              <p className="text-muted mt-2">Les talents les mieux notés de notre plateforme</p>
            </div>
            <Link to="/recherche" className="hidden sm:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {MOCK_HAIRDRESSERS.map((h) => (
              <HairdresserCard
                key={h.id}
                hairdresser={h}
                services={MOCK_SERVICES.filter((s) => s.hairdresser_id === h.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="badge-pink mb-3">Simple & rapide</span>
            <h2 className="section-title">Comment ça marche ?</h2>
            <p className="text-muted mt-2 max-w-lg mx-auto">Réserver un coiffeur n'a jamais été aussi simple. En 3 étapes, c'est fait.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, description, icon: Icon, color }) => (
              <div key={step} className="relative text-center">
                {/* Connector line */}
                <div className="hidden md:block absolute top-10 left-1/2 w-full h-px bg-border -z-10" style={{ transform: 'translateX(50%)' }} />
                <div className={`inline-flex w-20 h-20 rounded-2xl ${color} items-center justify-center mb-5 shadow-card`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className="text-xs font-mono font-bold text-muted mb-2">{step}</div>
                <h3 className="font-display text-xl font-bold text-dark mb-3">{title}</h3>
                <p className="text-muted leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/recherche" className="btn-primary inline-flex items-center gap-2">
              Trouver mon coiffeur <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="badge-gold mb-3">Pour les coiffeurs</span>
            <h2 className="section-title">Des offres adaptées à votre activité</h2>
            <p className="text-muted mt-2 max-w-lg mx-auto">Commencez gratuitement, évoluez selon vos besoins.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-7 transition-all duration-300 ${
                  plan.id === 'pro'
                    ? 'bg-gradient-primary text-white shadow-violet-glow scale-105'
                    : 'bg-white shadow-card hover:shadow-card-hover'
                }`}
              >
                {plan.id === 'pro' && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-accent rounded-full text-white text-xs font-bold shadow-pink-glow">
                    Le plus populaire
                  </div>
                )}
                <div className="mb-5">
                  <p className={`font-display text-xl font-bold mb-1 ${plan.id === 'pro' ? 'text-white' : 'text-dark'}`}>
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className={`font-display text-4xl font-bold ${plan.id === 'pro' ? 'text-white' : 'text-dark'}`}>
                      {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
                    </span>
                    {plan.price > 0 && (
                      <span className={`text-sm ${plan.id === 'pro' ? 'text-white/70' : 'text-muted'}`}>/mois</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2.5 text-sm ${plan.id === 'pro' ? 'text-white/90' : 'text-dark'}`}>
                      <CheckCircle className={`w-4 h-4 shrink-0 ${plan.id === 'pro' ? 'text-white' : 'text-primary'}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/inscription"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                    plan.id === 'pro'
                      ? 'bg-white text-primary hover:bg-white/90'
                      : 'bg-primary text-white hover:bg-primary-600'
                  }`}
                >
                  {plan.id === 'free' ? 'Commencer gratuitement' : `Choisir ${plan.name}`}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA HAIRDRESSER ──────────────────────────────────────────── */}
      <section className="py-20 bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-mesh pointer-events-none opacity-40" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <Crown className="w-12 h-12 text-gold-400 mx-auto mb-5" />
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Vous êtes coiffeur ?
            <br />
            <span className="text-gradient">Rejoignez Stylio.</span>
          </h2>
          <p className="text-dark-300 text-lg mb-8 max-w-2xl mx-auto">
            Créez votre profil professionnel, gérez vos réservations et développez votre clientèle. Gratuit pour commencer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/inscription?role=hairdresser" className="btn-primary inline-flex items-center gap-2 justify-center py-4 px-8 text-base">
              Créer mon profil gratuit <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#" className="btn-ghost text-white hover:bg-white/10 py-4 px-8 text-base">
              En savoir plus
            </a>
          </div>
          <p className="text-dark-400 text-sm mt-6 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            Sans engagement • Inscription en 2 minutes
          </p>
        </div>
      </section>
    </div>
  )
}
