import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Star, MapPin, Home, Building2, CheckCircle, Clock,
  MessageCircle, Share2, Heart, ChevronLeft, Crown,
  Scissors, Calendar, Shield, Phone
} from 'lucide-react'
import { MOCK_HAIRDRESSERS, MOCK_SERVICES, MOCK_REVIEWS } from '@/lib/mockData'
import { SERVICE_CATEGORIES } from '@/types'
import { formatPrice, getInitials, formatDate, AVATAR_PLACEHOLDER } from '@/lib/utils'
import StarRating from '@/components/ui/StarRating'
import { useAuthStore } from '@/store/authStore'

export default function HairdresserProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'services' | 'portfolio' | 'avis'>('services')
  const [liked, setLiked] = useState(false)

  const hairdresser = MOCK_HAIRDRESSERS.find((h) => h.id === id)
  const services = MOCK_SERVICES.filter((s) => s.hairdresser_id === id)
  const reviews = MOCK_REVIEWS.filter((r) => r.hairdresser_id === id)

  if (!hairdresser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-muted">Coiffeur introuvable</p>
        <Link to="/recherche" className="btn-primary mt-4 inline-block">Retour à la recherche</Link>
      </div>
    )
  }

  const handleBooking = () => {
    if (!user) {
      navigate('/login?redirect=/coiffeur/' + id)
      return
    }
    if (!selectedService) return
    navigate(`/reservation/${hairdresser.id}/${selectedService}`)
  }

  const tabs = [
    { key: 'services', label: 'Prestations', count: services.length },
    { key: 'portfolio', label: 'Portfolio', count: hairdresser.portfolio_images?.length ?? 0 },
    { key: 'avis', label: 'Avis', count: reviews.length },
  ] as const

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-muted">
        <Link to="/recherche" className="hover:text-primary flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Recherche
        </Link>
        <span>/</span>
        <span className="text-dark font-medium">{hairdresser.user?.full_name}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero image */}
          <div className="relative rounded-3xl overflow-hidden h-72 md:h-96">
            <img
              src={hairdresser.portfolio_images?.[0] ?? AVATAR_PLACEHOLDER(hairdresser.user?.full_name ?? 'C')}
              alt={hairdresser.user?.full_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent" />

            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => setLiked(!liked)}
                className="p-2.5 rounded-xl bg-white/90 backdrop-blur-sm hover:bg-white transition-colors"
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-accent text-accent' : 'text-dark'}`} />
              </button>
              <button className="p-2.5 rounded-xl bg-white/90 backdrop-blur-sm hover:bg-white transition-colors">
                <Share2 className="w-5 h-5 text-dark" />
              </button>
            </div>

            {/* Plan badge */}
            {hairdresser.subscription_plan === 'vip' && (
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 text-amber-900 text-sm font-bold shadow">
                  <Crown className="w-4 h-4" />
                  Top Coiffeur
                </span>
              </div>
            )}

            {/* Info overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">
                    {hairdresser.user?.full_name}
                  </h1>
                  {hairdresser.salon_name && (
                    <p className="text-white/80 text-sm">{hairdresser.salon_name}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-white text-lg">{hairdresser.rating}</span>
                  </div>
                  <p className="text-white/70 text-xs">{hairdresser.review_count} avis</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info row */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 text-sm text-dark bg-white px-3 py-2 rounded-xl shadow-card">
              <MapPin className="w-4 h-4 text-primary" />
              {hairdresser.city} {hairdresser.zip_code}
            </div>
            {hairdresser.home_service && (
              <div className="flex items-center gap-2 text-sm text-dark bg-white px-3 py-2 rounded-xl shadow-card">
                <Home className="w-4 h-4 text-primary" />
                À domicile
              </div>
            )}
            {hairdresser.salon_service && (
              <div className="flex items-center gap-2 text-sm text-dark bg-white px-3 py-2 rounded-xl shadow-card">
                <Building2 className="w-4 h-4 text-primary" />
                En salon
              </div>
            )}
            {hairdresser.is_verified && (
              <div className="flex items-center gap-2 text-sm text-primary bg-primary-50 px-3 py-2 rounded-xl">
                <CheckCircle className="w-4 h-4" />
                Profil vérifié
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-dark bg-white px-3 py-2 rounded-xl shadow-card">
              <Scissors className="w-4 h-4 text-muted" />
              {hairdresser.years_experience} ans d'expérience
            </div>
          </div>

          {/* Bio */}
          <div className="card">
            <h2 className="font-display text-lg font-bold text-dark mb-3">À propos</h2>
            <p className="text-muted leading-relaxed">{hairdresser.bio}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {hairdresser.specialties.map((s) => (
                <span key={s} className="badge-violet">{s}</span>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div>
            <div className="flex border-b border-border mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
                    activeTab === tab.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted hover:text-dark'
                  }`}
                >
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-primary-50 text-primary' : 'bg-gray-100 text-muted'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Services tab */}
            {activeTab === 'services' && (
              <div className="space-y-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service.id === selectedService ? null : service.id)}
                    className={`card-hover flex items-center justify-between p-4 border-2 transition-all ${
                      selectedService === service.id
                        ? 'border-primary bg-primary-50'
                        : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        selectedService === service.id ? 'bg-primary text-white' : 'bg-primary-50 text-primary'
                      }`}>
                        <Scissors className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-dark">{service.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="badge-violet text-xs">{SERVICE_CATEGORIES[service.category]}</span>
                          <div className="flex items-center gap-1 text-muted text-xs">
                            <Clock className="w-3 h-3" />
                            {service.duration_minutes} min
                          </div>
                        </div>
                        {service.description && (
                          <p className="text-xs text-muted mt-1">{service.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono font-bold text-dark text-lg">{formatPrice(service.price)}</p>
                      {selectedService === service.id && (
                        <span className="text-xs text-primary font-medium">Sélectionné ✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Portfolio tab */}
            {activeTab === 'portfolio' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {hairdresser.portfolio_images?.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
                    <img
                      src={img}
                      alt={`Portfolio ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                ))}
                {(!hairdresser.portfolio_images || hairdresser.portfolio_images.length === 0) && (
                  <div className="col-span-3 text-center py-12 text-muted">Aucune photo de portfolio</div>
                )}
              </div>
            )}

            {/* Reviews tab */}
            {activeTab === 'avis' && (
              <div className="space-y-4">
                {/* Rating summary */}
                <div className="card flex items-center gap-6">
                  <div className="text-center">
                    <p className="font-display text-5xl font-bold text-dark">{hairdresser.rating}</p>
                    <StarRating rating={hairdresser.rating} className="justify-center mt-1" />
                    <p className="text-sm text-muted mt-1">{hairdresser.review_count} avis</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-muted w-4">{star}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${star === 5 ? 80 : star === 4 ? 15 : 5}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {reviews.map((review) => (
                  <div key={review.id} className="card">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {getInitials(review.client?.full_name ?? 'U')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-dark text-sm">{review.client?.full_name}</p>
                          <p className="text-xs text-muted">{formatDate(review.created_at)}</p>
                        </div>
                        <StarRating rating={review.rating} size="sm" className="mt-0.5" />
                      </div>
                    </div>
                    <p className="text-muted text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))}

                {reviews.length === 0 && (
                  <div className="card text-center py-8 text-muted">Aucun avis pour le moment</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── BOOKING SIDEBAR ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 space-y-4">
            {/* Booking card */}
            <div className="card border-2 border-primary">
              <h3 className="font-display text-lg font-bold text-dark mb-1">Réserver</h3>
              <p className="text-sm text-muted mb-4">Sélectionnez une prestation ci-contre</p>

              {selectedService ? (
                (() => {
                  const svc = services.find((s) => s.id === selectedService)!
                  return (
                    <>
                      <div className="bg-primary-50 rounded-xl p-3 mb-4">
                        <p className="font-semibold text-dark text-sm">{svc.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1 text-xs text-muted">
                            <Clock className="w-3 h-3" />
                            {svc.duration_minutes} min
                          </div>
                          <span className="font-mono font-bold text-primary">{formatPrice(svc.price)}</span>
                        </div>
                      </div>
                      <button onClick={handleBooking} className="btn-primary w-full flex items-center justify-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Choisir un créneau
                      </button>
                    </>
                  )
                })()
              ) : (
                <button disabled className="btn-primary w-full opacity-40 cursor-not-allowed">
                  Sélectionnez une prestation
                </button>
              )}

              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  Paiement sécurisé
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <CheckCircle className="w-3.5 h-3.5 text-primary" />
                  Annulation gratuite sous 24h
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="card">
              <h4 className="font-semibold text-dark mb-3">Contacter</h4>
              <Link
                to={user ? `/messages/${hairdresser.id}` : '/login'}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border-2 border-border hover:border-primary hover:text-primary transition-all text-sm font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                Envoyer un message
              </Link>
            </div>

            {/* Location */}
            {hairdresser.salon_address && (
              <div className="card">
                <h4 className="font-semibold text-dark mb-2">Adresse salon</h4>
                <p className="text-sm text-muted">{hairdresser.salon_address}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
