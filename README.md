# Plateforme Immobilière - Microservice Gestion Utilisateurs

## Description
Microservice de gestion des utilisateurs et de reporting pour une plateforme immobilière développé avec Spring Boot et Angular.

## Architecture
- **Backend**: Spring Boot 3.5.5 avec Spring Security, JPA/Hibernate, JWT
- **Frontend**: Angular 16 avec Bootstrap, Chart.js
- **Base de données**: MySQL
- **Authentification**: JWT avec confirmation par email

## Fonctionnalités

### Gestion des comptes
- ✅ CRUD utilisateurs (Utilisateur, Client Abonné, Agence Immobilière, Administrateur)
- ✅ Inscription avec confirmation par email
- ✅ Authentification JWT
- ✅ Contrôle d'accès basé sur les rôles
- ✅ Vérification des agences par les administrateurs

### Statistiques interactives
- ✅ Dashboard avec métriques en temps réel
- ✅ Nombre de visites de la plateforme (quotidien/hebdomadaire)
- ✅ Nombre d'annonces publiées
- ✅ Graphiques interactifs (Chart.js)
- ✅ Répartition des utilisateurs par type

## Prérequis
- Java 17+
- Node.js 16+
- MySQL 8.0+
- Maven 3.6+

## Configuration

### Base de données
Créer une base de données MySQL :
```sql
CREATE DATABASE Userdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Configuration email (application.properties)
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=votre-email@gmail.com
spring.mail.password=votre-mot-de-passe-app
```

### Configuration CORS
Par défaut, les origins autorisées sont :
- `http://localhost:4200` (Angular dev server)
- `http://127.0.0.1:4200`
- `http://localhost:3000`

Pour ajouter d'autres origins, modifiez `application.properties` :
```properties
app.cors.allowed-origins=http://localhost:4200,http://localhost:3000,http://your-domain.com
```

## Installation et Démarrage

### Backend (Spring Boot)
```bash
cd backend/microservice/User

# Windows
mvnw.cmd clean install
mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw clean install
./mvnw spring-boot:run
```

L'API sera disponible sur http://localhost:8080

### Frontend (Angular)
```bash
cd frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start
```

L'application sera disponible sur http://localhost:4200

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/verify?token=xxx` - Vérification email
- `GET /api/auth/profile` - Profil utilisateur
- `PUT /api/auth/profile` - Mise à jour du profil

### Gestion des utilisateurs (Admin uniquement)
- `GET /api/users` - Liste des utilisateurs
- `GET /api/users/paginated` - Utilisateurs avec pagination
- `GET /api/users/{id}` - Détails d'un utilisateur
- `PUT /api/users/{id}` - Modifier un utilisateur
- `DELETE /api/users/{id}` - Supprimer un utilisateur
- `GET /api/users/search?keyword=xxx` - Recherche
- `POST /api/users/verify-agency/{id}` - Vérifier une agence

### Statistiques
- `GET /api/statistics` - Toutes les statistiques
- `GET /api/statistics/dashboard` - Données du dashboard
- `GET /api/statistics/weekly` - Statistiques hebdomadaires
- `GET /api/statistics/annonces` - Statistiques des annonces

## Types d'utilisateurs

### Utilisateur
- Utilisateur standard de la plateforme

### Client Abonné
- Utilisateur avec abonnement
- Limitations sur les recherches selon le type d'abonnement

### Agence Immobilière
- Peut publier des annonces
- Nécessite une vérification par l'administrateur
- Limitations sur le nombre d'annonces

### Administrateur
- Accès complet à la gestion des utilisateurs
- Peut vérifier les agences
- Accès aux statistiques complètes

## Structure du projet

```
projetPI/
├── backend/
│   └── microservice/
│       └── User/
│           ├── src/main/java/esprit/user/
│           │   ├── config/          # Configuration sécurité
│           │   ├── controller/      # Contrôleurs REST
│           │   ├── dto/             # Data Transfer Objects
│           │   ├── entity/          # Entités JPA
│           │   ├── repository/      # Repositories
│           │   └── service/         # Services métier
│           └── src/main/resources/
│               └── application.properties
└── frontend/
    └── src/app/
        ├── components/    # Composants Angular
        ├── services/      # Services Angular
        ├── models/        # Modèles TypeScript
        ├── guards/        # Guards de navigation
        └── interceptors/  # Intercepteurs HTTP
```

## Résolution de problèmes

### Dépendance circulaire
Si vous rencontrez une erreur de dépendance circulaire au démarrage, vérifiez que :
1. `ApplicationConfig` est bien séparée de `SecurityConfig`
2. `UserService` n'implémente pas `UserDetailsService`
3. Les beans sont correctement configurés

### Problèmes de CORS
Vérifiez la configuration CORS dans `SecurityConfig` si les requêtes Angular sont bloquées.

### Problèmes d'email
1. Activez l'authentification à deux facteurs sur Gmail
2. Générez un mot de passe d'application
3. Configurez correctement les propriétés SMTP

## Contributeurs
Développé avec Claude Code pour le projet de plateforme immobilière.