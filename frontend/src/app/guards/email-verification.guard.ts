import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class EmailVerificationGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    // First check if user is authenticated
    if (!this.auth.isAuthenticated) {
      return this.router.createUrlTree(['/login']);
    }

    // Check if email verification is required
    if (this.auth.isEmailVerificationRequired()) {
      return this.router.createUrlTree(['/verify-email']);
    }

    return true;
  }
}