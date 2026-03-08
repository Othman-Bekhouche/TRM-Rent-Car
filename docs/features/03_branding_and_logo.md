# Fonctionnalité : Intégration de l'Identité Visuelle (Logos)

## Objectif
Intégrer les éléments d'identité de marque ("TRM CARTE recto.jpg.jpeg") de l'entreprise directement dans l'interface de la plateforme (Navbar et Footer) pour respecter le style "Dark Premium".

## Choix Techniques
- **Sources d'images** : Copie des fichiers médias originaux (carte de visite recto et verso ainsi que les PDFs) vers le dossier structuré `/frontend/public/` pour les rendre virtuellement accessibles sans traitement asynchrone complexe.
- **Remplacement des icônes génériques** : Remplacement du logo "voiture" générique de Lucide React par la variable `carte-recto.jpg` dans `<Navbar>` et `<Footer>`.
- **Adaptation CSS** : Utilisation des classes utilitaires Tailwind `object-contain`, `rounded`, et `shadow-sm` pour lisser les bordures et préserver la qualité de l'image (Business Card Recto) sur le fond sombre de la navigation.

## État Actuel (Ce qui a été réalisé)
1. Transfert des fichiers locaux vers `frontend/public/`.
2. Édition de `Navbar.tsx` : Affichage du logo en entête avec gestion de la responsivité.
3. Édition de `Footer.tsx` : Affichage du logo dans la section "À Propos".
4. Nettoyage des imports `Car` inutilisés (Fixation de Lints TypeScript).

## Prochaines Étapes
- Paramétrage de Supabase Local (Autentification/Database) et création des entités `Vehicles` pour peupler le catalogue public.
