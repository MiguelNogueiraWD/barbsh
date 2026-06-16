import { Link } from 'react-router-dom'
import { Star, MapPin, Home, Building2, CheckCircle, Crown } from 'lucide-react'
import { cn, formatPrice, AVATAR_PLACEHOLDER } from '@/lib/utils'
import type { HairdresserProfile, Service } from '@/types'

interface HairdresserCardProps {
  hairdresser: HairdresserProfile
  services?: Service[]
  className?: string
}

export default function HairdresserCard({ hairdresser, services = [], className }: HairdresserCardProps) {
  const minPrice = services.length > 0 ? Math.min(...services.map((s) => s.price)) : null
  const displayImage = hairdresser.portfolio_images?.[0] ?? hairdresser.user?.avatar_url ?? AVATAR_PLACEHOLDER(hairdresser.user?.full_name ?? 'C')

  return (
    <Link to={`/coiffeur/${hairdresser.id}`} className={cn('block', className)}>
      <div className="card-hover group overflow-hidden p-0">
        {/* Portfolio image */}
        <div className="relative h-44 overflow-hidden">
          <img
            src={displayImage}
            alt={hairdresser.user?.full_name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {hairdresser.subscription_plan === 'vip' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400 text-amber-900 text-xs font-bold shadow">
                <Crown className="w-3 h-3" />
                Top Coiffeur
              </span>
            )}
            {hairdresser.is_verified && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm text-primary text-xs font-semibold">
                <CheckCircle className="w-3 h-3" />
                Vérifié
              </span>
            )}
          </div>

          {/* Service types */}
          <div className="absolute bottom-3 right-3 flex gap-1.5">
            {hairdresser.salon_service && (
              <span className="p-1.5 rounded-lg bg-white/90 backdrop-blur-sm text-dark">
                <Building2 className="w-3.5 h-3.5" />
              </span>
            )}
            {hairdresser.home_service && (
              <span className="p-1.5 rounded-lg bg-white/90 backdrop-blur-sm text-dark">
                <Home className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-dark group-hover:text-primary transition-colors">
                {hairdresser.user?.full_name}
              </h3>
              {hairdresser.salon_name && (
                <p className="text-xs text-muted">{hairdresser.salon_name}</p>
              )}
            </div>
            {/* Rating */}
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-sm text-dark">{hairdresser.rating.toFixed(1)}</span>
              <span className="text-xs text-muted">({hairdresser.review_count})</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-muted text-sm mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>{hairdresser.city}</span>
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {hairdresser.specialties.slice(0, 3).map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 text-xs font-medium">
                {s}
              </span>
            ))}
          </div>

          {/* Price */}
          {minPrice !== null && (
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-xs text-muted">À partir de</span>
              <span className="font-mono font-bold text-dark">{formatPrice(minPrice)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
