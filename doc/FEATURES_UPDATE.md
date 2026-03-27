# Documentation des Fonctionnalités - TRM Rent Car

## 1. Galerie Dynamique des Véhicules

### Description
La page de détail d'un véhicule (`VehicleDetail.tsx`) a été mise à jour pour inclure une galerie d'images dynamique permettant aux utilisateurs de voir le véhicule sous plusieurs angles (avant, arrière, intérieur).

### Modifications Techniques
- **Bdd (Supabase)** : Ajout de nouvelles images dans la table `vehicle_images` associées à l'ID de chaque véhicule via un script d'insertion SQL.
- **Frontend** : 
  - Remplacement des données mockées statiques par un appel API à l'aide de Supabase : `.from('vehicles').select('*, vehicle_images(*)')`.
  - Ajout d'un état React `selectedImage` pour gérer l'image actuellement affichée en grand format.
  - Création d'une grille de miniatures cliquables sous l'image principale pour basculer facilement entre les vues (Front, Rear, Interior).

---

## 2. Intégration Dynamique du Processus de Réservation

### Description
La page de réservation / checkout (`BookingCheckout.tsx`) a été liée de manière dynamique au véhicule sélectionné, supprimant le problème où toutes les réservations pointaient vers la "Peugeot 208 Noir".

### Modifications Techniques
- **Utilisation des paramètres d'URL (Router)** : Récupération du `vehicleId` depuis l'URL et utilisation d'un `useEffect` pour charger la voiture spécifique depuis la base de données.
- **Amélioration de l'UI** : Ajout d'un indicateur de chargement (`Loader2`) pendant la requête vers la BDD pour une meilleure expérience utilisateur.
- **Réduction des erreurs TypeScript** : Correction des types et réintégration des variables d'état (ex: informations client).

---

## 3. Ajout d'Images Premium Adaptatives (SaaS / Dark Mode)

### Description
Remplacement complet des images génériques et disparates par un ensemble cohérent et professionnel d'images générées spécifiquement pour la plateforme.

### Modifications Techniques
- **Villes/Régions** : Création et implémentation de photos haute résolution et localisées pour les différentes zones de l'Oriental (Berkane, Fès, Nador, Oujda, Taourirt).
- **Véhicules** : Remplacement des images de voitures classiques par des modélisations "Studio" sur fond foncé (dark background) pour s'intégrer nativement avec le thème Premium Dark du site, sans "box" blanche autour.
- **Nouveau Véhicule** : Intégration d'un luxueux Range Rover Evoque au sommet du catalogue.

---

## 4. Correction des Rôles Administratifs

### Description
Correction d'un blocage lors du réamorçage de la base de données (Seed) lié à l'absence du rôle "assistant" dans le type de données de PostgreSQL.

### Modifications Techniques
- Exécution d'une migration pour mettre à jour l'enum PostgreSQL `user_role` afin d'inclure les rôles `'assistant'` et `'gestionnaire'`.
- Autorisations complètes restaurées pour le personnel sur les modules adéquats.

---
*Date de dernière mise à jour : 09/03/2026*
## [2026-03-27] - Accounting Module v2 (Categorization & Automation)

### Fixed & Improved
- **Transaction Categorization**: Added a `category` field to the `transactions` table to move beyond simple entrance/expense tracking.
- **Automated Sync**: Updated database triggers to automatically categorize transactions:
  - `Location`: From reservation payments.
  - `Maintenance`: From vehicle maintenance records.
  - `Caution`: From handover deposits.
- **Financial Analytics**:
  - Added **Growth Analysis** (Comparison with previous periods).
  - Added **Category Breakdown** (Pie chart analysis).
  - Improved **Filtering** by Type, Category, and Payment Method.
- **Reporting**:
  - Added **Print / Statement** functionality.
  - Improved **CSV Export** with more metadata.
- **User Interface**: 
  - New "Opération de Caisse" modal with category selection.
  - Premium aesthetics with glassmorphism and sub-kpis (Basket size, Pending revenue).

### New Files
- `supabase/migrations/09_accounting_v2.sql`: Database schema updates and triggers.
