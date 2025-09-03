import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AnnonceService } from '../../services/annonce.service';
import { AnnonceCreateRequest, AnnonceUpdateRequest, TypeBien, TypeTransaction, AnnonceSummary } from '../../core/models';

@Component({
  selector: 'app-annonce-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './annonce-create.component.html',
  styleUrls: ['./annonce-create.component.scss']
})
export class AnnonceCreateComponent implements OnInit {
  annonceForm: FormGroup;
  isSubmitting = false;
  submitMessage = '';
  imageUrls: string[] = [];
  
  // Edit mode properties
  isEditMode = false;
  annonceId: number | null = null;
  currentAnnonce: AnnonceSummary | null = null;
  isLoading = false;

  typesBien = [
    { value: 'APPARTEMENT', label: 'Appartement' },
    { value: 'VILLA', label: 'Villa' },
    { value: 'STUDIO', label: 'Studio' },
    { value: 'DUPLEX', label: 'Duplex' },
    { value: 'PENTHOUSE', label: 'Penthouse' },
    { value: 'MAISON', label: 'Maison' },
    { value: 'TERRAIN', label: 'Terrain' },
    { value: 'LOCAL_COMMERCIAL', label: 'Local Commercial' },
    { value: 'BUREAU', label: 'Bureau' },
    { value: 'ENTREPOT', label: 'Entrepôt' }
  ];

  typesTransaction = [
    { value: 'VENTE', label: 'Vente' },
    { value: 'LOCATION', label: 'Location' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private annonceService: AnnonceService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.annonceForm = this.createForm();
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.annonceId = parseInt(id, 10);
        console.log('✏️ [ANNONCE-EDIT] Edit mode - loading annonce:', this.annonceId);
        this.loadAnnonceForEdit();
      } else {
        console.log('🏗️ [ANNONCE-CREATE] Create mode initialized');
      }
    });
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      // Basic information
      titre: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
      prix: [null, [Validators.required, Validators.min(1)]],
      typeBien: ['', Validators.required],
      typeTransaction: ['', Validators.required],
      
      // Location
      adresse: ['', [Validators.required, Validators.maxLength(500)]],
      ville: ['', [Validators.required, Validators.maxLength(100)]],
      codePostal: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      
      // Property details
      surface: [null, [Validators.min(1)]],
      nombreChambres: [null, [Validators.min(0)]],
      nombreSallesBain: [null, [Validators.min(0)]],
      etage: [null],
      
      // Features
      garage: [false],
      jardin: [false],
      piscine: [false],
      climatisation: [false],
      ascenseur: [false],
      
      // Contact
      nomContact: ['', [Validators.required, Validators.maxLength(100)]],
      telephoneContact: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      emailContact: ['', [Validators.email, Validators.maxLength(150)]],
      
      // Images
      imageUrl: ['']
    });
  }

  addImage(): void {
    const imageUrl = this.annonceForm.get('imageUrl')?.value;
    if (imageUrl && imageUrl.trim()) {
      this.imageUrls.push(imageUrl.trim());
      this.annonceForm.get('imageUrl')?.setValue('');
      console.log('🖼️ [ANNONCE-CREATE] Image added:', imageUrl);
    }
  }

  removeImage(index: number): void {
    this.imageUrls.splice(index, 1);
    console.log('🗑️ [ANNONCE-CREATE] Image removed at index:', index);
  }

  onSubmit(): void {
    console.log('📝 [ANNONCE-CREATE] Form submission started');
    
    if (this.annonceForm.valid) {
      this.isSubmitting = true;
      this.submitMessage = '';

      const formValue = this.annonceForm.value;
      const annonceData: AnnonceCreateRequest | AnnonceUpdateRequest = {
        titre: formValue.titre,
        description: formValue.description,
        prix: formValue.prix,
        typeBien: formValue.typeBien as TypeBien,
        typeTransaction: formValue.typeTransaction as TypeTransaction,
        adresse: formValue.adresse,
        ville: formValue.ville,
        codePostal: formValue.codePostal,
        surface: formValue.surface || undefined,
        nombreChambres: formValue.nombreChambres || undefined,
        nombreSallesBain: formValue.nombreSallesBain || undefined,
        etage: formValue.etage || undefined,
        garage: formValue.garage,
        jardin: formValue.jardin,
        piscine: formValue.piscine,
        climatisation: formValue.climatisation,
        ascenseur: formValue.ascenseur,
        images: this.imageUrls.length > 0 ? this.imageUrls : undefined,
        nomContact: formValue.nomContact,
        telephoneContact: formValue.telephoneContact,
        emailContact: formValue.emailContact || undefined
      };

      console.log('📤 [ANNONCE-CREATE] Submitting annonce data:', annonceData);

      const request = this.isEditMode ? 
        this.annonceService.updateAnnonce(this.annonceId!, annonceData as AnnonceUpdateRequest) : 
        this.annonceService.createAnnonce(annonceData as AnnonceCreateRequest);
      
      request.subscribe({
        next: (response) => {
          console.log(`✅ [ANNONCE-${this.isEditMode ? 'EDIT' : 'CREATE'}] Annonce ${this.isEditMode ? 'updated' : 'created'} successfully:`, response);
          this.submitMessage = `Annonce ${this.isEditMode ? 'modifiée' : 'créée'} avec succès !`;
          this.isSubmitting = false;
          
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/agency/properties']);
          }, 2000);
        },
        error: (error) => {
          console.error(`❌ [ANNONCE-${this.isEditMode ? 'EDIT' : 'CREATE'}] Error ${this.isEditMode ? 'updating' : 'creating'} annonce:`, error);
          
          // Show specific validation errors if available
          if (error.error && typeof error.error === 'object') {
            const errorMessages = Object.values(error.error).join(', ');
            this.submitMessage = `Erreurs de validation: ${errorMessages}`;
          } else {
            this.submitMessage = `Erreur lors de ${this.isEditMode ? 'la modification' : 'la création'} de l'annonce. Veuillez réessayer.`;
          }
          
          this.isSubmitting = false;
        }
      });
    } else {
      console.log(`⚠️ [ANNONCE-${this.isEditMode ? 'EDIT' : 'CREATE'}] Form is invalid`);
      this.markFormGroupTouched(this.annonceForm);
      this.submitMessage = 'Veuillez corriger les erreurs dans le formulaire.';
    }
  }

  private loadAnnonceForEdit(): void {
    if (!this.annonceId) return;
    
    this.isLoading = true;
    this.annonceService.getAnnonceById(this.annonceId).subscribe({
      next: (annonce) => {
        console.log('✅ [ANNONCE-EDIT] Annonce loaded for editing:', annonce);
        this.currentAnnonce = annonce;
        this.populateForm(annonce);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ [ANNONCE-EDIT] Error loading annonce:', error);
        this.submitMessage = 'Erreur lors du chargement de l\'annonce.';
        this.isLoading = false;
        // Redirect back to properties if annonce not found
        setTimeout(() => {
          this.router.navigate(['/agency/properties']);
        }, 2000);
      }
    });
  }

  private populateForm(annonce: any): void {
    // Populate basic fields
    this.annonceForm.patchValue({
      titre: annonce.titre,
      description: annonce.description,
      prix: annonce.prix,
      typeBien: annonce.typeBien,
      typeTransaction: annonce.typeTransaction,
      adresse: annonce.adresse,
      ville: annonce.ville,
      codePostal: annonce.codePostal,
      surface: annonce.surface,
      nombreChambres: annonce.nombreChambres,
      nombreSallesBain: annonce.nombreSallesBain,
      etage: annonce.etage,
      garage: annonce.garage || false,
      jardin: annonce.jardin || false,
      piscine: annonce.piscine || false,
      climatisation: annonce.climatisation || false,
      ascenseur: annonce.ascenseur || false,
      nomContact: annonce.nomContact,
      telephoneContact: annonce.telephoneContact,
      emailContact: annonce.emailContact
    });
    
    // Populate images
    if (annonce.images && annonce.images.length > 0) {
      this.imageUrls = [...annonce.images];
    }
  }
  
  getPageTitle(): string {
    return this.isEditMode ? 'Modifier l\'annonce' : 'Créer une nouvelle annonce';
  }
  
  getSubmitButtonText(): string {
    return this.isEditMode ? 'Modifier l\'annonce' : 'Créer l\'annonce';
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control && (control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.annonceForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.annonceForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return 'Ce champ est requis';
      if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
      if (field.errors['maxlength']) return `Maximum ${field.errors['maxlength'].requiredLength} caractères`;
      if (field.errors['min']) return `Valeur minimum: ${field.errors['min'].min}`;
      if (field.errors['pattern']) return 'Format invalide';
      if (field.errors['email']) return 'Email invalide';
    }
    return '';
  }

  cancel(): void {
    console.log('❌ [ANNONCE-CREATE] Form cancelled');
    this.router.navigate(['/agency/properties']);
  }
}