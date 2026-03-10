# TRM Rent Car — Documentation Projet

## 🏢 Informations Agence

- **Nom :** TRM Rent Car
- **Siège :** Appt Sabrine, 2ème Étage N°6 Bloc A, 65800 Taourirt
- **Téléphone :** 06 06 06 6426
- **Email :** trm.rentcar@gmail.com
- **Zone de livraison :** Taourirt (siège), Oujda, Nador, Fès, Berkane

---

## 🛠 Stack Technique

| Composant | Technologie |
|-----------|-------------|
| **Frontend** | React 19, TypeScript, Vite 7 |
| **Styling** | Tailwind CSS 4 (thème sombre premium) |
| **Backend / BDD** | Supabase (Self-hosted), PostgreSQL 17 |
| **Auth** | Supabase Auth (email/password) |
| **Cartographie** | Leaflet + React-Leaflet (OpenStreetMap) |
| **Icônes** | Lucide React |
| **Infrastructure** | Docker (dev local) |
| **Déploiement** | VPS avec domaine personnalisé (futur) |

---

## 🎨 Design & Palette

| Couleur | Hex | Usage |
|---------|-----|-------|
| Deep Indigo | `#1C0770` | Titres, accents forts |
| Electric Blue | `#261CC1` | Dégradés, boutons actifs |
| Sky Blue | `#3A9AFF` | Primary, liens, CTA |
| Background | `#0B0F19` | Fond principal |
| Surface | `#121826` | Cards, modales |
| Border | `#1F2A3D` | Séparateurs, bordures |

- Logo utilisé : `trm-logo-pour-arriere-noir.png` (optimisé pour fond sombre)
- Style : Dark mode premium, glassmorphism, animations subtiles

---

## 👥 Rôles & Identifiants

### Comptes Admin (Supabase Auth)

| Rôle | Nom | Email | Mot de passe |
|------|-----|-------|-------------|
| **Super Admin** | Med Tahiri | `admin@trmrentcar.ma` | `AdminTRM2026!` |
| **Admin** | Ahmed Tahiri | `ahmed.t@trmrentcar.ma` | `AhmedTRM2026!` |
| **Admin** | Sara Bennani | `sara.b@trmrentcar.ma` | `SaraTRM2026!` |

### Rôles utilisateur

1. **Guest** — Navigation publique, catalogue, réservation
2. **Customer** — Espace client, historique, profil
3. **Admin** — Gestion flotte, réservations, clients
4. **Super Admin** — Tout + gestion des admins, paramètres

---

## 🗄 Architecture Base de Données

### Tables

| Table | Description | Lignes seed |
|-------|-------------|-------------|
| `profiles` | Comptes admin (lié à auth.users) | 3 |
| `vehicles` | Flotte automobile | 7 |
| `vehicle_images` | Photos des véhicules | 7 |
| `customers` | Clients CRM (nom, CIN, tél, adresse) | 6 |
| `reservations` | Réservations (lié clients + véhicules) | 5 |
| `infractions` | Infractions routières (lié véhicules + clients) | 3 |
| `maintenance` | Entretien véhicules | 5 |
| `transactions` | Comptabilité (encaissements, cautions) | 5 |
| `gps_tracking` | Positions GPS en temps réel | 2 |

### Fonctionnalités DB avancées

- **Trigger `match_infraction_to_reservation()`** — Match automatique infraction → réservation → client
- **Trigger `update_updated_at()`** — Mise à jour auto du champ `updated_at`
- **RLS (Row Level Security)** — Admin-only sur toutes les tables métier
- **Indexes** — Sur vehicle_id, customer_id, dates, status, CIN, phone

---

## 🚗 Flotte Véhicules

| Véhicule | Plaque | Prix/jour | Statut |
|----------|--------|-----------|--------|
| Peugeot 208 Noir | 208-A-001 | 420 MAD | Disponible |
| Peugeot 208 Gris | 208-B-002 | 520 MAD | Disponible |
| Dacia Logan Blanc | LOG-C-003 | 300 MAD | Disponible |
| Dacia Logan Gris | LOG-C-004 | 300 MAD | Réservé |
| Dacia Sandero Blanc | SND-D-005 | 320 MAD | Disponible |
| Dacia Sandero Gris | SND-D-006 | 320 MAD | Disponible |
| Dacia Sandero Bleu | SND-D-007 | 320 MAD | Maintenance |

---

## 📁 Structure du Projet

```
TRM Rent Car/
├── frontend/
│   ├── src/
│   │   ├── components/ui/       # Navbar, Footer
│   │   ├── layouts/             # PublicLayout, AdminLayout
│   │   ├── lib/                 # supabase.ts, api.ts (CRUD services)
│   │   ├── pages/
│   │   │   ├── public/          # Home, Vehicles, VehicleDetail, About, Contact
│   │   │   │   └── auth/        # Login, Register
│   │   │   └── admin/           # Dashboard, Reservations, AdminVehicles,
│   │   │                        # Customers, Infractions, GPS, Accounting,
│   │   │                        # Maintenance, Settings, Users
│   │   ├── App.tsx              # Routes (public + admin)
│   │   └── index.css            # Variables CSS + animations
│   ├── public/
│   │   ├── images/cars/         # Photos véhicules (PNG réalistes)
│   │   ├── trm-logo-pour-arriere-noir.png
│   │   └── trm-logo-pour-arriere-blanc.png
│   └── package.json
├── supabase/
│   ├── config.toml              # Config Supabase locale
│   ├── migrations/
│   │   ├── 20260308_initial_schema.sql     # profiles, vehicles, reservations
│   │   └── 20260309_extended_schema.sql    # customers, infractions, maintenance,
│   │                                       # transactions, gps_tracking + triggers
│   └── seed.sql                 # Données de démonstration complètes
└── PROJECT_PLAN.md              # Ce fichier
```

---

## 🖥 Pages Publiques

| Page | URL | Description |
|------|-----|-------------|
| **Accueil** | `/` | Hero cinématique, widget réservation, flotte populaire, zones livraison, "Pourquoi TRM" |
| **Flotte** | `/vehicles` | Catalogue filtrable (type, transmission, carburant, prix) |
| **Détail** | `/vehicles/:id` | Fiche véhicule, galerie, specs, widget réservation sticky |
| **À propos** | `/about` | Histoire, valeurs, statistiques, CTA |
| **Contact** | `/contact` | Téléphone, email, WhatsApp, horaires, formulaire |
| **Connexion** | `/login` | Auth Supabase (email/password) |
| **Inscription** | `/register` | Formulaire création compte |

---

## 🏗 Pages Admin (`/admin`)

| Page | URL | Description |
|------|-----|-------------|
| **Dashboard** | `/admin` | KPIs (revenus, véhicules, réservations), graphiques, activité récente |
| **Réservations** | `/admin/reservations` | Table CRM filtrale, statuts, recherche |
| **Véhicules** | `/admin/vehicles` | Gestion flotte, ajout/édition/suppression |
| **Clients** | `/admin/customers` | CRM clients avec CIN, historique, statuts |
| **Infractions** | `/admin/infractions` | ⚠️ Module complet : amendes routières, matching auto client/véhicule, transmission aux autorités |
| **GPS** | `/admin/gps` | Carte Leaflet interactive, positions véhicules temps réel |
| **Comptabilité** | `/admin/accounting` | KPIs financiers, transactions, revenus |
| **Maintenance** | `/admin/maintenance` | Suivi entretien, alertes, coûts |
| **Paramètres** | `/admin/settings` | Info agence, tarifs, notifications |
| **Administrateurs** | `/admin/users` | Gestion comptes admin, rôles |

---

## 🔗 API Services (`src/lib/api.ts`)

Couche CRUD complète connectée à Supabase :

| Service | Opérations |
|---------|-----------|
| `vehiclesApi` | getAll, getById, create, update, delete |
| `customersApi` | getAll, getById, create, update, delete |
| `reservationsApi` | getAll, getById, create, update, delete, findByVehicleAndDate |
| `infractionsApi` | getAll, getById, create, update, delete |
| `maintenanceApi` | getAll, create, update, delete |
| `transactionsApi` | getAll, create, update, delete |
| `gpsApi` | getLatestPositions |
| `adminsApi` | getAll, update |
| `authApi` | signIn, signOut, getCurrentUser, getSession |
| `dashboardApi` | getStats (KPIs agrégés) |

---

## 🚀 Lancement

### Prérequis
- Node.js 18+
- Docker Desktop
- Supabase CLI (`npx supabase`)

### Démarrer Supabase (base de données)
```bash
cd "TRM Rent Car"
npx supabase start
npx supabase db reset   # Applique migrations + seed
```

### Démarrer le Frontend
```bash
cd frontend
npm install
npm run dev             # http://localhost:5173
```

### Accès Supabase Studio
```
http://127.0.0.1:54423
```

### Build Production
```bash
cd frontend
npm run build           # Génère dist/
```

---

## 📋 Roadmap

### ✅ Phase 1 — MVP (Complété)
- [x] Site public premium (Home, Flotte, Détail, About, Contact)
- [x] Système de réservation (widget dates + lieu)
- [x] Auth (Login/Register via Supabase)
- [x] Admin CRM complet (Dashboard, Réservations, Véhicules, Clients)
- [x] Module Infractions avec matching automatique
- [x] GPS avec carte Leaflet interactive
- [x] Comptabilité, Maintenance, Paramètres, Gestion Admins
- [x] Base de données complète avec triggers et RLS
- [x] API CRUD pour toutes les tables

### 🔲 Phase 2 — Intégration & Automatisation
- [x] Connexion pages admin au backend Supabase (données live)
- [ ] Paiement en ligne (Stripe ou CMI)
- [ ] Upload documents (permis, CIN) via Supabase Storage
- [ ] Notifications email (confirmation réservation)
- [ ] Export PDF (infractions, factures)

### 🔲 Phase 3 — Enterprise
- [ ] GPS temps réel (Traccar / OBD2)
- [ ] Reporting avancé + analytics
- [ ] Application mobile (Capacitor)
- [ ] Multi-agences
