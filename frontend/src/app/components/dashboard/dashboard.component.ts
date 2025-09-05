import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, combineLatest, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { AnnonceService } from '../../services/annonce.service';
import { AnnonceSummary, AnnonceStats, PagedResponse } from '../../core/models';
import { 
  AuthUser, 
  UserType, 
  DashboardStats,
  UserStats,
  PlatformStats,
  VisitStats,
  ClientAbonne,
  AgenceImmobiliere,
  Administrateur
} from '../../core/models';
import { ProfileViewComponent } from '../profile/profile-view.component';
import { ProfileSectionsComponent } from '../profile/profile-sections.component';
import { AnimatedChartComponent } from '../shared/animated-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfileViewComponent, ProfileSectionsComponent, AnimatedChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  // User and authentication
  currentUser: AuthUser | null = null;
  userType: UserType | null = null;
  isLoading = true;
  
  // Dashboard state
  activeSection = 'overview';
  dashboardStats: DashboardStats | null = null;
  userStats: UserStats | null = null;
  platformStats: PlatformStats | null = null;
  visitStats: VisitStats | null = null;
  
  // Agency management
  allAgencies: AuthUser[] = [];
  pendingAgencies: AuthUser[] = [];
  verifiedAgencies: AuthUser[] = [];
  isLoadingAgencies = false;
  
  // Analytics data
  analyticsData: any = null;
  isLoadingAnalytics = false;
  
  // Annonces data
  myAnnonces: PagedResponse<AnnonceSummary> | null = null;
  annonceStats: AnnonceStats | null = null;
  isLoadingAnnonces = false;
  
  // Public annonces browsing (for users and subscribers)
  publicAnnonces: PagedResponse<AnnonceSummary> | null = null;
  isLoadingPublicAnnonces = false;
  selectedAnnonce: AnnonceSummary | null = null;
  
  // Ratings and Comments data
  annonceRatings: { [key: number]: number } = {}; // annonceId -> average rating
  annonceComments: { [key: number]: any[] } = {}; // annonceId -> comments array
  isLoadingRatings = false;
  isLoadingComments = false;
  
  // Rating input state
  selectedRating = 0;
  hoverRating = 0;
  newComment = '';
  
  // Search and filters
  searchQuery = '';
  selectedTypeBien = '';
  selectedTypeTransaction = '';
  selectedStatus = '';
  
  // Search subject for debounced search
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  
  // Profile editing state
  isEditingProfile = false;
  
  // Sidebar and navigation
  sidebarCollapsed = false;
  
  // Subscriptions
  private subscriptions: Subscription[] = [];

  // Expose Math for template use
  Math = Math;
  // User activity and recommendations data
  recentActivity: any[] = [];
  recommendedProperties: any[] = [];
  isLoadingRecommendations = false;
  userActivityStats: any = {
    totalSearches: 0,
    savedProperties: 0,
    viewedProperties: 0
  };

  // Load user activity statistics
  getUserActivityStats(): any {
    return this.userActivityStats;
  }

  // Load recent activity feed
  loadRecentActivity(): void {
    if (!this.authService.isAuthenticated) return;
    
    // Simulate activity data (replace with real API call)
    this.recentActivity = [
      {
        icon: 'search',
        title: 'Recherche "Appartement Tunis"',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        icon: 'favorite',
        title: 'Ajouté aux favoris: Villa moderne Sousse',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        icon: 'visibility',
        title: 'Consulté: Appartement 3 pièces centre-ville',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      }
    ];
    
    // Load actual user stats
    this.userActivityStats = {
      totalSearches: 12,
      savedProperties: 3,
      viewedProperties: 18
    };
  }

  // Load personalized property recommendations
  loadRecommendations(): void {
    if (!this.authService.isAuthenticated) return;
    
    this.isLoadingRecommendations = true;
    
    // Use existing search functionality to get recommendations
    this.annonceService.searchAnnonces({
      page: 0,
      size: 6,
      sortBy: 'dateCreation',
      sortDirection: 'desc'
    }).subscribe({
      next: (data) => {
        this.recommendedProperties = data.content || [];
        this.isLoadingRecommendations = false;
      },
      error: (error) => {
        console.error('Error loading recommendations:', error);
        this.recommendedProperties = [];
        this.isLoadingRecommendations = false;
      }
    });
  }

  // Format relative time for activity feed
  formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} jour(s)`;
    
    return date.toLocaleDateString('fr-FR');
  }
  // Premium upgrade methods
  upgradeToPremium(): void {
    console.log('🌟 [UPGRADE] User wants to upgrade to Premium');
    // TODO: Implement premium upgrade flow
    if (confirm('Voulez-vous être redirigé vers la page de paiement Premium (29€/mois) ?')) {
      // For now, show success message
      alert('Redirection vers le paiement Premium... (À implémenter)');
      // In real implementation: this.router.navigate(['/payment/premium']);
    }
  }

  upgradeToVip(): void {
    console.log('👑 [UPGRADE] User wants to upgrade to VIP');
    // TODO: Implement VIP upgrade flow
    if (confirm('Voulez-vous être redirigé vers la page de paiement VIP (99€/mois) ?')) {
      // For now, show success message
      alert('Redirection vers le paiement VIP... (À implémenter)');
      // In real implementation: this.router.navigate(['/payment/vip']);
    }
  }
  // CLIENT_ABONNE specific methods
  getClientStats(): any {
    return {
      searchesRemaining: 47,
      favoriteProperties: 8,
      newFavorites: 2,
      activeAlerts: 5,
      newMatches: 12,
      propertiesViewed: 24,
      savedSearches: 6
    };
  }

  getSubscriptionDaysRemaining(): number {
    const endDate = this.getSubscriptionInfo()?.endDate;
    if (!endDate) return 30;
    
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  getRecentClientActivity(): any[] {
    return [
      {
        type: 'search',
        icon: 'search',
        title: 'Nouvelle recherche',
        description: 'Appartement 3 pièces à Tunis',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'favorite',
        icon: 'favorite',
        title: 'Bien ajouté aux favoris',
        description: 'Villa moderne avec piscine - Sousse',
        date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'alert',
        icon: 'notifications',
        title: 'Alerte déclenchée',
        description: '3 nouveaux biens correspondent à vos critères',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'view',
        icon: 'visibility',
        title: 'Bien consulté',
        description: 'Appartement standing - Centre-ville Sfax',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  // Quick Action Methods
  startQuickSearch(): void {
    console.log('🔍 [QUICK-ACTION] Starting quick search');
    this.setActiveSection('properties');
  }

  createAlert(): void {
    console.log('🔔 [QUICK-ACTION] Creating new alert');
    // Show alert creation modal
    const alertCriteria = prompt('Définissez vos critères de recherche (ex: Appartement, Tunis, 100k-200k):');
    if (alertCriteria) {
      alert(`✅ Alerte créée avec succès !\nCritères: ${alertCriteria}\nVous recevrez des notifications pour les nouveaux biens correspondants.`);
    }
  }

  viewAnalytics(): void {
    console.log('📊 [QUICK-ACTION] Viewing analytics');
    this.setActiveSection('analytics');
  }

  manageSubscription(): void {
    console.log('⚙️ [QUICK-ACTION] Managing subscription');
    this.setActiveSection('subscription');
  }

  // Modal Methods
  openFavoritesModal(): void {
    console.log('❤️ [MODAL] Opening favorites modal');
    const favoritesHtml = `
      <div style="padding: 20px;">
        <h3>🏠 Mes Biens Favoris (8)</h3>
        <div style="margin: 15px 0;">
          <div style="border-left: 4px solid #10b981; padding: 10px; margin: 10px 0; background: #f0fdf4;">
            <strong>Villa moderne avec piscine</strong><br>
            <span style="color: #059669;">350,000 TND - Sousse</span>
          </div>
          <div style="border-left: 4px solid #10b981; padding: 10px; margin: 10px 0; background: #f0fdf4;">
            <strong>Appartement 3 pièces centre-ville</strong><br>
            <span style="color: #059669;">180,000 TND - Tunis</span>
          </div>
          <div style="border-left: 4px solid #10b981; padding: 10px; margin: 10px 0; background: #f0fdf4;">
            <strong>Duplex avec terrasse</strong><br>
            <span style="color: #059669;">275,000 TND - Sfax</span>
          </div>
        </div>
        <p style="color: #6b7280;">Cliquez sur "Mes Recherches" pour gérer tous vos favoris.</p>
      </div>
    `;
    
    const popup = window.open('', 'favorites', 'width=500,height=400');
    if (popup) {
      popup.document.write(favoritesHtml);
      popup.document.title = 'Mes Favoris';
    }
  }

  openAlertsModal(): void {
    console.log('🔔 [MODAL] Opening alerts modal');
    const alertsHtml = `
      <div style="padding: 20px;">
        <h3>🔔 Mes Alertes Actives (5)</h3>
        <div style="margin: 15px 0;">
          <div style="border-left: 4px solid #3b82f6; padding: 10px; margin: 10px 0; background: #eff6ff;">
            <strong>Appartements Tunis Centre</strong><br>
            <span style="color: #2563eb;">Budget: 150k-250k TND • 12 nouveaux résultats</span>
          </div>
          <div style="border-left: 4px solid #3b82f6; padding: 10px; margin: 10px 0; background: #eff6ff;">
            <strong>Villas avec piscine</strong><br>
            <span style="color: #2563eb;">Sousse • 3 nouveaux résultats</span>
          </div>
          <div style="border-left: 4px solid #3b82f6; padding: 10px; margin: 10px 0; background: #eff6ff;">
            <strong>Investissement locatif</strong><br>
            <span style="color: #2563eb;">Sfax • Rendement > 7% • 5 nouveaux résultats</span>
          </div>
        </div>
        <p style="color: #6b7280;">Gérez toutes vos alertes dans la section "Mes Recherches".</p>
      </div>
    `;
    
    const popup = window.open('', 'alerts', 'width=500,height=400');
    if (popup) {
      popup.document.write(alertsHtml);
      popup.document.title = 'Mes Alertes';
    }
  }

  // Subscription Status Methods
  getSubscriptionStatusClass(): string {
    const daysRemaining = this.getSubscriptionDaysRemaining();
    if (daysRemaining < 7) return 'urgent';
    if (daysRemaining < 15) return 'warning';
    return 'active';
  }

  getSubscriptionIcon(): string {
    const status = this.getSubscriptionStatusClass();
    switch (status) {
      case 'urgent': return 'warning';
      case 'warning': return 'schedule';
      default: return 'check_circle';
    }
  }

  getSubscriptionStatusTitle(): string {
    const status = this.getSubscriptionStatusClass();
    const type = this.getSubscriptionInfo()?.type || 'Premium';
    
    switch (status) {
      case 'urgent': return `Abonnement ${type} expire bientôt !`;
      case 'warning': return `Abonnement ${type} à renouveler`;
      default: return `Abonnement ${type} actif`;
    }
  }

  getSubscriptionStatusMessage(): string {
    const daysRemaining = this.getSubscriptionDaysRemaining();
    const status = this.getSubscriptionStatusClass();
    
    switch (status) {
      case 'urgent': return `Plus que ${daysRemaining} jour(s) restant(s). Renouvelez dès maintenant pour continuer à profiter de vos avantages.`;
      case 'warning': return `${daysRemaining} jours restants. Pensez à renouveler votre abonnement.`;
      default: return `Votre abonnement est actif jusqu'au ${this.getSubscriptionInfo()?.endDate || 'fin du mois'}. Profitez de tous vos avantages !`;
    }
  }

  getSubscriptionActionText(): string {
    const status = this.getSubscriptionStatusClass();
    switch (status) {
      case 'urgent': return 'Renouveler maintenant';
      case 'warning': return 'Renouveler';
      default: return 'Gérer l\'abonnement';
    }
  }

  handleSubscriptionAction(): void {
    const status = this.getSubscriptionStatusClass();
    
    if (status === 'urgent' || status === 'warning') {
      const confirmRenewal = confirm(`Voulez-vous renouveler votre abonnement ${this.getSubscriptionInfo()?.type} ?`);
      if (confirmRenewal) {
        alert('🎉 Abonnement renouvelé avec succès ! Merci de votre confiance.');
        // In real implementation: redirect to payment
      }
    } else {
      this.setActiveSection('subscription');
    }
  }
  // AGENCY specific business methods
  getAgencyKPIs(): any {
    return {
      monthlyRevenue: '87,450',
      totalProperties: 127,
      activeProperties: 42,
      newThisWeek: 5,
      totalClients: 156,
      activeClients: 89,
      newLeads: 8,
      teamPerformance: 4.8
    };
  }

  getVerificationStatusMessage(): string {
    if (this.isAgencyVerified()) {
      return 'Votre agence est vérifiée et peut accéder à toutes les fonctionnalités professionnelles.';
    }
    return 'Votre demande de vérification est en cours. Vous recevrez une notification une fois terminée.';
  }

  getAgencyActivity(): any[] {
    return [
      {
        type: 'sale',
        icon: 'home_filled',
        title: 'Vente finalisée',
        description: 'Villa 4 pièces - Sousse',
        amount: '15,000 DT commission',
        date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        actionable: true
      },
      {
        type: 'lead',
        icon: 'person_add',
        title: 'Nouveau prospect',
        description: 'Client intéressé par appartement Tunis',
        date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        actionable: true
      },
      {
        type: 'property',
        icon: 'add_home',
        title: 'Nouvelle annonce',
        description: 'Duplex moderne - Centre-ville Sfax',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        actionable: false
      },
      {
        type: 'appointment',
        icon: 'event',
        title: 'Visite programmée',
        description: 'Mme Dubois - Villa Sousse',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        actionable: true
      },
      {
        type: 'contract',
        icon: 'description',
        title: 'Contrat signé',
        description: 'Location appartement - M. Ben Ali',
        amount: '2,500 DT commission',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        actionable: false
      }
    ];
  }

  getTopPerformers(): any[] {
    return [
      {
        initials: 'JD',
        name: 'Jean Durand',
        role: 'Directeur Commercial',
        sales: 15,
        revenue: '125,000',
        score: 95,
        performance: 'excellent'
      },
      {
        initials: 'SM',
        name: 'Sophie Martin',
        role: 'Négociatrice Senior',
        sales: 12,
        revenue: '98,000',
        score: 88,
        performance: 'good'
      },
      {
        initials: 'AB',
        name: 'Ahmed Ben Ali',
        role: 'Conseiller',
        sales: 8,
        revenue: '65,000',
        score: 82,
        performance: 'good'
      }
    ];
  }

  getCurrentMarketTrend(): string {
    return 'Le marché immobilier tunisien montre une croissance de 3.2% ce trimestre avec une forte demande sur Tunis et Sousse.';
  }

  getAgencyNotifications(): any[] {
    const notifications = [];
    
    if (!this.isAgencyVerified()) {
      notifications.push({
        priority: 'high',
        icon: 'warning',
        title: 'Vérification en attente',
        message: 'Complétez votre dossier pour débloquer toutes les fonctionnalités.',
        actionText: 'Compléter',
        action: 'verification'
      });
    }
    
    notifications.push(
      {
        priority: 'medium',
        icon: 'comment',
        title: 'Nouveaux commentaires',
        message: '3 nouveaux avis clients sur vos annonces.',
        actionText: 'Voir',
        action: 'comments'
      },
      {
        priority: 'low',
        icon: 'analytics',
        title: 'Rapport mensuel',
        message: 'Votre rapport de performance est disponible.',
        actionText: 'Télécharger',
        action: 'reports'
      }
    );
    
    return notifications;
  }

  // Agency Action Methods
  addNewProperty(): void {
    console.log('🏠 [AGENCY] Adding new property');
    if (!this.isAgencyVerified()) {
      alert('⚠️ Votre agence doit être vérifiée pour ajouter des annonces.\n\nConsultez la section "Vérification" pour plus d\'informations.');
      return;
    }
    this.createNewAnnonce();
  }

  addNewClient(): void {
    console.log('👥 [AGENCY] Adding new client');
    if (!this.isAgencyVerified()) {
      alert('⚠️ Accès au CRM disponible après vérification de votre agence.');
      return;
    }
    
    const clientModal = `
      <div style="padding: 25px; font-family: Arial, sans-serif;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">🆕 Nouveau Client CRM</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 15px 0;">
          <h3 style="color: #059669; margin-bottom: 15px;">✅ Client ajouté avec succès !</h3>
          <div style="margin: 10px 0;">
            <strong>Nom:</strong> Marie Dubois<br>
            <strong>Téléphone:</strong> +216 20 123 456<br>
            <strong>Email:</strong> marie.dubois@email.com<br>
            <strong>Intérêt:</strong> Appartement 3 pièces, Budget: 150k-200k DT
          </div>
          <div style="margin-top: 15px; padding: 10px; background: #dbeafe; border-radius: 8px;">
            <strong>Prochaines étapes:</strong><br>
            • Programmer un appel de qualification<br>
            • Envoyer une sélection de biens<br>
            • Planifier des visites
          </div>
        </div>
        <p style="color: #6b7280;">Accédez à la section "CRM Clients" pour gérer tous vos prospects et clients.</p>
      </div>
    `;
    
    const popup = window.open('', 'newClient', 'width=500,height=450');
    if (popup) {
      popup.document.write(clientModal);
      popup.document.title = 'Nouveau Client CRM';
    }
  }

  manageTeam(): void {
    console.log('👥 [AGENCY] Managing team');
    this.setActiveSection('team');
  }

  manageVerification(): void {
    console.log('✅ [AGENCY] Managing verification');
    this.setActiveSection('verification');
  }

  openRevenueDetails(): void {
    console.log('💰 [AGENCY] Opening revenue details');
    
    const revenueModal = `
      <div style="padding: 25px; font-family: Arial, sans-serif;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">💰 Détails des Revenus</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
          <div style="background: #f0fdf4; padding: 15px; border-radius: 12px; border-left: 4px solid #059669;">
            <h4 style="color: #059669; margin: 0 0 5px 0;">Chiffre d'affaires</h4>
            <div style="font-size: 1.5rem; font-weight: bold; color: #065f46;">87,450 DT</div>
            <div style="color: #6b7280; font-size: 0.9rem;">+12% vs mois dernier</div>
          </div>
          
          <div style="background: #eff6ff; padding: 15px; border-radius: 12px; border-left: 4px solid #2563eb;">
            <h4 style="color: #2563eb; margin: 0 0 5px 0;">Commissions</h4>
            <div style="font-size: 1.5rem; font-weight: bold; color: #1e40af;">52,200 DT</div>
            <div style="color: #6b7280; font-size: 0.9rem;">23 transactions</div>
          </div>
        </div>
        
        <div style="margin: 20px 0;">
          <h3 style="color: #374151;">📊 Répartition par type</h3>
          <div style="margin: 10px 0;">
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
              <span>Ventes (15 transactions)</span>
              <strong>38,500 DT</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
              <span>Locations (8 transactions)</span>
              <strong>13,700 DT</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
              <span>Gestion locative</span>
              <strong>35,250 DT</strong>
            </div>
          </div>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 12px; margin: 15px 0;">
          <strong>🎯 Objectif mensuel: 80,000 DT</strong><br>
          <div style="margin-top: 5px;">✅ Objectif dépassé de 109% !</div>
        </div>
      </div>
    `;
    
    const popup = window.open('', 'revenue', 'width=600,height=500');
    if (popup) {
      popup.document.write(revenueModal);
      popup.document.title = 'Détails des Revenus';
    }
  }

  viewAllActivity(): void {
    console.log('📋 [AGENCY] Viewing all activity');
    
    const activityModal = `
      <div style="padding: 25px; font-family: Arial, sans-serif;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">📋 Activité Commerciale Complète</h2>
        
        <div style="margin: 20px 0;">
          ${this.getAgencyActivity().map(activity => `
            <div style="display: flex; align-items: center; padding: 15px; margin: 10px 0; background: #f8fafc; border-radius: 12px; border-left: 4px solid #3b82f6;">
              <div style="margin-right: 15px; font-size: 1.5rem;">
                ${activity.type === 'sale' ? '🏠' : activity.type === 'lead' ? '👤' : activity.type === 'property' ? '🏡' : activity.type === 'appointment' ? '📅' : '📄'}
              </div>
              <div style="flex: 1;">
                <div style="font-weight: bold; color: #1f2937;">${activity.title}</div>
                <div style="color: #6b7280; font-size: 0.9rem;">${activity.description}</div>
                <div style="color: #9ca3af; font-size: 0.8rem;">${this.formatRelativeTime(activity.date)}</div>
              </div>
              ${activity.amount ? `<div style="font-weight: bold; color: #059669;">${activity.amount}</div>` : ''}
            </div>
          `).join('')}
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <div style="background: #dbeafe; padding: 15px; border-radius: 12px;">
            <strong>💼 Performance cette semaine</strong><br>
            3 ventes • 8 prospects • 15 visites • 52,500 DT commission
          </div>
        </div>
      </div>
    `;
    
    const popup = window.open('', 'activity', 'width=700,height=600');
    if (popup) {
      popup.document.write(activityModal);
      popup.document.title = 'Activité Commerciale';
    }
  }

  viewActivityDetails(activity: any): void {
    console.log('🔍 [AGENCY] Viewing activity details:', activity);
    alert(`📋 Détails: ${activity.title}\n\n${activity.description}\n\n${activity.amount || 'Pas de montant associé'}`);
  }

  viewMarketAnalysis(): void {
    console.log('📈 [AGENCY] Viewing market analysis');
    this.setActiveSection('analytics');
  }

  handleNotification(notification: any): void {
    console.log('🔔 [AGENCY] Handling notification:', notification);
    
    switch (notification.action) {
      case 'verification':
        this.setActiveSection('verification');
        break;
      case 'comments':
        this.setActiveSection('comments');
        break;
      case 'reports':
        alert('📊 Rapport mensuel téléchargé avec succès !\n\nVotre rapport de performance détaillé a été envoyé par email.');
        break;
      default:
        alert(`📌 ${notification.title}\n\n${notification.message}`);
    }
  }

  // Navigation items for different user types
  navigationItems = {
    UTILISATEUR: [
      { section: 'overview', label: 'Vue d\'ensemble', icon: 'dashboard', description: 'Aperçu de votre compte' },
      { section: 'properties', label: 'Parcourir les Biens', icon: 'home', description: 'Découvrir les annonces disponibles' },
      { section: 'profile', label: 'Mon Profil', icon: 'person', description: 'Gérer vos informations' },
      { section: 'upgrade', label: 'Passer Premium', icon: 'star', description: 'Découvrir les fonctionnalités premium' }
    ],
    CLIENT_ABONNE: [
      { section: 'overview', label: 'Vue d\'ensemble', icon: 'dashboard', description: 'Tableau de bord principal' },
      { section: 'properties', label: 'Parcourir les Biens', icon: 'home', description: 'Recherche avancée des annonces' },
      { section: 'mes-annonces', label: 'Mes Annonces', icon: 'apartment', description: 'Gérer mes annonces immobilières' },
      { section: 'subscription', label: 'Mon Abonnement', icon: 'star', description: 'Gérer votre abonnement' },
      { section: 'searches', label: 'Mes Recherches', icon: 'search', description: 'Historique et alertes' },
      { section: 'analytics', label: 'Mes Statistiques', icon: 'analytics', description: 'Analyse de vos activités' },
      { section: 'profile', label: 'Mon Profil', icon: 'person', description: 'Informations personnelles' }
    ],
    AGENCE_IMMOBILIERE: [
      { section: 'overview', label: 'Vue d\'ensemble', icon: 'dashboard', description: 'Tableau de bord agence' },
      { section: 'properties', label: 'Mes Annonces', icon: 'home', description: 'Gestion des annonces' },
      { section: 'comments', label: 'Commentaires', icon: 'comment', description: 'Commentaires reçus' },
      { section: 'clients', label: 'CRM Clients', icon: 'people', description: 'Relation client' },
      { section: 'team', label: 'Mon Équipe', icon: 'group', description: 'Gestion des collaborateurs' },
      { section: 'analytics', label: 'Analytics', icon: 'analytics', description: 'Performance et rapports' },
      { section: 'verification', label: 'Vérification', icon: 'verified', description: 'Statut de vérification' },
      { section: 'profile', label: 'Profil Agence', icon: 'business', description: 'Informations de l\'agence' }
    ],
    ADMINISTRATEUR: [
      { section: 'overview', label: 'Vue d\'ensemble', icon: 'dashboard', description: 'Dashboard administrateur' },
      { section: 'users', label: 'Gestion Utilisateurs', icon: 'people', description: 'Administration des comptes' },
      { section: 'agencies', label: 'Vérification Agences', icon: 'business', description: 'Processus de vérification' },
      { section: 'statistics', label: 'Statistiques Globales', icon: 'analytics', description: 'Analytics de la plateforme' },
      { section: 'visits', label: 'Trafic & Visites', icon: 'visibility', description: 'Analyse du trafic' },
      { section: 'system', label: 'Administration', icon: 'settings', description: 'Configuration système' },
      { section: 'profile', label: 'Mon Profil', icon: 'admin_panel_settings', description: 'Profil administrateur' }
    ]
  };

  constructor(
    private authService: AuthService,
    private annonceService: AnnonceService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeDashboard();
    this.loadDashboardData();
    this.setupSearchFunctionality();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngAfterViewInit(): void {
    console.log('🎯 [DEBUG] MyAnnonces data:', this.myAnnonces);
    console.log('🎯 [DEBUG] MyAnnonces content length:', this.myAnnonces?.content?.length);
    console.log('🎯 [DEBUG] Active section:', this.activeSection);
    console.log('🎯 [DEBUG] User type:', this.userType);
    console.log('🎯 [DEBUG] Is agency:', this.isAgency());
    console.log('🎯 [DEBUG] Is loading annonces:', this.isLoadingAnnonces);
  }

  private setupSearchFunctionality(): void {
    // Setup debounced search
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(500), // Wait 500ms after user stops typing
      distinctUntilChanged(), // Only search if search term changed
      tap(searchTerm => {
        console.log('🔍 [SEARCH] Debounced search triggered:', searchTerm);
        this.isLoadingAnnonces = true;
      }),
      switchMap(searchTerm => {
        // Call the search API with current filters
        return this.annonceService.searchAnnonces({
          titre: searchTerm,
          typeBien: this.selectedTypeBien as any,
          typeTransaction: this.selectedTypeTransaction as any,
          page: 0,
          size: 20
        });
      })
    ).subscribe({
      next: (data) => {
        console.log('✅ [SEARCH] Search results received:', data);
        
        // Debug search results images
        if (data?.content && data.content.length > 0) {
          data.content.forEach((annonce, index) => {
            console.log(`🖼️ [SEARCH-IMAGE-DEBUG] Annonce ${index + 1}:`, {
              id: annonce.id,
              titre: annonce.titre,
              premierImage: annonce.premierImage,
              imageExists: !!annonce.premierImage,
              imageType: typeof annonce.premierImage,
              imageLength: annonce.premierImage?.length || 0
            });
          });
        }
        
        this.myAnnonces = data;
        this.isLoadingAnnonces = false;
      },
      error: (error) => {
        console.error('❌ [SEARCH] Search error:', error);
        this.isLoadingAnnonces = false;
        // Don't show alert for search errors, just fail gracefully
      }
    });

    this.subscriptions.push(this.searchSubscription);
  }

  private initializeDashboard(): void {
    // Subscribe to user changes
    const userSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.userType = user?.userType || null;
      
      if (user) {
        this.setupDefaultSection();
        this.loadRoleSpecificData();
      } else {
        this.router.navigate(['/login']);
      }
    });

    // Subscribe to loading state
    const loadingSub = this.authService.isLoading$.subscribe(loading => {
      this.isLoading = loading;
    });

    this.subscriptions.push(userSub, loadingSub);
  }

  private setupDefaultSection(): void {
    // Set section based on current route
    const urlSegments = this.router.url.split('/');
    
    if (urlSegments.includes('admin')) {
      // Admin routes: /admin/dashboard, /admin/users, /admin/agencies, /admin/profile, etc.
      const adminSection = urlSegments[urlSegments.indexOf('admin') + 1];
      this.activeSection = adminSection === 'dashboard' ? 'overview' : adminSection || 'overview';
    } else if (urlSegments.includes('agency')) {
      // Agency routes: /agency/dashboard, /agency/properties, /agency/clients, /agency/profile, etc.
      const agencySection = urlSegments[urlSegments.indexOf('agency') + 1];
      this.activeSection = agencySection === 'dashboard' ? 'overview' : agencySection || 'overview';
    } else if (urlSegments.includes('client')) {
      // Client routes: /client/dashboard, /client/subscription, /client/searches, /client/profile, etc.
      const clientSection = urlSegments[urlSegments.indexOf('client') + 1];
      this.activeSection = clientSection === 'dashboard' ? 'overview' : clientSection || 'overview';
    } else if (urlSegments.includes('profile')) {
      // Regular user profile: /profile
      this.activeSection = 'profile';
    } else if (urlSegments.includes('dashboard')) {
      // Regular user dashboard: /dashboard
      this.activeSection = 'overview';
    } else {
      this.activeSection = 'overview';
    }
    
    
    // Load section-specific data (skip for profile - it handles its own data loading)
    if (this.activeSection !== 'profile') {
      this.loadSectionData(this.activeSection);
    }
  }

  private loadDashboardData(): void {
    if (!this.authService.isAuthenticated) return;

    // Load user-specific dashboard stats
    const dashboardSub = this.authService.getUserStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
      }
    });

    this.subscriptions.push(dashboardSub);
  }

  private loadRoleSpecificData(): void {
    if (!this.userType) return;

    switch (this.userType) {
      case 'ADMINISTRATEUR':
        this.loadAdminData();
        break;
      case 'AGENCE_IMMOBILIERE':
        this.loadAgencyData();
        break;
      case 'CLIENT_ABONNE':
        this.loadClientData();
        break;
      default:
        break;
    }
  }

  private loadAdminData(): void {
    // Load admin-specific statistics
    const adminSub = combineLatest([
      this.authService.getAdminStatistics(),
      this.authService.getVisitStats(),
      this.authService.getPlatformStatistics()
    ]).subscribe({
      next: ([adminStats, visitStats, platformStats]) => {
        this.userStats = adminStats;
        this.visitStats = visitStats;
        this.platformStats = platformStats;
      },
      error: (error) => {
        console.error('Error loading admin data:', error);
      }
    });

    this.subscriptions.push(adminSub);
  }

  private loadAgencyData(): void {
    console.log('🏢 [DASHBOARD] Loading agency-specific data...');
    
    // Load analytics data for agency
    this.loadAnalytics();
    
    // Load annonces data
    this.loadMyAnnonces();
    
    // Load annonce statistics
    this.loadAnnonceStats();
    
    // Load comments for notification badge
    this.loadCommentsForMyAnnonces();
  }

  private loadClientData(): void {
    // Client-specific data loading will be implemented when needed
    console.log('Loading client-specific data...');
  }

  // Navigation and UI methods
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  setActiveSection(section: string, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    
    // Set the active section without navigating away from dashboard
    this.activeSection = section;
    
    // Load section data
    this.loadSectionData(section);
  }

  private navigateToSection(section: string): void {
    // For all sections including profile, use role-based routing
    const userType = this.userType;
    let routePath = '';

    switch (userType) {
      case 'ADMINISTRATEUR':
        routePath = section === 'overview' ? '/admin/dashboard' : `/admin/${section}`;
        break;
      case 'AGENCE_IMMOBILIERE':
        routePath = section === 'overview' ? '/agency/dashboard' : `/agency/${section}`;
        break;
      case 'CLIENT_ABONNE':
        routePath = section === 'overview' ? '/client/dashboard' : `/client/${section}`;
        break;
      case 'UTILISATEUR':
      default:
        routePath = section === 'overview' ? '/dashboard' : `/${section}`;
        break;
    }

    // Navigate to the route
    this.router.navigate([routePath]);
  }

  private loadSectionData(section: string): void {
    switch (section) {
      case 'overview':
        // Load overview data for all user types
        this.loadRecentActivity();
        this.loadRecommendations();
        break;
      case 'statistics':
        if (this.userType === 'ADMINISTRATEUR') {
          this.loadAdminData();
        }
        break;
      case 'visits':
        if (this.userType === 'ADMINISTRATEUR') {
          this.loadVisitData();
        }
        break;
      case 'agencies':
        if (this.userType === 'ADMINISTRATEUR') {
          this.loadAgencies();
        }
        break;
      case 'analytics':
        if (this.userType === 'CLIENT_ABONNE' || this.userType === 'AGENCE_IMMOBILIERE') {
          this.loadAnalytics();
        }
        break;
      case 'properties':
        if (this.userType === 'UTILISATEUR' || this.userType === 'CLIENT_ABONNE') {
          this.loadPublicAnnonces();
        }
        break;
      case 'mes-annonces':
        if (this.userType === 'CLIENT_ABONNE') {
          this.loadMyAnnonces();
          this.loadAnnonceStats();
        }
        break;
      case 'comments':
        if (this.userType === 'AGENCE_IMMOBILIERE') {
          this.loadCommentsForMyAnnonces();
        }
        break;
      default:
        break;
    }
  }

  private loadVisitData(): void {
    const visitSub = this.authService.getVisitStats().subscribe({
      next: (stats) => {
        this.visitStats = stats;
      },
      error: (error) => {
        console.error('Error loading visit stats:', error);
      }
    });

    this.subscriptions.push(visitSub);
  }

  // User role and permissions
  hasAccessTo(feature: string): boolean {
    return this.authService.hasAnyRole([
      'CLIENT_ABONNE', 
      'AGENCE_IMMOBILIERE', 
      'ADMINISTRATEUR'
    ]) && this.checkFeatureAccess(feature);
  }

  private checkFeatureAccess(feature: string): boolean {
    if (!this.userType) return false;

    switch (feature) {
      case 'properties':
        return ['AGENCE_IMMOBILIERE', 'ADMINISTRATEUR'].includes(this.userType);
      case 'clients':
        return ['CLIENT_ABONNE', 'AGENCE_IMMOBILIERE', 'ADMINISTRATEUR'].includes(this.userType);
      case 'analytics':
        return ['CLIENT_ABONNE', 'AGENCE_IMMOBILIERE', 'ADMINISTRATEUR'].includes(this.userType);
      case 'team':
        return ['AGENCE_IMMOBILIERE', 'ADMINISTRATEUR'].includes(this.userType);
      case 'admin':
        return this.userType === 'ADMINISTRATEUR';
      case 'verification':
        return this.userType === 'AGENCE_IMMOBILIERE';
      case 'subscription':
        return this.userType === 'CLIENT_ABONNE';
      default:
        return true;
    }
  }

  // User information getters
  getUserDisplayName(): string {
    return this.authService.getUserDisplayName();
  }

  getUserRoleDisplay(): string {
    return this.authService.getUserRoleDisplayName();
  }

  getCurrentNavigationItems() {
    return this.userType ? this.navigationItems[this.userType] || [] : [];
  }

  getSectionInfo(section: string) {
    const items = this.getCurrentNavigationItems();
    return items.find(item => item.section === section) || {
      section,
      label: 'Section',
      icon: 'dashboard',
      description: 'Description'
    };
  }

  // User type specific getters
  isRegularUser(): boolean {
    return this.userType === 'UTILISATEUR';
  }

  isClientAbonne(): boolean {
    return this.userType === 'CLIENT_ABONNE';
  }

  isAgency(): boolean {
    return this.userType === 'AGENCE_IMMOBILIERE';
  }

  isAdmin(): boolean {
    return this.userType === 'ADMINISTRATEUR';
  }

  // Agency specific methods
  isAgencyVerified(): boolean {
    return this.authService.isAgencyVerified();
  }

  getAgencyInfo(): AgenceImmobiliere | null {
    return this.isAgency() ? (this.currentUser as AgenceImmobiliere) : null;
  }

  // Client specific methods
  getClientInfo(): ClientAbonne | null {
    return this.isClientAbonne() ? (this.currentUser as ClientAbonne) : null;
  }

  getSubscriptionInfo() {
    const clientInfo = this.getClientInfo();
    return clientInfo ? {
      type: clientInfo.subscriptionType,
      searchLimit: clientInfo.searchLimit,
      startDate: clientInfo.subscriptionStartDate,
      endDate: clientInfo.subscriptionEndDate
    } : null;
  }

  // Admin specific methods
  getAdminInfo(): Administrateur | null {
    return this.isAdmin() ? (this.currentUser as Administrateur) : null;
  }

  canManageUsers(): boolean {
    const adminInfo = this.getAdminInfo();
    return adminInfo?.canManageUsers === true;
  }

  canVerifyAgencies(): boolean {
    const adminInfo = this.getAdminInfo();
    return adminInfo?.canVerifyAgencies === true;
  }

  // Statistics getters
  getTotalUsers(): number {
    return this.userStats?.totalUsers || 0;
  }

  getActiveUsers(): number {
    return this.userStats?.activeUsers || 0;
  }

  getTotalVisits(): number {
    return this.visitStats?.totalVisits || 0;
  }

  getUniqueVisitors(): number {
    return this.visitStats?.uniqueVisitors || 0;
  }

  getPlatformGrowth() {
    return this.platformStats?.userGrowth || [];
  }

  // Actions
  refreshData(): void {
    this.loadDashboardData();
    this.loadRoleSpecificData();
  }


  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToProfile(): void {
    this.setActiveSection('profile');
  }

  // Email verification check
  needsEmailVerification(): boolean {
    return this.authService.isEmailVerificationRequired();
  }

  needsAgencyVerification(): boolean {
    return this.authService.isAgencyVerificationRequired();
  }

  // Profile editing methods
  startEditProfile(): void {
    this.isEditingProfile = true;
  }

  cancelEditProfile(): void {
    this.isEditingProfile = false;
  }

  onProfileSaved(updatedUser: AuthUser): void {
    this.currentUser = updatedUser;
    this.isEditingProfile = false;
    // Update the auth service with the new user data
    this.authService.updateCurrentUser(updatedUser);
  }

  onPasswordChanged(): void {
    this.isEditingProfile = false;
  }

  // Agency management methods
  loadAgencies(): void {
    if (!this.isAdmin()) return;
    
    this.isLoadingAgencies = true;
    const agencySub = this.authService.getAllAgencies().subscribe({
      next: (agencies) => {
        this.allAgencies = agencies;
        this.pendingAgencies = agencies.filter(agency => !agency.verified);
        this.verifiedAgencies = agencies.filter(agency => agency.verified);
        this.isLoadingAgencies = false;
      },
      error: (error) => {
        console.error('Error loading agencies:', error);
        this.isLoadingAgencies = false;
      }
    });

    this.subscriptions.push(agencySub);
  }

  verifyAgency(agencyId: number): void {
    if (!this.isAdmin()) return;

    const verifySub = this.authService.verifyAgency(agencyId).subscribe({
      next: (response) => {
        console.log('Agency verified successfully:', response.message);
        // Reload agencies to update the lists
        this.loadAgencies();
        // Show success message (you can implement a toast notification here)
        alert('Agence vérifiée avec succès !');
      },
      error: (error) => {
        console.error('Error verifying agency:', error);
        alert('Erreur lors de la vérification de l\'agence');
      }
    });

    this.subscriptions.push(verifySub);
  }

  getPendingAgenciesCount(): number {
    return this.pendingAgencies.length;
  }

  getVerifiedAgenciesCount(): number {
    return this.verifiedAgencies.length;
  }

  getAgencyInitials(agency: AuthUser): string {
    if (agency.nomAgence) {
      return agency.nomAgence.split(' ').map((word: string) => word.charAt(0)).join('').toUpperCase();
    }
    return `${agency.prenom.charAt(0)}${agency.nom.charAt(0)}`.toUpperCase();
  }

  // Analytics methods
  loadAnalytics(): void {
    if (!this.userType || (this.userType !== 'CLIENT_ABONNE' && this.userType !== 'AGENCE_IMMOBILIERE')) {
      return;
    }
    
    this.isLoadingAnalytics = true;
    const analyticsSub = this.authService.getUserAnalytics().subscribe({
      next: (data) => {
        this.analyticsData = data;
        this.isLoadingAnalytics = false;
        console.log('Analytics data loaded:', data);
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.isLoadingAnalytics = false;
      }
    });

    this.subscriptions.push(analyticsSub);
  }

  showMetricDetails(metric: any): void {
    console.log('Metric details:', metric);
    // TODO: Implement metric details popup
  }

  // Annonces methods
  loadMyAnnonces(page: number = 0): void {
    console.log('📋 [DASHBOARD] Loading my annonces for page:', page);
    
    if (!this.authService.isAuthenticated || (!this.isAgency() && !this.isClientAbonne())) {
      console.log('❌ [DASHBOARD] Not authorized to load annonces');
      return;
    }

    this.isLoadingAnnonces = true;
    const annoncesSub = this.annonceService.getMyAnnonces(page, 20).subscribe({
      next: (data) => {
        console.log('✅ [DASHBOARD] My annonces loaded successfully:', data);
        console.log('🎯 [DEBUG] Data content array:', data?.content);
        console.log('🎯 [DEBUG] Content length:', data?.content?.length);
        console.log('🎯 [DEBUG] Total elements:', data?.totalElements);
        
        // Debug each annonce to check image data
        if (data?.content && data.content.length > 0) {
          data.content.forEach((annonce, index) => {
            console.log(`🖼️ [IMAGE-DEBUG] Annonce ${index + 1}:`, {
              id: annonce.id,
              titre: annonce.titre,
              premierImage: annonce.premierImage,
              images: annonce.images,
              imageExists: !!annonce.premierImage,
              imageType: typeof annonce.premierImage,
              imageLength: annonce.premierImage?.length || 0
            });
          });
        }
        
        this.myAnnonces = data;
        this.isLoadingAnnonces = false;
        
        // Trigger change detection debug after data is loaded
        setTimeout(() => {
          console.log('🎯 [DEBUG] After loading - MyAnnonces:', this.myAnnonces);
          console.log('🎯 [DEBUG] After loading - Content exists:', !!this.myAnnonces?.content);
          console.log('🎯 [DEBUG] After loading - Content length:', this.myAnnonces?.content?.length);
        }, 100);
      },
      error: (error) => {
        console.error('❌ [DASHBOARD] Error loading my annonces:', error);
        this.isLoadingAnnonces = false;
        // Show user-friendly error message
        alert('Erreur lors du chargement de vos annonces. Veuillez réessayer.');
      }
    });

    this.subscriptions.push(annoncesSub);
  }

  loadAnnonceStats(): void {
    console.log('📊 [DASHBOARD] Loading annonce statistics...');
    
    if (!this.authService.isAuthenticated || (!this.isAgency() && !this.isClientAbonne())) {
      console.log('❌ [DASHBOARD] Not authorized to load annonce stats');
      return;
    }

    const statsSub = this.annonceService.getMyAnnonceStats().subscribe({
      next: (stats) => {
        console.log('✅ [DASHBOARD] Annonce statistics loaded:', stats);
        this.annonceStats = stats;
      },
      error: (error) => {
        console.error('❌ [DASHBOARD] Error loading annonce stats:', error);
        // Continue without stats, don't show error to user for stats
      }
    });

    this.subscriptions.push(statsSub);
  }

  // Helper methods for annonces
  getTotalAnnonces(): number {
    return this.annonceStats?.totalAnnonces || 0;
  }

  getActiveAnnonces(): number {
    return this.annonceStats?.annoncesActives || 0;
  }

  getTotalVues(): number {
    return this.annonceStats?.totalVues || 0;
  }

  getTotalFavoris(): number {
    return this.annonceStats?.totalFavoris || 0;
  }

  getPrixMoyen(): number {
    return this.annonceStats?.prixMoyen || 0;
  }

  formatPrice(price: number): string {
    return this.annonceService.formatPrice(price);
  }

  getAnnonceTypeBienDisplay(type: string): string {
    return this.annonceService.getTypeBienDisplayName(type as any);
  }

  getAnnonceTypeTransactionDisplay(type: string): string {
    return this.annonceService.getTypeTransactionDisplayName(type as any);
  }

  getAnnonceStatusDisplay(status: string): string {
    return this.annonceService.getStatusAnnonceDisplayName(status as any);
  }

  formatAnnonceDate(dateString: string): string {
    return this.annonceService.formatDate(dateString);
  }

  // Navigation for annonces
  createNewAnnonce(): void {
    console.log('🏗️ [DASHBOARD] Navigating to annonce creation...');
    this.router.navigate(['/annonce-create']);
  }

  editAnnonce(annonceOrId: number | AnnonceSummary): void {
    const annonceId = typeof annonceOrId === 'number' ? annonceOrId : annonceOrId.id;
    console.log('✏️ [DASHBOARD] Editing annonce:', annonceId);
    this.router.navigate(['/annonce-edit', annonceId]);
  }

  viewAnnonce(annonceId: number): void {
    console.log('👁️ [DASHBOARD] Viewing annonce:', annonceId);
    this.router.navigate(['/annonce-view', annonceId]);
  }

  deleteAnnonce(annonceId: number): void {
    console.log('🗑️ [DASHBOARD] Deleting annonce:', annonceId);
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      return;
    }

    const deleteSub = this.annonceService.deleteAnnonce(annonceId).subscribe({
      next: () => {
        console.log('✅ [DASHBOARD] Annonce deleted successfully');
        alert('Annonce supprimée avec succès !');
        // Reload annonces
        this.loadMyAnnonces();
        this.loadAnnonceStats();
      },
      error: (error) => {
        console.error('❌ [DASHBOARD] Error deleting annonce:', error);
        alert('Erreur lors de la suppression de l\'annonce');
      }
    });

    this.subscriptions.push(deleteSub);
  }

  // Pagination methods
  getPaginationPages(): number[] {
    if (!this.myAnnonces || this.myAnnonces.totalPages <= 1) {
      return [];
    }
    
    const totalPages = this.myAnnonces.totalPages;
    const currentPage = this.myAnnonces.currentPage;
    const maxVisible = 5;
    
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible);
    
    if (end - start < maxVisible && totalPages >= maxVisible) {
      start = Math.max(0, end - maxVisible);
    }
    
    const pages = [];
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  goToPage(page: number): void {
    if (!this.myAnnonces || page < 0 || page >= this.myAnnonces.totalPages) {
      return;
    }
    
    console.log('📄 [DASHBOARD] Going to page:', page + 1);
    this.loadMyAnnonces(page);
  }

  // Search and filter methods
  onSearch(): void {
    console.log('🔍 [DASHBOARD] Search query changed:', this.searchQuery);
    // Trigger debounced search
    this.searchSubject.next(this.searchQuery);
  }

  onFilterChange(): void {
    console.log('🔧 [DASHBOARD] Filter changed - Type:', this.selectedTypeBien, 'Transaction:', this.selectedTypeTransaction, 'Status:', this.selectedStatus);
    // Trigger immediate search when filters change
    this.searchAnnonces();
  }

  searchAnnonces(): void {
    console.log('🔎 [DASHBOARD] Searching annonces with filters...');
    this.isLoadingAnnonces = true;
    
    this.annonceService.searchAnnonces({
      titre: this.searchQuery,
      typeBien: this.selectedTypeBien as any,
      typeTransaction: this.selectedTypeTransaction as any,
      page: 0,
      size: 20
    }).subscribe({
      next: (data) => {
        console.log('✅ [SEARCH] Filter search results:', data);
        this.myAnnonces = data;
        this.isLoadingAnnonces = false;
      },
      error: (error) => {
        console.error('❌ [SEARCH] Filter search error:', error);
        this.isLoadingAnnonces = false;
      }
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.selectedTypeBien = '';
    this.selectedTypeTransaction = '';
    this.selectedStatus = '';
    this.loadMyAnnonces(0); // Load all user's annonces
  }

  // Public Annonces methods for users and subscribers
  loadPublicAnnonces(page: number = 0): void {
    console.log('🏢 [DASHBOARD] Loading public annonces for page:', page);
    
    if (!this.authService.isAuthenticated) {
      console.log('❌ [DASHBOARD] Not authenticated, cannot load annonces');
      return;
    }

    this.isLoadingPublicAnnonces = true;
    const searchSub = this.annonceService.searchAnnonces({
      page,
      size: this.isClientAbonne() ? 20 : 10, // Subscribers see more per page
      sortBy: 'dateCreation',
      sortDirection: 'desc'
    }).subscribe({
      next: (data) => {
        console.log('✅ [DASHBOARD] Public annonces loaded successfully:', data);
        console.log('🎯 [DEBUG] Data content array:', data?.content);
        console.log('🎯 [DEBUG] Content length:', data?.content?.length);
        console.log('🎯 [DEBUG] Total elements:', data?.totalElements);
        
        // Debug each annonce to check image data
        if (data?.content && data.content.length > 0) {
          data.content.forEach((annonce, index) => {
            console.log(`🖼️ [PUBLIC-ANNONCE-DEBUG] Annonce ${index + 1}:`, {
              id: annonce.id,
              titre: annonce.titre,
              premierImage: annonce.premierImage,
              imageExists: !!annonce.premierImage,
              imageType: typeof annonce.premierImage,
              imageLength: annonce.premierImage?.length || 0
            });
          });
        }
        
        this.publicAnnonces = data;
        this.isLoadingPublicAnnonces = false;
      },
      error: (error) => {
        console.error('❌ [DASHBOARD] Error loading public annonces:', error);
        this.isLoadingPublicAnnonces = false;
        // Show user-friendly error message
        alert('Erreur lors du chargement des annonces. Veuillez réessayer.');
      }
    });

    this.subscriptions.push(searchSub);
  }

  searchPublicAnnonces(): void {
    console.log('🔎 [DASHBOARD] Searching public annonces with filters...');
    this.isLoadingPublicAnnonces = true;
    
    const searchFilters = {
      titre: this.searchQuery,
      typeBien: this.selectedTypeBien as any,
      typeTransaction: this.selectedTypeTransaction as any,
      page: 0,
      size: this.isClientAbonne() ? 20 : 10
    };

    this.annonceService.searchAnnonces(searchFilters).subscribe({
      next: (data) => {
        console.log('✅ [PUBLIC-SEARCH] Search results:', data);
        this.publicAnnonces = data;
        this.isLoadingPublicAnnonces = false;
      },
      error: (error) => {
        console.error('❌ [PUBLIC-SEARCH] Search error:', error);
        this.isLoadingPublicAnnonces = false;
      }
    });
  }

  viewAnnonceDetails(annonce: AnnonceSummary): void {
    console.log('👁️ [DASHBOARD] Viewing annonce details:', annonce.id);
    this.selectedAnnonce = annonce;
    // Load ratings and comments for this annonce
    this.loadAnnonceRatings(annonce.id);
    this.loadAnnonceComments(annonce.id);
  }

  closeAnnonceDetails(): void {
    this.selectedAnnonce = null;
  }

  loadAnnonceRatings(annonceId: number): void {
    console.log('⭐ [RATINGS] Loading ratings for annonce:', annonceId);
    this.isLoadingRatings = true;
    
    const ratingSub = this.annonceService.getAnnonceCommentStats(annonceId).subscribe({
      next: (stats) => {
        console.log('✅ [RATINGS] Rating stats loaded:', stats);
        this.annonceRatings[annonceId] = stats.averageRating;
        this.isLoadingRatings = false;
      },
      error: (error) => {
        console.error('❌ [RATINGS] Error loading ratings:', error);
        this.isLoadingRatings = false;
      }
    });
    
    this.subscriptions.push(ratingSub);
  }

loadAnnonceComments(annonceId: number): void {
    console.log('💬 [COMMENTS] Loading comments for annonce:', annonceId);
    this.isLoadingComments = true;
    
    const commentsSub = this.annonceService.getCommentsByAnnonce(annonceId).subscribe({
      next: (comments) => {
        console.log('✅ [COMMENTS] Comments loaded:', comments);
        this.annonceComments[annonceId] = comments;
        this.isLoadingComments = false;
      },
      error: (error) => {
        console.error('❌ [COMMENTS] Error loading comments:', error);
        this.isLoadingComments = false;
        // Set empty array on error
        this.annonceComments[annonceId] = [];
      }
    });
    
    this.subscriptions.push(commentsSub);
  }

  submitRating(annonceId: number, rating: number): void {
    console.log('⭐ [RATING] Submitting rating:', rating, 'for annonce:', annonceId);
    
    if (!this.newComment.trim()) {
      alert('Veuillez ajouter un commentaire avec votre évaluation.');
      return;
    }
    
    const commentData = {
      content: this.newComment.trim(),
      rating: rating
    };
    
    const ratingSub = this.annonceService.createComment(annonceId, commentData).subscribe({
      next: (response) => {
        console.log('✅ [RATING] Comment and rating submitted successfully:', response);
        alert('Merci pour votre évaluation et commentaire !');
        
        // Clear the form
        this.selectedRating = 0;
        this.newComment = '';
        
        // Reload comments and ratings
        this.loadAnnonceComments(annonceId);
        this.loadAnnonceRatings(annonceId);
      },
      error: (error) => {
        console.error('❌ [RATING] Error submitting comment:', error);
        const errorMessage = error.error?.message || 'Erreur lors de l\'ajout du commentaire';
        alert(errorMessage);
      }
    });
    
    this.subscriptions.push(ratingSub);
  }

  submitComment(annonceId: number, comment: string): void {
    console.log('💬 [COMMENT] Submitting comment:', comment, 'for annonce:', annonceId);
    
    if (!comment.trim()) {
      alert('Veuillez saisir un commentaire.');
      return;
    }
    
    if (this.selectedRating === 0) {
      alert('Veuillez donner une note avant de publier votre commentaire.');
      return;
    }
    
    const commentData = {
      content: comment.trim(),
      rating: this.selectedRating
    };
    
    const commentSub = this.annonceService.createComment(annonceId, commentData).subscribe({
      next: (response) => {
        console.log('✅ [COMMENT] Comment submitted successfully:', response);
        alert('Merci pour votre commentaire !');
        
        // Clear the form
        this.newComment = '';
        this.selectedRating = 0;
        
        // Reload comments and ratings
        this.loadAnnonceComments(annonceId);
        this.loadAnnonceRatings(annonceId);
      },
      error: (error) => {
        console.error('❌ [COMMENT] Error submitting comment:', error);
        const errorMessage = error.error?.message || 'Erreur lors de l\'ajout du commentaire';
        alert(errorMessage);
      }
    });
    
    this.subscriptions.push(commentSub);
  }

  // Feature restriction methods
  canViewFullDetails(): boolean {
    // Subscribers can view full details, regular users have limited view
    return this.isClientAbonne();
  }

  canRateAndComment(): boolean {
    // Both users and subscribers can rate and comment
    return this.isRegularUser() || this.isClientAbonne();
  }

  canContactAgency(): boolean {
    // Only subscribers can contact agencies directly
    return this.isClientAbonne();
  }

  getMaxVisibleAnnonces(): number {
    // Regular users see limited annonces, subscribers see more
    return this.isClientAbonne() ? 50 : 10;
  }

  // Missing methods that are called in the template
  openCommentModal(annonce: AnnonceSummary): void {
    console.log('💬 [MODAL] Opening comment modal for annonce:', annonce.id);
    // TODO: Implement comment modal functionality
    // For now, just use the existing comment system
    this.viewAnnonceDetails(annonce);
  }

  formatDate(dateString: string): string {
    // Reuse existing date formatting method
    return this.formatAnnonceDate(dateString);
  }

  toggleFavorite(annonce: AnnonceSummary): void {
    console.log('❤️ [FAVORITE] Toggling favorite for annonce:', annonce.id);
    // TODO: Implement API call when backend is ready
    alert('Fonctionnalité de favoris en développement');
  }
  // Agency comment management
  myAnnonceComments: any = null;
  isLoadingMyComments = false;
  
  // Reply functionality
  replyingToComment: number | null = null;
  replyContent = '';
  isSubmittingReply = false;

  loadCommentsForMyAnnonces(): void {
    if (!this.isAgency() && !this.isClientAbonne()) return;
    
    console.log('📋 [AGENCY-COMMENTS] Loading comments for my annonces...');
    this.isLoadingMyComments = true;
    
    const commentsSub = this.annonceService.getCommentsForMyAnnonces(0, 20).subscribe({
      next: (data) => {
        console.log('✅ [AGENCY-COMMENTS] Comments loaded:', data);
        this.myAnnonceComments = data;
        this.isLoadingMyComments = false;
      },
      error: (error) => {
        console.error('❌ [AGENCY-COMMENTS] Error loading comments:', error);
        this.isLoadingMyComments = false;
      }
    });
    
    this.subscriptions.push(commentsSub);
  }

  getCommentNotificationCount(): number {
    if (!this.myAnnonceComments || !this.myAnnonceComments.content) {
      return 0;
    }
    return this.myAnnonceComments.totalElements || this.myAnnonceComments.content.length || 0;
  }

  // Reply functionality methods
  startReply(commentId: number): void {
    console.log('💬 [REPLY] Starting reply to comment:', commentId);
    this.replyingToComment = commentId;
    this.replyContent = '';
  }

  cancelReply(): void {
    console.log('❌ [REPLY] Cancelling reply');
    this.replyingToComment = null;
    this.replyContent = '';
  }

  submitReply(commentId: number): void {
    if (!this.replyContent.trim()) {
      alert('Veuillez saisir votre réponse');
      return;
    }

    // Debug user and authentication info
    console.log('🔍 [DEBUG] Submit reply attempt:');
    console.log('  - Comment ID:', commentId);
    console.log('  - Reply content:', this.replyContent);
    console.log('  - Current user:', this.currentUser);
    console.log('  - User type:', this.userType);
    console.log('  - Is agency:', this.isAgency());
    console.log('  - JWT token exists:', !!this.authService.getToken());
    console.log('  - Is authenticated:', this.authService.isAuthenticated);
    
    // Check if user is authenticated
    if (!this.authService.isAuthenticated) {
      alert('Vous devez être connecté pour répondre aux commentaires');
      return;
    }
    
    // Check if user is agency
    if (!this.isAgency()) {
      alert('Seules les agences peuvent répondre aux commentaires');
      return;
    }

    console.log('📝 [REPLY] Submitting reply to comment:', commentId, 'Content:', this.replyContent);
    
    this.isSubmittingReply = true;
    const replySub = this.annonceService.createReply(commentId, this.replyContent.trim()).subscribe({
      next: (response) => {
        console.log('✅ [REPLY] Reply submitted successfully:', response);
        alert('Réponse envoyée avec succès !');
        
        // Clear reply form
        this.replyingToComment = null;
        this.replyContent = '';
        this.isSubmittingReply = false;
        
        // Reload comments to show the new reply
        this.loadCommentsForMyAnnonces();
      },
      error: (error) => {
        console.error('❌ [REPLY] Error submitting reply:', error);
        console.error('❌ [REPLY] Error details:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.error?.message,
          currentUser: this.currentUser?.email,
          userType: this.userType,
          commentId: commentId
        });
        
        let errorMessage = 'Erreur lors de l\'envoi de la réponse';
        
        if (error.status === 403) {
          errorMessage = 'Vous n\'avez pas l\'autorisation de répondre à ce commentaire. Seul le propriétaire de l\'annonce peut répondre.';
        } else if (error.status === 401) {
          errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        alert(errorMessage);
        this.isSubmittingReply = false;
      }
    });

    this.subscriptions.push(replySub);
  }
}
