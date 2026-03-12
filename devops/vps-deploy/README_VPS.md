# 🚀 Guide de migration vers VPS — TRM Rent Car

Ce dossier contient les fichiers nécessaires pour déployer l'infrastructure **Supabase (Self-hosted)** sur votre VPS.

## 📋 Prérequis sur le VPS
- **Docker** et **Docker Compose** installés.
- Un nom de domaine (ex: `api.trmrentcar.ma`) pointant vers l'IP du VPS.
- Ports ouverts : `8000` (Kong API), `5432` (Postgres - optionnel), `54423` (Studio).

## 📁 Structure des fichiers
- `docker-compose.yml` : Définit tous les services (DB, Auth, Edge, Kong, Studio).
- `volumes/api/kong.yml` : Configuration des routes API.
- `.env.example` : Modèle pour vos variables d'environnement.

## 🛠 Étapes de déploiement

### 1. Préparer les fichiers
Copiez le contenu du dossier `devops/vps-deploy` sur votre VPS.
```bash
mkdir -p ~/trm-deploy
# Copiez les fichiers ici
```

### 2. Configurer les variables d'environnement
Renommez `.env.example` en `.env` et remplissez les valeurs :
```bash
cp .env.example .env
nano .env
```
> **Important :** Générez des clés sécurisées pour `JWT_SECRET`, `ANON_KEY` et `SERVICE_ROLE_KEY`.

### 3. Lancer l'infrastructure
```bash
docker-compose up -d
```

### 4. Migrer la base de données
Depuis votre machine locale, si vous avez le CLI Supabase, vous pouvez pousser le schéma vers le VPS :
```bash
# Dans le dossier racine du projet
supabase link --project-ref your_vps_ip
supabase db push
```
Ou importez manuellement les fichiers SQL de `supabase/migrations/` et `supabase/seed.sql` via le Studio (port 54423).

### 5. Configurer le Frontend
Dans votre fichier `.env` côté React (frontend), mettez à jour l'URL :
```env
VITE_SUPABASE_URL=http://votre_ip_vps:8000
VITE_SUPABASE_ANON_KEY=votre_nouvelle_anon_key
```

## ⚠️ Sécurité
- Changez obligatoirement le `POSTGRES_PASSWORD`.
- Il est recommandé d'utiliser un reverse proxy (Nginx/Traefik) avec SSL (Certbot) devant le port 8000.
