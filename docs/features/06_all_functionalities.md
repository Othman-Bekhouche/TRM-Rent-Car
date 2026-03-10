# Documentation des Fonctionnalités — TRM Rent Car

Ce document récapitule l'ensemble des fonctionnalités implémentées dans l'application TRM Rent Car pour la gestion d'agence de location de voitures.

## 1. Gestion des Réservations (Module Central)
- **Cycle de Vie Complet** : 
    - `En attente` : Nouvelle demande.
    - `Confirmé` : Réservation validée par l'admin.
    - `Loué` : Véhicule remis au client (Handover).
    - `Retourné` : Véhicule récupéré, calcul des frais supplémentaires.
    - `Terminé` : Dossier archivé après clôture.
    - `Annulé` : Demande rejetée ou annulée.
- **Dossier de Réservation** : Consultation détaillée incluant infos client, véhicule, dates, et statut financier.
- **Handover (Remise)** : Formulaire de sortie avec kilométrage, niveau de carburant, caution et photos (état du véhicule).
- **Check-in (Retour)** : Formulaire de retour avec calcul automatique des jours supplémentaires et frais de dépassement.

## 2. Gestion de la Flotte (Véhicules)
- **Inventaire** : Liste complète avec filtres (disponibilité, marque).
- **Fiches Techniques** : Détails (immatriculation, motorisation, boîte, kilométrage).
- **Statuts Dynamiques** : Mise à jour automatique (Disponible, Loué, En Maintenance, Réservé).

## 3. CRM & Gestion Clients
- **Base Clientèle** : Centralisation des infos (Nom, CIN, Passeport, Téléphone, Email).
- **Historique** : Vue sur toutes les locations passées par client.
- **Statuts Clients** : Actif, VIP, Inactif.

## 4. Devis & Propositions (Nouveau)
- **Génération de Devis** : Création de propositions commerciales rapides.
- **Conversion** : Possibilité de transformer un devis accepté en réservation officielle.
- **Téléchargement/Impression** : Bouton dédié pour générer le document PDF.

## 5. Gestion Documentaire & Impression
- **Contrats de Location** : Génération automatique du contrat prêt à imprimer. Séparation des actions "Imprimer" et "Télécharger PDF".
- **Facturation** : Création de factures détaillées avec statut de paiement (Payée, En attente). Boutons distincts pour impression directe et archivage PDF.
- **Aperçu Avant Impression** : Pages optimisées pour le format A4 avec barre d'action dédiée contenant les options séparées.
- **Actions Rapides** : Accès direct aux documents depuis les listes globales (Facturation, Contrats) et le dossier de réservation.

## 6. Tableau de Bord (Dashboard) "Premium Style"
- **Statuts KPI** : Revenus totaux, réservations actives, taux d'occupation de la flotte.
- **Graphique Moderne** : Visualisation du Chiffre d'Affaires sur les 3 derniers mois avec projection.
- **Accès Rapide** : Liste des dernières réservations et état actuel de la flotte.

## 7. Infrastructure & Sécurité
- **Supabase Backend** : Base de données PostgreSQL en temps réel.
- **Row Level Security (RLS)** : Protection des données par rôles (Admin, Gestionnaire, Assistant).
- **Migrations SQL** : Versioning de la structure de la base de données.

---
*Dernière mise à jour : 10 Mars 2026*
