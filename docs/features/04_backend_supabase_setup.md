# Backend & Database Configuration (Supabase Local via Docker)

## Objectif
Mettre en place la fondation Back-End et Base de données de la plateforme **TRM Rent Car** à l'aide de **Supabase Self-Hosted**, exécuté localement sous **Docker**, tout en créant une structure SQL scalable prête à supporter de futurs modules d'entreprise (GPS, Comptabilité, etc.).

---

## 1. Hébergement Local Supabase & Configuration Docker (Documentation)
### À propos de l'architecture
L'écosystème **Supabase Self-Hosted** s'appuie sur plusieurs conteneurs (services) orchestrés via `docker-compose`. Voici les composants vitaux configurés dans l'environnement :
- **PostgreSQL Database** : Le cœur de l'application (base SQL relationnelle) contenant nos données métier, accessible via un conteneur dédié (port 5432).
- **PostgREST** : Service "API auto-générée" permettant de requêter notre base PostgreSQL depuis le frontend React via des appels HTTP RESTful.
- **GoTrue (Auth)** : Le micro-service gérant l'authentification des clients et de l'administration, avec JWT. Indispensable pour la sécurité.
- **Realtime** : Service WebSocket surveillant PostgreSQL pour déclencher en temps réel les futures notifications de réservation.
- **Storage** : Service gérant les gros fichiers, typiquement hébergeant les photos des véhicules, les documents client (permis de conduire) ou les photos de la voiture au check-in/check-out.
- **Supabase Studio** : Interface d'administration visuelle (CRM technique) s'exécutant sur `localhost:54323` (port par défaut), permettant d’inspecter les `tables` SQL sans ligne de commande.

### Prérequis à l'installation 
- Vous devez avoir [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé, allumé et configuré sur votre environnement Windows/WSL2.
- Vous devez installer l'outil `Supabase CLI` en local pour faciliter la vie. Commande recommandée sur Windows : `npm install -g supabase` ou `scoop install supabase`.

### Scripts utilisés
- `supabase init` (Pour déclencher le projet dans le dossier racine de TRM Rent Car).
- `supabase start` (Qui va télécharger les images Docker nécessaires et monter l'environnement local avec le .env autogénéré).
- `supabase db reset` (Qui jouera nos scripts SQL automatiquement).

---

## 2. Le Modèle de données (Schéma SQL)
Les tables ont été pensées pour s'emboîter de manière sécurisée et extensible.
1. **profiles** : Extrait la table `auth.users` cachée de Supabase pour définir des informations business (Nom complet, email, téléphone) et le *Rôle* (L'admin aura `role='admin'` pour accéder au Dashboard).
2. **vehicles** : Contient toutes les propriétés financières (prix caution, prix par jour) et techniques de la flotte TRM.
3. **vehicle_images** : Reliée à `vehicles`, cette table permet d'associer "1 à plusieurs" images par voiture pour le futur carrousel du site.
4. **reservations** : Relie de façon critique le `customer_id` et le `vehicle_id`. Intègre la vérification des dates, de l'état du paiement et les annotations. C'est le socle du futur "Accounting Module".

### Énumérations Customisées
- **user_role** : customer, admin, super_admin.
- **vehicle_status** : available, booked, maintenance, inactive (Essentiel pour exclure l'affichage des voitures en panne sur le frontend public).
- **reservation_status** : pending, confirmed, cancelled, completed, rejected.

---

## 3. Sécurité (RLS - Row Level Security)
Les règles injectées exigent au serveur de données de refuser les connexions et appels malicieux :
- En lecture : Tout visiteur anonyme sur internet (`true`) a l'autorisation de regarder les `vehicles` et `vehicle_images` (Le catalogue).
- En écriture/modification : **Seuls** les profils marqués `admin` (le propriétaire) peuvent supprimer ou ajouter une voiture.
- Réservations : Les clients ne voient et ne créent que les réservations où leur identifiant (UID Supabase) correspond au `customer_id`. Les autres factures leur sont invisibles. L'Admin voit l'ensemble de la table `reservations`.

---

## 4. Données Factices (Seed.sql)
Un second script SQL (`seed.sql`) a été rédigé pour pré-remplir la plateforme avec des véhicules de luxe (Range Rover, Porsche, Mercedes) et des images. Ces données garantiront un visuel spectaculaire lors de la phase de création du catalogue sur le frontend.

---

*Ce document certifie la complétion de l'architecture base de données du projet TRM.*
