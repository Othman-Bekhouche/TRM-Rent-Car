# 🧪 Guide de Tests E2E — TRM Rent Car

Ce projet utilise **Cypress** pour garantir la stabilité et l'intégrité des flux métiers, de la réservation client à la gestion administrative complexe (Comptabilité, Maintenance, Infractions).

## 🚀 Installation & Lancement rapide

### 1. Prérequis
Assurez-vous que le serveur de développement frontend est lancé :
```powershell
cd frontend
npm run dev
```

### 2. Ouvrir l'interface Cypress (Mode Interactif)
Idéal pour le développement et le debug visuel :
```powershell
cd frontend
npx cypress open
```

### 3. Exécuter les tests en ligne de commande (Mode Headless)
Génère un rapport dans le terminal et des screenshots en cas d'erreur :
```powershell
cd frontend
npx cypress run
```

---

## 📂 Organisation des Suites de Tests

Le projet dispose de deux suites majeures situées dans `frontend/cypress/e2e/` :

### 1. `advanced_lifecycle.cy.ts` (43 Scénarios)
C'est le cœur de la validation métier. Elle simule un cycle de vie réel :
- **Sécurité** : Connexion multi-rôles (SuperAdmin, Gestionnaire, Assistant).
- **Flotte** : Création technique, édition média et alertes maintenance.
- **Réservation** : Parcours client de l'accueil au checkout, puis validation admin.
- **Finance** : Enregistrement automatique des transactions, flux de caisse et bilans.
- **Opérations** : Suivi GPS, gestion des infractions (auto-matching) et notifications.

### 2. `smoke_load.cy.ts` (Vérification de Santé)
Vérifie instantanément que toutes les pages du projet (environ 30 routes) chargent sans erreur "Page Blanche".
- Valide le rendu des titres de pages.
- Vérifie la présence des graphiques sur le tableau de bord.

---

## 🛠️ Configuration & Environnement

Les paramètres de test sont définis dans `frontend/cypress.config.js`. 

- **Base URL** : `http://localhost:5173`
- **Timeout par défaut** : 15 000ms (adapté aux appels API Supabase).
- **Screenshots** : Capturés automatiquement dans `frontend/cypress/screenshots/` si un test échoue.

## ⚠️ Notes Importantes
- **Base de Données** : Les tests interagissent avec la base réelle (Supabase). Il est recommandé d'utiliser un environnement de "staging" ou de nettoyer la base après des tests massifs.
- **LocalStorage** : Les tests vident automatiquement le LocalStorage entre chaque bloc `it` pour éviter les fuites de session.

---

*Document généré le 28 Mars 2026 pour le projet TRM Rent Car v2.0.*
