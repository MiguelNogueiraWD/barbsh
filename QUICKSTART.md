# 🚀 Quick Start - Barbsh

Guide de démarrage rapide pour lancer Barbsh en local en moins de 10 minutes.

## ⚡ Installation Express

### 1. Cloner le projet

```bash
git clone https://github.com/MiguelNogueiraWD/barbsh.git
cd barbsh
```

### 2. Installer PostgreSQL (si pas déjà installé)

**macOS (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
- Télécharger depuis [postgresql.org](https://www.postgresql.org/download/windows/)
- Installer et démarrer le service

### 3. Créer la base de données

```bash
# Se connecter à PostgreSQL
psql postgres

# Dans psql, créer la base de données
CREATE DATABASE barbsh_db;
CREATE USER barbsh_user WITH PASSWORD 'barbsh_password';
GRANT ALL PRIVILEGES ON DATABASE barbsh_db TO barbsh_user;
\q
```

### 4. Configurer le Backend

```bash
cd backend-coiffeurs

# Installer les dépendances
npm install

# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos informations
nano .env  # ou utilisez votre éditeur préféré
```

**Configuration minimale dans .env :**
```env
DATABASE_URL="postgresql://barbsh_user:barbsh_password@localhost:5432/barbsh_db"
JWT_SECRET="mon_secret_temporaire_123"
MAIL_USER="votre.email@gmail.com"
MAIL_PASS="votre_mot_de_passe_app"
STRIPE_SECRET_KEY="sk_test_obtenir_depuis_stripe"
FRONT_URL="http://localhost:5173"
```

**Initialiser la base de données :**
```bash
npx prisma generate
npx prisma db push
```

**Démarrer le serveur :**
```bash
npm run dev
```

✅ Backend lancé sur http://localhost:3000

### 5. Configurer le Frontend

**Nouvelle fenêtre de terminal :**
```bash
cd client-barbsh

# Installer les dépendances
npm install

# Démarrer l'application
npm run dev
```

✅ Frontend lancé sur http://localhost:5173

## 🎯 Premiers pas

### Tester l'API

**Swagger UI** : http://localhost:3000/docs

**Test rapide :**
```bash
# Vérifier que l'API répond
curl http://localhost:3000/api/services

# S'inscrire (exemple)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CLIENT"
  }'
```

### Utiliser l'application

1. Ouvrir http://localhost:5173
2. Créer un compte utilisateur
3. Explorer les fonctionnalités

## 🔑 Obtenir les clés Stripe (pour les paiements)

1. Créer un compte sur [stripe.com](https://stripe.com)
2. Activer le mode Test
3. Aller dans Developers > API keys
4. Copier la clé secrète (commence par `sk_test_...`)
5. Ajouter dans `.env` : `STRIPE_SECRET_KEY="sk_test_..."`

**Cartes de test Stripe :**
- **Succès** : 4242 4242 4242 4242
- **Échec** : 4000 0000 0000 0002
- Date : N'importe quelle date future
- CVC : N'importe quel code 3 chiffres

## 📧 Configuration Gmail pour les emails (optionnel)

1. Aller dans votre compte Google
2. Sécurité > Validation en deux étapes (activer)
3. Mots de passe d'application > Générer
4. Utiliser ce mot de passe dans `.env` comme `MAIL_PASS`

## ❌ Problèmes courants

### Erreur "Cannot connect to database"
```bash
# Vérifier que PostgreSQL est démarré
# macOS
brew services list

# Linux
sudo systemctl status postgresql

# Tester la connexion
psql "postgresql://barbsh_user:barbsh_password@localhost:5432/barbsh_db"
```

### Erreur "Port 3000 already in use"
```bash
# Trouver le processus
lsof -i :3000

# Tuer le processus (remplacer PID)
kill -9 PID

# Ou changer le port dans .env
PORT=3001
```

### Erreur Prisma "Schema not synced"
```bash
cd backend-coiffeurs
npx prisma generate
npx prisma db push
```

### Frontend ne se connecte pas au backend
Vérifier que `VITE_API_URL` est correct dans le frontend (généralement géré automatiquement).

## 🎓 Pour les étudiants

Une fois que tout fonctionne en local, consultez :
- **[STUDENT_GUIDE.md](../STUDENT_GUIDE.md)** : Configuration avec GitHub Student Pack
- **[README.md](../README.md)** : Documentation complète du projet

## 📚 Prochaines étapes

1. ✅ Application lancée en local
2. 📖 Lire la [documentation backend](./README.md)
3. 🎨 Personnaliser le frontend
4. 🎓 Configurer le [GitHub Student Pack](../STUDENT_GUIDE.md)
5. 🚀 Déployer en production

## 🆘 Besoin d'aide ?

- 📖 Documentation complète : [README principal](../README.md)
- 🎓 Guide étudiant : [STUDENT_GUIDE.md](../STUDENT_GUIDE.md)
- 🐛 Problème ? [Créer une issue](https://github.com/MiguelNogueiraWD/barbsh/issues)
- 📝 API Documentation : http://localhost:3000/docs (Swagger)

---

**Temps estimé** : 10-15 minutes ⏱️

**Félicitations ! Vous êtes prêt à développer ! 🎉**
