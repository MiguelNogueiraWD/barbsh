import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ChevronLeft, Clock, MapPin, Home, Building2,
  CreditCard, CheckCircle, Calendar, ChevronRight
} from 'lucide-react'
import { MOCK_HAIRDRESSERS, MOCK_SERVICES, TIME_SLOTS } from '@/lib/mockData'
import { formatPrice, formatDate, getWeekDays } from '@/lib/utils'
import { format, addDays, isToday, isTomorrow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAuthStore } from '@/store/authStore'

type Step = 'datetime' | 'location' | 'confirm'

export default function Booking() {
  const { hairdresserId, serviceId } = useParams<{ hairdresserId: string; serviceId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const hairdresser = MOCK_HAIRDRESSERS.find((h) => h.id === hairdresserId)
  const service = MOCK_SERVICES.find((s) => s.id === serviceId)

  const [step, setStep] = useState<Step>('datetime')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [locationType, setLocationType] = useState<'salon' | 'home'>('salon')
  const [homeAddress, setHomeAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const weekDays = getWeekDays(new Date())

  if (!hairdresser || !service) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-muted">Prestation introuvable</p>
        <Link to="/recherche" className="btn-primary mt-4 inline-block">Retour</Link>
      </div>
    )
  }

  const formatDayLabel = (date: Date) => {
    if (isToday(date)) return "Aujourd'hui"
    if (isTomorrow(date)) return 'Demain'
    return format(date, 'EEE d', { locale: fr })
  }

  const handleConfirm = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500)) // Simulate API
    setLoading(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="card">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="font-display text-2xl font-bold text-dark mb-2">Réservation confirmée !</h2>
          <p className="text-muted mb-1">
            Votre rendez-vous avec <strong>{hairdresser.user?.full_name}</strong>
          </p>
          <p className="text-muted mb-6">
            Le {selectedDate && formatDate(selectedDate)} à {selectedTime}
          </p>
          <div className="bg-primary-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-dark mb-1">{service.name}</p>
            <p className="text-sm text-muted">{service.duration_minutes} min • {formatPrice(service.price)}</p>
          </div>
          <div className="flex gap-3">
            <Link to="/espace-client" className="flex-1 btn-primary text-center">
              Voir mes réservations
            </Link>
            <Link to="/" className="flex-1 btn-secondary text-center">
              Accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const steps: { key: Step; label: string }[] = [
    { key: 'datetime', label: 'Créneau' },
    { key: 'location', label: 'Lieu' },
    { key: 'confirm', label: 'Confirmation' },
  ]

  const canProceedDatetime = selectedDate && selectedTime
  const canProceedLocation = locationType === 'salon' || (locationType === 'home' && homeAddress.trim())

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-primary-50 transition-colors">
          <ChevronLeft className="w-5 h-5 text-dark" />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold text-dark">Réservation</h1>
          <p className="text-sm text-muted">{service.name} · {hairdresser.user?.full_name}</p>
        </div>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-0 mb-8">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1">
            <div className={`flex items-center gap-2 ${i < steps.length - 1 ? 'flex-1' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all shrink-0 ${
                step === s.key
                  ? 'bg-primary text-white'
                  : steps.indexOf({ key: step, label: '' } as typeof s) > i || success
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-muted'
              }`}>
                {i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${step === s.key ? 'text-dark' : 'text-muted'}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-3 rounded-full transition-all ${
                ['datetime', 'location', 'confirm'].indexOf(step) > i ? 'bg-primary' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Service summary */}
      <div className="card mb-6 flex items-center gap-4">
        {hairdresser.portfolio_images?.[0] && (
          <img src={hairdresser.portfolio_images[0]} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
        )}
        <div className="flex-1">
          <p className="font-semibold text-dark">{service.name}</p>
          <p className="text-sm text-muted">{hairdresser.user?.full_name} · {hairdresser.city}</p>
        </div>
        <div className="text-right">
          <p className="font-mono font-bold text-dark text-lg">{formatPrice(service.price)}</p>
          <div className="flex items-center gap-1 text-xs text-muted justify-end">
            <Clock className="w-3 h-3" />
            {service.duration_minutes} min
          </div>
        </div>
      </div>

      {/* ── STEP: DATE & TIME ── */}
      {step === 'datetime' && (
        <div className="card space-y-6 animate-fade-in">
          <div>
            <h2 className="font-display text-lg font-bold text-dark mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Choisissez une date
            </h2>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {weekDays.map((date) => (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center gap-0.5 min-w-[68px] py-3 px-2 rounded-2xl border-2 transition-all ${
                    selectedDate?.toDateString() === date.toDateString()
                      ? 'bg-primary border-primary text-white'
                      : 'border-border text-dark hover:border-primary'
                  }`}
                >
                  <span className="text-xs font-medium capitalize">{formatDayLabel(date).split(' ')[0]}</span>
                  <span className="text-2xl font-display font-bold">{format(date, 'd')}</span>
                  <span className="text-xs opacity-70 capitalize">{format(date, 'MMM', { locale: fr })}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedDate && (
            <div className="animate-fade-in">
              <h2 className="font-display text-lg font-bold text-dark mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Choisissez un créneau
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      selectedTime === slot
                        ? 'bg-primary border-primary text-white'
                        : 'border-border text-dark hover:border-primary'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setStep('location')}
            disabled={!canProceedDatetime}
            className={`btn-primary w-full flex items-center justify-center gap-2 ${!canProceedDatetime ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            Continuer <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── STEP: LOCATION ── */}
      {step === 'location' && (
        <div className="card space-y-5 animate-fade-in">
          <h2 className="font-display text-lg font-bold text-dark flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Où souhaitez-vous être coiffé ?
          </h2>

          <div className="grid sm:grid-cols-2 gap-3">
            {hairdresser.salon_service && (
              <button
                onClick={() => setLocationType('salon')}
                className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${
                  locationType === 'salon' ? 'border-primary bg-primary-50' : 'border-border hover:border-primary'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${locationType === 'salon' ? 'bg-primary text-white' : 'bg-primary-50 text-primary'}`}>
                  <Building2 className="w-6 h-6" />
                </div>
                <p className="font-semibold text-dark text-sm">En salon</p>
                {hairdresser.salon_address && (
                  <p className="text-xs text-muted text-center">{hairdresser.salon_address}</p>
                )}
              </button>
            )}
            {hairdresser.home_service && (
              <button
                onClick={() => setLocationType('home')}
                className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${
                  locationType === 'home' ? 'border-primary bg-primary-50' : 'border-border hover:border-primary'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${locationType === 'home' ? 'bg-primary text-white' : 'bg-primary-50 text-primary'}`}>
                  <Home className="w-6 h-6" />
                </div>
                <p className="font-semibold text-dark text-sm">À domicile</p>
                <p className="text-xs text-muted">Chez vous</p>
              </button>
            )}
          </div>

          {locationType === 'home' && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-dark mb-2">Votre adresse</label>
              <input
                type="text"
                placeholder="12 rue des Lilas, 75001 Paris"
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
                className="input-field"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-dark mb-2">Notes pour le coiffeur (optionnel)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: cheveux épais, allergie aux produits..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('datetime')} className="btn-ghost flex-1">
              Retour
            </button>
            <button
              onClick={() => setStep('confirm')}
              disabled={!canProceedLocation}
              className={`btn-primary flex-1 flex items-center justify-center gap-2 ${!canProceedLocation ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              Continuer <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP: CONFIRM ── */}
      {step === 'confirm' && (
        <div className="space-y-4 animate-fade-in">
          <div className="card">
            <h2 className="font-display text-lg font-bold text-dark mb-4">Récapitulatif</h2>
            <div className="space-y-3">
              {[
                { label: 'Prestation', value: service.name },
                { label: 'Coiffeur', value: hairdresser.user?.full_name ?? '' },
                { label: 'Date', value: selectedDate ? formatDate(selectedDate) : '' },
                { label: 'Heure', value: selectedTime ?? '' },
                { label: 'Lieu', value: locationType === 'salon' ? `En salon – ${hairdresser.salon_address ?? hairdresser.city}` : `À domicile – ${homeAddress}` },
                { label: 'Durée', value: `${service.duration_minutes} min` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted">{label}</span>
                  <span className="font-medium text-dark">{value}</span>
                </div>
              ))}
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-semibold text-dark">Total</span>
                <span className="font-mono font-bold text-primary text-lg">{formatPrice(service.price)}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-dark mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Paiement sécurisé
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-muted">
              <p>Paiement par Stripe · SSL · 3D Secure</p>
              <p className="text-xs mt-1 text-muted">Votre carte ne sera débitée qu'à la confirmation du coiffeur</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('location')} className="btn-ghost flex-1">
              Retour
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Traitement…
                </span>
              ) : (
                <>
                  Confirmer et payer {formatPrice(service.price)}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
