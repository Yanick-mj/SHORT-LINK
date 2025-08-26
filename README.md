# Short-Link

Une application web moderne pour créer et gérer des liens raccourcis avec authentification et analytics.

## 🚀 Fonctionnalités

- **Création de liens raccourcis** : Transformez vos URLs longues en liens courts et personnalisables
- **Authentification** : Système de connexion/inscription sécurisé
- **Dashboard** : Interface pour gérer vos liens et voir les statistiques
- **Analytics** : Suivi des clics et des performances de vos liens
- **QR Codes** : Génération automatique de codes QR pour vos liens
- **Interface moderne** : Design responsive avec Tailwind CSS et Radix UI

## 🛠️ Technologies utilisées

- **Frontend** : React 19, Vite
- **Styling** : Tailwind CSS 4, Radix UI
- **Backend** : Supabase (Base de données, Authentification, API)
- **Routing** : React Router DOM
- **Validation** : Yup
- **Icons** : Lucide React

## 📦 Installation

1. Clonez le repository :
```bash
git clone <votre-repo-url>
cd short-link
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez les variables d'environnement :
Créez un fichier `.env` à la racine du projet avec vos clés Supabase :
```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

4. Lancez le serveur de développement :
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 🏗️ Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Construit l'application pour la production
- `npm run preview` - Prévisualise la build de production
- `npm run lint` - Lance ESLint pour vérifier le code

## 📁 Structure du projet

```
src/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants UI de base
│   └── ...             # Composants spécifiques
├── pages/              # Pages de l'application
├── db/                 # Configuration et API Supabase
├── hooks/              # Hooks React personnalisés
├── lib/                # Utilitaires et helpers
└── layout/             # Layouts de l'application
```

## 🔧 Configuration Supabase

Ce projet utilise Supabase pour :
- **Authentification** : Gestion des utilisateurs
- **Base de données** : Stockage des liens et statistiques
- **API** : Endpoints pour la gestion des données

Assurez-vous de configurer correctement votre projet Supabase avec les tables nécessaires.

## 📝 Licence

Ce projet est sous licence MIT.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.
