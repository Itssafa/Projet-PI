# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a real estate platform microservice project with user management and reporting features. It consists of:

- **Backend**: Spring Boot 3.5.5 microservice with JWT authentication, Spring Security, and MySQL
- **Frontend**: Angular 16 application with responsive UI and Chart.js visualizations
- **Architecture**: Microservice architecture with role-based access control

## Development Commands


### Backend (Spring Boot)
```bash
# Start backend server (uses Maven wrapper)
start-backend.bat

# Manual startup
cd backend\microservice\User
mvnw.cmd clean compile
mvnw.cmd spring-boot:run

# Run tests
mvnw.cmd test

# Build for production
mvnw.cmd clean package
```

### Frontend (Angular)
```bash
# Start frontend server
start-frontend.bat
#I personally, usually run the frontend using ```ng serve``` 

# Manual startup
cd frontend
npm install --legacy-peer-deps 
npm start

# Build for production
ng build

# Run tests
ng test
```

### Utility Scripts
- `diagnose.bat` - Diagnose system configuration
- `verify-all.bat` - Verify complete system setup
- `test-api.bat` - Test API endpoints
- `generate-components.bat` - Generate missing Angular components
- Various CORS testing scripts

## Architecture & Structure

### Backend Structure (Spring Boot)
```
backend/microservice/User/src/main/java/esprit/user/
├── config/          # Security, CORS, JWT configuration
├── controller/      # REST API endpoints
├── dto/            # Data Transfer Objects
├── entity/         # JPA entities (User types, subscriptions)
├── repository/     # Data access layer
├── service/        # Business logic
└── exception/      # Global exception handling
```

### Frontend Structure (Angular)
```
frontend/src/app/
├── components/
│   ├── auth/           # Login, register, email verification
│   ├── dashboards/     # Role-specific dashboards
│   ├── admin/          # Admin management components
│   └── shared/         # Reusable components
├── services/           # HTTP services, auth service
├── guards/            # Route protection
├── interceptors/      # HTTP interceptors
└── models/           # TypeScript interfaces
```

### User Types & Roles
- **UTILISATEUR**: Basic user with limited access
- **CLIENT_ABONNE**: Subscribed client with premium features
- **AGENCE_IMMOBILIERE**: Real estate agency (requires admin verification)
- **ADMINISTRATEUR**: Full system access and user management

### Key Components
- **Authentication**: JWT-based with email verification
- **Authorization**: Role-based route guards and API access
- **Statistics**: Real-time dashboard with Chart.js integration
- **CORS Configuration**: Pre-configured for localhost development

## Configuration

### Database Setup
```sql
CREATE DATABASE Userdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Key Configuration Files
- `backend/microservice/User/src/main/resources/application.properties` - Backend configuration
- `frontend/src/environments/environment.ts` - Frontend environment settings
- `frontend/package.json` - Angular dependencies and scripts

### Default Ports
- Backend API: http://localhost:8080
- Frontend: http://localhost:4200
- Database: MySQL on port 3306

### Email Configuration Required
Update `application.properties` with valid SMTP settings:
```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

## API Structure

### Main Endpoints
- `/api/auth/*` - Authentication (login, register, verify)
- `/api/users/*` - User management (admin only)
- `/api/statistics/*` - Platform statistics and analytics

### Security
- JWT tokens stored in localStorage
- Role-based API access control
- CORS configured for development origins
- Password validation and email verification required

## Common Development Patterns

### Adding New Features
1. Create entity in `backend/microservice/User/src/main/java/esprit/user/entity/`
2. Add repository extending JpaRepository
3. Implement service layer with business logic
4. Create REST controller with appropriate security annotations
5. Add corresponding Angular service and components

### Role-Based Access
- Backend: Use `@PreAuthorize("hasRole('ADMIN')")` annotations
- Frontend: Implement route guards in `guards/` directory
- Use `RoleGuard` with `expectedRoles` data in routing module

### Error Handling
- Backend: Global exception handler in `exception/GlobalExceptionHandler`
- Frontend: HTTP interceptor handles authentication errors automatically

## Testing

### Backend Tests
```bash
cd backend\microservice\User
mvnw.cmd test
```

### Frontend Tests
```bash
cd frontend
ng test
```

## Troubleshooting

### Common Issues
- **CORS errors**: Check `app.cors.allowed-origins` in application.properties
- **MySQL connection**: Ensure database exists and credentials are correct
- **Angular compilation**: Use `--legacy-peer-deps` flag for npm install
- **Missing components**: Run `generate-components.bat` to create Angular components

### Dependency Issues
- Backend uses Maven wrapper (`mvnw.cmd`)
- Frontend requires Node.js 16+ and Angular CLI
- Charts depend on Chart.js and ng2-charts libraries


What i want you to do, is this : 
- Read the full backend, i want you to navigate to C:\Users\user\OneDrive\Bureau\projetPI\backend\microservice\User\src\main, in which you find 2 folders, you read all the content of java, and ressources. You analyse well and understand the purpose of the project.
- Based on the backend, you will create a **FULL** frontend from beginning to end. C:\Users\user\OneDrive\Bureau\projetPI\frontend
- I want you then, to give me a deep todo list in todo.md file, so that i can understand what you will do.
- I read the md file, and i confirm and then you start working the whole frontend project.
Before doing so, tell me what assistants you need as agents.