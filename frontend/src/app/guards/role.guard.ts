import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserType } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    // First check if user is authenticated
    if (!this.auth.isAuthenticated) {
      return this.router.createUrlTree(['/login']);
    }

    // Get expected roles from route data
    const expectedRoles = route.data['expectedRoles'] as UserType[];
    
    if (!expectedRoles || expectedRoles.length === 0) {
      // If no specific roles required, allow access if authenticated
      return true;
    }

    // Check if user has any of the expected roles
    if (this.auth.hasAnyRole(expectedRoles)) {
      return true;
    }

    // If user doesn't have required role, redirect based on their actual role
    const userType = this.auth.userType;
    switch (userType) {
      case 'UTILISATEUR':
        return this.router.createUrlTree(['/dashboard']);
      case 'CLIENT_ABONNE':
        return this.router.createUrlTree(['/client/dashboard']);
      case 'AGENCE_IMMOBILIERE':
        return this.router.createUrlTree(['/agency/dashboard']);
      case 'ADMINISTRATEUR':
        return this.router.createUrlTree(['/admin/dashboard']);
      default:
        return this.router.createUrlTree(['/dashboard']);
    }
  }
}