import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthUser, UserType, ClientAbonne, AgenceImmobiliere, Administrateur, UserUpdateRequest, PasswordChangeRequest } from '../../core/models';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../core/notification.service';

@Component({
  selector: 'app-profile-edit',
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
          <p>Mettez à jour vos informations personnelles</p>
        </div>
        <div class="header-actions">
          <button type="button" class="btn btn-secondary" (click)="onCancel()">
            <i class="material-icons">close</i>
            Annuler
          </button>
          <button type="button" class="btn btn-primary" (click)="onSave()" [disabled]="!isFormValid() || isLoading">
            <i class="material-icons" *ngIf="!isLoading">save</i>
            <div class="spinner" *ngIf="isLoading"></div>
            {{ isLoading ? 'Sauvegarde...' : 'Sauvegarder' }}
          </button>
        </div>
      </div>

      <form [formGroup]="profileForm" class="profile-form">
        <!-- Basic Information Card -->
        <div class="form-card">
          <div class="card-header">
            <h2>
              <i class="material-icons">person</i>
              Informations personnelles
            </h2>
          </div>
          <div class="card-content">
            <div class="form-grid">
              <div class="form-group">
                <label for="prenom">Prénom *</label>
                <input
                  id="prenom"
                  type="text"
                  formControlName="prenom"
                  class="form-input"
                  [class.error]="isFieldInvalid('prenom')"
                  placeholder="Votre prénom"
                >
                <div class="error-message" *ngIf="isFieldInvalid('prenom')">
                  {{ getFieldError('prenom') }}
                </div>
              </div>

              <div class="form-group">
                <label for="nom">Nom *</label>
                <input
                  id="nom"
                  type="text"
                  formControlName="nom"
                  class="form-input"
                  [class.error]="isFieldInvalid('nom')"
                  placeholder="Votre nom de famille"
                >
                <div class="error-message" *ngIf="isFieldInvalid('nom')">
                  {{ getFieldError('nom') }}
                </div>
              </div>

              <div class="form-group">
                <label for="email">Email *</label>
                <div class="email-input-group">
                  <input
                    id="email"
                    type="email"
                    formControlName="email"
                    class="form-input"
                    [class.error]="isFieldInvalid('email')"
                    placeholder="votre.email@exemple.com"
                  >
                  <div class="email-status">
                    <i class="material-icons" [class]="user?.emailVerified ? 'verified' : 'unverified'">
                      {{ user?.emailVerified ? 'verified' : 'error' }}
                    </i>
                    <span class="status-text">
                      {{ user?.emailVerified ? 'Vérifié' : 'Non vérifié' }}
                    </span>
                  </div>
                </div>
                <div class="error-message" *ngIf="isFieldInvalid('email')">
                  {{ getFieldError('email') }}
                </div>
                <div class="field-info" *ngIf="profileForm.get('email')?.value !== user?.email">
                  <i class="material-icons">info</i>
                  Changer votre email nécessitera une nouvelle vérification
                </div>
              </div>

              <div class="form-group">
                <label for="telephone">Téléphone *</label>
                <input
                  id="telephone"
                  type="tel"
                  formControlName="telephone"
                  class="form-input"
                  [class.error]="isFieldInvalid('telephone')"
                  placeholder="12345678"
                  maxlength="8"
                >
                <div class="error-message" *ngIf="isFieldInvalid('telephone')">
                  {{ getFieldError('telephone') }}
                </div>
              </div>

              <div class="form-group full-width">
                <label for="adresse">Adresse *</label>
                <textarea
                  id="adresse"
                  formControlName="adresse"
                  class="form-textarea"
                  [class.error]="isFieldInvalid('adresse')"
                  placeholder="Votre adresse complète"
                  rows="3"
                ></textarea>
                <div class="error-message" *ngIf="isFieldInvalid('adresse')">
                  {{ getFieldError('adresse') }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Role-Specific Information -->
        <div class="form-card" *ngIf="isClientAbonne()">
          <div class="card-header">
            <h2>
              <i class="material-icons">star</i>
              Préférences d'abonnement
            </h2>
          </div>
          <div class="card-content">
            <div class="subscription-info">
              <div class="current-plan">
                <div class="plan-display">
                  <span class="plan-badge" [ngClass]="getSubscriptionClass()">
                    {{ getClientAbonne()?.subscriptionType }}
                  </span>
                  <div class="plan-details">
                    <p class="plan-name">Plan {{ getSubscriptionDisplayName() }}</p>
                    <p class="plan-description">{{ getSubscriptionDescription() }}</p>
                  </div>
                </div>
                <button type="button" class="btn btn-outline upgrade-btn">
                  <i class="material-icons">upgrade</i>
                  Changer de plan
                </button>
              </div>
              
              <div class="usage-summary">
                <div class="usage-item">
                  <span class="usage-label">Recherches utilisées ce mois</span>
                  <div class="usage-bar">
                    <div class="usage-progress" [style.width.%]="getUsagePercentage()"></div>
                  </div>
                  <span class="usage-text">
                    {{ getSearchesUsed() }} / {{ getClientAbonne()?.searchLimit || 0 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-card" *ngIf="isAgency()">
          <div class="card-header">
            <h2>
              <i class="material-icons">business</i>
              Informations de l'agence
            </h2>
          </div>
          <div class="card-content">
            <div class="form-grid">
              <div class="form-group">
                <label for="nomAgence">Nom de l'agence *</label>
                <input
                  id="nomAgence"
                  type="text"
                  formControlName="nomAgence"
                  class="form-input"
                  [class.error]="isFieldInvalid('nomAgence')"
                  placeholder="Nom de votre agence"
                >
                <div class="error-message" *ngIf="isFieldInvalid('nomAgence')">
                  {{ getFieldError('nomAgence') }}
                </div>
              </div>

              <div class="form-group">
                <label for="numeroLicence">Numéro de licence *</label>
                <input
                  id="numeroLicence"
                  type="text"
                  formControlName="numeroLicence"
                  class="form-input"
                  [class.error]="isFieldInvalid('numeroLicence')"
                  placeholder="Numéro de licence officiel"
                >
                <div class="error-message" *ngIf="isFieldInvalid('numeroLicence')">
                  {{ getFieldError('numeroLicence') }}
                </div>
              </div>

              <div class="form-group">
                <label for="siteWeb">Site web</label>
                <input
                  id="siteWeb"
                  type="url"
                  formControlName="siteWeb"
                  class="form-input"
                  [class.error]="isFieldInvalid('siteWeb')"
                  placeholder="https://www.votre-agence.com"
                >
                <div class="error-message" *ngIf="isFieldInvalid('siteWeb')">
                  {{ getFieldError('siteWeb') }}
                </div>
              </div>

              <div class="form-group">
                <label for="nombreEmployes">Nombre d'employés</label>
                <input
                  id="nombreEmployes"
                  type="number"
                  formControlName="nombreEmployes"
                  class="form-input"
                  [class.error]="isFieldInvalid('nombreEmployes')"
                  placeholder="0"
                  min="1"
                  max="1000"
                >
                <div class="error-message" *ngIf="isFieldInvalid('nombreEmployes')">
                  {{ getFieldError('nombreEmployes') }}
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
          </div>
        </div>

        <div class="form-card" *ngIf="isAdmin()">
          <div class="card-header">
            <h2>
              <i class="material-icons">admin_panel_settings</i>
              Informations administrateur
            </h2>
          </div>
          <div class="card-content">
            <div class="admin-info">
              <div class="admin-level-display">
                <label>Niveau d'administration</label>
                <div class="level-badge" [ngClass]="getAdminLevelClass()">
                  <i class="material-icons">{{ getAdminLevelIcon() }}</i>
                  {{ getAdminLevelDisplay() }}
                </div>
              </div>
              
              <div class="admin-permissions">
                <label>Permissions accordées</label>
                <div class="permissions-grid">
                  <div class="permission-item" *ngFor="let permission of getAdminPermissions()">
                    <i class="material-icons">check_circle</i>
                    {{ permission }}
                  </div>
                </div>
              </div>

              <div class="admin-note">
                <i class="material-icons">info</i>
                <p>Les informations administrateur ne peuvent être modifiées que par un Super Administrateur.</p>
              </div>
            </div>
          </div>
        </div>
      </form>

      <!-- Password Change Section -->
      <div class="password-section">
        <div class="password-toggle">
          <button type="button" class="btn btn-secondary" (click)="showPasswordSection = !showPasswordSection">
            <i class="material-icons">{{ showPasswordSection ? 'lock' : 'lock_open' }}</i>
            {{ showPasswordSection ? 'Masquer' : 'Changer le mot de passe' }}
          </button>
        </div>
        
        <div class="password-form" *ngIf="showPasswordSection" [formGroup]="passwordForm">
          <div class="form-card">
            <div class="card-header">
              <h2>
                <i class="material-icons">security</i>
                Changer le mot de passe
              </h2>
            </div>
            <div class="card-content">
              <div class="form-grid">
                <div class="form-group">
                  <label for="currentPassword">Mot de passe actuel *</label>
                  <input
                    id="currentPassword"
                    type="password"
                    formControlName="currentPassword"
                    class="form-control"
                    [class.error]="isPasswordFieldInvalid('currentPassword')"
                    placeholder="Entrez votre mot de passe actuel">
                  <div class="error-message" *ngIf="isPasswordFieldInvalid('currentPassword')">
                    {{ getPasswordFieldError('currentPassword') }}
                  </div>
                </div>

                <div class="form-group">
                  <label for="newPassword">Nouveau mot de passe *</label>
                  <input
                    id="newPassword"
                    type="password"
                    formControlName="newPassword"
                    class="form-control"
                    [class.error]="isPasswordFieldInvalid('newPassword')"
                    placeholder="Entrez le nouveau mot de passe">
                  <div class="error-message" *ngIf="isPasswordFieldInvalid('newPassword')">
                    {{ getPasswordFieldError('newPassword') }}
                  </div>
                </div>

                <div class="form-group">
                  <label for="confirmPassword">Confirmer le nouveau mot de passe *</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    formControlName="confirmPassword"
                    class="form-control"
                    [class.error]="isPasswordFieldInvalid('confirmPassword')"
                    placeholder="Confirmez le nouveau mot de passe">
                  <div class="error-message" *ngIf="isPasswordFieldInvalid('confirmPassword')">
                    {{ getPasswordFieldError('confirmPassword') }}
                  </div>
                </div>
              </div>

              <div class="password-actions">
                <button type="button" class="btn btn-primary" 
                        (click)="changePassword()" 
                        [disabled]="!isPasswordFormValid() || isLoading">
                  <i class="material-icons">key</i>
                  Changer le mot de passe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {
  @Input() user: AuthUser | null = null;
  @Output() saved = new EventEmitter<AuthUser>();
  @Output() cancelled = new EventEmitter<void>();

  profileForm!: FormGroup;
  originalFormValue: any;
  showPasswordSection = false;
  passwordForm!: FormGroup;
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
    this.initializeForm();
    this.initializePasswordForm();
    // Store original values to detect changes after form is fully initialized
    setTimeout(() => {
      this.originalFormValue = JSON.parse(JSON.stringify(this.profileForm.value));
    }, 0);
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      prenom: [this.user?.prenom || '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      nom: [this.user?.nom || '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      telephone: [this.user?.telephone || '', [
        Validators.required,
        Validators.pattern(/^\d{8,15}$/), // Allow 8-15 digits for international numbers
        Validators.minLength(8)
      ]],
      adresse: [this.user?.adresse || '', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]]
    });

    // Add role-specific fields
    if (this.isAgency()) {
      const agency = this.getAgency();
      this.profileForm.addControl('nomAgence', this.fb.control(
        agency?.nomAgence || '', [Validators.required, Validators.minLength(2)]
      ));
      this.profileForm.addControl('numeroLicence', this.fb.control(
        agency?.numeroLicence || '', [Validators.required, Validators.pattern(/^\d{8}$/)]
      ));
      this.profileForm.addControl('siteWeb', this.fb.control(
        agency?.siteWeb || ''  // Optional field, no validators
      ));
      this.profileForm.addControl('nombreEmployes', this.fb.control(
        agency?.nombreEmployes || 1, [Validators.min(1), Validators.max(1000)]
      ));
      this.profileForm.addControl('zonesCouverture', this.fb.control(
        agency?.zonesCouverture || ''  // Optional field
      ));
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

  isFormValid(): boolean {
    // Only require that there are changes, not that all fields are valid
    // This allows partial updates of profile information
    return this.hasFormChanges();
  }

  hasFormChanges(): boolean {
    if (!this.originalFormValue) {
      return false; // No changes if we don't have original values yet
    }
    const currentValue = this.profileForm.value;
    return JSON.stringify(currentValue) !== JSON.stringify(this.originalFormValue);
  }

  getChangedFields(): string[] {
    if (!this.originalFormValue) {
      return [];
    }
    
    const currentValue = this.profileForm.value;
    const changedFields: string[] = [];
    
    Object.keys(currentValue).forEach(key => {
      if (currentValue[key] !== this.originalFormValue[key]) {
        changedFields.push(key);
      }
    });
    
    return changedFields;
  }

  isPasswordFormValid(): boolean {
    return this.passwordForm.valid;
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

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Ce champ est obligatoire.';
    if (field.errors['email']) return 'Format d\'email invalide.';
    if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} caractères.`;
    if (field.errors['maxlength']) return `Maximum ${field.errors['maxlength'].requiredLength} caractères.`;
    if (field.errors['pattern']) {
      if (fieldName === 'telephone') {
        return 'Le numéro de téléphone doit contenir exactement 8 chiffres.';
      }
      if (fieldName === 'siteWeb') {
        return 'URL invalide. Doit commencer par http:// ou https://';
      }
    }
    if (field.errors['min']) return `Valeur minimum: ${field.errors['min'].min}`;
    if (field.errors['max']) return `Valeur maximum: ${field.errors['max'].max}`;

    return 'Champ invalide.';
  }

  onSave(): void {
    if (!this.hasFormChanges()) {
      this.notificationService.showInfo('Aucune modification détectée.');
      return;
    }

    // Validate only the changed fields
    const changedFields = this.getChangedFields();
    let hasValidationErrors = false;
    
    for (const fieldName of changedFields) {
      const field = this.profileForm.get(fieldName);
      if (field && field.invalid) {
        field.markAsTouched();
        hasValidationErrors = true;
      }
    }

    if (hasValidationErrors) {
      this.errorMessage = 'Veuillez corriger les erreurs dans les champs modifiés.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updateData: UserUpdateRequest = this.buildUpdateRequest();

    // Debug: Check if user is authenticated and has token
    console.log('Current user:', this.authService.currentUser);
    console.log('JWT token exists:', !!this.authService.token);
    console.log('JWT token preview:', this.authService.token ? this.authService.token.substring(0, 50) + '...' : 'No token');
    console.log('Is authenticated:', this.authService.isAuthenticated);
    console.log('Update data:', updateData);
    
    // Decode token to check its contents
    if (this.authService.token) {
      try {
        const tokenPayload = this.authService.getTokenPayload();
        console.log('Token payload:', tokenPayload);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
    
    this.authService.updateProfile(updateData).subscribe({
      next: (updatedUser) => {
        console.log('Profile updated successfully:', updatedUser);
        this.user = updatedUser;
        // Update original values to reflect the saved state
        this.originalFormValue = JSON.parse(JSON.stringify(this.profileForm.value));
        this.successMessage = 'Profil mis à jour avec succès!';
        this.notificationService.showSuccess('Profil mis à jour avec succès!');
        this.saved.emit(updatedUser);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Profile update error:', error);
        console.log('Error status:', error.status);
        console.log('Error message:', error.error);
        this.errorMessage = error.error?.error || error.error?.message || 'Erreur lors de la mise à jour. Veuillez réessayer.';
        this.notificationService.showError(this.errorMessage);
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
    this.errorMessage = '';
    this.successMessage = '';

    const passwordData: PasswordChangeRequest = {
      currentPassword: this.passwordForm.get('currentPassword')?.value,
      newPassword: this.passwordForm.get('newPassword')?.value
    };

    this.authService.changePassword(passwordData).subscribe({
      next: () => {
        this.successMessage = 'Mot de passe changé avec succès!';
        this.notificationService.showSuccess('Mot de passe changé avec succès!');
        this.passwordForm.reset();
        this.showPasswordSection = false;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erreur lors du changement de mot de passe.';
        this.notificationService.showError(this.errorMessage);
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  private buildUpdateRequest(): UserUpdateRequest {
    const formData = this.profileForm.value;
    const baseRequest: UserUpdateRequest = {
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      telephone: formData.telephone,
      adresse: formData.adresse
    };

    // Add role-specific data
    if (this.isAgency()) {
      return {
        ...baseRequest,
        nomAgence: formData.nomAgence,
        numeroLicence: formData.numeroLicence,
        siteWeb: formData.siteWeb || undefined,
        nombreEmployes: formData.nombreEmployes || undefined,
        zonesCouverture: formData.zonesCouverture || undefined
      };
    }

    return baseRequest;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  private markPasswordFormTouched(): void {
    Object.keys(this.passwordForm.controls).forEach(key => {
      const control = this.passwordForm.get(key);
      control?.markAsTouched();
    });
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

  getClientAbonne(): ClientAbonne | null {
    return this.isClientAbonne() ? this.user as ClientAbonne : null;
  }

  getAgency(): AgenceImmobiliere | null {
    return this.isAgency() ? this.user as AgenceImmobiliere : null;
  }

  getAdmin(): Administrateur | null {
    return this.isAdmin() ? this.user as Administrateur : null;
  }

  // Subscription methods
  getSubscriptionClass(): string {
    const subscription = this.getClientAbonne()?.subscriptionType;
    return subscription?.toLowerCase() || 'basic';
  }

  getSubscriptionDisplayName(): string {
    switch (this.getClientAbonne()?.subscriptionType) {
      case 'BASIC': return 'Basique';
      case 'PREMIUM': return 'Premium';
      case 'VIP': return 'VIP';
      default: return 'Basique';
    }
  }

  getSubscriptionDescription(): string {
    switch (this.getClientAbonne()?.subscriptionType) {
      case 'BASIC': return 'Accès aux fonctionnalités de base';
      case 'PREMIUM': return 'Fonctionnalités avancées et support prioritaire';
      case 'VIP': return 'Accès complet avec services personnalisés';
      default: return '';
    }
  }

  getSearchesUsed(): number {
    const client = this.getClientAbonne();
    if (!client) return 0;
    return (client as any).searchesUsed || 0;
  }

  getUsagePercentage(): number {
    const client = this.getClientAbonne();
    if (!client || !client.searchLimit) return 0;
    return (this.getSearchesUsed() / client.searchLimit) * 100;
  }

  // Admin methods
  getAdminLevelClass(): string {
    return this.getAdmin()?.adminLevel?.toLowerCase() || '';
  }

  getAdminLevelDisplay(): string {
    switch (this.getAdmin()?.adminLevel) {
      case 'SUPPORT': return 'Support Client';
      case 'MODERATOR': return 'Modérateur';
      case 'SUPER_ADMIN': return 'Super Administrateur';
      default: return 'Administrateur';
    }
  }

  getAdminLevelIcon(): string {
    switch (this.getAdmin()?.adminLevel) {
      case 'SUPPORT': return 'support_agent';
      case 'MODERATOR': return 'gavel';
      case 'SUPER_ADMIN': return 'supervisor_account';
      default: return 'admin_panel_settings';
    }
  }

  getAdminPermissions(): string[] {
    switch (this.getAdmin()?.adminLevel) {
      case 'SUPPORT':
        return ['Assistance utilisateurs', 'Consultation des statistiques'];
      case 'MODERATOR':
        return ['Gestion des utilisateurs', 'Vérification des agences', 'Modération des contenus'];
      case 'SUPER_ADMIN':
        return ['Administration complète', 'Configuration système', 'Gestion des administrateurs'];
      default:
        return ['Permissions de base'];
    }
  }

  showVerificationProcess(): void {
    const message = `
    <div class="verification-process-info">
      <h3>Processus de Vérification des Agences</h3>
      <div class="verification-steps">
        <div class="step">
          <span class="step-number">1</span>
          <div class="step-content">
            <h4>Soumission des documents</h4>
            <p>Votre agence a été enregistrée avec les informations fournies.</p>
          </div>
        </div>
        <div class="step">
          <span class="step-number">2</span>
          <div class="step-content">
            <h4>Vérification administrative</h4>
            <p>Notre équipe vérifie vos informations et documents.</p>
          </div>
        </div>
        <div class="step">
          <span class="step-number">3</span>
          <div class="step-content">
            <h4>Validation finale</h4>
            <p>Une fois approuvée, votre agence recevra le statut "Vérifiée".</p>
          </div>
        </div>
      </div>
      <div class="verification-benefits">
        <h4>Avantages de la vérification :</h4>
        <ul>
          <li>Badge "Agence Vérifiée" visible</li>
          <li>Confiance accrue des clients</li>
          <li>Accès aux fonctionnalités premium</li>
          <li>Meilleur référencement</li>
        </ul>
      </div>
      <p><strong>Délai habituel :</strong> 2-5 jours ouvrables</p>
    </div>
    `;
    
    this.notificationService.showInfo(message);
  }
}