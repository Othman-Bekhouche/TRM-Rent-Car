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
Si la base de données est vide, vous pouvez tout configurer en une seule commande :

1. Ouvrez l'éditeur SQL dans **Supabase Studio** (généralement sur `http://localhost:54323`).
2. Copiez et collez le contenu du fichier `supabase/v2/master_init.sql` et exécutez-le. 
   > **Note** : Ce fichier exécute automatiquement tous les autres scripts (rôles, tables, fonctions, RLS).

Si vous préférez la ligne de commande (Psql) :
```bash
# Depuis le dossier devops/vps-deploy
docker exec -i supabase_db_TRM_Rent_Car psql -U postgres -d postgres < ../../supabase/v2/master_init.sql
```

#### Vérification des Rôles
Le script `00_roles.sql` (inclus dans le master) crée automatiquement les rôles nécessaires (`anon`, `authenticated`, `service_role`, `authenticator`). Si vous avez un PC avec une installation Docker PostgreSQL existante, assurez-vous qu'elle n'utilise pas le port 5432.

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

## Accès par défaut
- **Admin Panel** : `http://localhost:5173/admin/login`
- **Identifiants (si configurés dans seed.sql)** : 
  - Email: `admin@trm.com` (Exemple)
  - Password: `trmrentcar2026`
