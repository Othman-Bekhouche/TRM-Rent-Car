# Guide de Démarrage - TRM Rent Car

Ce projet est une application de gestion de location de voitures avec un frontend React et un backend Supabase (auto-hébergé via Docker).

## Prérequis
- **Docker & Docker Compose**
- **Node.js** (v18 ou supérieur)
- **Git**

## Étapes pour démarrer sur un nouveau PC

### 1. Cloner le projet
```bash
git clone <url-du-repo>
cd TRM-Rent-Car
```

### 2. Configuration du Backend (Supabase Docker)
Le backend est situé dans le dossier `devops/vps-deploy`.

1. Accédez au dossier :
   ```bash
   cd devops/vps-deploy
   ```
2. Créez un fichier `.env` à partir du template (s'il existe) ou vérifiez les variables dans `docker-compose.yml`.
3. Démarrez les services :
   ```bash
   docker-compose up -d
   ```
4. Vérifiez que tous les containers sont en cours d'exécution :
   ```bash
   docker ps
   ```

### 3. Initialisation de la Base de Données
Si la base de données est vide, vous devez appliquer les scripts SQL situés dans `supabase/v2` dans l'ordre numérique :
- `01_setup_auth.sql`
- `02_extensions.sql`
- `03_tables.sql`
- ... et ainsi de suite.

Vous pouvez les appliquer via l'interface **Supabase Studio** (généralement sur `http://localhost:54323`) dans l'éditeur SQL.

### 4. Configuration du Frontend
1. Accédez au dossier frontend :
   ```bash
   cd ../../frontend
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Créez un fichier `.env` à la racine du dossier `frontend` avec les clés Supabase :
   ```env
   VITE_SUPABASE_URL=http://localhost:54421
   VITE_SUPABASE_ANON_KEY=votre_cle_anon
   ```
4. Démarrez l'application en mode développement :
   ```bash
   npm run dev
   ```

## Structure du Projet
- `frontend/` : Application React (Vite, Tailwind, Lucide Icons).
- `supabase/v2/` : Scripts de migration et structure de la base de données.
- `devops/` : Configuration Docker et déploiement.

## Maintenance
- Pour voir les logs Docker : `docker-compose logs -f`
- Pour arrêter les services : `docker-compose down`
