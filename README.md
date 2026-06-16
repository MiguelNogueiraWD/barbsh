# 💇 Stylio — Marketplace de coiffeurs indépendants

> Plateforme web moderne connectant clients et coiffeurs à domicile.  
> Stack : React 18 · TypeScript · Vite · TailwindCSS · Supabase

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Alexis-358/stylio)

---

## ✨ Fonctionnalités

### Côté client
- 🔍 Recherche géolocalisée avec carte interactive (Leaflet / OpenStreetMap)
- 📅 Réservation en ligne (assistant 3 étapes)
- ⭐ Avis et notations vérifiés
- 💬 Messagerie temps réel (Supabase Realtime)
- 👤 Tableau de bord (réservations, historique, messages)

### Côté coiffeur
- 🎨 Profil + portfolio photo
- 📆 Gestion des disponibilités
- 📊 Statistiques de revenus et réservations
- 🚀 Plans d'abonnement : Free / Pro (29 €/mois) / VIP (59 €/mois)
- 💳 Paiement automatique via Stripe Connect

### Côté admin
- 🛡️ Dashboard de modération (signalements, vérifications)
- 👥 Gestion utilisateurs et coiffeurs
- 📈 Analytics revenus et commissions (15%)
- ✅ Validation et suspension de comptes

---

## 🏗️ Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | TailwindCSS 3 (design system custom) |
| State | Zustand (persisted) |
| Data fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Routing | React Router v6 |
| Animations | Framer Motion |
| Maps | React Leaflet + OpenStreetMap |
| Backend | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| Paiement | Stripe (Checkout + Connect) |
| Icônes | Lucide React |
| Déploiement | Vercel (frontend) + Supabase (cloud) |

---

## 🚀 Démarrage rapide

### Prérequis
- Node.js ≥ 18
- npm ≥ 9
- Compte [Supabase](https://supabase.com) (gratuit)
- Compte [Stripe](https://stripe.com) (pour les paiements)

### Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/Alexis-358/stylio.git
cd stylio

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# → Éditer .env avec vos clés Supabase et Stripe
```

### Configuration Supabase

```bash
# Installer la CLI Supabase
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref VOTRE_PROJECT_REF

# Appliquer la migration (schéma DB)
supabase db push

# (Optionnel) Créer les buckets Storage
supabase storage create avatars --public
supabase storage create portfolios --public
```

Ou via le **Supabase Dashboard** → SQL Editor → coller le contenu de `supabase/migrations/001_schema.sql`.

### Lancer en développement

```bash
npm run dev
# → http://localhost:5173
```

### Build de production

```bash
npm run build
npm run preview   # vérification locale
```

---

## 📁 Structure du projet

```
stylio/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── layout/        # Navbar, Footer
│   │   ├── search/        # HairdresserCard, MapView
│   │   └── ui/            # StarRating, ...
│   ├── lib/
│   │   ├── supabase.ts    # Client + helpers DB
│   │   ├── utils.ts       # Fonctions utilitaires
│   │   └── mockData.ts    # Données de démo
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Search.tsx
│   │   ├── HairdresserProfile.tsx
│   │   ├── Booking.tsx
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   └── dashboard/
│   │       ├── ClientDashboard.tsx
│   │       ├── HairdresserDashboard.tsx
│   │       └── AdminDashboard.tsx
│   ├── store/
│   │   └── authStore.ts   # Zustand auth
│   ├── types/
│   │   └── index.ts       # Types TypeScript globaux
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── migrations/
│       └── 001_schema.sql # Schéma PostgreSQL complet + RLS
├── .env.example
├── .gitignore
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## 🌐 Déploiement sur Vercel

```bash
# Via CLI Vercel
npm install -g vercel
vercel --prod

# Variables d'environnement à configurer dans Vercel :
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
# VITE_STRIPE_PUBLIC_KEY
```

Ou via le bouton **Deploy with Vercel** en haut de ce README.

---

## 🗂️ Routes

| Route | Page | Accès |
|-------|------|-------|
| `/` | Accueil | Public |
| `/recherche` | Recherche + carte | Public |
| `/coiffeur/:id` | Profil coiffeur | Public |
| `/reservation/:hairdresserId/:serviceId` | Réservation | Authentifié |
| `/login` | Connexion | Public |
| `/inscription` | Inscription | Public |
| `/espace-client` | Dashboard client | Client |
| `/espace-coiffeur` | Dashboard coiffeur | Coiffeur |
| `/admin` | Dashboard admin | Admin |

---

## 💰 Modèle économique

| Plan | Prix | Fonctionnalités |
|------|------|-----------------|
| Free | 0 €/mois | Profil basique, 5 photos, pas de mise en avant |
| Pro | 29 €/mois | Profil complet, 20 photos, stats, mise en avant |
| VIP | 59 €/mois | Tout Pro + badge VIP, priorité recherche, accès API |

**Commission** : 15% sur chaque réservation payante.

---

## 🔐 Sécurité

- Authentification via **Supabase Auth** (JWT)
- **Row Level Security** sur toutes les tables
- Mots de passe hashés côté Supabase (bcrypt)
- Variables sensibles en `.env` (jamais commitées)
- Paiements gérés exclusivement par **Stripe** (PCI DSS)

---

## 👨‍💻 Auteur

**Alexis Ngodebo Ze Eric** — Étudiant SUPINFO (2ème année, CS/Data Science)  
GitHub : [@Alexis-358](https://github.com/Alexis-358)

---

## 📄 Licence

MIT — Voir [LICENSE](./LICENSE) pour plus d'informations.
