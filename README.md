# 💈 Barbsh - Plateforme de Réservation pour Coiffeurs et Barbiers

Plateforme moderne de réservation en ligne pour coiffeurs et barbiers avec système de paiement, marketplace, et gestion complète des rendez-vous.

## 📋 Description du Projet

Barbsh est une application full-stack qui permet :
- 🗓️ **Réservation en ligne** : Prise de rendez-vous simplifiée pour les clients
- 💳 **Paiement sécurisé** : Intégration Stripe avec gestion des commissions
- 👤 **Multi-rôles** : Client, Coiffeur, Modérateur, Admin
- 🖼️ **Galerie photos** : Portfolio pour les coiffeurs
- ⭐ **Système d'avis** : Notation et commentaires
- 🛍️ **Marketplace** : Vente de produits capillaires
- 📧 **Emails automatiques** : Notifications et confirmations
- 📊 **Dashboard admin** : Statistiques et gestion

## 🏗️ Architecture

```
barbsh/
├── backend-coiffeurs/    # API REST Node.js + Express + Prisma
├── client-barbsh/        # Frontend React + Vite + TailwindCSS
└── README.md            # Ce fichier
```

### Stack Technique

**Backend:**
- Node.js + Express.js
- PostgreSQL + Prisma ORM
- JWT pour l'authentification
- Stripe pour les paiements
- Nodemailer pour les emails
- PDFKit pour les factures

**Frontend:**
- React 19
- Vite
- TailwindCSS
- React Router DOM
- Axios
- Leaflet (cartes interactives)

## 🚀 Installation Rapide

### Prérequis
- Node.js (v18+)
- PostgreSQL
- npm ou yarn

### Backend

```bash
cd backend-coiffeurs
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Remplir le fichier .env avec vos credentials

# Synchroniser la base de données
npx prisma db push

# Démarrer le serveur de développement
npm run dev
```

Le backend sera disponible sur `http://localhost:3000`

### Frontend

```bash
cd client-barbsh
npm install

# Démarrer l'application
npm run dev
```

Le frontend sera disponible sur `http://localhost:5173`

## 🎓 GitHub Student Developer Pack

### Qu'est-ce que le GitHub Student Developer Pack ?

Le **GitHub Student Developer Pack** offre aux étudiants un accès gratuit à des outils de développement premium. C'est parfait pour développer et déployer ce projet sans frais !

🔗 **Postuler ici** : [education.github.com/pack](https://education.github.com/pack)

### Avantages pour le Projet Barbsh

En tant qu'étudiant, vous pouvez accéder gratuitement à ces services essentiels pour Barbsh :

#### 1. 💳 **Stripe** (Paiements)
- **Offre** : Traitement de paiements sans frais de transaction pendant 1 an
- **Valeur** : Économisez sur les frais de transaction
- **Usage dans Barbsh** : Paiement des réservations et commandes
- **Comment l'obtenir** : [stripe.com/education](https://stripe.com/education)

#### 2. 🗄️ **Base de Données**

**Option A: Heroku Postgres**
- **Offre** : Base de données PostgreSQL gratuite
- **Valeur** : Jusqu'à 10 000 lignes gratuites
- **Comment l'obtenir** : Via le pack étudiant

**Option B: DigitalOcean**
- **Offre** : 200$ de crédits (12 mois)
- **Valeur** : Hébergement de base de données managée
- **Usage dans Barbsh** : Base de données PostgreSQL en production
- **Comment l'obtenir** : Via le pack étudiant

#### 3. ☁️ **Hébergement et Déploiement**

**Heroku**
- **Offre** : Crédits gratuits pour héberger vos applications
- **Usage dans Barbsh** : Déployer le backend Node.js

**DigitalOcean**
- **Offre** : 200$ de crédits
- **Usage dans Barbsh** : Héberger frontend et backend, base de données

**Vercel**
- **Offre** : Déploiement gratuit illimité
- **Usage dans Barbsh** : Héberger le frontend React

**Netlify**
- **Offre** : Pro plan gratuit pendant 1 an
- **Usage dans Barbsh** : Alternative pour le frontend

#### 4. 📧 **Services Email**

**SendGrid**
- **Offre** : 15 000 emails/mois gratuits pendant 12 mois
- **Valeur** : 15$/mois
- **Usage dans Barbsh** : Remplacer Nodemailer pour les emails transactionnels
- **Comment l'obtenir** : Via le pack étudiant

**Mailgun**
- **Offre** : 20 000 emails/mois pendant 12 mois
- **Usage dans Barbsh** : Alternative pour l'envoi d'emails

#### 5. 🔐 **Sécurité et Monitoring**

**Datadog**
- **Offre** : Pro plan gratuit pendant 2 ans
- **Usage dans Barbsh** : Monitoring des performances, logs, alertes

**Sentry**
- **Offre** : 500 000 événements/mois pendant 6 mois
- **Usage dans Barbsh** : Tracking des erreurs en production

#### 6. 🖼️ **Stockage de Fichiers**

**Backblaze B2 Cloud Storage**
- **Offre** : 10 GB de stockage gratuit
- **Usage dans Barbsh** : Stocker les images (avatars, galerie) au lieu du stockage local

#### 7. 🔍 **Domaine & DNS**

**Namecheap**
- **Offre** : 1 an de domaine .me gratuit + SSL
- **Usage dans Barbsh** : Nom de domaine personnalisé (ex: barbsh.me)

**Name.com**
- **Offre** : 1 domaine gratuit pendant 1 an
- **Alternative** : Autre option pour un nom de domaine

#### 8. 🧪 **Développement et Tests**

**GitHub Copilot**
- **Offre** : Accès gratuit
- **Usage** : Assistant IA pour coder plus rapidement

**GitKraken**
- **Offre** : Pro plan gratuit
- **Usage** : Interface Git avancée

## 🔧 Configuration avec le Pack Étudiant

### 1. Obtenir le Pack Étudiant

1. Allez sur [education.github.com/pack](https://education.github.com/pack)
2. Cliquez sur "Get student benefits"
3. Vérifiez votre statut d'étudiant (carte étudiante, email académique)
4. Attendez l'approbation (généralement quelques heures)

### 2. Configurer Stripe (Paiements)

```bash
# Dans backend-coiffeurs/.env
STRIPE_SECRET_KEY=sk_test_votre_cle_stripe
STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique
```

1. Allez sur [stripe.com/education](https://stripe.com/education)
2. Activez votre compte étudiant
3. Récupérez vos clés API dans le dashboard
4. Ajoutez-les au fichier `.env`

### 3. Configurer la Base de Données (DigitalOcean)

```bash
# Dans backend-coiffeurs/.env
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

1. Activez vos crédits DigitalOcean via le pack étudiant
2. Créez une base de données PostgreSQL managée
3. Copiez l'URL de connexion
4. Mettez à jour votre `.env`
5. Lancez `npx prisma db push`

### 4. Configurer SendGrid (Emails)

```bash
# Dans backend-coiffeurs/.env
SENDGRID_API_KEY=votre_cle_api_sendgrid
MAIL_FROM=noreply@votre-domaine.com
```

1. Activez SendGrid via le pack étudiant
2. Créez une clé API
3. Vérifiez votre domaine ou email d'envoi
4. Mettez à jour le code pour utiliser SendGrid au lieu de Nodemailer

### 5. Déployer sur Heroku ou DigitalOcean

**Heroku:**
```bash
# Installer Heroku CLI
npm install -g heroku

# Se connecter
heroku login

# Créer une app
heroku create barbsh-backend

# Déployer
git push heroku main

# Configurer les variables d'environnement
heroku config:set DATABASE_URL="votre_url"
heroku config:set JWT_SECRET="votre_secret"
```

**DigitalOcean:**
- Utilisez App Platform pour un déploiement simplifié
- Connectez votre repo GitHub
- Configurez les variables d'environnement
- Déployez automatiquement à chaque push

## 📚 Documentation Détaillée

- **Backend** : Voir [backend-coiffeurs/README.md](./backend-coiffeurs/README.md)
- **Frontend** : Voir [client-barbsh/README.md](./client-barbsh/README.md)
- **API Docs** : `http://localhost:3000/docs` (Swagger)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence ISC.

## 👨‍💻 Auteur

Miguel Nogueira

## 🆘 Support

Pour toute question :
- 📧 Email : [Créer une issue](https://github.com/MiguelNogueiraWD/barbsh/issues)
- 📖 Documentation complète dans les sous-dossiers
- 🎓 Utilisez le pack étudiant pour économiser sur les coûts de développement !

---

**Note** : Ce projet est idéal pour les étudiants souhaitant apprendre le développement full-stack moderne. Profitez du GitHub Student Developer Pack pour déployer gratuitement ! 🎓✨
