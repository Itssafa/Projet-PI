// User Types
export type UserType = 'UTILISATEUR' | 'CLIENT_ABONNE' | 'AGENCE_IMMOBILIERE' | 'ADMINISTRATEUR';
export type SubscriptionType = 'BASIC' | 'PREMIUM' | 'VIP';
export type AdminLevel = 'SUPER_ADMIN' | 'MODERATOR' | 'SUPPORT';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';

// Authentication Request/Response Models
export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  message: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone: string; // 8 digits validation
  adresse: string;
  userType: UserType;
  // Agency specific fields (required for AGENCE_IMMOBILIERE)
  nomAgence?: string;
  numeroLicence?: string;
  siteWeb?: string;
  nombreEmployes?: number;
  zonesCouverture?: string;
  // Client specific fields (optional for CLIENT_ABONNE)
  subscriptionType?: SubscriptionType;
  // Admin specific fields (optional for ADMINISTRATEUR)
  adminLevel?: AdminLevel;
}

export interface RegisterResponse {
  message: string;
  user: AuthUser;
  emailVerificationRequired: boolean;
}

export interface EmailVerificationRequest {
  token: string;
}

export interface EmailVerificationResponse {
  message: string;
  success: boolean;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
  success: boolean;
}

// Base User Interface
export interface BaseUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  userType: UserType;
  enabled: boolean;
  emailVerified: boolean;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Specialized User Interfaces (matching backend entities)
export interface RegularUser extends BaseUser {
  userType: 'UTILISATEUR';
}

export interface ClientAbonne extends BaseUser {
  userType: 'CLIENT_ABONNE';
  subscriptionType: SubscriptionType;
  searchLimit: number;
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
}

export interface AgenceImmobiliere extends BaseUser {
  userType: 'AGENCE_IMMOBILIERE';
  nomAgence: string;
  numeroLicence: string;
  siteWeb?: string;
  nombreEmployes?: number;
  zonesCouverture?: string;
  verified: boolean;
  verificationDate?: Date;
  verificationNotes?: string;
}

export interface Administrateur extends BaseUser {
  userType: 'ADMINISTRATEUR';
  adminLevel: AdminLevel;
  canManageUsers: boolean;
  canVerifyAgencies: boolean;
  canViewStatistics: boolean;
  canManageSystem: boolean;
}

// Union type for all user types
export type AuthUser = RegularUser | ClientAbonne | AgenceImmobiliere | Administrateur;

// User Statistics Models
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersByType: {
    UTILISATEUR: number;
    CLIENT_ABONNE: number;
    AGENCE_IMMOBILIERE: number;
    ADMINISTRATEUR: number;
  };
  verifiedAgencies: number;
  pendingVerifications: number;
}

// Platform Statistics Models
export interface PlatformStats {
  totalVisits: number;
  uniqueVisitors: number;
  averageSessionDuration: number;
  topPages: Array<{page: string; visits: number}>;
  userGrowth: Array<{date: string; count: number}>;
  geographicDistribution: Array<{country: string; visits: number}>;
}

// Visit Tracking Models
export interface PlatformVisit {
  id: number;
  ipAddress: string;
  userAgent: string;
  page: string;
  visitDate: Date;
  sessionId: string;
  country?: string;
  city?: string;
  userId?: number;
}

export interface VisitCreateRequest {
  page: string;
  userAgent: string;
  sessionId: string;
}

export interface VisitStats {
  totalVisits: number;
  uniqueVisitors: number;
  averageSessionDuration: number;
  topPages: Array<{page: string; visits: number; percentage: number}>;
  hourlyDistribution: Array<{hour: number; visits: number}>;
  dailyTrends: Array<{date: string; visits: number; uniqueVisitors: number}>;
}

// Admin Management Models
export interface UserManagementFilter {
  userType?: UserType;
  status?: UserStatus;
  verified?: boolean;
  emailVerified?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  searchTerm?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface UserManagementResponse {
  users: AuthUser[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface UserUpdateRequest {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  enabled?: boolean;
  // Agency specific
  nomAgence?: string;
  numeroLicence?: string;
  siteWeb?: string;
  nombreEmployes?: number;
  zonesCouverture?: string;
  // Client specific
  subscriptionType?: SubscriptionType;
  searchLimit?: number;
  // Admin specific
  adminLevel?: AdminLevel;
  canManageUsers?: boolean;
  canVerifyAgencies?: boolean;
  canViewStatistics?: boolean;
  canManageSystem?: boolean;
}

export interface AgencyVerificationRequest {
  verified: boolean;
  verificationNotes?: string;
}

export interface AgencyVerificationResponse {
  message: string;
  success: boolean;
  agency: AgenceImmobiliere;
}

// Dashboard Models
export interface DashboardStats {
  user: AuthUser;
  stats: any; // Will be specialized based on user type
  recentActivity: Array<{
    id: number;
    action: string;
    description: string;
    timestamp: Date;
    type: 'info' | 'success' | 'warning' | 'error';
  }>;
}

// Form Models for Multi-step Registration
export interface RegistrationStep1 {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  confirmPassword: string;
}

export interface RegistrationStep2 {
  telephone: string;
  adresse: string;
}

export interface RegistrationStep3 {
  userType: UserType;
}

export interface RegistrationStep4Agency {
  nomAgence: string;
  numeroLicence: string;
  siteWeb?: string;
  nombreEmployes?: number;
  zonesCouverture?: string;
}

export interface RegistrationStep4Client {
  subscriptionType: SubscriptionType;
}

export interface RegistrationStep4Admin {
  adminLevel: AdminLevel;
}

// Password Management
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  message: string;
  success: boolean;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface PasswordChangeResponse {
  message: string;
  success: boolean;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

// Error handling
export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

// JWT Token payload (for decoding)
export interface JwtPayload {
  sub: string; // email
  userId: number;
  userType: UserType;
  authorities: string[];
  iat: number;
  exp: number;
}