# 🚀 Guide d'Installation Frontend Angular

## ❗ Situation Actuelle

Le frontend a été développé avec tous les composants et services, mais certains composants n'ont pas pu être créés directement. Voici comment finaliser l'installation.

## 📋 Étapes d'Installation

### 1. Générer les Composants Manquants

```bash
# Exécuter le script de génération
generate-components.bat
```

Cela va créer tous les composants manquants avec Angular CLI.

### 2. Copier le Contenu des Composants

Une fois les composants générés, vous devrez copier le contenu des fichiers `.ts`, `.html`, et `.css` que j'ai créés précédemment dans les nouveaux fichiers générés.

**Composants à copier :**

#### Auth Components
- `components/auth/email-verification/` 
  - Copier depuis le contenu créé précédemment

#### Dashboard Components  
- `components/dashboards/admin-dashboard/`
- `components/dashboards/agency-dashboard/`
- `components/dashboards/client-dashboard/`
- `components/dashboards/user-dashboard/`

#### Admin Components
- `components/admin/user-list/`
- `components/admin/statistics/`

#### Shared Components
- `components/shared/profile/`
- `components/shared/navbar/`

### 3. Mettre à Jour app.module.ts

Remplacez le contenu actuel par :

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Tous les composants
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { EmailVerificationComponent } from './components/auth/email-verification/email-verification.component';
import { AdminDashboardComponent } from './components/dashboards/admin-dashboard/admin-dashboard.component';
import { AgencyDashboardComponent } from './components/dashboards/agency-dashboard/agency-dashboard.component';
import { ClientDashboardComponent } from './components/dashboards/client-dashboard/client-dashboard.component';
import { UserDashboardComponent } from './components/dashboards/user-dashboard/user-dashboard.component';
import { UserListComponent } from './components/admin/user-list/user-list.component';
import { StatisticsComponent } from './components/admin/statistics/statistics.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/shared/profile/profile.component';
import { UnauthorizedComponent } from './components/shared/unauthorized/unauthorized.component';
import { NavbarComponent } from './components/shared/navbar/navbar.component';

// Services
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { StatisticsService } from './services/statistics.service';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    EmailVerificationComponent,
    AdminDashboardComponent,
    AgencyDashboardComponent,
    ClientDashboardComponent,
    UserDashboardComponent,
    UserListComponent,
    StatisticsComponent,
    HomeComponent,
    ProfileComponent,
    UnauthorizedComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    AuthService,
    UserService,
    StatisticsService,
    AuthGuard,
    RoleGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### 4. Mettre à Jour app-routing.module.ts

Remplacez le contenu actuel par :

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { AdminDashboardComponent } from './components/dashboards/admin-dashboard/admin-dashboard.component';
import { AgencyDashboardComponent } from './components/dashboards/agency-dashboard/agency-dashboard.component';
import { ClientDashboardComponent } from './components/dashboards/client-dashboard/client-dashboard.component';
import { UserDashboardComponent } from './components/dashboards/user-dashboard/user-dashboard.component';
import { UserListComponent } from './components/admin/user-list/user-list.component';
import { StatisticsComponent } from './components/admin/statistics/statistics.component';
import { ProfileComponent } from './components/shared/profile/profile.component';
import { UnauthorizedComponent } from './components/shared/unauthorized/unauthorized.component';
import { EmailVerificationComponent } from './components/auth/email-verification/email-verification.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-email', component: EmailVerificationComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  
  // Routes protégées
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  
  // Routes administrateur
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['ADMINISTRATEUR'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: UserListComponent },
      { path: 'statistics', component: StatisticsComponent }
    ]
  },
  
  // Routes agence immobilière
  {
    path: 'agency',
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['AGENCE_IMMOBILIERE'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AgencyDashboardComponent }
    ]
  },
  
  // Routes client abonné
  {
    path: 'client',
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['CLIENT_ABONNE'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ClientDashboardComponent }
    ]
  },
  
  // Routes utilisateur simple
  {
    path: 'user',
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['UTILISATEUR'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: UserDashboardComponent }
    ]
  },
  
  // Route par défaut
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

### 5. Installation des Dépendances

```bash
cd frontend
npm install
npm install @angular/cdk@16.2.0 @angular/material@16.2.0
```

### 6. Démarrage

```bash
# Terminal 1 : Backend
cd backend/microservice/User
mvn spring-boot:run

# Terminal 2 : Frontend  
cd frontend
ng serve
```

## 🎯 Points Importants

### ✅ Ce qui est Déjà Prêt
- ✅ Services Angular (AuthService, UserService, StatisticsService)
- ✅ Guards de sécurité (AuthGuard, RoleGuard)
- ✅ Intercepteur JWT
- ✅ Modèles TypeScript
- ✅ Composants de base (Login, Register, Home, Unauthorized)

### ⚠️ Ce qui Reste à Faire
- Générer les composants manquants avec `generate-components.bat`
- Copier le contenu des fichiers créés précédemment
- Mettre à jour app.module.ts et app-routing.module.ts
- Tester l'intégration complète

## 🔧 Alternative Rapide

Si vous voulez tester rapidement l'authentification, le système actuel fonctionne déjà avec :
- Page d'accueil : `http://localhost:4200`
- Connexion : `http://localhost:4200/login`  
- Inscription : `http://localhost:4200/register`

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez que le backend fonctionne sur le port 8080
2. Vérifiez les erreurs de console dans le navigateur
3. Assurez-vous que tous les fichiers de services existent
4. Testez les appels API avec Postman si nécessaire

---

**🎉 Une fois ces étapes terminées, vous aurez un frontend Angular complet intégré à votre backend Spring Boot !**