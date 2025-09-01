import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../core/notification.service';

@Component({
  selector: 'app-password-change',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="password-change-container">
      <!-- Header -->
      <div class="change-header">
        <div class="header-content">
          <h1>
            <i class="material-icons">lock</i>
            Changer le mot de passe
          </h1>
          <p>Assurez-vous d'utiliser un mot de passe sécurisé</p>
        </div>
        <div class="security-indicator">
          <i class="material-icons">security</i>
          <span>Sécurisé</span>
        </div>
      </div>

      <form [formGroup]="passwordForm" (ngSubmit)="onSubmit()" class="password-form">
        <!-- Password Change Card -->
        <div class="form-card">
          <div class="card-header">
            <h2>
              <i class="material-icons">vpn_key</i>
              Modification du mot de passe
            </h2>
          </div>
          <div class="card-content">
            <div class="form-group">
              <label for="currentPassword">Mot de passe actuel *</label>
              <div class="password-input-group">
                <input
                  id="currentPassword"
                  [type]="showCurrentPassword ? 'text' : 'password'"
                  formControlName="currentPassword"
                  class="form-input"
                  [class.error]="isFieldInvalid('currentPassword')"
                  placeholder="Saisissez votre mot de passe actuel"
                >
                <button
                  type="button"
                  class="password-toggle"
                  (click)="toggleCurrentPassword()"
                >
                  <i class="material-icons">{{ showCurrentPassword ? 'visibility_off' : 'visibility' }}</i>
                </button>
              </div>
              <div class="error-message" *ngIf="isFieldInvalid('currentPassword')">
                {{ getFieldError('currentPassword') }}
              </div>
            </div>

            <div class="form-group">
              <label for="newPassword">Nouveau mot de passe *</label>
              <div class="password-input-group">
                <input
                  id="newPassword"
                  [type]="showNewPassword ? 'text' : 'password'"
                  formControlName="newPassword"
                  class="form-input"
                  [class.error]="isFieldInvalid('newPassword')"
                  placeholder="Créez un nouveau mot de passe"
                  (input)="onNewPasswordChange()"
                >
                <button
                  type="button"
                  class="password-toggle"
                  (click)="toggleNewPassword()"
                >
                  <i class="material-icons">{{ showNewPassword ? 'visibility_off' : 'visibility' }}</i>
                </button>
              </div>
              <div class="error-message" *ngIf="isFieldInvalid('newPassword')">
                {{ getFieldError('newPassword') }}
              </div>
              
              <!-- Password Strength Indicator -->
              <div class="password-strength" *ngIf="passwordForm.get('newPassword')?.value">
                <div class="strength-label">Force du mot de passe:</div>
                <div class="strength-bar">
                  <div class="strength-fill" [style.width.%]="passwordStrength.percentage" [ngClass]="passwordStrength.level"></div>
                </div>
                <div class="strength-text" [ngClass]="passwordStrength.level">{{ passwordStrength.text }}</div>
              </div>

              <!-- Password Requirements -->
              <div class="password-requirements" *ngIf="passwordForm.get('newPassword')?.touched">
                <div class="requirement-item" [ngClass]="passwordRequirements.minLength ? 'valid' : 'invalid'">
                  <i class="material-icons">{{ passwordRequirements.minLength ? 'check' : 'close' }}</i>
                  Au moins 8 caractères
                </div>
                <div class="requirement-item" [ngClass]="passwordRequirements.uppercase ? 'valid' : 'invalid'">
                  <i class="material-icons">{{ passwordRequirements.uppercase ? 'check' : 'close' }}</i>
                  Une lettre majuscule
                </div>
                <div class="requirement-item" [ngClass]="passwordRequirements.lowercase ? 'valid' : 'invalid'">
                  <i class="material-icons">{{ passwordRequirements.lowercase ? 'check' : 'close' }}</i>
                  Une lettre minuscule
                </div>
                <div class="requirement-item" [ngClass]="passwordRequirements.digit ? 'valid' : 'invalid'">
                  <i class="material-icons">{{ passwordRequirements.digit ? 'check' : 'close' }}</i>
                  Un chiffre
                </div>
                <div class="requirement-item" [ngClass]="passwordRequirements.special ? 'valid' : 'invalid'">
                  <i class="material-icons">{{ passwordRequirements.special ? 'check' : 'close' }}</i>
                  Un caractère spécial
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirmer le nouveau mot de passe *</label>
              <div class="password-input-group">
                <input
                  id="confirmPassword"
                  [type]="showConfirmPassword ? 'text' : 'password'"
                  formControlName="confirmPassword"
                  class="form-input"
                  [class.error]="isFieldInvalid('confirmPassword')"
                  placeholder="Confirmez votre nouveau mot de passe"
                >
                <button
                  type="button"
                  class="password-toggle"
                  (click)="toggleConfirmPassword()"
                >
                  <i class="material-icons">{{ showConfirmPassword ? 'visibility_off' : 'visibility' }}</i>
                </button>
              </div>
              <div class="error-message" *ngIf="isFieldInvalid('confirmPassword')">
                {{ getFieldError('confirmPassword') }}
              </div>
              <div class="field-success" *ngIf="passwordsMatch() && passwordForm.get('confirmPassword')?.value">
                <i class="material-icons">check_circle</i>
                Les mots de passe correspondent
              </div>
            </div>
          </div>
        </div>

        <!-- Security Tips Card -->
        <div class="form-card tips-card">
          <div class="card-header">
            <h2>
              <i class="material-icons">tips_and_updates</i>
              Conseils de sécurité
            </h2>
          </div>
          <div class="card-content">
            <div class="security-tips">
              <div class="tip-item">
                <i class="material-icons">shield</i>
                <div>
                  <h4>Utilisez un mot de passe unique</h4>
                  <p>Ne réutilisez jamais ce mot de passe sur d'autres sites</p>
                </div>
              </div>
              <div class="tip-item">
                <i class="material-icons">update</i>
                <div>
                  <h4>Changez régulièrement</h4>
                  <p>Modifiez votre mot de passe tous les 3-6 mois</p>
                </div>
              </div>
              <div class="tip-item">
                <i class="material-icons">password</i>
                <div>
                  <h4>Utilisez un gestionnaire de mots de passe</h4>
                  <p>Pour gérer vos mots de passe en toute sécurité</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="onCancel()">
            <i class="material-icons">close</i>
            Annuler
          </button>
          <button 
            type="submit" 
            class="btn btn-primary" 
            [disabled]="!passwordForm.valid || isLoading"
          >
            <i class="material-icons" *ngIf="!isLoading">save</i>
            <div class="spinner" *ngIf="isLoading"></div>
            {{ isLoading ? 'Modification...' : 'Changer le mot de passe' }}
          </button>
        </div>
      </form>

      <!-- Success/Error Messages -->
      <div class="message-container">
        <div class="success-message" *ngIf="successMessage">
          <i class="material-icons">check_circle</i>
          {{ successMessage }}
        </div>
        <div class="error-message" *ngIf="errorMessage">
          <i class="material-icons">error</i>
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./password-change.component.scss']
})
export class PasswordChangeComponent implements OnInit {
  passwordForm!: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  // Password visibility toggles
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Password strength
  passwordStrength = {
    percentage: 0,
    level: '',
    text: ''
  };

  // Password requirements tracking
  passwordRequirements = {
    minLength: false,
    uppercase: false,
    lowercase: false,
    digit: false,
    special: false
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordComplexityValidator
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordComplexityValidator(control: AbstractControl) {
    if (!control.value) return null;

    const password = control.value;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumeric = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar) {
      return null;
    }

    return { passwordComplexity: true };
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ ...confirmPassword.errors, mismatch: true });
      return { mismatch: true };
    }

    if (confirmPassword && confirmPassword.errors) {
      delete confirmPassword.errors['mismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }

    return null;
  }

  onNewPasswordChange(): void {
    const password = this.passwordForm.get('newPassword')?.value || '';
    this.updatePasswordRequirements(password);
    this.updatePasswordStrength(password);
  }

  private updatePasswordRequirements(password: string): void {
    this.passwordRequirements = {
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      digit: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
  }

  private updatePasswordStrength(password: string): void {
    let score = 0;
    const requirements = Object.values(this.passwordRequirements);
    score = requirements.filter(req => req).length;

    let percentage = (score / 5) * 100;
    let level = '';
    let text = '';

    if (score <= 2) {
      level = 'weak';
      text = 'Faible';
    } else if (score <= 3) {
      level = 'medium';
      text = 'Moyen';
    } else if (score <= 4) {
      level = 'strong';
      text = 'Fort';
    } else {
      level = 'very-strong';
      text = 'Très fort';
    }

    this.passwordStrength = { percentage, level, text };
  }

  toggleCurrentPassword(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.passwordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.passwordForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Ce champ est obligatoire.';
    if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} caractères.`;
    if (field.errors['passwordComplexity']) {
      return 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.';
    }
    if (field.errors['mismatch']) return 'Les mots de passe ne correspondent pas.';

    return 'Champ invalide.';
  }

  passwordsMatch(): boolean {
    const newPassword = this.passwordForm.get('newPassword')?.value;
    const confirmPassword = this.passwordForm.get('confirmPassword')?.value;
    return newPassword && confirmPassword && newPassword === confirmPassword;
  }

  onSubmit(): void {
    if (!this.passwordForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword({
      currentPassword,
      newPassword
    }).subscribe({
      next: (response) => {
        this.successMessage = 'Mot de passe modifié avec succès!';
        this.notificationService.showSuccess('Mot de passe modifié avec succès!');
        this.passwordForm.reset();
        this.resetPasswordIndicators();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erreur lors de la modification. Veuillez réessayer.';
        this.notificationService.showError(this.errorMessage);
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.passwordForm.reset();
    this.resetPasswordIndicators();
    this.errorMessage = '';
    this.successMessage = '';
  }

  private resetPasswordIndicators(): void {
    this.passwordStrength = { percentage: 0, level: '', text: '' };
    this.passwordRequirements = {
      minLength: false,
      uppercase: false,
      lowercase: false,
      digit: false,
      special: false
    };
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.passwordForm.controls).forEach(key => {
      const control = this.passwordForm.get(key);
      control?.markAsTouched();
    });
  }
}