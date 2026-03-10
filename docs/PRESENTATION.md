# Présentation MVP : TRM Rent Car 🚘

Bienvenue dans le manuel visuel de votre nouvelle plateforme de gestion locative de véhicules, **TRM Rent Car**. Ce document répertorie de façon lisible les écrans et modules fonctionnels interconnectés au backend Supabase.

> 📝 **Note pour l'ajout des captures :** Prenez les captures d'écran respectives pour chaque fonctionnalité, nommez-les correctement selon ce document et placez-les dans un sous-dossier `assets/screenshots/`.

---

## 1. Tableau de Bord (Dashboard)
Le centre névralgique de votre agence mis à jour en temps réel.
- **Fonctionnalités clés :**
  - Chiffres clés (Revenus, Réservations, Occupation de la Flotte, Nouveaux Clients)
  - Filtre dynamique par période (Jour, Semaine, Mois, etc.)
  - Suivi de disponibilité de la flotte (Véhicules libres vs Loués).
  - Statistiques en direct et suivi de chiffre d'affaires synchronisé avec la facturation.
- **Capture d'écran requise :** `assets/screenshots/01-dashboard.png`
  ![Dashboard Placeholder](./assets/screenshots/01-dashboard.png)

---

## 2. Gestion de la Flotte & Véhicules
Surveillance complète et détails de chaque voiture de votre parc de véhicules.
- **Fonctionnalités clés :**
  - Ajout d'options complètes : kilométrage, niveau de carburant, année, boîte à vitesses, etc.
  - Aperçu détaillé des statuts réels liés aux réservations.
- **Capture d'écran requise :** `assets/screenshots/02-vehicles.png`
  ![Flotte Placeholder](./assets/screenshots/02-vehicles.png)

---

## 3. Gestion des Réservations
Le calendrier et la facturation centralisés pour suivre chaque déplacement.
- **Fonctionnalités clés :**
  - Sélection précise du locataire et du véhicule disponible.
  - Calcul et devis automatiques en fonction de la durée (Jour/Heure).
  - Gestion des états : *En attente*, *Confirmée*, *En cours de location*, *Terminée*, *Annulée*.
  - Enregistrement des Handover (État de départ et de retour avec notes des dégâts et carburant).
- **Capture d'écran requise :** `assets/screenshots/03-reservations.png`
  ![Réservations Placeholder](./assets/screenshots/03-reservations.png)

---

## 4. CRM & Clients
Une carte d'identité pour chaque locataire.
- **Fonctionnalités clés :**
  - Liste chronologique des clients (Nom, Téléphone, CIN).
  - Profil spécifique et informations de contact partagées avec le module facturation.
- **Capture d'écran requise :** `assets/screenshots/04-clients.png`
  ![Clients Placeholder](./assets/screenshots/04-clients.png)

---

## 5. Infractions & Amendes (Intelligence)
Le module phare automatisant l'imputation des amendes radars.
- **Fonctionnalités clés :**
  - Sélection d'un véhicule, et saisie de la date et de l'heure précise de l'infraction.
  - **Auto-Matching** : Algorithme capable de dire, *"À 12h32 sur la Logan Dacia, le véhicule était entre les mains de Sarah Benani"*.
  - Statuts d'alerte (Non-identifié, Multimatch, Résolu).
- **Capture d'écran requise :** `assets/screenshots/05-infractions.png`
  ![Infractions Placeholder](./assets/screenshots/05-infractions.png)

---

## 6. Historique de Maintenance (Entretiens)
Prévoir, reporter et enregistrer le suivi complet des réparations mécaniques.
- **Fonctionnalités clés :**
  - Suivi des vidanges, changements de pneus, pannes.
  - Dates de passage, coût exact et détails mécaniques.
- **Capture d'écran requise :** `assets/screenshots/06-maintenance.png`
  ![Maintenance Placeholder](./assets/screenshots/06-maintenance.png)

---

## 7. Comptabilité
Le journal central des entrées et sorties pour piloter sa marge de bénéfices.
- **Fonctionnalités clés :**
  - Graphiques des marges nettes vs C.A.
  - Suivi des transactions réelles enregistrées (Paiement locatif, Retour de caution) et transactions de charges d'entreprise (Salaires, Pièces de rechange).
- **Capture d'écran requise :** `assets/screenshots/07-accounting.png`
  ![Comptabilité Placeholder](./assets/screenshots/07-accounting.png)

---

### Prochaines Étapes
La Phase 1 (MVP avec back-office fonctionnel et base de données connectée en direct) est désormais aboutie ! Tout a été synchronisé afin d'obtenir un ERP complet de gestion locative, sans données fantômes sur le Dashboard.
