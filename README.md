# 🚗 TRM Rent Car — Système de Gestion de Flotte Automobile

Plateforme web premium pour la gestion complète d'une agence de location de véhicules.

## 🌟 Fonctionnalités Clés

- **🌐 Site Public & Catalogue** : Présentation haut de gamme de la flotte avec filtres avancés.
- **📅 Réservation Intelligente** : Système de réservation direct avec calcul automatique des tarifs.
- **👤 Espace Client** : Suivi des réservations et accès aux documents de location.
- **🛡️ Administration (CRM)** :
    - Dashboard analytique (revenus, KPIs, statut de la flotte).
    - Gestion CRUD des véhicules, clients et réservations.
    - **⚠️ Module Infractions** : Matching automatique véhicule/client pour les amendes.
    - **📍 GPS Live** : Suivi cartographique des véhicules en temps réel (via Leaflet).
    - **🔧 Maintenance** : Suivi des entretiens et alertes kilométrage.
    - **💰 Comptabilité** : Suivi des transactions et revenus.

## 🛠 Stack Technique

- **Frontend** : React 19, TypeScript, Vite 7, Tailwind CSS 4.
- **Backend** : Supabase (Self-hosted), PostgreSQL 17.
- **Auth** : Supabase Auth (gestion des rôles Super Admin, Admin, Assistant).
- **Cartographie** : React-Leaflet.

---

## 🚀 Installation Locale

### 1. Base de données (Supabase CLI)
```bash
npx supabase start      # Lance les containers Docker Supabase
npx supabase db reset   # Applique les migrations et les données de test (seed)
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev             # http://localhost:5173
```

---

## 📦 Déploiement sur VPS

Tout le nécessaire pour déployer sur un VPS est prêt dans le dossier `devops/vps-deploy/`.

### Étapes rapides :
1. Copiez le dossier `devops/vps-deploy/` sur votre VPS.
2. Renommez `.env.example` en `.env` et ajustez les secrets.
3. Lancez l'infrastructure :
   ```bash
   docker-compose up -d
   ```

Pour plus de détails, consultez le **[Guide de déploiement VPS dédié](devops/vps-deploy/README_VPS.md)**.

---

## 📂 Documentation Additionnelle

- **[Plan du Projet (Complet)](PROJECT_PLAN.md)**
- **[Liste des fonctionnalités](docs/features/06_all_functionalities.md)**
- **[Aperçu de l'architecture](PROJECT_PLAN.md# architecture-base-de-données)**

---
© 2026 TRM Rent Car.
