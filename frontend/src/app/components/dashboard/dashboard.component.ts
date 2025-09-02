import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
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
  imports: [CommonModule, ProfileViewComponent, ProfileSectionsComponent, AnimatedChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
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
  
  // Profile editing state
  isEditingProfile = false;
  
  // Sidebar and navigation
  sidebarCollapsed = false;
  
  // Subscriptions
  private subscriptions: Subscription[] = [];

  // Navigation items for different user types
  navigationItems = {
    UTILISATEUR: [
      { section: 'overview', label: 'Vue d\'ensemble', icon: 'dashboard', description: 'Aperçu de votre compte' },
      { section: 'profile', label: 'Mon Profil', icon: 'person', description: 'Gérer vos informations' },
      { section: 'upgrade', label: 'Passer Premium', icon: 'star', description: 'Découvrir les fonctionnalités premium' }
    ],
    CLIENT_ABONNE: [
      { section: 'overview', label: 'Vue d\'ensemble', icon: 'dashboard', description: 'Tableau de bord principal' },
      { section: 'subscription', label: 'Mon Abonnement', icon: 'star', description: 'Gérer votre abonnement' },
      { section: 'searches', label: 'Mes Recherches', icon: 'search', description: 'Historique et alertes' },
      { section: 'analytics', label: 'Mes Statistiques', icon: 'analytics', description: 'Analyse de vos activités' },
      { section: 'profile', label: 'Mon Profil', icon: 'person', description: 'Informations personnelles' }
    ],
    AGENCE_IMMOBILIERE: [
      { section: 'overview', label: 'Vue d\'ensemble', icon: 'dashboard', description: 'Tableau de bord agence' },
      { section: 'properties', label: 'Mes Annonces', icon: 'home', description: 'Gestion des annonces' },
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
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
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
    console.log('🏠 [DASHBOARD] Loading agency-specific data...');
    
    // Load analytics data for agency
    this.loadAnalytics();
    
    // Load annonces data
    this.loadMyAnnonces();
    
    // Load annonce statistics
    this.loadAnnonceStats();
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
    
    // Navigate to appropriate route based on user type and section
    this.navigateToSection(section);
    
    // Don't load section data for profile - it handles its own data loading
    if (section !== 'profile') {
      this.loadSectionData(section);
    }
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
    this.navigateToSection('profile');
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
  loadMyAnnonces(): void {
    console.log('📋 [DASHBOARD] Loading my annonces...');
    
    if (!this.authService.isAuthenticated || !this.isAgency()) {
      console.log('❌ [DASHBOARD] Not authorized to load annonces');
      return;
    }

    this.isLoadingAnnonces = true;
    const annoncesSub = this.annonceService.getMyAnnonces(0, 20).subscribe({
      next: (data) => {
        console.log('✅ [DASHBOARD] My annonces loaded successfully:', data);
        this.myAnnonces = data;
        this.isLoadingAnnonces = false;
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
    
    if (!this.authService.isAuthenticated || !this.isAgency()) {
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
    console.log('🏗️ [DASHBOARD] Creating new annonce...');
    // TODO: Navigate to annonce creation page
    alert('Création d\'annonce - En cours d\'implémentation');
  }

  editAnnonce(annonceId: number): void {
    console.log('✏️ [DASHBOARD] Editing annonce:', annonceId);
    // TODO: Navigate to annonce editing page
    alert(`Modification de l'annonce ${annonceId} - En cours d'implémentation`);
  }

  viewAnnonce(annonceId: number): void {
    console.log('👁️ [DASHBOARD] Viewing annonce:', annonceId);
    // TODO: Navigate to annonce details page
    alert(`Consultation de l'annonce ${annonceId} - En cours d'implémentation`);
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
}