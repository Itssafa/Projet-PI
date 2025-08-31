import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="verify-email-container">
      <div class="verify-email-card">
        <div class="verify-email-header">
          <div class="logo">
            <span class="logo-icon">🏠</span>
            <h1>ImmoConnect</h1>
          </div>
        </div>

        <div class="verify-email-content">
          <!-- Loading State -->
          <div class="verification-status" *ngIf="isVerifying">
            <div class="spinner"></div>
            <h2>Vérification en cours...</h2>
            <p>Veuillez patienter pendant que nous vérifions votre email.</p>
          </div>

          <!-- Success State -->
          <div class="verification-status success" *ngIf="verificationSuccess">
            <div class="success-icon">✓</div>
            <h2>Email vérifié avec succès !</h2>
            <p>Votre adresse email a été confirmée. Vous pouvez maintenant vous connecter à votre compte.</p>
            
            <div class="actions">
              <button class="btn btn-primary" (click)="goToLogin()">
                <span class="material-icons">login</span>
                Se connecter
              </button>
            </div>
          </div>

          <!-- Error State -->
          <div class="verification-status error" *ngIf="verificationError">
            <div class="error-icon">✕</div>
            <h2>Erreur de vérification</h2>
            <p>{{ errorMessage }}</p>
            
            <div class="actions">
              <button class="btn btn-secondary" (click)="resendVerification()" [disabled]="isResending">
                <span class="material-icons" *ngIf="!isResending">refresh</span>
                <span class="spinner small" *ngIf="isResending"></span>
                {{ isResending ? 'Envoi en cours...' : 'Renvoyer l\'email' }}
              </button>
              <button class="btn btn-primary" (click)="goToLogin()">
                <span class="material-icons">login</span>
                Aller à la connexion
              </button>
            </div>
          </div>

          <!-- Pending Verification (no token in URL) -->
          <div class="verification-status pending" *ngIf="isPendingVerification">
            <div class="pending-icon">📧</div>
            <h2>Vérifiez votre email</h2>
            <p *ngIf="userEmail">
              Nous avons envoyé un lien de vérification à <strong>{{ userEmail }}</strong>
            </p>
            <p>Cliquez sur le lien dans l'email pour activer votre compte.</p>
            
            <div class="verification-tips">
              <h3>Vous ne recevez pas l'email ?</h3>
              <ul>
                <li>Vérifiez votre dossier spam/courrier indésirable</li>
                <li>Assurez-vous que l'adresse email est correcte</li>
                <li>Attendez quelques minutes, l'email peut prendre du temps à arriver</li>
              </ul>
            </div>

            <div class="actions">
              <button class="btn btn-secondary" (click)="resendVerification()" [disabled]="isResending || !canResend">
                <span class="material-icons" *ngIf="!isResending">refresh</span>
                <span class="spinner small" *ngIf="isResending"></span>
                {{ isResending ? 'Envoi en cours...' : 
                   canResend ? 'Renvoyer l\'email' : 'Renvoyer (' + resendCountdown + 's)' }}
              </button>
              <button class="btn btn-outline" (click)="goToLogin()">
                <span class="material-icons">arrow_back</span>
                Retour à la connexion
              </button>
            </div>
          </div>

          <!-- Resend Success Message -->
          <div class="success-message" *ngIf="resendSuccess">
            <span class="material-icons">check_circle</span>
            Email de vérification renvoyé avec succès !
          </div>

          <!-- Resend Error Message -->
          <div class="error-message" *ngIf="resendError">
            <span class="material-icons">error</span>
            {{ resendErrorMessage }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .verify-email-container {
      min-height: 100vh;
      background: linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }

    .verify-email-card {
      background: var(--white);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
      padding: 2rem;
      width: 100%;
      max-width: 500px;
      text-align: center;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--primary-500) 0%, var(--secondary-500) 100%);
        border-radius: var(--radius-xl) var(--radius-xl) 0 0;
      }
    }

    .verify-email-header {
      margin-bottom: 2rem;

      .logo {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        margin-bottom: 1rem;

        .logo-icon {
          font-size: 2rem;
        }

        h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--primary-600);
          margin: 0;
        }
      }
    }

    .verification-status {
      padding: 2rem 0;

      h2 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: var(--gray-900);
      }

      p {
        color: var(--gray-600);
        font-size: 1rem;
        line-height: 1.6;
        margin-bottom: 1.5rem;
      }

      &.success {
        .success-icon {
          font-size: 4rem;
          color: var(--success);
          margin-bottom: 1rem;
        }

        h2 {
          color: var(--success-dark);
        }
      }

      &.error {
        .error-icon {
          font-size: 4rem;
          color: var(--error);
          margin-bottom: 1rem;
        }

        h2 {
          color: var(--error-dark);
        }
      }

      &.pending {
        .pending-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
      }
    }

    .spinner {
      width: 3rem;
      height: 3rem;
      border: 3px solid var(--gray-200);
      border-top: 3px solid var(--primary-500);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;

      &.small {
        width: 1rem;
        height: 1rem;
        border-width: 2px;
        margin: 0;
      }
    }

    .verification-tips {
      background: var(--gray-50);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      margin: 1.5rem 0;
      text-align: left;

      h3 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--gray-900);
        margin-bottom: 0.75rem;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          color: var(--gray-600);
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
          padding-left: 1rem;
          position: relative;

          &::before {
            content: '•';
            position: absolute;
            left: 0;
            color: var(--primary-500);
          }
        }
      }
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 2rem;

      @media (min-width: 480px) {
        flex-direction: row;
        justify-content: center;
      }
    }

    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid;
      min-height: 44px;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .material-icons {
        font-size: 1.125rem;
      }
    }

    .btn-primary {
      background: var(--primary-500);
      color: var(--white);
      border-color: var(--primary-500);

      &:hover:not(:disabled) {
        background: var(--primary-600);
        border-color: var(--primary-600);
      }
    }

    .btn-secondary {
      background: var(--white);
      color: var(--gray-700);
      border-color: var(--gray-300);

      &:hover:not(:disabled) {
        background: var(--gray-50);
        border-color: var(--gray-400);
      }
    }

    .btn-outline {
      background: transparent;
      color: var(--primary-600);
      border-color: var(--primary-300);

      &:hover:not(:disabled) {
        background: var(--primary-50);
        border-color: var(--primary-400);
      }
    }

    .success-message, .error-message {
      margin-top: 1rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .success-message {
      background: var(--success-light);
      color: var(--success-dark);
      border: 1px solid var(--success-border);

      .material-icons {
        color: var(--success);
      }
    }

    .error-message {
      background: var(--error-light);
      color: var(--error-dark);
      border: 1px solid var(--error-border);

      .material-icons {
        color: var(--error);
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 480px) {
      .verify-email-container {
        padding: 1rem 0.5rem;
      }

      .verify-email-card {
        padding: 1.5rem;
      }

      .verification-status {
        padding: 1.5rem 0;

        h2 {
          font-size: 1.25rem;
        }
      }
    }
  `]
})
export class VerifyEmailComponent implements OnInit {
  isVerifying = false;
  verificationSuccess = false;
  verificationError = false;
  isPendingVerification = false;
  
  errorMessage = '';
  userEmail = '';
  
  // Resend functionality
  isResending = false;
  resendSuccess = false;
  resendError = false;
  resendErrorMessage = '';
  canResend = true;
  resendCountdown = 0;
  private resendTimer?: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      this.userEmail = params['email'] || '';
      
      if (token) {
        this.verifyEmailWithToken(token);
      } else {
        this.isPendingVerification = true;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
    }
  }

  private verifyEmailWithToken(token: string): void {
    this.isVerifying = true;
    this.verificationSuccess = false;
    this.verificationError = false;
    this.isPendingVerification = false;

    this.authService.verifyEmail(token).subscribe({
      next: (response) => {
        this.isVerifying = false;
        if (response.success) {
          this.verificationSuccess = true;
        } else {
          this.verificationError = true;
          this.errorMessage = response.message || 'Erreur de vérification inconnue.';
        }
      },
      error: (error) => {
        this.isVerifying = false;
        this.verificationError = true;
        this.errorMessage = error.error?.message || 
          'Le lien de vérification est invalide ou a expiré. Veuillez demander un nouveau lien.';
      }
    });
  }

  resendVerification(): void {
    if (!this.canResend || this.isResending || !this.userEmail) {
      return;
    }

    this.isResending = true;
    this.resendSuccess = false;
    this.resendError = false;
    this.resendErrorMessage = '';

    this.authService.resendVerification({ email: this.userEmail }).subscribe({
      next: (response) => {
        this.isResending = false;
        if (response.success) {
          this.resendSuccess = true;
          this.startResendCooldown();
          setTimeout(() => {
            this.resendSuccess = false;
          }, 5000);
        } else {
          this.resendError = true;
          this.resendErrorMessage = response.message || 'Erreur lors de l\'envoi.';
        }
      },
      error: (error) => {
        this.isResending = false;
        this.resendError = true;
        this.resendErrorMessage = error.error?.message || 
          'Impossible de renvoyer l\'email. Veuillez réessayer plus tard.';
      }
    });
  }

  private startResendCooldown(): void {
    this.canResend = false;
    this.resendCountdown = 60; // 60 seconds cooldown
    
    this.resendTimer = setInterval(() => {
      this.resendCountdown--;
      
      if (this.resendCountdown <= 0) {
        this.canResend = true;
        clearInterval(this.resendTimer);
        this.resendTimer = null;
      }
    }, 1000);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}