import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthUser, UserType, ClientAbonne, AgenceImmobiliere, Administrateur, UserUpdateRequest, PasswordChangeRequest } from '../../core/models';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../core/notification.service';

@Component({
  selector: 'app-profile-sections',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-edit-container">
      <!-- Header -->
      <div class="edit-header">
        <div class="header-content">
          <h1>
            <i class="material-icons">edit</i>
            Modifier mon profil
          </h1>
          <p>Gérez vos informations par sections</p>
        </div>
        <div class="header-actions">
          <button type="button" class="btn btn-secondary" (click)="onCancel()">
            <i class="material-icons">close</i>
            Annuler
          </button>
        </div>
      </div>

      <!-- Section 1: Basic Profile Information -->
      <div class="form-card">
        <div class="card-header">
          <h2>
            <i class="material-icons">person</i>
            Informations personnelles
          </h2>
        </div>
        <div class="card-content">
          <form [formGroup]="profileForm" class="profile-form">
            <div class="form-grid">
              <div class="form-group">
                <label for="prenom">Prénom</label>
                <input
                  id="prenom"
                  type="text"
                  formControlName="prenom"
                  class="form-input"
                  [class.error]="isProfileFieldInvalid('prenom')"
                  placeholder="Votre prénom"
                >
                <div class="error-message" *ngIf="isProfileFieldInvalid('prenom')">
                  {{ getProfileFieldError('prenom') }}
                </div>
              </div>

              <div class="form-group">
                <label for="nom">Nom</label>
                <input
                  id="nom"
                  type="text"
                  formControlName="nom"
                  class="form-input"
                  [class.error]="isProfileFieldInvalid('nom')"
                  placeholder="Votre nom de famille"
                >
                <div class="error-message" *ngIf="isProfileFieldInvalid('nom')">
                  {{ getProfileFieldError('nom') }}
                </div>
              </div>

              <div class="form-group">
                <label for="email">Email</label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  class="form-input"
                  [class.error]="isProfileFieldInvalid('email')"
                  placeholder="votre.email@exemple.com"
                >
                <div class="error-message" *ngIf="isProfileFieldInvalid('email')">
                  {{ getProfileFieldError('email') }}
                </div>
              </div>

              <div class="form-group">
                <label for="telephone">Téléphone</label>
                <input
                  id="telephone"
                  type="tel"
                  formControlName="telephone"
                  class="form-input"
                  [class.error]="isProfileFieldInvalid('telephone')"
                  placeholder="12345678"
                  maxlength="15"
                >
                <div class="error-message" *ngIf="isProfileFieldInvalid('telephone')">
                  {{ getProfileFieldError('telephone') }}
                </div>
              </div>

              <div class="form-group full-width">
                <label for="adresse">Adresse</label>
                <textarea
                  id="adresse"
                  formControlName="adresse"
                  class="form-textarea"
                  [class.error]="isProfileFieldInvalid('adresse')"
                  placeholder="Votre adresse complète"
                  rows="3"
                ></textarea>
                <div class="error-message" *ngIf="isProfileFieldInvalid('adresse')">
                  {{ getProfileFieldError('adresse') }}
                </div>
              </div>
            </div>
            
            <div class="card-actions">
              <button type="button" class="btn btn-primary" 
                      (click)="saveProfile()" 
                      [disabled]="!isProfileFormValid() || isLoading">
                <i class="material-icons" *ngIf="!isLoading">save</i>
                <div class="spinner" *ngIf="isLoading"></div>
                <span *ngIf="isLoading">Sauvegarde...</span>
                <span *ngIf="!isLoading">Sauvegarder le profil</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Section 2: Agency Information (only for agencies) -->
      <div class="form-card" *ngIf="isAgency()">
        <div class="card-header">
          <h2>
            <i class="material-icons">business</i>
            Informations de l'agence
          </h2>
        </div>
        <div class="card-content">
          <form [formGroup]="agencyForm" class="profile-form">
            <div class="form-grid">
              <div class="form-group">
                <label for="nomAgence">Nom de l'agence</label>
                <input
                  id="nomAgence"
                  type="text"
                  formControlName="nomAgence"
                  class="form-input"
                  [class.error]="isAgencyFieldInvalid('nomAgence')"
                  placeholder="Nom de votre agence"
                >
                <div class="error-message" *ngIf="isAgencyFieldInvalid('nomAgence')">
                  {{ getAgencyFieldError('nomAgence') }}
                </div>
              </div>

              <div class="form-group">
                <label for="numeroLicence">Numéro de licence</label>
                <input
                  id="numeroLicence"
                  type="text"
                  formControlName="numeroLicence"
                  class="form-input"
                  [class.error]="isAgencyFieldInvalid('numeroLicence')"
                  placeholder="Numéro de licence officiel"
                >
                <div class="error-message" *ngIf="isAgencyFieldInvalid('numeroLicence')">
                  {{ getAgencyFieldError('numeroLicence') }}
                </div>
              </div>

              <div class="form-group">
                <label for="siteWeb">Site web</label>
                <input
                  id="siteWeb"
                  type="url"
                  formControlName="siteWeb"
                  class="form-input"
                  [class.error]="isAgencyFieldInvalid('siteWeb')"
                  placeholder="https://www.votre-agence.com"
                >
                <div class="error-message" *ngIf="isAgencyFieldInvalid('siteWeb')">
                  {{ getAgencyFieldError('siteWeb') }}
                </div>
              </div>

              <div class="form-group">
                <label for="nombreEmployes">Nombre d'employés</label>
                <input
                  id="nombreEmployes"
                  type="number"
                  formControlName="nombreEmployes"
                  class="form-input"
                  [class.error]="isAgencyFieldInvalid('nombreEmployes')"
                  placeholder="0"
                  min="1"
                  max="1000"
                >
                <div class="error-message" *ngIf="isAgencyFieldInvalid('nombreEmployes')">
                  {{ getAgencyFieldError('nombreEmployes') }}
                </div>
              </div>

              <div class="form-group full-width">
                <label for="zonesCouverture">Zones de couverture</label>
                <textarea
                  id="zonesCouverture"
                  formControlName="zonesCouverture"
                  class="form-textarea"
                  placeholder="Décrivez les zones géographiques que vous couvrez"
                  rows="3"
                ></textarea>
              </div>

              <div class="form-group full-width">
                <div class="verification-status">
                  <div class="status-info">
                    <i class="material-icons" [class]="getAgency()?.verified ? 'verified' : 'pending'">
                      {{ getAgency()?.verified ? 'verified_user' : 'hourglass_empty' }}
                    </i>
                    <div>
                      <span class="status-title">Statut de vérification</span>
                      <span class="status-text" [class]="getAgency()?.verified ? 'verified' : 'pending'">
                        {{ getAgency()?.verified ? 'Agence vérifiée' : 'Vérification en cours' }}
                      </span>
                    </div>
                  </div>
                  <button type="button" class="btn btn-info" *ngIf="!getAgency()?.verified" (click)="showVerificationProcess()">
                    <i class="material-icons">help</i>
                    Processus de vérification
                  </button>
                </div>
              </div>
            </div>
            
            <div class="card-actions">
              <button type="button" class="btn btn-primary" 
                      (click)="saveAgency()" 
                      [disabled]="!isAgencyFormValid() || isLoading">
                <i class="material-icons" *ngIf="!isLoading">save</i>
                <div class="spinner" *ngIf="isLoading"></div>
                <span *ngIf="isLoading">Sauvegarde...</span>
                <span *ngIf="!isLoading">Sauvegarder l'agence</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Section 3: Security / Password Change -->
      <div class="form-card">
        <div class="card-header">
          <h2>
            <i class="material-icons">security</i>
            Sécurité du compte
          </h2>
        </div>
        <div class="card-content">
          <div class="password-toggle">
            <button type="button" class="btn btn-secondary" (click)="showPasswordSection = !showPasswordSection">
              <i class="material-icons">{{ showPasswordSection ? 'lock' : 'lock_open' }}</i>
              {{ showPasswordSection ? 'Masquer' : 'Changer le mot de passe' }}
            </button>
          </div>
          
          <form [formGroup]="passwordForm" class="profile-form" *ngIf="showPasswordSection">
            <div class="form-grid">
              <div class="form-group">
                <label for="currentPassword">Mot de passe actuel</label>
                <input
                  id="currentPassword"
                  type="password"
                  formControlName="currentPassword"
                  class="form-input"
                  [class.error]="isPasswordFieldInvalid('currentPassword')"
                  placeholder="Entrez votre mot de passe actuel">
                <div class="error-message" *ngIf="isPasswordFieldInvalid('currentPassword')">
                  {{ getPasswordFieldError('currentPassword') }}
                </div>
              </div>

              <div class="form-group">
                <label for="newPassword">Nouveau mot de passe</label>
                <input
                  id="newPassword"
                  type="password"
                  formControlName="newPassword"
                  class="form-input"
                  [class.error]="isPasswordFieldInvalid('newPassword')"
                  placeholder="Entrez le nouveau mot de passe">
                <div class="error-message" *ngIf="isPasswordFieldInvalid('newPassword')">
                  {{ getPasswordFieldError('newPassword') }}
                </div>
              </div>

              <div class="form-group">
                <label for="confirmPassword">Confirmer le nouveau mot de passe</label>
                <input
                  id="confirmPassword"
                  type="password"
                  formControlName="confirmPassword"
                  class="form-input"
                  [class.error]="isPasswordFieldInvalid('confirmPassword')"
                  placeholder="Confirmez le nouveau mot de passe">
                <div class="error-message" *ngIf="isPasswordFieldInvalid('confirmPassword')">
                  {{ getPasswordFieldError('confirmPassword') }}
                </div>
              </div>
            </div>

            <div class="card-actions">
              <button type="button" class="btn btn-primary" 
                      (click)="changePassword()" 
                      [disabled]="!isPasswordFormValid() || isLoading">
                <i class="material-icons" *ngIf="!isLoading">key</i>
                <div class="spinner" *ngIf="isLoading"></div>
                {{ isLoading ? 'Changement...' : 'Changer le mot de passe' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div class="message-container" *ngIf="successMessage || errorMessage">
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
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileSectionsComponent implements OnInit {
  @Input() user: AuthUser | null = null;
  @Output() saved = new EventEmitter<AuthUser>();
  @Output() cancelled = new EventEmitter<void>();

  profileForm!: FormGroup;
  agencyForm!: FormGroup;
  passwordForm!: FormGroup;
  originalProfileValue: any;
  originalAgencyValue: any;
  showPasswordSection = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    if (!this.user) {
      this.user = this.authService.currentUser;
    }
    this.initializeBasicProfileForm();
    this.initializeAgencyForm();
    this.initializePasswordForm();
    // Store original values to detect changes after forms are fully initialized
    setTimeout(() => {
      this.originalProfileValue = JSON.parse(JSON.stringify(this.profileForm.value));
      if (this.isAgency()) {
        this.originalAgencyValue = JSON.parse(JSON.stringify(this.agencyForm.value));
      }
    }, 0);
  }

  private initializeBasicProfileForm(): void {
    this.profileForm = this.fb.group({
      prenom: [this.user?.prenom || ''],
      nom: [this.user?.nom || ''],
      email: [this.user?.email || '', [Validators.email]],
      telephone: [this.user?.telephone || ''],
      adresse: [this.user?.adresse || '']
    });
  }

  private initializeAgencyForm(): void {
    if (this.isAgency()) {
      const agency = this.getAgency();
      this.agencyForm = this.fb.group({
        nomAgence: [agency?.nomAgence || ''],
        numeroLicence: [agency?.numeroLicence || '', [Validators.pattern(/^\d{8}$/)]],
        siteWeb: [agency?.siteWeb || ''],
        nombreEmployes: [agency?.nombreEmployes || 1, [Validators.min(1), Validators.max(1000)]],
        zonesCouverture: [agency?.zonesCouverture || '']
      });
    }
  }

  private initializePasswordForm(): void {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  // Profile form validation
  isProfileFormValid(): boolean {
    return this.hasProfileChanges();
  }

  hasProfileChanges(): boolean {
    if (!this.originalProfileValue) {
      return false;
    }
    const currentValue = this.profileForm.value;
    return JSON.stringify(currentValue) !== JSON.stringify(this.originalProfileValue);
  }

  // Agency form validation
  isAgencyFormValid(): boolean {
    return this.hasAgencyChanges();
  }

  hasAgencyChanges(): boolean {
    if (!this.isAgency() || !this.originalAgencyValue) {
      return false;
    }
    const currentValue = this.agencyForm.value;
    return JSON.stringify(currentValue) !== JSON.stringify(this.originalAgencyValue);
  }

  isPasswordFormValid(): boolean {
    return this.passwordForm.valid;
  }

  isProfileFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getProfileFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['email']) return 'Format d\'email invalide.';
    return 'Format invalide.';
  }

  isAgencyFieldInvalid(fieldName: string): boolean {
    const field = this.agencyForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getAgencyFieldError(fieldName: string): string {
    const field = this.agencyForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['pattern'] && fieldName === 'numeroLicence') {
      return 'Le numéro de licence doit contenir exactement 8 chiffres.';
    }
    if (field.errors['min']) return `Valeur minimum: ${field.errors['min'].min}`;
    if (field.errors['max']) return `Valeur maximum: ${field.errors['max'].max}`;
    return 'Format invalide.';
  }

  isPasswordFieldInvalid(fieldName: string): boolean {
    const field = this.passwordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getPasswordFieldError(fieldName: string): string {
    const field = this.passwordForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Ce champ est obligatoire.';
    if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} caractères.`;
    if (fieldName === 'confirmPassword' && this.passwordForm.errors?.['passwordMismatch']) {
      return 'Les mots de passe ne correspondent pas.';
    }
    return 'Champ invalide.';
  }

  saveProfile(): void {
    if (!this.hasProfileChanges()) {
      this.notificationService.showInfo('Aucune modification détectée dans le profil.');
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    const updateData: UserUpdateRequest = this.buildProfileUpdateRequest();
    console.log('[Profile Save] Update data:', updateData);
    
    this.authService.updateProfile(updateData).subscribe({
      next: (updatedUser) => {
        console.log('[Profile Save] Success:', updatedUser);
        this.user = updatedUser;
        this.originalProfileValue = JSON.parse(JSON.stringify(this.profileForm.value));
        this.showSuccess('Profil mis à jour avec succès!');
        this.saved.emit(updatedUser);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[Profile Save] Error:', error);
        this.showError(error.error?.error || error.error?.message || 'Erreur lors de la mise à jour du profil.');
        this.isLoading = false;
      }
    });
  }

  saveAgency(): void {
    if (!this.hasAgencyChanges()) {
      this.notificationService.showInfo('Aucune modification détectée dans les informations de l\'agence.');
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    const updateData: UserUpdateRequest = this.buildAgencyUpdateRequest();
    console.log('[Agency Save] Update data:', updateData);
    
    this.authService.updateProfile(updateData).subscribe({
      next: (updatedUser) => {
        console.log('[Agency Save] Success:', updatedUser);
        this.user = updatedUser;
        this.originalAgencyValue = JSON.parse(JSON.stringify(this.agencyForm.value));
        this.showSuccess('Informations de l\'agence mises à jour avec succès!');
        this.saved.emit(updatedUser);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[Agency Save] Error:', error);
        this.showError(error.error?.error || error.error?.message || 'Erreur lors de la mise à jour des informations de l\'agence.');
        this.isLoading = false;
      }
    });
  }

  changePassword(): void {
    if (!this.isPasswordFormValid()) {
      this.markPasswordFormTouched();
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    const passwordData: PasswordChangeRequest = {
      currentPassword: this.passwordForm.get('currentPassword')?.value,
      newPassword: this.passwordForm.get('newPassword')?.value
    };

    this.authService.changePassword(passwordData).subscribe({
      next: () => {
        this.showSuccess('Mot de passe changé avec succès!');
        this.passwordForm.reset();
        this.showPasswordSection = false;
        this.isLoading = false;
      },
      error: (error) => {
        this.showError(error.error?.error || error.error?.message || 'Erreur lors du changement de mot de passe.');
        this.isLoading = false;
      }
    });
  }

  private buildProfileUpdateRequest(): UserUpdateRequest {
    const formData = this.profileForm.value;
    const request: UserUpdateRequest = {};
    
    // Only include non-empty fields
    if (formData.nom && formData.nom.trim()) request.nom = formData.nom.trim();
    if (formData.prenom && formData.prenom.trim()) request.prenom = formData.prenom.trim();
    if (formData.email && formData.email.trim()) request.email = formData.email.trim();
    if (formData.telephone && formData.telephone.trim()) request.telephone = formData.telephone.trim();
    if (formData.adresse && formData.adresse.trim()) request.adresse = formData.adresse.trim();

    return request;
  }

  private buildAgencyUpdateRequest(): UserUpdateRequest {
    if (!this.isAgency()) {
      return {};
    }

    const formData = this.agencyForm.value;
    const request: UserUpdateRequest = {};
    
    // Only include non-empty fields
    if (formData.nomAgence && formData.nomAgence.trim()) request.nomAgence = formData.nomAgence.trim();
    if (formData.numeroLicence && formData.numeroLicence.trim()) request.numeroLicence = formData.numeroLicence.trim();
    if (formData.siteWeb && formData.siteWeb.trim()) request.siteWeb = formData.siteWeb.trim();
    if (formData.nombreEmployes) request.nombreEmployes = formData.nombreEmployes;
    if (formData.zonesCouverture && formData.zonesCouverture.trim()) request.zonesCouverture = formData.zonesCouverture.trim();

    return request;
  }

  private markPasswordFormTouched(): void {
    Object.keys(this.passwordForm.controls).forEach(key => {
      const control = this.passwordForm.get(key);
      control?.markAsTouched();
    });
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    this.notificationService.showSuccess(message);
    // Clear success message after 5 seconds
    setTimeout(() => this.successMessage = '', 5000);
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.notificationService.showError(message);
    // Clear error message after 10 seconds
    setTimeout(() => this.errorMessage = '', 10000);
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  // User type checks
  isClientAbonne(): boolean {
    return this.user?.userType === 'CLIENT_ABONNE';
  }

  isAgency(): boolean {
    return this.user?.userType === 'AGENCE_IMMOBILIERE';
  }

  isAdmin(): boolean {
    return this.user?.userType === 'ADMINISTRATEUR';
  }

  getAgency(): AgenceImmobiliere | null {
    return this.isAgency() ? this.user as AgenceImmobiliere : null;
  }

  showVerificationProcess(): void {
    const message = `
    Processus de Vérification des Agences:
    
    1. Soumission des documents - Votre agence a été enregistrée
    2. Vérification administrative - Notre équipe vérifie vos informations
    3. Validation finale - Une fois approuvée, vous recevrez le statut "Vérifiée"
    
    Délai habituel: 2-5 jours ouvrables
    `;
    
    this.notificationService.showInfo(message);
  }
}