import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnonceService } from '../../services/annonce.service';
import { AuthService } from '../../services/auth.service';
import { Annonce } from '../../core/models';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-annonce-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './annonce-view.component.html',
  styleUrls: ['./annonce-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AnnonceViewComponent implements OnInit {
  annonce: Annonce | null = null;
  isLoading = true;
  error: string | null = null;
  currentImageIndex = 0;

  // Comment-related properties
  comments: any[] = [];
  commentStats: { averageRating: number; commentCount: number } | null = null;
  isLoadingComments = false;
  newComment = '';
  selectedRating = 0;
  isSubmittingComment = false;

  // Reply functionality
  replyingToComment: number | null = null;
  replyContent = '';
  isSubmittingReply = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private annonceService: AnnonceService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadAnnonce(parseInt(id, 10));
      } else {
        this.error = 'ID de l\'annonce manquant';
        this.isLoading = false;
      }
    });
  }

  private loadAnnonce(id: number): void {
    this.isLoading = true;
    this.annonceService.getAnnonceById(id).subscribe({
      next: (annonce) => {
        console.log('✅ [ANNONCE-VIEW] Annonce loaded:', annonce);
        this.annonce = annonce;
        this.isLoading = false;
        // Load comments and stats after loading the annonce
        this.loadComments(id);
        this.loadCommentStats(id);
      },
      error: (error) => {
        console.error('❌ [ANNONCE-VIEW] Error loading annonce:', error);
        this.error = 'Annonce introuvable';
        this.isLoading = false;
      }
    });
  }

  private loadComments(annonceId: number): void {
    this.isLoadingComments = true;
    this.annonceService.getCommentsByAnnonce(annonceId).subscribe({
      next: (comments) => {
        console.log('✅ [ANNONCE-VIEW] Comments loaded:', comments);
        console.log('✅ [ANNONCE-VIEW] Comments count:', comments?.length || 0);
        console.log('✅ [ANNONCE-VIEW] Current user authenticated:', this.authService.isAuthenticated);
        console.log('✅ [ANNONCE-VIEW] Current user:', this.authService.currentUser);
        this.comments = comments || [];
        this.isLoadingComments = false;
      },
      error: (error) => {
        console.error('❌ [ANNONCE-VIEW] Error loading comments:', error);
        this.comments = [];
        this.isLoadingComments = false;
      }
    });
  }

  private loadCommentStats(annonceId: number): void {
    this.annonceService.getAnnonceCommentStats(annonceId).subscribe({
      next: (stats) => {
        console.log('✅ [ANNONCE-VIEW] Comment stats loaded:', stats);
        this.commentStats = stats;
      },
      error: (error) => {
        console.error('❌ [ANNONCE-VIEW] Error loading comment stats:', error);
        this.commentStats = { averageRating: 0, commentCount: 0 };
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/agency/properties']);
  }

  editAnnonce(): void {
    if (this.annonce?.id) {
      this.router.navigate(['/annonce-edit', this.annonce.id]);
    }
  }

  // Image gallery methods
  nextImage(): void {
    if (this.annonce?.images && this.annonce.images.length > 1) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.annonce.images.length;
    }
  }

  previousImage(): void {
    if (this.annonce?.images && this.annonce.images.length > 1) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.annonce.images.length - 1 
        : this.currentImageIndex - 1;
    }
  }

  selectImage(index: number): void {
    this.currentImageIndex = index;
  }

  // Helper methods
  formatPrice(price: number): string {
    return this.annonceService.formatPrice(price);
  }

  getTypeBienDisplay(type: string): string {
    return this.annonceService.getTypeBienDisplayName(type as any);
  }

  getTypeTransactionDisplay(type: string): string {
    return this.annonceService.getTypeTransactionDisplayName(type as any);
  }

  getStatusDisplay(status: string): string {
    return this.annonceService.getStatusAnnonceDisplayName(status as any);
  }

  formatDate(dateString: string): string {
    return this.annonceService.formatDate(dateString);
  }

  getCurrentImage(): string | null {
    if (this.annonce?.images && this.annonce.images.length > 0) {
      return this.annonce.images[this.currentImageIndex];
    }
    return null;
  }

  hasMultipleImages(): boolean {
    return this.annonce?.images ? this.annonce.images.length > 1 : false;
  }

  // Comment-related methods
  canComment(): boolean {
    const isAuth = this.authService.isAuthenticated;
    const currentUser = this.authService.currentUser;
    console.log('🔍 [ANNONCE-VIEW] Can comment check:', {
      isAuthenticated: isAuth,
      currentUser: currentUser,
      userType: currentUser?.userType
    });
    return isAuth;
  }

  isCurrentUserSubscriber(): boolean {
    return this.authService.currentUser?.userType === 'CLIENT_ABONNE';
  }

  shouldShowComments(): boolean {
    // All authenticated users can see comments
    return this.authService.isAuthenticated;
  }

  setRating(rating: number): void {
    this.selectedRating = rating;
  }

  canSubmitComment(): boolean {
    return this.selectedRating > 0 && 
           this.newComment.trim().length > 0 && 
           !this.isSubmittingComment;
  }

  submitComment(): void {
    if (!this.canSubmitComment() || !this.annonce?.id) {
      return;
    }

    this.isSubmittingComment = true;
    const commentData = {
      content: this.newComment.trim(),
      rating: this.selectedRating
    };

    this.annonceService.createComment(this.annonce.id, commentData).subscribe({
      next: (response) => {
        console.log('✅ [ANNONCE-VIEW] Comment submitted:', response);
        // Reset form
        this.newComment = '';
        this.selectedRating = 0;
        this.isSubmittingComment = false;
        
        // Reload comments and stats
        this.loadComments(this.annonce!.id);
        this.loadCommentStats(this.annonce!.id);
      },
      error: (error) => {
        console.error('❌ [ANNONCE-VIEW] Error submitting comment:', error);
        this.isSubmittingComment = false;
        // You could add a toast notification here for better UX
      }
    });
  }

  getAverageRatingRounded(): number {
    return Math.round(this.commentStats?.averageRating || 0);
  }

  getUserTypeDisplay(userType: string): string {
    const displayNames: { [key: string]: string } = {
      'UTILISATEUR': 'Utilisateur',
      'CLIENT_ABONNE': 'Client Abonné',
      'AGENCE_IMMOBILIERE': 'Agence Immobilière',
      'ADMINISTRATEUR': 'Administrateur'
    };
    return displayNames[userType] || userType;
  }

  // TrackBy function for better performance
  trackByCommentId(index: number, comment: any): any {
    return comment?.id || index;
  }

  // Reply functionality methods
  canReply(): boolean {
    // Only the owner of the annonce (agencies) can reply to comments
    const currentUser = this.authService.currentUser;
    return currentUser?.userType === 'AGENCE_IMMOBILIERE' && 
           this.annonce?.createurId === currentUser?.id;
  }

  startReply(commentId: number): void {
    console.log('💬 [ANNONCE-VIEW-REPLY] Starting reply to comment:', commentId);
    this.replyingToComment = commentId;
    this.replyContent = '';
  }

  cancelReply(): void {
    console.log('❌ [ANNONCE-VIEW-REPLY] Cancelling reply');
    this.replyingToComment = null;
    this.replyContent = '';
  }

  submitReply(commentId: number): void {
    if (!this.replyContent.trim()) {
      alert('Veuillez saisir votre réponse');
      return;
    }

    console.log('📝 [ANNONCE-VIEW-REPLY] Submitting reply to comment:', commentId, 'Content:', this.replyContent);
    
    this.isSubmittingReply = true;
    const replySub = this.annonceService.createReply(commentId, this.replyContent.trim()).subscribe({
      next: (response) => {
        console.log('✅ [ANNONCE-VIEW-REPLY] Reply submitted successfully:', response);
        alert('Réponse envoyée avec succès !');
        
        // Clear reply form
        this.replyingToComment = null;
        this.replyContent = '';
        this.isSubmittingReply = false;
        
        // Reload comments to show the new reply
        if (this.annonce?.id) {
          this.loadComments(this.annonce.id);
        }
      },
      error: (error) => {
        console.error('❌ [ANNONCE-VIEW-REPLY] Error submitting reply:', error);
        const errorMessage = error.error?.message || 'Erreur lors de l\'envoi de la réponse';
        alert(errorMessage);
        this.isSubmittingReply = false;
      }
    });
  }
}