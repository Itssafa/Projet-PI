import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnonceService } from '../../services/annonce.service';
import { Annonce } from '../../core/models';

@Component({
  selector: 'app-annonce-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './annonce-view.component.html',
  styleUrls: ['./annonce-view.component.scss']
})
export class AnnonceViewComponent implements OnInit {
  annonce: Annonce | null = null;
  isLoading = true;
  error: string | null = null;
  currentImageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private annonceService: AnnonceService
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
      },
      error: (error) => {
        console.error('❌ [ANNONCE-VIEW] Error loading annonce:', error);
        this.error = 'Annonce introuvable';
        this.isLoading = false;
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
}