import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, SlidersHorizontal, MapIcon, LayoutGrid, X, ChevronDown, Home, Building2 } from 'lucide-react'
import HairdresserCard from '@/components/search/HairdresserCard'
import MapView from '@/components/search/MapView'
import { MOCK_HAIRDRESSERS, MOCK_SERVICES } from '@/lib/mockData'
import { SERVICE_CATEGORIES } from '@/types'
import type { ServiceCategory } from '@/types'

const CITIES = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille', 'Nantes', 'Toulouse', 'Strasbourg']
const SORT_OPTIONS = [
  { value: 'rating', label: 'Mieux notés' },
  { value: 'new', label: 'Nouveaux' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
]

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showMap, setShowMap] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Filter state
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [city, setCity] = useState(searchParams.get('ville') ?? '')
  const [category, setCategory] = useState<ServiceCategory | ''>('')
  const [homeService, setHomeService] = useState(false)
  const [salonService, setSalonService] = useState(false)
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState('rating')

  // Filter hairdressers
  const filtered = useMemo(() => {
    let results = [...MOCK_HAIRDRESSERS]

    if (city) {
      results = results.filter((h) => h.city.toLowerCase().includes(city.toLowerCase()))
    }
    if (homeService) results = results.filter((h) => h.home_service)
    if (salonService) results = results.filter((h) => h.salon_service)
    if (minRating > 0) results = results.filter((h) => h.rating >= minRating)
    if (query) {
      const q = query.toLowerCase()
      results = results.filter((h) =>
        h.user?.full_name.toLowerCase().includes(q) ||
        h.specialties.some((s) => s.toLowerCase().includes(q)) ||
        h.city.toLowerCase().includes(q)
      )
    }
    if (category) {
      const hairdresserIds = MOCK_SERVICES
        .filter((s) => s.category === category)
        .map((s) => s.hairdresser_id)
      results = results.filter((h) => hairdresserIds.includes(h.id))
    }

    switch (sortBy) {
      case 'rating': return results.sort((a, b) => b.rating - a.rating)
      case 'new': return results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      default: return results
    }
  }, [query, city, category, homeService, salonService, minRating, sortBy])

  const clearFilters = () => {
    setQuery('')
    setCity('')
    setCategory('')
    setHomeService(false)
    setSalonService(false)
    setMinRating(0)
    setSortBy('rating')
    setSearchParams({})
  }

  const hasActiveFilters = query || city || category || homeService || salonService || minRating > 0

  return (
    <div className="min-h-screen">
      {/* Search header */}
      <div className="bg-white border-b border-border sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            {/* Search input */}
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-100 transition-all">
              <SearchIcon className="w-4 h-4 text-muted shrink-0" />
              <input
                type="text"
                placeholder="Coupe, balayage, tresses…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 text-sm text-dark placeholder-muted focus:outline-none bg-transparent"
              />
              {query && (
                <button onClick={() => setQuery('')}>
                  <X className="w-4 h-4 text-muted hover:text-dark" />
                </button>
              )}
            </div>

            {/* City select */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-white min-w-36">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="text-sm text-dark bg-transparent focus:outline-none cursor-pointer w-full"
              >
                <option value="">Toutes les villes</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                showFilters ? 'bg-primary text-white border-primary' : 'border-border text-dark hover:border-primary'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filtres</span>
              {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
            </button>

            {/* Map toggle */}
            <button
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                showMap ? 'bg-primary text-white border-primary' : 'border-border text-dark hover:border-primary'
              }`}
            >
              {showMap ? <LayoutGrid className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
              <span className="hidden sm:inline">{showMap ? 'Grille' : 'Carte'}</span>
            </button>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-3 items-center animate-fade-in">
              {/* Category */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory | '')}
                className="input-field w-auto text-sm py-2"
              >
                <option value="">Toutes prestations</option>
                {Object.entries(SERVICE_CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>

              {/* Service type */}
              <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border cursor-pointer hover:border-primary transition-colors text-sm">
                <input type="checkbox" checked={homeService} onChange={(e) => setHomeService(e.target.checked)} className="accent-primary" />
                <Home className="w-4 h-4 text-muted" />
                À domicile
              </label>
              <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border cursor-pointer hover:border-primary transition-colors text-sm">
                <input type="checkbox" checked={salonService} onChange={(e) => setSalonService(e.target.checked)} className="accent-primary" />
                <Building2 className="w-4 h-4 text-muted" />
                En salon
              </label>

              {/* Min rating */}
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="input-field w-auto text-sm py-2"
              >
                <option value={0}>Toutes notes</option>
                <option value={4}>4+ étoiles</option>
                <option value={4.5}>4.5+ étoiles</option>
              </select>

              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 font-medium">
                  <X className="w-3.5 h-3.5" />
                  Effacer
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results count + sort */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted text-sm">
            <span className="font-semibold text-dark">{filtered.length}</span> coiffeur{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
            {city && <span> à <span className="text-primary font-medium">{city}</span></span>}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted hidden sm:inline">Trier :</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm text-dark border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary bg-white"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {showMap ? (
          /* Map + side panel */
          <div className="flex gap-6 h-[calc(100vh-280px)]">
            <div className="w-80 lg:w-96 shrink-0 overflow-y-auto scrollbar-hide space-y-4">
              {filtered.length === 0 ? (
                <div className="card text-center py-12">
                  <p className="text-muted">Aucun coiffeur trouvé</p>
                </div>
              ) : (
                filtered.map((h) => (
                  <HairdresserCard
                    key={h.id}
                    hairdresser={h}
                    services={MOCK_SERVICES.filter((s) => s.hairdresser_id === h.id)}
                  />
                ))
              )}
            </div>
            <div className="flex-1">
              <MapView
                hairdressers={filtered}
                className="h-full"
              />
            </div>
          </div>
        ) : (
          /* Grid view */
          filtered.length === 0 ? (
            <div className="text-center py-20 card">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold text-dark mb-2">Aucun résultat</h3>
              <p className="text-muted mb-6">Essayez d'élargir votre recherche ou de changer de ville.</p>
              <button onClick={clearFilters} className="btn-primary">
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((h) => (
                <HairdresserCard
                  key={h.id}
                  hairdresser={h}
                  services={MOCK_SERVICES.filter((s) => s.hairdresser_id === h.id)}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
