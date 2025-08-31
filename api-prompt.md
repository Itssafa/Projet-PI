# API Integration Task

## Backend Context

### Controller Endpoints
**AuthController.java** (`/api/auth/*`):
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication 
- `GET /api/auth/verify?token=` - Email verification
- `GET /api/auth/profile` - Get current user profile (authenticated)
- `PUT /api/auth/profile` - Update user profile (authenticated)

### DTOs Involved

**UserRegistrationDto.java** (lines 14-42):
```java
public class UserRegistrationDto {
    @NotBlank(message = "Le nom est obligatoire")
    private String nom;
    
    @NotBlank(message = "Le prénom est obligatoire") 
    private String prenom;
    
    @Email(message = "Format d'email invalide")
    @NotBlank(message = "L'email est obligatoire")
    private String email;
    
    @NotBlank(message = "Le mot de passe est obligatoire")
    private String motDePasse;
    
    @Pattern(regexp = "^[0-9]{8}$", message = "Le numéro de téléphone doit contenir 8 chiffres")
    private String telephone;
    
    @NotBlank(message = "L'adresse est obligatoire")
    private String adresse;
    
    private UserType userType;
    
    // For real estate agencies only:
    private String nomAgence;
    private String numeroLicence;
    private String siteWeb;
    private Integer nombreEmployes;
    private String zonesCouverture;
}
```

**UserLoginDto.java** (lines 12-20):
```java
public class UserLoginDto {
    @Email(message = "Format d'email invalide")
    @NotBlank(message = "L'email est obligatoire")
    private String email;
    
    @NotBlank(message = "Le mot de passe est obligatoire")
    private String motDePasse;
}
```

**UserType enum** (lines 3-8):
```java
public enum UserType {
    UTILISATEUR,        // Basic user
    CLIENT_ABONNE,      // Subscribed client
    AGENCE_IMMOBILIERE, // Real estate agency
    ADMINISTRATEUR      // Administrator
}
```

### Authentication Requirements
- JWT tokens stored in localStorage
- Bearer token in Authorization header: `Authorization: Bearer <token>`
- Login response includes JWT token and user profile
- Registration requires email verification before login
- Role-based access control based on UserType

## Frontend Context

### Components Needing Data
- **Login Component**: Authenticate users and store JWT
- **Register Component**: Create new user accounts with role selection
- **Dashboard Component**: Display role-specific interface after login
- **Profile Component**: Show/edit current user profile
- **Guard Services**: Protect routes based on authentication and roles

### Service Layer to Create
- **AuthService**: Handle login, register, token management
- **HttpInterceptor**: Automatically add JWT to requests
- **UserService**: Profile management and user operations

### Data Flow Expected
1. User registers → Backend validates → Email verification required
2. User logs in → Backend returns JWT + profile → Store token → Redirect to dashboard
3. Protected routes check JWT validity
4. API calls include JWT in headers automatically

## Integration Requirements

### Specific Requirements
1. **HTTP Service Methods**: Implement login(), register(), logout(), getProfile(), updateProfile()
2. **Token Management**: Store/retrieve JWT from localStorage, check expiration
3. **Error Handling**: Display proper error messages from backend validation
4. **Form Validation**: Client-side validation matching backend DTOs
5. **Role-Based Navigation**: Redirect users to appropriate dashboards based on UserType
6. **Automatic Token Inclusion**: HTTP interceptor for adding JWT to requests
7. **Authentication State**: Observable/BehaviorSubject for login status
8. **Route Guards**: Protect routes requiring authentication or specific roles

### Expected Output
1. **AuthService implementation** with all HTTP methods for authentication
2. **JWT HTTP Interceptor** for automatic token inclusion
3. **Login/Register component** implementations with proper form validation
4. **Authentication state management** using observables
5. **Route guard implementations** for protected routes

### Technical Details
- Backend URL: `http://localhost:8080`
- JWT stored in: `localStorage.getItem('token')`
- Headers format: `{ 'Authorization': 'Bearer ' + token }`
- Error responses format: `{ error: string, timestamp: datetime }`
- Success login format: `{ token: string, user: UserResponseDto }`

### Form Fields Required

**Login Form**:
- email (email validation)
- motDePasse (required)

**Register Form**:
- nom (required)
- prenom (required) 
- email (email validation)
- motDePasse (required, min 6 chars)
- telephone (8 digits pattern)
- adresse (required)
- userType (select dropdown)
- nomAgence (if userType === AGENCE_IMMOBILIERE)
- numeroLicence (if userType === AGENCE_IMMOBILIERE)
- siteWeb (if userType === AGENCE_IMMOBILIERE, optional)
- nombreEmployes (if userType === AGENCE_IMMOBILIERE, optional)
- zonesCouverture (if userType === AGENCE_IMMOBILIERE, optional)