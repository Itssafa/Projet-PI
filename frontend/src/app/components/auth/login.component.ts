import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loading = false;
  serverError: string | null = null;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  get f() { 
    return {
      email: this.form.get('email')!,
      motDePasse: this.form.get('motDePasse')!
    };
  }

  submit() {
    this.serverError = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.loading = true;
    const loginData: LoginRequest = this.form.value as LoginRequest;
    
    this.auth.login(loginData).subscribe({
      next: (response) => {
        this.loading = false;
        
        // Check if email verification is required
        if (this.auth.isEmailVerificationRequired()) {
          this.router.navigate(['/verify-email'], { 
            queryParams: { email: loginData.email } 
          });
          return;
        }
        
        // Redirect based on user role
        const redirect = this.route.snapshot.queryParamMap.get('redirect') || this.getDefaultRedirect();
        this.router.navigateByUrl(redirect);
      },
      error: (err) => {
        this.serverError = err?.error?.message || 'Identifiants invalides. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  private getDefaultRedirect(): string {
    const userType = this.auth.userType;
    switch (userType) {
      case 'ADMINISTRATEUR':
        return '/admin/dashboard';
      case 'AGENCE_IMMOBILIERE':
        return '/agency/dashboard';
      case 'CLIENT_ABONNE':
        return '/client/dashboard';
      case 'UTILISATEUR':
      default:
        return '/dashboard';
    }
  }
}