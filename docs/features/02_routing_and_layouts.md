# Fonctionnalité : Routeur et Mises en Page (Layouts)

## Objectif
Permettre la navigation fluide au sein de la plateforme (Single Page Application) et distinguer l'espace client public de l'interface d'administration.

## Choix Techniques
- **React Router DOM** : Configuration des routes imbriquées (nested routes) pour réutiliser des mises en page (Layouts) partagées.
- **Lucide React** : Librairie d'icônes SVG intégrée pour rehausser le design du menu d'administration et de la page d'accueil avec des icônes légères.

## État Actuel (Ce qui a été réalisé)
1. **Installation** des paquets (`react-router-dom`, `lucide-react`).
2. **Création des Layouts et Composants :**
   - `PublicLayout.tsx` : Encapsule les pages publiques avec une Navbar (Responsive, transparente et adhésive au top) et un Footer (liens sociaux et légaux).
   - `AdminLayout.tsx` : Encapsule l'espace d'administration de TRM Rent Car, doté d'une Sidebar gauche, d'une Topbar (profil admin) et d'un espace de travail (Dashboard).
3. **Création des Pages Initiales :**
   - `Home.tsx` : Page d'atterrissage élégante, promouvant le service premium (Bouton d'appel à l'action, grille de valeurs/avantages avec effets de survol).
   - `Dashboard.tsx` : Bureau de l'administrateur présentant un aperçu fictif des statistiques financières, des réservations actives et du parc automobile, pour se donner un aperçu du rendu final de l'infrastructure.
4. **Configuration du Routeur (`App.tsx`)** : Point d'entrée de l'application dirigeant `/` vers la Home et `/admin` vers le Dashboard protégé (pour l'instant ouvert à titre de MVP visuel).

## Prochaines Étapes
- Mettre en place la page de catalogue `/vehicles` (pour lister toute la flotte en mode public).
- Affiner et ajouter la page de détail d'un véhicule, le calendrier de disponibilité, et la configuration Supabase (Auth, Routing protégé).
