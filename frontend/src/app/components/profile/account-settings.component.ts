import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AuthUser } from '../../core/models';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../core/notification.service';

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
  systemUpdates: boolean;
  propertyAlerts: boolean;
  subscriptionUpdates: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'contacts';
  showEmail: boolean;
  showPhone: boolean;
  allowContactRequests: boolean;
  dataSharing: boolean;
  analyticsTracking: boolean;
}

interface DisplaySettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'fr' | 'en' | 'ar';
  timezone: string;
  dateFormat: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
  currency: 'TND' | 'EUR' | 'USD';
}

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="account-settings-container">
      <!-- Header -->
      <div class="settings-header">
        <div class="header-content">
          <h1>
            <i class="material-icons">settings</i>
            Paramètres du compte
          </h1>
          <p>Gérez vos préférences et paramètres de confidentialité</p>
        </div>
        <div class="header-actions">
          <button type="button" class="btn btn-secondary" (click)="resetToDefaults()">
            <i class="material-icons">restore</i>
            Réinitialiser
          </button>
          <button type="button" class="btn btn-primary" (click)="saveAllSettings()" [disabled]="isLoading">
            <i class="material-icons" *ngIf="!isLoading">save</i>
            <div class="spinner" *ngIf="isLoading"></div>
            {{ isLoading ? 'Sauvegarde...' : 'Sauvegarder' }}
          </button>
        </div>
      </div>

      <div class="settings-grid">
        <!-- Notification Settings -->
        <div class="settings-card">
          <div class="card-header">
            <h2>
              <i class="material-icons">notifications</i>
              Notifications
            </h2>
            <p>Choisissez comment et quand vous souhaitez être notifié</p>
          </div>
          <div class="card-content">
            <form [formGroup]="notificationForm">
              <div class="settings-section">
                <h3>Communications générales</h3>
                <div class="setting-item">
                  <div class="setting-info">
                    <label>Notifications par email</label>
                    <span>Recevez des notifications importantes par email</span>
                  </div>
                  <div class="toggle-switch">
                    <input type="checkbox" id="emailNotifications" formControlName="emailNotifications">
                    <label for="emailNotifications" class="toggle-slider"></label>
                  </div>
                </div>
                
                <div class="setting-item">
                  <div class="setting-info">
                    <label>Notifications SMS</label>
                    <span>Alertes urgentes par SMS</span>
                  </div>
                  <div class="toggle-switch">
                    <input type="checkbox" id="smsNotifications" formControlName="smsNotifications">
                    <label for="smsNotifications" class="toggle-slider"></label>
                  </div>
                </div>
                
                <div class="setting-item">
                  <div class="setting-info">
                    <label>Notifications push</label>
                    <span>Notifications dans votre navigateur</span>
                  </div>
                  <div class="toggle-switch">
                    <input type="checkbox" id="pushNotifications" formControlName="pushNotifications">
                    <label for="pushNotifications" class="toggle-slider"></label>
                  </div>
                </div>
              </div>

              <div class="settings-section">
                <h3>Contenu et marketing</h3>
                <div class="setting-item">
                  <div class="setting-info">
                    <label>Emails marketing</label>
                    <span>Offres spéciales et nouveautés</span>
                  </div>
                  <div class="toggle-switch">
                    <input type="checkbox" id="marketingEmails" formControlName="marketingEmails">
                    <label for="marketingEmails" class="toggle-slider"></label>
                  </div>
                </div>

                <div class="setting-item" *ngIf="isClientAbonne()">
                  <div class="setting-info">
                    <label>Alertes immobilières</label>
                    <span>Nouveaux biens correspondant à vos critères</span>
                  </div>
                  <div class="toggle-switch">
                    <input type="checkbox" id="propertyAlerts" formControlName="propertyAlerts">
                    <label for="propertyAlerts" class="toggle-slider"></label>
                  </div>
                </div>

                <div class="setting-item" *ngIf="isClientAbonne()">
                  <div class="setting-info">
                    <label>Mises à jour d'abonnement</label>
                    <span>Changements de plan et renouvellements</span>
                  </div>
                  <div class="toggle-switch">
                    <input type="checkbox" id="subscriptionUpdates" formControlName="subscriptionUpdates">
                    <label for="subscriptionUpdates" class="toggle-slider"></label>
                  </div>
                </div>
              </div>

              <div class="settings-section">
                <h3>Sécurité et système</h3>
                <div class="setting-item">
                  <div class="setting-info">
                    <label>Alertes de sécurité</label>
                    <span>Connexions suspectes et changements de compte</span>
                  </div>
                  <div class="toggle-switch">
                    <input type="checkbox" id="securityAlerts" formControlName="securityAlerts">
                    <label for="securityAlerts" class="toggle-slider"></label>
                  </div>
                </div>
                
                <div class="setting-item">
                  <div class="setting-info">
                    <label>Mises à jour système</label>
                    <span>Nouvelles fonctionnalités et maintenances</span>
                  </div>
                  <div class="toggle-switch">
                    <input type="checkbox" id="systemUpdates" formControlName="systemUpdates">
                    <label for="systemUpdates" class="toggle-slider"></label>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        <!-- Privacy Settings -->
        <div class="settings-card">
          <div class="card-header">
            <h2>
              <i class="material-icons">privacy_tip</i>
              Confidentialité
            </h2>
            <p>Contrôlez qui peut voir vos informations</p>
          </div>
          <div class="card-content">
            <form [formGroup]="privacyForm">
              <div class="settings-section">
                <h3>Visibilité du profil</h3>
                <div class="setting-item">
                  <div class="setting-info">
                    <label>Qui peut voir mon profil</label>
                    <span>Contrôlez la visibilité de vos informations</span>
                  </div>
                  <select formControlName="profileVisibility" class="select-input">
                    <option value="public">Public</option>
                    <option value="contacts">Mes contacts seulement</option>
                    <option value="private">Privé</option>
                  </select>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <label>Afficher mon email</label>
                    <span>Permettre aux autres utilisateurs de voir votre email</span>
                  </div>
                  <div class="toggle-switch">
                    <input type="checkbox" id="showEmail" formControlName="showEmail">
                    <label for="showEmail" class="toggle-slider"></label>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <label>Afficher mon téléphone</label>
                    <span>Permettre aux autres utilisateurs de voir votre téléphone</span>
                  </div>
                  <div class="toggle-switch">
                    <input type="checkbox" id="showPhone" formControlName="showPhone">
                    <label for="showPhone" class="toggle-slider"></label>
                  </div>
                </div>
              </div>

              <div class="settings-section">
                <h3>Permissions et données</h3>
                <div class="setting-item">
                  <div class="setting-info">
                    <label>Autoriser les demandes de contact</label>
                    <span>Permettre aux autres utilisateurs de vous contacter</span>
                  </div>
                  <div class="toggle-switch">
                    <input type="checkbox" id="allowContactRequests" formControlName="allowContactRequests">
                    <label for="allowContactRequests" class="toggle-slider"></label>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <label>Partage de données avec partenaires</label>
                    <span>Améliorer les services grâce au partage de données anonymes</span>
                  </div>
                  <div class="toggle-switch">
                    <input type="checkbox" id="dataSharing" formControlName="dataSharing">
                    <label for="dataSharing" class="toggle-slider"></label>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <label>Suivi analytique</label>
                    <span>Permettre l'analyse d'usage pour améliorer l'expérience</span>
                  </div>
                  <div class="toggle-switch">
                    <input type="checkbox" id="analyticsTracking" formControlName="analyticsTracking">
                    <label for="analyticsTracking" class="toggle-slider"></label>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        <!-- Display Settings -->
        <div class="settings-card">
          <div class="card-header">
            <h2>
              <i class="material-icons">display_settings</i>
              Affichage
            </h2>
            <p>Personnalisez l'apparence et le format</p>
          </div>
          <div class="card-content">
            <form [formGroup]="displayForm">
              <div class="settings-section">
                <h3>Interface</h3>
                <div class="setting-item">
                  <div class="setting-info">
                    <label>Thème</label>
                    <span>Choisissez l'apparence de l'interface</span>
                  </div>
                  <select formControlName="theme" class="select-input">
                    <option value="light">Clair</option>
                    <option value="dark">Sombre</option>
                    <option value="auto">Automatique</option>
                  </select>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <label>Langue</label>
                    <span>Langue d'affichage de l'interface</span>
                  </div>
                  <select formControlName="language" class="select-input">
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
              </div>

              <div class="settings-section">
                <h3>Formats</h3>
                <div class="setting-item">
                  <div class="setting-info">
                    <label>Fuseau horaire</label>
                    <span>Zone horaire pour l'affichage des dates</span>
                  </div>
                  <select formControlName="timezone" class="select-input">
                    <option value="Africa/Tunis">Tunis (UTC+1)</option>
                    <option value="Europe/Paris">Paris (UTC+1)</option>
                    <option value="Europe/London">Londres (UTC+0)</option>
                    <option value="America/New_York">New York (UTC-5)</option>
                  </select>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <label>Format de date</label>
                    <span>Comment afficher les dates</span>
                  </div>
                  <select formControlName="dateFormat" class="select-input">
                    <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                    <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                    <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                  </select>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <label>Devise</label>
                    <span>Devise d'affichage des prix</span>
                  </div>
                  <select formControlName="currency" class="select-input">
                    <option value="TND">Dinar Tunisien (TND)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="USD">Dollar US (USD)</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
        </div>

        <!-- Account Actions -->
        <div class="settings-card danger-card">
          <div class="card-header">
            <h2>
              <i class="material-icons">warning</i>
              Actions sur le compte
            </h2>
            <p>Actions importantes et irréversibles</p>
          </div>
          <div class="card-content">
            <div class="danger-actions">
              <div class="action-item">
                <div class="action-info">
                  <h4>Télécharger mes données</h4>
                  <p>Téléchargez une copie de toutes vos données personnelles</p>
                </div>
                <button type="button" class="btn btn-outline" (click)="downloadData()">
                  <i class="material-icons">download</i>
                  Télécharger
                </button>
              </div>

              <div class="action-item">
                <div class="action-info">
                  <h4>Désactiver le compte</h4>
                  <p>Désactivez temporairement votre compte</p>
                </div>
                <button type="button" class="btn btn-warning" (click)="deactivateAccount()">
                  <i class="material-icons">pause</i>
                  Désactiver
                </button>
              </div>

              <div class="action-item">
                <div class="action-info">
                  <h4>Supprimer le compte</h4>
                  <p>Supprimez définitivement votre compte et toutes vos données</p>
                </div>
                <button type="button" class="btn btn-danger" (click)="deleteAccount()">
                  <i class="material-icons">delete_forever</i>
                  Supprimer
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
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {
  user: AuthUser | null = null;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  notificationForm!: FormGroup;
  privacyForm!: FormGroup;
  displayForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUser;
    this.initializeForms();
    this.loadSettings();
  }

  private initializeForms(): void {
    this.notificationForm = this.fb.group({
      emailNotifications: [true],
      smsNotifications: [false],
      pushNotifications: [true],
      marketingEmails: [false],
      securityAlerts: [true],
      systemUpdates: [true],
      propertyAlerts: [true],
      subscriptionUpdates: [true]
    });

    this.privacyForm = this.fb.group({
      profileVisibility: ['contacts'],
      showEmail: [false],
      showPhone: [false],
      allowContactRequests: [true],
      dataSharing: [false],
      analyticsTracking: [true]
    });

    this.displayForm = this.fb.group({
      theme: ['light'],
      language: ['fr'],
      timezone: ['Africa/Tunis'],
      dateFormat: ['dd/mm/yyyy'],
      currency: ['TND']
    });
  }

  private loadSettings(): void {
    // Load settings from localStorage or API
    const savedNotificationSettings = localStorage.getItem('notificationSettings');
    const savedPrivacySettings = localStorage.getItem('privacySettings');
    const savedDisplaySettings = localStorage.getItem('displaySettings');

    if (savedNotificationSettings) {
      this.notificationForm.patchValue(JSON.parse(savedNotificationSettings));
    }

    if (savedPrivacySettings) {
      this.privacyForm.patchValue(JSON.parse(savedPrivacySettings));
    }

    if (savedDisplaySettings) {
      this.displayForm.patchValue(JSON.parse(savedDisplaySettings));
    }
  }

  saveAllSettings(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Save to localStorage (in a real app, this would be an API call)
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(this.notificationForm.value));
      localStorage.setItem('privacySettings', JSON.stringify(this.privacyForm.value));
      localStorage.setItem('displaySettings', JSON.stringify(this.displayForm.value));

      // Simulate API call delay
      setTimeout(() => {
        this.successMessage = 'Paramètres sauvegardés avec succès!';
        this.notificationService.showSuccess('Paramètres sauvegardés avec succès!');
        this.isLoading = false;
      }, 1000);
    } catch (error) {
      this.errorMessage = 'Erreur lors de la sauvegarde des paramètres.';
      this.notificationService.showError(this.errorMessage);
      this.isLoading = false;
    }
  }

  resetToDefaults(): void {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres aux valeurs par défaut ?')) {
      this.initializeForms();
      localStorage.removeItem('notificationSettings');
      localStorage.removeItem('privacySettings');
      localStorage.removeItem('displaySettings');
      this.notificationService.showInfo('Paramètres réinitialisés aux valeurs par défaut.');
    }
  }

  downloadData(): void {
    this.notificationService.showInfo('Préparation de vos données... Vous recevrez un email avec le lien de téléchargement.');
    // Implement data download logic
  }

  deactivateAccount(): void {
    const confirmed = confirm(
      'Êtes-vous sûr de vouloir désactiver votre compte ? ' +
      'Vous pourrez le réactiver en vous reconnectant.'
    );
    
    if (confirmed) {
      this.notificationService.showWarning('Votre compte sera désactivé dans quelques minutes.');
      // Implement account deactivation logic
    }
  }

  deleteAccount(): void {
    const confirmed = confirm(
      'ATTENTION : Cette action est irréversible ! ' +
      'Toutes vos données seront définitivement supprimées. ' +
      'Tapez "SUPPRIMER" pour confirmer.'
    );
    
    if (confirmed) {
      const confirmText = prompt('Tapez "SUPPRIMER" pour confirmer la suppression définitive :');
      if (confirmText === 'SUPPRIMER') {
        this.notificationService.showError('Suppression du compte initiée. Un email de confirmation a été envoyé.');
        // Implement account deletion logic
      }
    }
  }

  isClientAbonne(): boolean {
    return this.user?.userType === 'CLIENT_ABONNE';
  }
}