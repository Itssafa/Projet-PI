import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { 
  Annonce, 
  AnnonceSummary, 
  AnnonceCreateRequest, 
  AnnonceUpdateRequest, 
  AnnonceSearchFilters, 
  AnnonceStats, 
  PagedResponse,
  TypeBien,
  TypeTransaction,
  StatusAnnonce
} from '../core/models';

const BASE_URL = 'http://localhost:8080/api/annonces';

@Injectable({ providedIn: 'root' })
export class AnnonceService {

  constructor(private http: HttpClient) { }

  // Search annonces with filters
  searchAnnonces(filters: AnnonceSearchFilters = {}): Observable<PagedResponse<AnnonceSummary>> {
    let params = new HttpParams();
    
    if (filters.titre) params = params.set('titre', filters.titre);
    if (filters.typeBien) params = params.set('typeBien', filters.typeBien);
    if (filters.typeTransaction) params = params.set('typeTransaction', filters.typeTransaction);
    if (filters.ville) params = params.set('ville', filters.ville);
    if (filters.prixMin !== undefined) params = params.set('prixMin', filters.prixMin.toString());
    if (filters.prixMax !== undefined) params = params.set('prixMax', filters.prixMax.toString());
    if (filters.surfaceMin !== undefined) params = params.set('surfaceMin', filters.surfaceMin.toString());
    if (filters.surfaceMax !== undefined) params = params.set('surfaceMax', filters.surfaceMax.toString());
    if (filters.nombreChambresMin !== undefined) params = params.set('nombreChambresMin', filters.nombreChambresMin.toString());
    if (filters.nombreSallesBainMin !== undefined) params = params.set('nombreSallesBainMin', filters.nombreSallesBainMin.toString());
    if (filters.garage !== undefined) params = params.set('garage', filters.garage.toString());
    if (filters.jardin !== undefined) params = params.set('jardin', filters.jardin.toString());
    if (filters.piscine !== undefined) params = params.set('piscine', filters.piscine.toString());
    if (filters.climatisation !== undefined) params = params.set('climatisation', filters.climatisation.toString());
    if (filters.ascenseur !== undefined) params = params.set('ascenseur', filters.ascenseur.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortDirection) params = params.set('sortDirection', filters.sortDirection);
    if (filters.page !== undefined) params = params.set('page', filters.page.toString());
    if (filters.size !== undefined) params = params.set('size', filters.size.toString());

    return this.http.get<any>(BASE_URL, { params }).pipe();
  }

  // Get annonce by ID
  getAnnonceById(id: number): Observable<Annonce> {
    return this.http.get<Annonce>(`${BASE_URL}/${id}`);
  }

  // Create new annonce
  createAnnonce(annonce: AnnonceCreateRequest): Observable<Annonce> {
    return this.http.post<Annonce>(BASE_URL, annonce);
  }

  // Update annonce
  updateAnnonce(id: number, annonce: AnnonceUpdateRequest): Observable<Annonce> {
    return this.http.put<Annonce>(`${BASE_URL}/${id}`, annonce);
  }

  // Delete annonce
  deleteAnnonce(id: number): Observable<any> {
    return this.http.delete(`${BASE_URL}/${id}`);
  }

  // Get my annonces
  getMyAnnonces(page = 0, size = 10): Observable<PagedResponse<AnnonceSummary>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    console.log('🔄 [ANNONCE-SERVICE] Getting my annonces - page:', page, 'size:', size);
    return this.http.get<PagedResponse<AnnonceSummary>>(`${BASE_URL}/me`, { params });
  }

  // Get popular annonces
  getPopularAnnonces(limit = 10): Observable<AnnonceSummary[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<AnnonceSummary[]>(`${BASE_URL}/popular`, { params });
  }

  // Get recent annonces
  getRecentAnnonces(days = 7, limit = 10): Observable<AnnonceSummary[]> {
    const params = new HttpParams()
      .set('days', days.toString())
      .set('limit', limit.toString());
    
    return this.http.get<AnnonceSummary[]>(`${BASE_URL}/recent`, { params });
  }

  // Get similar annonces
  getSimilarAnnonces(id: number, limit = 5): Observable<AnnonceSummary[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<AnnonceSummary[]>(`${BASE_URL}/${id}/similar`, { params });
  }

  // Get my annonce stats
  getMyAnnonceStats(): Observable<AnnonceStats> {
    return this.http.get<AnnonceStats>(`${BASE_URL}/stats/me`);
  }

  // Get global stats (admin only)
  getGlobalStats(): Observable<AnnonceStats> {
    return this.http.get<AnnonceStats>(`${BASE_URL}/stats/global`);
  }

  // Get annonce types
  getAnnonceTypes(): Observable<{
    typesBien: TypeBien[],
    typesTransaction: TypeTransaction[],
    statusAnnonce: StatusAnnonce[]
  }> {
    return this.http.get<any>(`${BASE_URL}/types`);
  }

  // Comment methods
  createComment(annonceId: number, commentData: { content: string; rating: number }): Observable<any> {
    console.log('📝 [ANNONCE-SERVICE] Creating comment for annonce:', annonceId, commentData);
    return this.http.post<any>(`http://localhost:8080/api/comments/annonce/${annonceId}`, commentData).pipe(
      tap(response => console.log('✅ [ANNONCE-SERVICE] Comment created:', response)),
      catchError(error => {
        console.error('❌ [ANNONCE-SERVICE] Error creating comment:', error);
        return throwError(() => error);
      })
    );
  }

  getCommentsByAnnonce(annonceId: number): Observable<any[]> {
    console.log('💬 [ANNONCE-SERVICE] Loading comments for annonce:', annonceId);
    return this.http.get<any[]>(`http://localhost:8080/api/comments/annonce/${annonceId}`).pipe(
      tap(response => console.log('✅ [ANNONCE-SERVICE] Comments loaded:', response)),
      catchError(error => {
        console.error('❌ [ANNONCE-SERVICE] Error loading comments:', error);
        return throwError(() => error);
      })
    );
  }

  getAnnonceCommentStats(annonceId: number): Observable<{ averageRating: number; commentCount: number }> {
    console.log('📊 [ANNONCE-SERVICE] Loading comment stats for annonce:', annonceId);
    return this.http.get<{ averageRating: number; commentCount: number }>(`http://localhost:8080/api/comments/annonce/${annonceId}/stats`).pipe(
      tap(response => console.log('✅ [ANNONCE-SERVICE] Comment stats loaded:', response)),
      catchError(error => {
        console.error('❌ [ANNONCE-SERVICE] Error loading comment stats:', error);
        return throwError(() => error);
      })
    );
  }

  getCommentsForMyAnnonces(page: number = 0, size: number = 10): Observable<any> {
    console.log('📋 [ANNONCE-SERVICE] Loading comments for my annonces');
    return this.http.get<any>(`http://localhost:8080/api/comments/my-annonces?page=${page}&size=${size}`).pipe(
      tap(response => console.log('✅ [ANNONCE-SERVICE] My annonce comments loaded:', response)),
      catchError(error => {
        console.error('❌ [ANNONCE-SERVICE] Error loading my annonce comments:', error);
        return throwError(() => error);
      })
    );
  }

  createReply(parentCommentId: number, replyContent: string): Observable<any> {
    console.log('💬 [ANNONCE-SERVICE] Creating reply for comment:', parentCommentId, replyContent);
    return this.http.post<any>(`http://localhost:8080/api/comments/reply/${parentCommentId}`, { content: replyContent }).pipe(
      tap(response => console.log('✅ [ANNONCE-SERVICE] Reply created:', response)),
      catchError(error => {
        console.error('❌ [ANNONCE-SERVICE] Error creating reply:', error);
        return throwError(() => error);
      })
    );
  }

  // Helper methods for display values
  getTypeBienDisplayName(type: TypeBien): string {
    const displayNames: { [key in TypeBien]: string } = {
      'APPARTEMENT': 'Appartement',
      'VILLA': 'Villa',
      'STUDIO': 'Studio',
      'DUPLEX': 'Duplex',
      'PENTHOUSE': 'Penthouse',
      'MAISON': 'Maison',
      'TERRAIN': 'Terrain',
      'LOCAL_COMMERCIAL': 'Local Commercial',
      'BUREAU': 'Bureau',
      'ENTREPOT': 'Entrepôt'
    };
    return displayNames[type] || type;
  }

  getTypeTransactionDisplayName(type: TypeTransaction): string {
    const displayNames: { [key in TypeTransaction]: string } = {
      'VENTE': 'Vente',
      'LOCATION': 'Location'
    };
    return displayNames[type] || type;
  }

  getStatusAnnonceDisplayName(status: StatusAnnonce): string {
    const displayNames: { [key in StatusAnnonce]: string } = {
      'ACTIVE': 'Active',
      'INACTIVE': 'Inactive', 
      'VENDU': 'Vendu',
      'LOUE': 'Loué',
      'EXPIRE': 'Expiré',
      'BROUILLON': 'Brouillon'
    };
    return displayNames[status] || status;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(price);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}