# Short-Link

Une application web moderne pour créer et gérer des liens raccourcis avec authentification et analytics.

## 🚀 Fonctionnalités

- **Création de liens raccourcis** : Transformez vos URLs longues en liens courts et personnalisables
- **Édition de liens** : Modifiez le titre, l'URL originale et l'URL personnalisée de vos liens existants
- **Gestion des liens** : Supprimez et organisez vos liens raccourcis
- **Authentification** : Système de connexion/inscription sécurisé
- **Dashboard** : Interface pour gérer vos liens et voir les statistiques
- **Analytics** : Suivi des clics et des performances de vos liens
- **Interface moderne** : Design responsive avec Tailwind CSS et Radix UI
- **Accessibilité** : Navigation clavier, lecteurs d'écran, WCAG AA

## 📋 Fonctionnalités Détaillées

### 🔗 Gestion des Liens
- **Création** : Transformez n'importe quelle URL en lien court
- **Édition** : Modifiez le titre, l'URL originale et l'URL personnalisée
- **Suppression** : Supprimez vos liens avec confirmation
- **Copie** : Copiez vos liens raccourcis en un clic

### 📊 Analytics
- **Statistiques de clics** : Suivez les performances de vos liens
- **Géolocalisation** : Voir d'où viennent vos clics
- **Appareils** : Statistiques par type d'appareil
- **Historique** : Consultez l'historique complet des clics

### 🔐 Sécurité
- **Authentification** : Connexion/inscription sécurisée
- **RLS** : Chaque utilisateur ne voit que ses propres liens
- **Validation** : Validation stricte des données côté client et serveur
- **Permissions** : Contrôle d'accès granulaire

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
Créez un fichier `.env.local` à la racine du projet avec vos clés Supabase :
```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_KEY=votre_clé_anon_supabase
VITE_PUBLIC_SHORT_DOMAIN=https://votre-domaine.com
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
- `node qa-test-console.js` - Tests QA automatisés en mode console

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
- **RLS (Row Level Security)** : Sécurité au niveau des lignes

### Tables requises :
- `urls` : Stockage des liens raccourcis
- `clicks` : Statistiques de clics
- `profil_pic` : Images de profil (storage)

### RLS Policies requises :
```sql
-- Permissions pour la table urls
CREATE POLICY "Users can view their own links" ON urls FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own links" ON urls FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own links" ON urls FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own links" ON urls FOR DELETE USING (auth.uid() = user_id);
```

## 📝 Licence

Ce projet est sous licence MIT.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.
