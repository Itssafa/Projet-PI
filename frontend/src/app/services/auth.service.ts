import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError, of } from 'rxjs';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  RegisterResponse,
  AuthUser, 
  EmailVerificationResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  PasswordChangeRequest,
  PasswordChangeResponse,
  UserStats,
  PlatformStats,
  VisitStats,
  UserManagementFilter,
  UserManagementResponse,
  AgencyVerificationRequest,
  AgencyVerificationResponse,
  DashboardStats,
  ApiResponse,
  UserType,
  ClientAbonne,
  AgenceImmobiliere,
  Administrateur,
  UserUpdateRequest,
  VisitCreateRequest,
  JwtPayload
} from '../core/models';

const BASE_URL = 'http://localhost:8080';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'jwt_token';
  private readonly USER_KEY = 'auth_user';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  private _currentUser$ = new BehaviorSubject<AuthUser | null>(this.readUserFromStorage());
  currentUser$ = this._currentUser$.asObservable();

  private _isLoading$ = new BehaviorSubject<boolean>(false);
  isLoading$ = this._isLoading$.asObservable();

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  // --- Initialization ---
  private initializeAuth(): void {
    const token = this.token;
    if (token && this.isTokenValid(token)) {
      this.trackVisit();
    } else if (token) {
      this.logout();
    }
  }

  // --- Helper Methods ---
  private readUserFromStorage(): AuthUser | null {
    const json = localStorage.getItem(this.USER_KEY);
    try { 
      return json ? (JSON.parse(json) as AuthUser) : null; 
    } catch { 
      return null; 
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      const now = Math.floor(Date.now() / 1000);
      const isValid = payload.exp > now;
      
      // Debug: Log token validity
      console.log('Token validation:', {
        tokenExists: !!token,
        expiresAt: new Date(payload.exp * 1000),
        currentTime: new Date(),
        isValid: isValid,
        timeUntilExpiry: payload.exp - now
      });
      
      return isValid;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  private decodeToken(token: string): JwtPayload {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }

  private setLoading(loading: boolean): void {
    this._isLoading$.next(loading);
  }

  // --- Getters ---
  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  get currentUser(): AuthUser | null {
    return this._currentUser$.value;
  }

  get isAuthenticated(): boolean {
    const token = this.token;
    return !!token && this.isTokenValid(token);
  }

  get userType(): UserType | null {
    return this.currentUser?.userType || null;
  }

  // --- Authentication Endpoints ---
  
  /**
   * POST /api/auth/login
   * Authenticate user and get JWT token
   */
  login(payload: LoginRequest): Observable<LoginResponse> {
    this.setLoading(true);
    return this.http.post<LoginResponse>(`${BASE_URL}/api/auth/login`, payload).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        this._currentUser$.next(response.user);
        this.trackVisit(); // Track login visit
        this.setLoading(false);
      }),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * POST /api/auth/register
   * Register new user with role-specific data
   */
  register(payload: RegisterRequest): Observable<RegisterResponse> {
    this.setLoading(true);
    
    // Ensure proper headers for JSON payload
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Log the payload for debugging (remove in production)
    console.log('Registration payload:', JSON.stringify(payload, null, 2));
    
    return this.http.post<RegisterResponse>(`${BASE_URL}/api/auth/register`, payload, { headers }).pipe(
      tap((response) => {
        console.log('Registration response:', response);
        this.setLoading(false);
      }),
      tap(
        () => this.setLoading(false),
        (error) => {
          console.error('Registration error:', error);
          this.setLoading(false);
        }
      )
    );
  }

  /**
   * GET /api/auth/verify-email?token=
   * Verify user email with token
   */
  verifyEmail(token: string): Observable<EmailVerificationResponse> {
    const params = new HttpParams().set('token', token);
    return this.http.get<EmailVerificationResponse>(`${BASE_URL}/api/auth/verify-email`, { params });
  }

  /**
   * POST /api/auth/resend-verification
   * Resend email verification
   */
  resendVerification(payload: ResendVerificationRequest): Observable<ResendVerificationResponse> {
    return this.http.post<ResendVerificationResponse>(`${BASE_URL}/api/auth/resend-verification`, payload);
  }

  // --- User Management Endpoints ---

  /**
   * GET /api/users/me
   * Get current user profile
   */
  getProfile(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${BASE_URL}/api/users/me`).pipe(
      tap(user => {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this._currentUser$.next(user);
      })
    );
  }

  /**
   * PUT /api/users/me
   * Update current user profile
   */
  updateProfile(payload: UserUpdateRequest): Observable<AuthUser> {
    // Check token validity before making request
    if (!this.isAuthenticated) {
      console.error('User not authenticated, clearing storage and redirecting');
      this.logout();
      return throwError(() => new Error('Session expired. Please login again.'));
    }
    
    return this.http.put<AuthUser>(`${BASE_URL}/api/users/me`, payload).pipe(
      tap(user => {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this._currentUser$.next(user);
      })
    );
  }

  /**
   * GET /api/users/stats
   * Get user dashboard statistics
   */
  getUserStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${BASE_URL}/api/users/stats`);
  }

  // --- Admin Endpoints ---

  /**
   * GET /api/admin/dashboard
   * Get admin dashboard statistics
   */
  getAdminDashboard(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${BASE_URL}/api/admin/dashboard`);
  }

  /**
   * GET /api/admin/users
   * Get users with filtering and pagination
   */
  getUsers(filter: UserManagementFilter = {}): Observable<UserManagementResponse> {
    let params = new HttpParams();
    
    if (filter.userType) params = params.set('userType', filter.userType);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.verified !== undefined) params = params.set('verified', filter.verified.toString());
    if (filter.emailVerified !== undefined) params = params.set('emailVerified', filter.emailVerified.toString());
    if (filter.searchTerm) params = params.set('search', filter.searchTerm);
    if (filter.page !== undefined) params = params.set('page', filter.page.toString());
    if (filter.size !== undefined) params = params.set('size', filter.size.toString());
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.sortDirection) params = params.set('sortDirection', filter.sortDirection);

    return this.http.get<UserManagementResponse>(`${BASE_URL}/api/admin/users`, { params });
  }

  /**
   * PUT /api/admin/users/{id}/status
   * Update user status (enable/disable)
   */
  updateUserStatus(userId: number, enabled: boolean): Observable<ApiResponse<AuthUser>> {
    return this.http.put<ApiResponse<AuthUser>>(`${BASE_URL}/api/admin/users/${userId}/status`, { enabled });
  }

  /**
   * DELETE /api/admin/users/{id}
   * Delete user account
   */
  deleteUser(userId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${BASE_URL}/api/admin/users/${userId}`);
  }

  /**
   * PUT /api/admin/verify-agency/{id}
   * Verify or reject agency
   */
  verifyAgency(agencyId: number, payload: AgencyVerificationRequest): Observable<AgencyVerificationResponse> {
    return this.http.put<AgencyVerificationResponse>(`${BASE_URL}/api/admin/verify-agency/${agencyId}`, payload);
  }

  /**
   * GET /api/admin/statistics
   * Get comprehensive admin statistics
   */
  getAdminStatistics(): Observable<UserStats & PlatformStats> {
    return this.http.get<UserStats & PlatformStats>(`${BASE_URL}/api/admin/statistics`);
  }

  // --- Visit Tracking Endpoints ---

  /**
   * POST /api/visits/
   * Track platform visit
   */
  trackVisit(page?: string): Observable<void> {
    const payload: VisitCreateRequest = {
      page: page || window.location.pathname,
      userAgent: navigator.userAgent,
      sessionId: this.getOrCreateSessionId()
    };
    return this.http.post<void>(`${BASE_URL}/api/visits`, payload);
  }

  /**
   * GET /api/visits/stats
   * Get visit statistics
   */
  getVisitStats(): Observable<VisitStats> {
    return this.http.get<VisitStats>(`${BASE_URL}/api/visits/stats`);
  }

  // --- Statistics Endpoints ---

  /**
   * GET /api/statistics/platform
   * Get platform-wide statistics
   */
  getPlatformStatistics(): Observable<PlatformStats> {
    return this.http.get<PlatformStats>(`${BASE_URL}/api/statistics/platform`);
  }

  /**
   * GET /api/statistics/users
   * Get user statistics
   */
  getUserStatistics(): Observable<UserStats> {
    return this.http.get<UserStats>(`${BASE_URL}/api/statistics/users`);
  }

  // --- Password Management ---

  /**
   * POST /api/auth/forgot-password
   * Request password reset
   */
  requestPasswordReset(payload: PasswordResetRequest): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>(`${BASE_URL}/api/auth/forgot-password`, payload);
  }

  /**
   * POST /api/auth/change-password
   * Change user password
   */
  changePassword(payload: PasswordChangeRequest): Observable<PasswordChangeResponse> {
    return this.http.post<PasswordChangeResponse>(`${BASE_URL}/api/auth/change-password`, payload);
  }

  // --- Role-Based Access Control ---

  /**
   * Check if user has specific role
   */
  hasRole(role: UserType): boolean {
    return this.currentUser?.userType === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: UserType[]): boolean {
    return this.currentUser ? roles.includes(this.currentUser.userType) : false;
  }

  /**
   * Check if user can access admin features
   */
  canAccessAdmin(): boolean {
    return this.hasRole('ADMINISTRATEUR');
  }

  /**
   * Check if user can access agency features
   */
  canAccessAgency(): boolean {
    return this.hasAnyRole(['AGENCE_IMMOBILIERE', 'ADMINISTRATEUR']);
  }

  /**
   * Check if user can access premium features
   */
  canAccessPremium(): boolean {
    return this.hasAnyRole(['CLIENT_ABONNE', 'AGENCE_IMMOBILIERE', 'ADMINISTRATEUR']);
  }

  /**
   * Check if agency is verified
   */
  isAgencyVerified(): boolean {
    const user = this.currentUser;
    return user?.userType === 'AGENCE_IMMOBILIERE' && 
           'verified' in user && user.verified === true;
  }

  /**
   * Get user's display name
   */
  getUserDisplayName(): string {
    const user = this.currentUser;
    if (!user) return '';
    return `${user.prenom} ${user.nom}`;
  }

  /**
   * Get user role display name
   */
  getUserRoleDisplayName(): string {
    switch (this.userType) {
      case 'UTILISATEUR': return 'Utilisateur Standard';
      case 'CLIENT_ABONNE': return 'Client Abonné';
      case 'AGENCE_IMMOBILIERE': return 'Agence Immobilière';
      case 'ADMINISTRATEUR': return 'Administrateur';
      default: return 'Utilisateur';
    }
  }

  // --- Session Management ---

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Logout user and clear all data
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem('session_id');
    this._currentUser$.next(null);
    this.setLoading(false);
  }

  /**
   * Check if email verification is required
   */
  isEmailVerificationRequired(): boolean {
    const user = this.currentUser;
    return user ? !user.emailVerified : false;
  }

  /**
   * Check if agency verification is required
   */
  isAgencyVerificationRequired(): boolean {
    const user = this.currentUser;
    return user?.userType === 'AGENCE_IMMOBILIERE' && 
           'verified' in user && user.verified === false;
  }

  /**
   * Refresh user data from server
   */
  refreshUserData(): Observable<AuthUser> {
    return this.getProfile();
  }

  /**
   * Check if user account is enabled
   */
  isAccountEnabled(): boolean {
    return this.currentUser?.enabled === true;
  }

  /**
   * Get current JWT token payload
   */
  getTokenPayload(): JwtPayload | null {
    const token = this.token;
    if (!token) return null;
    
    try {
      return this.decodeToken(token);
    } catch {
      return null;
    }
  }

  /**
   * Update current user state
   */
  updateCurrentUser(user: AuthUser): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._currentUser$.next(user);
  }
}