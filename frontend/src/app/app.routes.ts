import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { EmailVerificationGuard } from './guards/email-verification.guard';
import { AdminGuard } from './guards/admin.guard';
import { AgencyVerificationGuard } from './guards/agency-verification.guard';

export const routes: Routes = [
  // Public routes
  { 
    path: 'login', 
    loadComponent: () => import('./components/auth/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
  },
  { 
    path: 'verify-email', 
    loadComponent: () => import('./components/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent)
  },
  
  // Protected routes with role-based access
  
  // Regular user dashboard
  { 
    path: 'dashboard', 
    canActivate: [AuthGuard, EmailVerificationGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { expectedRoles: ['UTILISATEUR'] }
  },
  { 
    path: 'profile', 
    canActivate: [AuthGuard, EmailVerificationGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { expectedRoles: ['UTILISATEUR'] }
  },
  
  // Client Abonné routes
  { 
    path: 'client/dashboard', 
    canActivate: [AuthGuard, EmailVerificationGuard, RoleGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { expectedRoles: ['CLIENT_ABONNE'] }
  },
  { 
    path: 'client/subscription', 
    canActivate: [AuthGuard, EmailVerificationGuard, RoleGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { expectedRoles: ['CLIENT_ABONNE'] }
  },
  { 
    path: 'client/searches', 
    canActivate: [AuthGuard, EmailVerificationGuard, RoleGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { expectedRoles: ['CLIENT_ABONNE'] }
  },
  { 
    path: 'client/analytics', 
    canActivate: [AuthGuard, EmailVerificationGuard, RoleGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { expectedRoles: ['CLIENT_ABONNE'] }
  },
  { 
    path: 'client/profile', 
    canActivate: [AuthGuard, EmailVerificationGuard, RoleGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { expectedRoles: ['CLIENT_ABONNE'] }
  },
  
  // Agency routes
  { 
    path: 'agency/dashboard', 
    canActivate: [AuthGuard, EmailVerificationGuard, RoleGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { expectedRoles: ['AGENCE_IMMOBILIERE'] }
  },
  { 
    path: 'agency/properties', 
    canActivate: [AuthGuard, EmailVerificationGuard, AgencyVerificationGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { expectedRoles: ['AGENCE_IMMOBILIERE'], requiresVerification: true }
  },
  { 
    path: 'agency/clients', 
    canActivate: [AuthGuard, EmailVerificationGuard, AgencyVerificationGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { expectedRoles: ['AGENCE_IMMOBILIERE'], requiresVerification: true }
  },
  { 
    path: 'agency/team', 
    canActivate: [AuthGuard, EmailVerificationGuard, AgencyVerificationGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { expectedRoles: ['AGENCE_IMMOBILIERE'], requiresVerification: true }
  },
  { 
    path: 'agency/analytics', 
    canActivate: [AuthGuard, EmailVerificationGuard, AgencyVerificationGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { expectedRoles: ['AGENCE_IMMOBILIERE'], requiresVerification: true }
  },
  { 
    path: 'agency/verification', 
    canActivate: [AuthGuard, EmailVerificationGuard, RoleGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { expectedRoles: ['AGENCE_IMMOBILIERE'] }
  },
  { 
    path: 'agency/profile', 
    canActivate: [AuthGuard, EmailVerificationGuard, RoleGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { expectedRoles: ['AGENCE_IMMOBILIERE'] }
  },
  
  // Admin routes
  { 
    path: 'admin/dashboard', 
    canActivate: [AdminGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { expectedRoles: ['ADMINISTRATEUR'] }
  },
  { 
    path: 'admin/users', 
    canActivate: [AdminGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { expectedRoles: ['ADMINISTRATEUR'] }
  },
  { 
    path: 'admin/agencies', 
    canActivate: [AdminGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { expectedRoles: ['ADMINISTRATEUR'] }
  },
  { 
    path: 'admin/statistics', 
    canActivate: [AdminGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { expectedRoles: ['ADMINISTRATEUR'] }
  },
  { 
    path: 'admin/visits', 
    canActivate: [AdminGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { expectedRoles: ['ADMINISTRATEUR'] }
  },
  { 
    path: 'admin/system', 
    canActivate: [AdminGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { expectedRoles: ['ADMINISTRATEUR'] }
  },
  { 
    path: 'admin/profile', 
    canActivate: [AdminGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { expectedRoles: ['ADMINISTRATEUR'] }
  },
  
  // Profile routes are now handled within the dashboard component
  
  // Default redirects based on user role
  { 
    path: '', 
    redirectTo: '/dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: '/dashboard' 
  }
];
