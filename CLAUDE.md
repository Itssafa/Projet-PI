# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a real estate platform microservice project with user management and reporting features. It consists of:

- **Backend**: Spring Boot 3.5.5 microservice with JWT authentication, Spring Security, and MySQL
- **Frontend**: Angular 16 application with responsive UI and Chart.js visualizations
- **Architecture**: Microservice architecture with role-based access control

## AI Collaboration Workflow

### Frontend-Backend Connection Strategy

**Claude's Strengths**: Backend development, Frontend development (components, services, UI)
**Claude's Weakness**: API consumption and frontend-backend integration

**Workflow for API Integration**:

1. **When Claude encounters frontend-backend connection tasks** (API calls, HTTP services, data fetching):
   - Claude should create a `api-prompt.md` file
   - This file contains detailed context and requirements for the integration task
   - User takes this prompt to ChatGPT for specific implementation details

2. **Prompt File Structure** (`api-prompt.md`):
   ```markdown
   ## API Integration Task
   
   ### Backend Context
   - Controller endpoints: [list relevant endpoints]
   - DTOs involved: [specify DTOs and their structure]
   - Authentication requirements: [JWT, roles, etc.]
   
   ### Frontend Context
   - Component needing data: [component name and purpose]
   - Service layer: [existing services to modify/create]
   - Data flow: [describe expected data flow]
   
   ### Integration Requirements
   - [Specific requirements for the integration]
   
   ### Expected Output
   - [What specific code/implementation is needed]
   ```

3. **Implementation Process**:
   - User provides ChatGPT's response in `instructions.md`
   - Claude implements the solution based on the provided instructions
   - Claude focuses on integrating the solution seamlessly with existing code architecture

### When to Use This Workflow
- HTTP service method implementations
- API endpoint consumption
- Data fetching and error handling
- Authentication header management
- Request/response mapping
- Async operations and observables

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
5. **For API consumption**: Use the AI collaboration workflow described above
6. Add corresponding Angular service and components

### Role-Based Access
- Backend: Use `@PreAuthorize("hasRole('ADMIN')")` annotations
- Frontend: Implement route guards in `guards/` directory
- Use `RoleGuard` with `expectedRoles` data in routing module

### Error Handling
- Backend: Global exception handler in `exception/GlobalExceptionHandler`
- Frontend: HTTP interceptor handles authentication errors automatically

### API Integration Workflow
1. **Identify Integration Need**: When a component needs backend data
2. **Create API Prompt**: Generate `api-prompt.md` with full context
3. **Get Expert Input**: User consults ChatGPT with the prompt
4. **Implement Solution**: Follow instructions from `instructions.md`
5. **Integrate & Test**: Ensure seamless integration with existing architecture

## File Management for AI Collaboration

### Key Files for Integration
- `api-prompt.md` - Generated by Claude for integration tasks
- `instructions.md` - Contains ChatGPT's implementation guidance
- `todo.md` - Development roadmap and task list

### Workflow Files Update Process
1. Claude updates `api-prompt.md` when encountering API tasks
2. User gets instructions from ChatGPT
3. User updates `instructions.md` with the guidance
4. Claude implements based on `instructions.md`
5. Process repeats for each integration task

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

### API Integration Testing
- Use Postman or similar tools to test endpoints
- Verify JWT authentication flows
- Test CORS configuration
- Validate request/response mapping

## Troubleshooting

### Common Issues
- **CORS errors**: Check `app.cors.allowed-origins` in application.properties
- **MySQL connection**: Ensure database exists and credentials are correct
- **Angular compilation**: Use `--legacy-peer-deps` flag for npm install
- **Missing components**: Run `generate-components.bat` to create Angular components
- **API integration issues**: Use the AI collaboration workflow for complex integrations

### Dependency Issues
- Backend uses Maven wrapper (`mvnw.cmd`)
- Frontend requires Node.js 16+ and Angular CLI
- Charts depend on Chart.js and ng2-charts libraries

### AI Collaboration Troubleshooting
- Ensure `api-prompt.md` contains complete context
- Verify `instructions.md` has clear implementation steps
- Test integrations incrementally
- Use browser dev tools to debug API calls