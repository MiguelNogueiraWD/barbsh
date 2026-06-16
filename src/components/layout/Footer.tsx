import { Link } from 'react-router-dom'
import { Scissors, Instagram, Facebook, Twitter, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-dark text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold">Stylio</span>
            </div>
            <p className="text-dark-200 text-sm leading-relaxed mb-6">
              La plateforme qui connecte les coiffeurs talentueux avec les clients qui méritent le meilleur.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Plateforme</h4>
            <ul className="space-y-3">
              {[
                { label: 'Trouver un coiffeur', href: '/recherche' },
                { label: 'Comment ça marche', href: '#' },
                { label: 'Tarifs', href: '#' },
                { label: 'Blog beauté', href: '#' },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.href} className="text-dark-300 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For hairdressers */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Coiffeurs</h4>
            <ul className="space-y-3">
              {[
                { label: 'Rejoindre Stylio', href: '/inscription' },
                { label: 'Nos abonnements', href: '#' },
                { label: 'Centre d\'aide Pro', href: '#' },
                { label: 'Témoignages', href: '#' },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.href} className="text-dark-300 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Légal</h4>
            <ul className="space-y-3">
              {[
                { label: 'CGU', href: '#' },
                { label: 'Politique de confidentialité', href: '#' },
                { label: 'Mentions légales', href: '#' },
                { label: 'Contact', href: '#' },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.href} className="text-dark-300 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-dark-300 text-sm">
            © {new Date().getFullYear()} Stylio. Tous droits réservés.
          </p>
          <p className="text-dark-300 text-sm flex items-center gap-1.5">
            Fait avec <Heart className="w-3.5 h-3.5 text-accent fill-accent" /> en France 🇫🇷
          </p>
        </div>
      </div>
    </footer>
  )
}
