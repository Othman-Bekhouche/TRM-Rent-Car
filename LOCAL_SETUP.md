# Guide d'Installation de TRM Rent Car en Local

Ce guide vous explique comment installer et faire tourner le projet **TRM Rent Car** sur n'importe quel nouvel ordinateur.

## 📋 Prérequis
- [Node.js](https://nodejs.org/) (v18+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Pour le backend)
- [Git](https://git-scm.com/)

---

## 🚀 1. Clonage du Projet
```bash
git clone https://github.com/Othman-Bekhouche/TRM-Rent-Car.git
cd TRM-Rent-Car
```

## 🛠️ 2. Configuration du Backend

Nous utilisons **Docker Compose** pour lancer le backend Supabase en local de manière autonome.

1. Allez dans le dossier du déploiement :
   ```bash
   cd devops/vps-deploy
   ```
2. Créez votre fichier `.env` local :
   ```bash
   cp .env.example .env
   ```
3. Lancez les conteneurs :
   ```bash
   docker-compose up -d
   ```
4. **Injection du Schéma** : Attendez que les conteneurs soient prêts (vérifiez avec `docker ps`), puis injectez la base de données dans cet ordre précis :
   ```bash
   # Depuis la racine du projet
   cd ../../supabase/v2
   
   # Utiliser pgAdmin ou un client SQL (DBeaver) sur localhost:5432 (user: postgres, pass: trmrentcar2026)
   # Exécutez les fichiers dans cet ordre :
   00_roles.sql
   01_extensions.sql
   02_enums.sql
   03_tables.sql
   04_functions.sql
   05_triggers.sql
   06_rls.sql
   07_permissions.sql
   08_seed.sql
   ```

## 🏢 3. Configuration du Frontend

1. Allez dans le dossier frontend :
   ```bash
   cd ../../frontend
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Créez votre fichier `.env` :
   ```bash
   cp .env.example .env
   ```
4. Configurez les variables dans `.env` :
   - `VITE_SUPABASE_URL` : utilisez l'IP de votre Docker (souvent http://localhost:8000 via Kong)
   - `VITE_SUPABASE_ANON_KEY` : utilisez la clé présente dans le .env du dossier devops.

5. Lancez l'application :
   ```bash
   npm run dev
   ```

## ✅ 4. Vérification
- Site web : [http://localhost:5173](http://localhost:5173)
- Supabase Studio : [http://localhost:54423](http://localhost:54423)

---
**Note technique** : Les fix pour PostgreSQL 15 que nous avons appliqués (ownership, search path des rôles) sont déjà inclus dans les fichiers SQL du dossier `supabase/v2`. Tout devrait fonctionner instantanément lors d'un fresh install.
