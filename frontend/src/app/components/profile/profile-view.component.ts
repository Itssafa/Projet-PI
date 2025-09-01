import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthUser, UserType, ClientAbonne, AgenceImmobiliere, Administrateur } from '../../core/models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-view-container">
      <!-- Header Section -->
      <div class="profile-header">
        <div class="profile-avatar">
          <div class="avatar-circle">
            {{ getInitials() }}
          </div>
          <div class="online-indicator"></div>
        </div>
        <div class="profile-info">
          <h1 class="profile-name">{{ user?.prenom }} {{ user?.nom }}</h1>
          <p class="profile-role">{{ getUserRoleDisplayName() }}</p>
          <div class="profile-badges">
            <span class="badge status-badge" [ngClass]="getStatusBadgeClass()">
              <i class="material-icons">{{ getStatusIcon() }}</i>
              {{ getStatusText() }}
            </span>
            <span class="badge verification-badge" *ngIf="showVerificationBadge()" [ngClass]="getVerificationBadgeClass()">
              <i class="material-icons">{{ getVerificationIcon() }}</i>
              {{ getVerificationText() }}
            </span>
          </div>
        </div>
      </div>

      <!-- Basic Information Card -->
      <div class="info-card">
        <div class="card-header">
          <h2>
            <i class="material-icons">person</i>
            Informations personnelles
          </h2>
        </div>
        <div class="card-content">
          <div class="info-grid">
            <div class="info-item">
              <label>Nom complet</label>
              <span>{{ user?.prenom }} {{ user?.nom }}</span>
            </div>
            <div class="info-item">
              <label>Email</label>
              <div class="email-info">
                <span>{{ user?.email }}</span>
                <i class="material-icons verification-icon" 
                   [ngClass]="user?.emailVerified ? 'verified' : 'unverified'">
                  {{ user?.emailVerified ? 'verified' : 'error' }}
                </i>
              </div>
            </div>
            <div class="info-item">
              <label>Téléphone</label>
              <span>{{ formatPhoneNumber(user?.telephone) }}</span>
            </div>
            <div class="info-item">
              <label>Adresse</label>
              <span>{{ user?.adresse }}</span>
            </div>
            <div class="info-item">
              <label>Date d'inscription</label>
              <span>{{ formatDate(user?.dateInscription) }}</span>
            </div>
            <div class="info-item">
              <label>Dernière connexion</label>
              <span>{{ getLastConnectionDate() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Role-Specific Information -->
      <div class="info-card" *ngIf="isClientAbonne()">
        <div class="card-header">
          <h2>
            <i class="material-icons">star</i>
            Abonnement
          </h2>
        </div>
        <div class="card-content">
          <div class="subscription-info">
            <div class="subscription-plan">
              <div class="plan-badge" [ngClass]="getSubscriptionClass()">
                {{ getClientAbonne()?.subscriptionType }}
              </div>
              <p class="plan-description">{{ getSubscriptionDescription() }}</p>
            </div>
            <div class="subscription-stats">
              <div class="stat-item">
                <span class="stat-value">{{ getClientAbonne()?.searchLimit || 0 }}</span>
                <span class="stat-label">Recherches/mois</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ getSearchesUsed() }}</span>
                <span class="stat-label">Utilisées</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ getRemainingSearches() }}</span>
                <span class="stat-label">Restantes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="info-card" *ngIf="isAgency()">
        <div class="card-header">
          <h2>
            <i class="material-icons">business</i>
            Informations de l'agence
          </h2>
        </div>
        <div class="card-content">
          <div class="info-grid">
            <div class="info-item">
              <label>Nom de l'agence</label>
              <span>{{ getAgency()?.nomAgence }}</span>
            </div>
            <div class="info-item">
              <label>Numéro de licence</label>
              <span>{{ getAgency()?.numeroLicence }}</span>
            </div>
            <div class="info-item">
              <label>Site web</label>
              <a *ngIf="getAgency()?.siteWeb" [href]="getAgency()?.siteWeb" target="_blank" class="website-link">
                {{ getAgency()?.siteWeb }}
              </a>
              <span *ngIf="!getAgency()?.siteWeb">Non renseigné</span>
            </div>
            <div class="info-item">
              <label>Nombre d'employés</label>
              <span>{{ getAgency()?.nombreEmployes || 'Non renseigné' }}</span>
            </div>
            <div class="info-item">
              <label>Zones de couverture</label>
              <span>{{ getAgency()?.zonesCouverture || 'Non renseigné' }}</span>
            </div>
            <div class="info-item">
              <label>Statut de vérification</label>
              <div class="verification-status">
                <span class="verification-badge" [ngClass]="getAgencyVerificationClass()">
                  <i class="material-icons">{{ getAgencyVerificationIcon() }}</i>
                  {{ getAgencyVerificationText() }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="info-card" *ngIf="isAdmin()">
        <div class="card-header">
          <h2>
            <i class="material-icons">admin_panel_settings</i>
            Informations administrateur
          </h2>
        </div>
        <div class="card-content">
          <div class="info-grid">
            <div class="info-item">
              <label>Niveau d'administration</label>
              <span class="admin-level" [ngClass]="getAdminLevelClass()">
                {{ getAdminLevelDisplay() }}
              </span>
            </div>
            <div class="info-item">
              <label>Permissions</label>
              <div class="permissions-list">
                <span class="permission-tag" *ngFor="let permission of getAdminPermissions()">
                  {{ permission }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Account Status Card -->
      <div class="info-card">
        <div class="card-header">
          <h2>
            <i class="material-icons">security</i>
            Sécurité du compte
          </h2>
        </div>
        <div class="card-content">
          <div class="security-items">
            <div class="security-item">
              <div class="security-info">
                <i class="material-icons">email</i>
                <div>
                  <span class="security-title">Email vérifié</span>
                  <span class="security-status" [ngClass]="user?.emailVerified ? 'verified' : 'pending'">
                    {{ user?.emailVerified ? 'Vérifié' : 'En attente' }}
                  </span>
                </div>
              </div>
              <i class="material-icons status-icon" [ngClass]="user?.emailVerified ? 'verified' : 'pending'">
                {{ user?.emailVerified ? 'check_circle' : 'pending' }}
              </i>
            </div>
            <div class="security-item">
              <div class="security-info">
                <i class="material-icons">lock</i>
                <div>
                  <span class="security-title">Mot de passe</span>
                  <span class="security-status">Configuré</span>
                </div>
              </div>
              <i class="material-icons status-icon verified">check_circle</i>
            </div>
            <div class="security-item">
              <div class="security-info">
                <i class="material-icons">account_circle</i>
                <div>
                  <span class="security-title">Compte actif</span>
                  <span class="security-status verified">Actif</span>
                </div>
              </div>
              <i class="material-icons status-icon verified">check_circle</i>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./profile-view.component.scss']
})
export class ProfileViewComponent implements OnInit {
  @Input() user: AuthUser | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    console.log('ProfileView component initializing...');
    if (!this.user) {
      this.user = this.authService.currentUser;
      console.log('User loaded from AuthService:', this.user);
    }
  }

  getInitials(): string {
    if (!this.user) return 'U';
    const firstInitial = this.user.prenom?.charAt(0)?.toUpperCase() || '';
    const lastInitial = this.user.nom?.charAt(0)?.toUpperCase() || '';
    return firstInitial + lastInitial;
  }

  getUserRoleDisplayName(): string {
    return this.authService.getUserRoleDisplayName();
  }

  getStatusBadgeClass(): string {
    return this.user?.enabled ? 'active' : 'inactive';
  }

  getStatusIcon(): string {
    return this.user?.enabled ? 'check_circle' : 'block';
  }

  getStatusText(): string {
    return this.user?.enabled ? 'Actif' : 'Inactif';
  }

  showVerificationBadge(): boolean {
    return this.user?.userType === 'AGENCE_IMMOBILIERE' || 
           (this.user?.userType === 'UTILISATEUR' && !this.user?.emailVerified);
  }

  getVerificationBadgeClass(): string {
    if (this.user?.userType === 'AGENCE_IMMOBILIERE') {
      return this.authService.isAgencyVerified() ? 'verified' : 'pending';
    }
    return this.user?.emailVerified ? 'verified' : 'pending';
  }

  getVerificationIcon(): string {
    if (this.user?.userType === 'AGENCE_IMMOBILIERE') {
      return this.authService.isAgencyVerified() ? 'verified_user' : 'hourglass_empty';
    }
    return this.user?.emailVerified ? 'mark_email_read' : 'mark_email_unread';
  }

  getVerificationText(): string {
    if (this.user?.userType === 'AGENCE_IMMOBILIERE') {
      return this.authService.isAgencyVerified() ? 'Agence vérifiée' : 'Vérification en cours';
    }
    return this.user?.emailVerified ? 'Email vérifié' : 'Email non vérifié';
  }

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

  getSubscriptionClass(): string {
    const subscription = this.getClientAbonne()?.subscriptionType;
    return subscription?.toLowerCase() || 'basic';
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

  getRemainingSearches(): number {
    const client = this.getClientAbonne();
    if (!client) return 0;
    const searchLimit = client.searchLimit || 0;
    const searchesUsed = (client as any).searchesUsed || 0;
    return searchLimit - searchesUsed;
  }

  getAgencyVerificationClass(): string {
    return this.getAgency()?.verified ? 'verified' : 'pending';
  }

  getAgencyVerificationIcon(): string {
    return this.getAgency()?.verified ? 'verified' : 'pending';
  }

  getAgencyVerificationText(): string {
    return this.getAgency()?.verified ? 'Vérifiée' : 'En attente de vérification';
  }

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

  formatPhoneNumber(phone: string | undefined): string {
    if (!phone) return 'Non renseigné';
    // Format Tunisia phone number: XX XXX XXX
    return phone.replace(/(\d{2})(\d{3})(\d{3})/, '$1 $2 $3');
  }

  getLastConnectionDate(): string {
    const lastConnection = (this.user as any)?.derniereConnexion;
    return this.formatDate(lastConnection);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Non disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}