// src/app/core/models.ts
export type UserType = 'CLIENT_ABONNE' | 'AGENCE_IMMOBILIERE' | 'ADMINISTRATEUR' | 'UTILISATEUR';
export type SubscriptionType = 'BASIC' | 'PREMIUM' | 'VIP';
export type AdminLevel = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'SUPPORT';

export interface AuthUser {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  userType: UserType;
  enabled: boolean;
  emailVerified: boolean;
  dateInscription?: string;
  derniereConnexion?: string;
  createdAt?: string;
  
  // Agency-specific fields (optional)
  nomAgence?: string;
  numeroLicence?: string;
  siteWeb?: string;
  nombreEmployes?: number;
  zonesCouverture?: string;
  verified?: boolean;
  verificationDate?: string;
  
  // Client-specific fields (optional)
  subscriptionType?: 'BASIC' | 'PREMIUM' | 'VIP';
  searchLimit?: number;
  searchesUsed?: number;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  
  // Admin-specific fields (optional)
  adminLevel?: AdminLevel;
  canManageUsers?: boolean;
  canVerifyAgencies?: boolean;
  canAccessSystemStats?: boolean;
  department?: string;
}

export interface ClientAbonne extends AuthUser {
  subscriptionType: 'BASIC' | 'PREMIUM' | 'VIP';
  searchLimit: number;
  searchesUsed?: number;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
}

export interface AgenceImmobiliere extends AuthUser {
  nomAgence: string;
  numeroLicence: string;
  siteWeb: string;
  nombreEmployes: number;
  zonesCouverture: string;
  verified: boolean;
  verificationDate?: string;
}

export interface Administrateur extends AuthUser {
  adminLevel: AdminLevel;
  canManageUsers: boolean;
  canVerifyAgencies: boolean;
  canAccessSystemStats: boolean;
}

/* Auth / Request / Response models */
export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: AuthUser;
  expiresIn: number; // seconds
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone: string;
  adresse: string;
  userType: UserType;
  subscriptionType?: 'BASIC' | 'PREMIUM' | 'VIP';
  nomAgence?: string;
  numeroLicence?: string;
  siteWeb?: string;
  nombreEmployes?: number;
  zonesCouverture?: string;
  adminLevel?: AdminLevel;
}

export interface EmailVerificationResponse { success: boolean; message?: string; }
export interface ResendVerificationRequest { email: string; }
export interface ResendVerificationResponse { success: boolean; message?: string; }
export interface PasswordResetRequest { email: string; }
export interface PasswordResetResponse { success: boolean; message?: string; }
export interface PasswordChangeRequest { token?: string; currentPassword?: string; newPassword: string; }
export interface PasswordChangeResponse { success: boolean; message?: string; }

export interface RegisterResponse { 
  success: boolean; 
  message: string; 
  user?: AuthUser; 
  emailVerificationRequired?: boolean;
}

export interface UserUpdateRequest {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  
  // Fields for AGENCE_IMMOBILIERE
  nomAgence?: string;
  numeroLicence?: string;
  siteWeb?: string;
  nombreEmployes?: number;
  zonesCouverture?: string;
  
  // Fields for CLIENT_ABONNE
  subscriptionType?: string;
  
  // Fields for ADMINISTRATEUR
  adminLevel?: string;
  department?: string;
}

export interface AgencyVerificationRequest {
  verified: boolean;
  rejectionReason?: string;
}

export interface AgencyVerificationResponse {
  success: boolean;
  message?: string;
  agency?: AgenceImmobiliere;
}

export interface VisitCreateRequest {
  page: string;
  userAgent: string;
  sessionId: string;
}

export interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
  userType: UserType;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

/* User management pagination */
export interface UserManagementFilter {
  userType?: UserType;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  verified?: boolean;
  emailVerified?: boolean;
  searchTerm?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface UserManagementResponse {
  users: AuthUser[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

/* Stats */
export interface ActivityItem { type: string; message: string; date: string; }
export interface DashboardStats {
  totalSearches?: number;
  favoriteProperties?: number;
  activeAlerts?: number;
  recentActivity?: ActivityItem[];
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisWeek: number;
  usersByType: Record<UserType, number>;
  pendingVerifications: number;
}

export interface GrowthData { month: string; value: number; }
export interface SubscriptionStats { type: string; count: number; }

export interface PlatformStats {
  totalRevenue: number;
  monthlyRevenue: number;
  userGrowth: GrowthData[];
  subscriptionDistribution: SubscriptionStats[];
}

export interface PageStats { path: string; visits: number; }
export interface CountryStats { country: string; visitors: number; }

export interface VisitStats {
  totalVisits: number;
  uniqueVisitors: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: PageStats[];
  geographicDistribution: CountryStats[];
}

// Enhanced Analytics Models
export interface MetricData {
  label: string;
  value: number;
  trend: 'positive' | 'negative' | 'neutral';
  percentage: number;
  icon: string;
  color: string;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  fill: boolean;
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  title: string;
  labels: string[];
  datasets: ChartDataset[];
}

export interface ActivityData {
  date: string;
  activity: string;
  description: string;
  icon: string;
  color: string;
}

export interface SubscriptionInsights {
  currentPlan: string;
  daysRemaining: number;
  usagePercentage: number;
  availableFeatures: string[];
  upgradeRecommendations: string[];
}

export interface SearchAnalytics {
  totalSearches: number;
  searchesThisMonth: number;
  searchesRemaining: number;
  averageSearchesPerDay: number;
  topSearchTypes: string[];
  topLocations: string[];
}

export interface ClientAnalytics {
  keyMetrics: MetricData[];
  charts: ChartData[];
  searchAnalytics: SearchAnalytics;
  recentActivity: ActivityData[];
  subscriptionInsights: SubscriptionInsights;
}

export interface PropertyTypeData {
  type: string;
  count: number;
  averagePrice: number;
  color: string;
}

export interface PropertyAnalytics {
  totalProperties: number;
  propertiesSold: number;
  propertiesRented: number;
  activeListings: number;
  averageSaleTime: number;
  averageRentTime: number;
  propertyByType: PropertyTypeData[];
}

export interface ClientSegment {
  segment: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ClientAnalyticsData {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  clientSatisfactionScore: number;
  clientSegments: ClientSegment[];
}

export interface MemberPerformance {
  name: string;
  role: string;
  score: number;
  salesCount: number;
  revenue: number;
  avatar: string;
}

export interface TeamPerformance {
  totalMembers: number;
  averagePerformanceScore: number;
  topPerformers: MemberPerformance[];
  teamMetrics: MetricData[];
}

export interface MarketData {
  competitorName: string;
  marketShare: number;
  color: string;
}

export interface PriceInsight {
  location: string;
  averagePrice: number;
  priceChange: number;
  trend: string;
}

export interface MarketInsights {
  marketTrend: 'growing' | 'stable' | 'declining';
  marketGrowthRate: number;
  competitorAnalysis: MarketData[];
  priceInsights: PriceInsight[];
  recommendations: string[];
}

export interface AgencyAnalytics {
  kpis: MetricData[];
  performanceCharts: ChartData[];
  propertyAnalytics: PropertyAnalytics;
  clientAnalytics: ClientAnalyticsData;
  teamPerformance: TeamPerformance;
  marketInsights: MarketInsights;
}