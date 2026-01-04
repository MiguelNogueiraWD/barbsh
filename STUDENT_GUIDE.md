# 🎓 Guide Étudiant - GitHub Student Developer Pack pour Barbsh

Ce guide vous explique étape par étape comment utiliser le **GitHub Student Developer Pack** pour développer et déployer Barbsh **gratuitement**.

## 📋 Table des Matières

1. [Obtenir le Pack Étudiant](#1-obtenir-le-pack-étudiant)
2. [Services Essentiels pour Barbsh](#2-services-essentiels-pour-barbsh)
3. [Configuration Complète](#3-configuration-complète)
4. [Déploiement en Production](#4-déploiement-en-production)
5. [Budget et Économies](#5-budget-et-économies)

## 1. Obtenir le Pack Étudiant

### Conditions Requises
- ✅ Être étudiant dans un établissement reconnu
- ✅ Avoir un email académique (`.edu`, `.ac.uk`, etc.) ou carte étudiante
- ✅ Avoir un compte GitHub

### Étapes d'Inscription

1. **Visitez le site**
   - Allez sur [education.github.com/pack](https://education.github.com/pack)

2. **Cliquez sur "Get student benefits"**
   - Connectez-vous à votre compte GitHub

3. **Vérifiez votre statut d'étudiant**
   - Option A : Email académique
   - Option B : Upload de votre carte étudiante

4. **Attendez l'approbation**
   - Généralement approuvé en quelques heures
   - Vous recevrez un email de confirmation

5. **Accédez à vos avantages**
   - Une fois approuvé, visitez [education.github.com/pack/offers](https://education.github.com/pack/offers)
   - Activez les services dont vous avez besoin

## 2. Services Essentiels pour Barbsh

### ⭐ Services Prioritaires (À activer en premier)

| Service | Gratuit | Valeur | Utilisation |
|---------|---------|--------|-------------|
| **GitHub Copilot** | Oui | 10$/mois | Aide au codage IA |
| **DigitalOcean** | 200$ crédits | 200$ | Hébergement + BDD |
| **Stripe** | Oui (1 an) | Variables | Paiements |
| **SendGrid** | 15k emails/mois | 15$/mois | Emails |
| **Namecheap** | 1 domaine .me | 10$/an | Nom de domaine |

### 🔧 Services Secondaires (Utiles mais optionnels)

| Service | Gratuit | Utilisation |
|---------|---------|-------------|
| **Sentry** | 500k events/mois | Tracking erreurs |
| **Datadog** | Pro 2 ans | Monitoring |
| **MongoDB Atlas** | 50$ crédits | Alternative à PostgreSQL |
| **Heroku** | Crédits | Hébergement alternatif |

## 3. Configuration Complète

### Étape 1 : Configuration de Base

#### A. Stripe (Paiements) 💳

**Pourquoi ?** Barbsh utilise Stripe pour tous les paiements (réservations, marketplace)

**Comment activer :**

1. Allez sur [stripe.com/education](https://stripe.com/education)
2. Cliquez sur "Apply now" avec votre email GitHub Education
3. Créez ou connectez votre compte Stripe
4. Activez le mode Test

**Configuration dans Barbsh :**

```bash
cd backend-coiffeurs
```

Créez ou modifiez `.env` :

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51xxx...
STRIPE_PUBLISHABLE_KEY=pk_test_51xxx...
STRIPE_WEBHOOK_SECRET=whsec_xxx... # Pour les webhooks en production
```

**Où trouver les clés :**
- Dashboard Stripe > Developers > API keys
- Utilisez les clés "Test mode" pour le développement
- Passez en "Live mode" uniquement pour la production

**Test :**

```bash
npm run dev
# Le serveur doit démarrer sans erreur Stripe
```

#### B. Base de Données (DigitalOcean) 🗄️

**Pourquoi ?** PostgreSQL pour stocker toutes les données (users, bookings, services, etc.)

**Comment activer :**

1. Visitez [digitalocean.com/github-students](https://www.digitalocean.com/github-students)
2. Créez un compte avec votre email GitHub Education
3. Réclamez vos 200$ de crédits
4. Créez une base de données :
   - Databases > Create Database Cluster
   - Choisissez PostgreSQL
   - Sélectionnez le plan le moins cher (10$/mois)
   - Région : la plus proche de vous
   - Cluster name : `barbsh-db`

**Configuration dans Barbsh :**

```env
# PostgreSQL Configuration
DATABASE_URL="postgresql://doadmin:PASSWORD@host-db.ondigitalocean.com:25060/defaultdb?sslmode=require"
```

**Initialiser la base de données :**

```bash
cd backend-coiffeurs
npx prisma generate
npx prisma db push
```

**Vérification :**

```bash
npx prisma studio
# Ouvre un interface pour visualiser la BDD
```

#### C. SendGrid (Emails) 📧

**Pourquoi ?** Pour envoyer les emails de confirmation de réservation, factures, etc.

**Comment activer :**

1. Allez sur [sendgrid.com/partner/github-education](https://sendgrid.com/partner/github-education)
2. Créez un compte avec votre email GitHub Education
3. Vérifiez votre email
4. Créez une clé API :
   - Settings > API Keys > Create API Key
   - Name: `Barbsh API`
   - Permissions: Full Access
   - Copiez la clé (elle ne sera affichée qu'une fois !)

**Configuration dans Barbsh :**

```env
# Email Configuration (SendGrid)
SENDGRID_API_KEY=SG.xxx...
MAIL_FROM=noreply@votre-domaine.com
```

**Modifier le code :**

Remplacez Nodemailer par SendGrid dans `backend-coiffeurs/utils/email.js` :

```javascript
const sgMail = require('@sendgrid/mail');

// Initialiser SendGrid avec validation
function initializeSendGrid() {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SENDGRID_API_KEY is not set in environment variables');
    return false;
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  return true;
}

// Initialiser au démarrage
const sendGridInitialized = initializeSendGrid();

async function sendEmail(to, subject, html) {
  if (!sendGridInitialized) {
    console.error('Cannot send email: SendGrid not properly initialized');
    return;
  }
  
  const msg = {
    to,
    from: process.env.MAIL_FROM,
    subject,
    html,
  };
  
  try {
    await sgMail.send(msg);
    console.log(`Email sent successfully to ${to} with subject: "${subject}"`);
  } catch (error) {
    console.error(`Error sending email to ${to} with subject "${subject}":`, error.message);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
  }
}

module.exports = { sendEmail };
```

**Installation :**

```bash
cd backend-coiffeurs
npm install @sendgrid/mail
```

#### D. Namecheap (Nom de Domaine) 🌐

**Pourquoi ?** Un nom de domaine professionnel pour votre projet

**Comment activer :**

1. Allez sur [nc.me](https://nc.me/)
2. Créez un compte
3. Réclamez votre domaine .me gratuit avec le pack étudiant
4. Choisissez un nom : `barbsh.me`, `monbarbier.me`, etc.

**Configuration DNS :**

Une fois que vous avez déployé sur DigitalOcean ou Heroku :

1. Obtenez l'IP ou le CNAME de votre serveur
2. Dans Namecheap Dashboard :
   - Advanced DNS
   - Ajoutez un A Record : `@` → `votre.ip.du.serveur`
   - Ajoutez un CNAME : `www` → `votre-domaine.com`

### Étape 2 : Configuration Avancée (Optionnel)

#### E. Sentry (Monitoring des Erreurs) 🐛

**Installation :**

```bash
cd backend-coiffeurs
npm install @sentry/node
```

**Configuration :**

```javascript
// Au début de index.js
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
});

// Avant vos routes
app.use(Sentry.Handlers.requestHandler());

// Après vos routes, avant les error handlers
app.use(Sentry.Handlers.errorHandler());
```

**Fichier .env :**

```env
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

#### F. Datadog (Monitoring Performances) 📊

Pour un monitoring avancé en production :

1. Créez un compte sur [datadoghq.com](https://www.datadoghq.com/partner/github-students/)
2. Installez l'agent Datadog sur votre serveur
3. Configurez les métriques pour Node.js

## 4. Déploiement en Production

### Option A : DigitalOcean App Platform (Recommandé)

**Avantages :**
- Déploiement automatique depuis GitHub
- Scaling facile
- SSL gratuit
- Logs centralisés

**Étapes :**

1. **Préparez votre projet**

```bash
# Ajoutez un fichier .do/app.yaml à la racine
```

Créez `.do/app.yaml` :

```yaml
name: barbsh
services:
  - name: backend
    github:
      repo: VotreUsername/barbsh
      branch: main
      deploy_on_push: true
    source_dir: /backend-coiffeurs
    environment_slug: node-js
    http_port: 3000
    env_variables:
      - key: NODE_ENV
        value: production
    routes:
      - path: /api
  
  - name: frontend
    github:
      repo: VotreUsername/barbsh
      branch: main
      deploy_on_push: true
    source_dir: /client-barbsh
    environment_slug: node-js
    build_command: npm run build
    http_port: 3000
    routes:
      - path: /

databases:
  - name: barbsh-db
    engine: PG
    version: "15"
```

2. **Déployez**

- DigitalOcean Dashboard > Apps > Create App
- Connectez votre repo GitHub
- Suivez le wizard
- Ajoutez les variables d'environnement
- Déployez !

3. **Configuration des variables d'environnement**

Dans App Platform > Settings > Environment Variables, ajoutez :

```
DATABASE_URL
JWT_SECRET
STRIPE_SECRET_KEY
SENDGRID_API_KEY
MAIL_FROM
FRONT_URL
```

### Option B : Heroku (Alternative)

**Installation :**

```bash
npm install -g heroku
heroku login
```

**Backend :**

```bash
cd backend-coiffeurs

# Créer l'app
heroku create barbsh-api

# Ajouter PostgreSQL
heroku addons:create heroku-postgresql:mini

# Configurer les variables
heroku config:set JWT_SECRET="votre_secret_très_sécurisé"
heroku config:set STRIPE_SECRET_KEY="sk_live_xxx"
heroku config:set SENDGRID_API_KEY="SG.xxx"

# Déployer
git subtree push --prefix backend-coiffeurs heroku main

# Initialiser la BDD
heroku run npx prisma db push
```

**Frontend (Vercel) :**

```bash
cd client-barbsh
npm install -g vercel
vercel

# Suivez les instructions
# Configurez VITE_API_URL vers votre backend Heroku
```

## 5. Budget et Économies

### Coût Sans le Pack Étudiant

| Service | Prix Mensuel | Prix Annuel |
|---------|-------------|-------------|
| Heroku Dyno | 7$ | 84$ |
| PostgreSQL | 9$ | 108$ |
| Stripe fees | ~2.9% + 0.30$ | Variable |
| SendGrid | 15$ | 180$ |
| Domaine | - | 10$ |
| Sentry | 26$ | 312$ |
| **TOTAL** | **~57$** | **~694$** |

### Avec le Pack Étudiant

| Service | Économie | Durée |
|---------|----------|-------|
| DigitalOcean | 200$ | 12 mois |
| Stripe | 100% fees | 12 mois |
| SendGrid | 180$ | 12 mois |
| Domaine .me | 10$ | 12 mois |
| Sentry | 624$ | 24 mois |
| GitHub Copilot | 120$ | Tant que étudiant |
| **TOTAL** | **>1000$** | **1-2 ans** |

### 💰 Économie Totale : Plus de 1000$ !

## 🎯 Checklist de Configuration

Utilisez cette checklist pour vous assurer que tout est configuré :

### Configuration Locale
- [ ] Node.js installé (v18+)
- [ ] PostgreSQL installé localement ou sur DigitalOcean
- [ ] Repository cloné
- [ ] Dependencies installées (backend + frontend)
- [ ] Fichier .env créé et rempli

### GitHub Student Pack
- [ ] Pack étudiant activé
- [ ] GitHub Copilot activé (aide au développement)
- [ ] DigitalOcean crédits réclamés
- [ ] Stripe Education activé
- [ ] SendGrid compte créé
- [ ] Namecheap domaine .me réclamé

### Services Configurés
- [ ] Stripe clés API en mode test
- [ ] Base de données PostgreSQL accessible
- [ ] Prisma migrations exécutées
- [ ] SendGrid clé API configurée
- [ ] JWT secret défini
- [ ] Variables d'environnement toutes configurées

### Tests Locaux
- [ ] Backend démarre sans erreur (`npm run dev`)
- [ ] Frontend démarre sans erreur (`npm run dev`)
- [ ] Connexion à la base de données fonctionne
- [ ] Inscription/connexion utilisateur fonctionne
- [ ] Création d'un service fonctionne

### Déploiement
- [ ] Backend déployé (DigitalOcean/Heroku)
- [ ] Frontend déployé (Vercel/Netlify/DO)
- [ ] Base de données en production créée
- [ ] Variables d'environnement de production configurées
- [ ] SSL/HTTPS activé
- [ ] Domaine personnalisé configuré (optionnel)
- [ ] Stripe en mode Live (pour la production réelle)

## 🆘 Problèmes Courants

### "Cannot connect to database"
- Vérifiez que `DATABASE_URL` est correct
- Vérifiez que votre IP est autorisée (DigitalOcean > Trusted Sources)
- Testez la connexion : `psql $DATABASE_URL`

### "Stripe API key invalid"
- Vérifiez que vous utilisez `sk_test_` pour le dev, `sk_live_` pour la prod
- Vérifiez qu'il n'y a pas d'espace avant/après la clé

### "SendGrid not sending emails"
- Vérifiez que votre email est vérifié dans SendGrid
- **Important** : Vérifiez l'authentification de l'expéditeur (Sender Authentication)
  - Allez dans SendGrid > Settings > Sender Authentication
  - Option A : Vérifiez un domaine complet (recommandé pour la production)
  - Option B : Vérifiez une adresse email unique (plus rapide pour les tests)
- Vérifiez que la clé API a les bonnes permissions (Full Access ou Mail Send)
- Regardez les logs SendGrid dans le dashboard pour voir les erreurs détaillées
- Testez avec l'Activity Feed dans SendGrid pour voir si les emails sont envoyés

### "Build failed on deployment"
- Vérifiez que toutes les dépendances sont dans `package.json`
- Vérifiez la version de Node.js compatible
- Regardez les logs de build pour identifier l'erreur

## 📚 Ressources Supplémentaires

- [Documentation Stripe](https://stripe.com/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation SendGrid](https://docs.sendgrid.com/)
- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)
- [GitHub Education](https://education.github.com/)

## 🎓 Conseils pour les Étudiants

1. **Commencez petit** : Configurez d'abord en local, puis déployez
2. **Utilisez Git branches** : `dev`, `staging`, `main`
3. **Mode Test d'abord** : Utilisez toujours Stripe test mode avant la production
4. **Documentez** : Prenez des notes sur votre configuration
5. **Backup** : Faites des backups réguliers de la base de données
6. **Sécurité** : Ne committez JAMAIS les fichiers `.env`
7. **Monitoring** : Utilisez Sentry dès le début pour tracker les bugs

---

**Bon développement ! 🚀**

Si vous avez des questions, créez une issue sur GitHub ou consultez la documentation complète dans les README des sous-dossiers.
