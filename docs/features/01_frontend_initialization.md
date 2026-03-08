# Fonctionnalité : Initialisation du Frontend (React + Vite + Tailwind CSS v4)

## Objectif
Mettre en place la base du projet frontend pour la plateforme **TRM Rent Car**, avec une architecture moderne, rapide et adoptant le thème sombre premium défini dans le projet.

## Choix Techniques
- **Framework Outil** : [Vite](https://vitejs.dev/) avec le template React/TypeScript.
- **Style CSS** : [Tailwind CSS v4](https://tailwindcss.com/) pour une gestion utilitaire des styles avec un plugin Vite dédié `@tailwindcss/vite`.
- **Thème Premium Dark Mode** :
  - Palette sombre élégante (Slate 900, Slate 800)
  - Couleur d'accentuation dynamique (Amber 500)
  - Typographie nette (Inter)

## État Actuel (Ce qui a été réalisé)
1. **Création du dossier `frontend`** via `create-vite`.
2. **Installation des dépendances** (`@tailwindcss/vite` pour la v4).
3. **Configuration Vite** : Intégration du plugin Tailwind (`vite.config.ts`).
4. **Configuration CSS** : Insertion des variables et règles de base dans `src/index.css`.
5. **Composant Initial** : Réécriture de `App.tsx` pour afficher un layout minimaliste, esthétique avec de subtiles animations (effet ombre et élévation au survol), fidèle aux "Design Aesthetics" demandées.
6. **Nettoyage** : Suppression des styles Vite par défaut via remplacement de `App.css`.

## Prochaines Étapes
- Intégration de React Router DOM pour la navigation.
- Création des composants réutilisables UI (boutons, inputs, cartes de véhicules).
- Mise en place du layout global (Navbar + Footer public, Sidebar + Topbar pour l'interface Admin).
