# Frontend Angular - Plateforme Immobilière

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (version 16+)
- Angular CLI (`npm install -g @angular/cli`)

### Installation Automatique
```bash
# Exécuter le script de configuration
setup-frontend.bat
```

### Installation Manuelle
```bash
cd frontend
npm install
ng serve
```

L'application sera disponible sur **http://localhost:4200**

## 🏗️ Architecture du Frontend

### 📁 Structure des Composants

```
src/app/
├── components/
│   ├── auth/                    # Authentification
│   │   ├── login/              # Connexion
│   │   ├── register/           # Inscription
│   │   └── email-verification/ # Vérification email
│   │
│   ├── dashboards/             # Tableaux de bord
│   │   ├── admin-dashboard/    # Dashboard administrateur
│   │   ├── agency-dashboard/   # Dashboard agence
│   │   ├── client-dashboard/   # Dashboard client
│   │   └── user-dashboard/     # Dashboard utilisateur
│   │
│   ├── admin/                  # Administration
│   │   ├── user-list/         # Liste des utilisateurs
│   │   └── statistics/        # Statistiques détaillées
│   │
│   ├── shared/                # Composants partagés
│   │   ├── navbar/           # Barre de navigation
│   │   ├── profile/          # Profil utilisateur
│   │   └── unauthorized/     # Page non autorisée
│   │
│   └── home/                 # Page d'accueil
│
├── services/                 # Services Angular
│   ├── auth.service.ts      # Service d'authentification
│   ├── user.service.ts      # Service utilisateur
│   └── statistics.service.ts # Service statistiques
│
├── guards/                  # Guards de sécurité
│   ├── auth.guard.ts       # Guard d'authentification
│   └── role.guard.ts       # Guard de rôles
│
├── models/                 # Modèles TypeScript
│   └── user.model.ts       # Modèles utilisateur
│
└── interceptors/           # Intercepteurs HTTP
    └── auth.interceptor.ts # Intercepteur JWT
```

## 🔐 Authentification

### Types d'Utilisateurs
- **Utilisateur Simple** : Accès de base
- **Client Abonné** : Fonctionnalités premium
- **Agence Immobilière** : Gestion d'annonces
- **Administrateur** : Gestion complète

### Flux d'Authentification
1. **Inscription** → Vérification email → **Activation**
2. **Connexion** → JWT Token → **Redirection** vers dashboard approprié
3. **Auto-déconnexion** en cas d'expiration du token

## 🎯 Fonctionnalités par Rôle

### 👤 Utilisateur Simple
- Recherche de propriétés
- Favoris (limités)
- Profil personnel
- Upgrade vers Premium

### 💎 Client Abonné
- Recherches illimitées (selon abonnement)
- Historique complet
- Alertes personnalisées
- Support prioritaire

### 🏢 Agence Immobilière
- Gestion d'annonces (max 100)
- Statistiques de performance
- Tableau de bord business
- Gestion du profil agence

### ⚙️ Administrateur
- Gestion des utilisateurs
- Vérification des agences
- Analytics complètes
- Statistiques de la plateforme

## 📊 Dashboard Administrateur

### Métriques Disponibles
- **Utilisateurs** : Total, Actifs, En attente
- **Agences** : Total, Vérifiées, Non vérifiées
- **Visites** : Aujourd'hui, Cette semaine, Ce mois
- **Répartition** : Par type d'utilisateur
- **Analytics** : Pages les plus visitées

### Graphiques et Visualisations
- Graphiques en barres pour les visites
- Répartition circulaire des types d'utilisateurs
- Évolution temporelle des inscriptions

## 🎨 Design et UI/UX

### Palette de Couleurs
- **Primaire** : Gradient bleu-violet (#667eea → #764ba2)
- **Succès** : Vert (#16a085)
- **Attention** : Orange (#f39c12)
- **Erreur** : Rouge (#e74c3c)

### Composants Stylisés
- Cards avec ombres et hover effects
- Formulaires avec validation temps réel
- Boutons avec animations
- Responsive design (mobile-first)

### États d'Interface
- **Loading** : Spinners et skeletons
- **Error** : Messages d'erreur contextuels
- **Success** : Notifications de succès
- **Empty** : États vides avec appels à l'action

## 🔧 Configuration API

### Endpoints Backend
```typescript
// Base URL
const API_BASE = 'http://localhost:8080/api';

// Endpoints principaux
/auth/register    # Inscription
/auth/login       # Connexion
/auth/verify      # Vérification email
/auth/profile     # Profil utilisateur

/users           # CRUD utilisateurs
/users/search    # Recherche utilisateurs
/users/verify-agency # Vérifier agence

/statistics      # Statistiques générales
/statistics/dashboard # Dashboard data
```

### Gestion des Erreurs
- Intercepteur HTTP automatique
- Redirection sur 401 (non autorisé)
- Messages d'erreur localisés
- Retry automatique configurable

## 🛡️ Sécurité

### Guards de Sécurité
- **AuthGuard** : Vérification de l'authentification
- **RoleGuard** : Vérification des rôles/permissions

### JWT Token
- Stockage sécurisé (localStorage)
- Auto-refresh des tokens
- Déconnexion automatique à l'expiration

### Validation Côté Client
- Validation reactive forms
- Sanitization des inputs
- Protection XSS

## 📱 Responsive Design

### Breakpoints
- **Mobile** : < 768px
- **Tablet** : 768px - 1024px
- **Desktop** : > 1024px

### Adaptations
- Navigation mobile avec menu hamburger
- Grilles adaptatives (CSS Grid/Flexbox)
- Typographie responsive
- Images optimisées

## 🚀 Performance

### Optimisations
- Lazy loading des modules
- OnPush change detection
- Images optimisées et lazy loading
- Bundle splitting

### SEO et Accessibilité
- Meta tags dynamiques
- Attributs ARIA
- Navigation au clavier
- Contraste couleurs respecté

## 🔄 Tests et Déploiement

### Commands Utiles
```bash
# Développement
ng serve                # Serveur de dev
ng build               # Build production
ng test                # Tests unitaires
ng lint                # Linting

# Déploiement
ng build --prod        # Build optimisé
```

### Variables d'Environnement
```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

## 🎯 Prochaines Étapes

### Fonctionnalités à Ajouter
- [ ] Chat en temps réel
- [ ] Notifications push
- [ ] Géolocalisation
- [ ] Paiements en ligne
- [ ] Upload d'images
- [ ] Système de reviews

### Améliorations Techniques
- [ ] Tests end-to-end (Cypress)
- [ ] State management (NgRx)
- [ ] PWA (Service Workers)
- [ ] Internationalisation (i18n)

---

## 🆘 Dépannage

### Problèmes Courants

**Erreur CORS**
```bash
# Ajouter dans le backend application.properties :
app.cors.allowed-origins=http://localhost:4200
```

**Modules manquants**
```bash
npm install
# ou
npm ci
```

**Port déjà utilisé**
```bash
ng serve --port 4201
```

---

**🎉 Le frontend Angular est maintenant entièrement intégré avec votre backend Spring Boot !**