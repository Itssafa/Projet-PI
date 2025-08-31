import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AgencyVerificationGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    // First check if user is authenticated
    if (!this.auth.isAuthenticated) {
      return this.router.createUrlTree(['/login']);
    }

    // Check if email is verified
    if (this.auth.isEmailVerificationRequired()) {
      return this.router.createUrlTree(['/verify-email']);
    }

    // Check if user is an agency
    if (!this.auth.hasRole('AGENCE_IMMOBILIERE')) {
      // Redirect non-agency users to their appropriate dashboard
      const userType = this.auth.userType;
      switch (userType) {
        case 'ADMINISTRATEUR':
          return this.router.createUrlTree(['/admin/dashboard']);
        case 'CLIENT_ABONNE':
          return this.router.createUrlTree(['/client/dashboard']);
        case 'UTILISATEUR':
        default:
          return this.router.createUrlTree(['/dashboard']);
      }
    }

    // Check if route requires agency verification
    const requiresVerification = route.data['requiresVerification'] as boolean;
    
    if (requiresVerification && this.auth.isAgencyVerificationRequired()) {
      // Agency needs verification but tries to access verified-only features
      return this.router.createUrlTree(['/agency/dashboard'], { 
        queryParams: { section: 'verification' } 
      });
    }

    return true;
  }
}