import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    // First check if user is authenticated
    if (!this.auth.isAuthenticated) {
      return this.router.createUrlTree(['/login']);
    }

    // Check if email is verified
    if (this.auth.isEmailVerificationRequired()) {
      return this.router.createUrlTree(['/verify-email']);
    }

    // Check if user is an administrator
    if (this.auth.hasRole('ADMINISTRATEUR')) {
      return true;
    }

    // If not admin, redirect based on user's role
    const userType = this.auth.userType;
    switch (userType) {
      case 'CLIENT_ABONNE':
        return this.router.createUrlTree(['/client/dashboard']);
      case 'AGENCE_IMMOBILIERE':
        return this.router.createUrlTree(['/agency/dashboard']);
      case 'UTILISATEUR':
      default:
        return this.router.createUrlTree(['/dashboard']);
    }
  }
}