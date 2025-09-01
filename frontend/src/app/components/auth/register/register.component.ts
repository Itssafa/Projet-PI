import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  RegisterRequest,
  UserType,
  SubscriptionType,
  AdminLevel
} from '../../../core/models';

// Keep the form step interfaces from the original models for now
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
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  currentStep = 1;
  totalSteps = 4;
  isLoading = false;
  error = '';
  success = '';

  // Form groups for each step
  step1Form!: FormGroup;
  step2Form!: FormGroup;
  step3Form!: FormGroup;
  step4Form!: FormGroup;

  // Selected user type
  selectedUserType: UserType | null = null;

  // User type options with descriptions
  userTypeOptions = [
    {
      value: 'UTILISATEUR' as UserType,
      label: 'Utilisateur Standard',
      description: 'Accès de base à la plateforme',
      icon: 'person',
      features: ['Consultation des annonces', 'Recherche basique', 'Profil personnel']
    },
    {
      value: 'CLIENT_ABONNE' as UserType,
      label: 'Client Abonné',
      description: 'Fonctionnalités premium avec abonnement',
      icon: 'star',
      features: ['Recherche avancée', 'Alertes personnalisées', 'Statistiques détaillées', 'Support prioritaire']
    },
    {
      value: 'AGENCE_IMMOBILIERE' as UserType,
      label: 'Agence Immobilière',
      description: 'Gestion complète pour les professionnels',
      icon: 'business',
      features: ['Gestion des biens', 'CRM clients', 'Équipe et collaborateurs', 'Analytics avancées']
    },
    {
      value: 'ADMINISTRATEUR' as UserType,
      label: 'Administrateur',
      description: 'Accès administrateur système',
      icon: 'admin_panel_settings',
      features: ['Gestion des utilisateurs', 'Vérification des agences', 'Statistiques globales', 'Configuration système']
    }
  ];

  subscriptionOptions: SubscriptionType[] = ['BASIC', 'PREMIUM', 'VIP'];
  adminLevels: AdminLevel[] = ['SUPPORT', 'MODERATOR', 'SUPER_ADMIN'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForms();
  }

  private initializeForms(): void {
    // Step 1: Basic Information
    this.step1Form = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      prenom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [
        Validators.required, 
        Validators.minLength(8), 
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Step 2: Contact Information
    this.step2Form = this.fb.group({
      telephone: ['', [
        Validators.required, 
        Validators.pattern(/^\d{8}$/),
        Validators.minLength(8),
        Validators.maxLength(8)
      ]],
      adresse: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]]
    });

    // Step 3: User Type Selection
    this.step3Form = this.fb.group({
      userType: ['', [Validators.required]]
    });

    // Step 4: Role-specific Information (initialized dynamically)
    this.step4Form = this.fb.group({});
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('motDePasse');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    
    return null;
  }

  // Step navigation
  nextStep(): void {
    if (this.isCurrentStepValid()) {
      if (this.currentStep === 3) {
        this.setupStep4Form();
      }
      this.currentStep++;
    } else {
      this.markFormGroupTouched(this.getCurrentForm());
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step <= this.currentStep || this.isStepAccessible(step)) {
      this.currentStep = step;
    }
  }

  isCurrentStepValid(): boolean {
    const currentForm = this.getCurrentForm();
    return currentForm ? currentForm.valid : false;
  }

  isStepAccessible(step: number): boolean {
    // Logic to determine if a step is accessible
    switch (step) {
      case 1: return true;
      case 2: return this.step1Form.valid;
      case 3: return this.step1Form.valid && this.step2Form.valid;
      case 4: return this.step1Form.valid && this.step2Form.valid && this.step3Form.valid;
      default: return false;
    }
  }

  private getCurrentForm(): FormGroup {
    switch (this.currentStep) {
      case 1: return this.step1Form;
      case 2: return this.step2Form;
      case 3: return this.step3Form;
      case 4: return this.step4Form;
      default: return this.step1Form;
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // User type selection
  selectUserType(userType: UserType): void {
    this.selectedUserType = userType;
    this.step3Form.patchValue({ userType });
  }

  getUserTypeOption(userType: UserType) {
    return this.userTypeOptions.find(option => option.value === userType);
  }

  // Step 4 form setup based on user type
  private setupStep4Form(): void {
    const userType = this.step3Form.get('userType')?.value;
    
    switch (userType) {
      case 'AGENCE_IMMOBILIERE':
        this.step4Form = this.fb.group({
          nomAgence: ['', [Validators.required, Validators.minLength(2)]],
          numeroLicence: ['', [Validators.required]],
          siteWeb: ['', [Validators.pattern(/^https?:\/\/.+/)]],
          nombreEmployes: ['', [Validators.min(1), Validators.max(1000)]],
          zonesCouverture: ['', [Validators.maxLength(500)]]
        });
        break;
        
      case 'CLIENT_ABONNE':
        this.step4Form = this.fb.group({
          subscriptionType: ['BASIC', [Validators.required]]
        });
        break;
        
      case 'ADMINISTRATEUR':
        this.step4Form = this.fb.group({
          adminLevel: ['SUPPORT', [Validators.required]]
        });
        break;
        
      default:
        this.step4Form = this.fb.group({});
    }
  }

  // Form submission
  onSubmit(): void {
    if (!this.areAllFormsValid()) {
      this.error = 'Veuillez vérifier tous les champs obligatoires.';
      return;
    }

    this.isLoading = true;
    this.error = '';
    
    const registrationData = this.buildRegistrationRequest();
    
    this.authService.register(registrationData).subscribe({
      next: (response) => {
        this.success = response.message || 'Inscription réussie!';
        this.isLoading = false;
        
        if (response.emailVerificationRequired) {
          this.router.navigate(['/verify-email'], { 
            queryParams: { email: registrationData.email } 
          });
        } else {
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      },
      error: (error) => {
        console.error('Registration error details:', error);
        
        // Handle different types of errors
        if (error.error && typeof error.error === 'object') {
          // Backend field validation errors
          if (error.error.errors) {
            this.handleFieldErrors(error.error.errors);
            this.error = 'Veuillez corriger les erreurs dans le formulaire.';
          } else if (error.error.message) {
            this.error = error.error.message;
          } else {
            this.error = 'Erreurs de validation. Vérifiez vos données.';
          }
        } else if (error.status === 0) {
          this.error = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
        } else if (error.status === 400) {
          this.error = 'Données invalides. Vérifiez le formulaire.';
        } else if (error.status === 409) {
          this.error = 'Un compte avec cet email existe déjà.';
        } else if (error.status >= 500) {
          this.error = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else {
          this.error = error.error?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.';
        }
        
        this.isLoading = false;
      }
    });
  }

  areAllFormsValid(): boolean {
    return this.step1Form.valid && 
           this.step2Form.valid && 
           this.step3Form.valid && 
           this.step4Form.valid;
  }

  private buildRegistrationRequest(): RegisterRequest {
    const step1Data = this.step1Form.value as RegistrationStep1;
    const step2Data = this.step2Form.value as RegistrationStep2;
    const step3Data = this.step3Form.value as RegistrationStep3;
    const step4Data = this.step4Form.value;

    const baseRequest: RegisterRequest = {
      nom: step1Data.nom,
      prenom: step1Data.prenom,
      email: step1Data.email,
      motDePasse: step1Data.motDePasse,
      telephone: step2Data.telephone,
      adresse: step2Data.adresse,
      userType: step3Data.userType
    };

    // Add role-specific data
    switch (step3Data.userType) {
      case 'AGENCE_IMMOBILIERE':
        const agencyData = step4Data as RegistrationStep4Agency;
        return {
          ...baseRequest,
          nomAgence: agencyData.nomAgence,
          numeroLicence: agencyData.numeroLicence,
          siteWeb: agencyData.siteWeb || undefined,
          nombreEmployes: agencyData.nombreEmployes || undefined,
          zonesCouverture: agencyData.zonesCouverture || undefined
        };
        
      case 'CLIENT_ABONNE':
        const clientData = step4Data as RegistrationStep4Client;
        return {
          ...baseRequest,
          subscriptionType: clientData.subscriptionType
        };
        
      case 'ADMINISTRATEUR':
        const adminData = step4Data as RegistrationStep4Admin;
        return {
          ...baseRequest,
          adminLevel: adminData.adminLevel
        };
        
      default:
        return baseRequest;
    }
  }

  // Utility methods for templates
  getProgressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (!field || !field.errors) return '';
    
    // Check for server errors first
    if (field.errors['serverError']) return field.errors['serverError'];
    
    if (field.errors['required']) return 'Ce champ est obligatoire.';
    if (field.errors['email']) return 'Format d\'email invalide.';
    if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} caractères.`;
    if (field.errors['maxlength']) return `Maximum ${field.errors['maxlength'].requiredLength} caractères.`;
    if (field.errors['pattern']) {
      if (fieldName === 'motDePasse') {
        return 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.';
      }
      if (fieldName === 'telephone') {
        return 'Le numéro de téléphone doit contenir exactement 8 chiffres.';
      }
      if (fieldName === 'siteWeb') {
        return 'URL invalide. Doit commencer par http:// ou https://';
      }
    }
    if (field.errors['mismatch']) return 'Les mots de passe ne correspondent pas.';
    if (field.errors['min']) return `Valeur minimum: ${field.errors['min'].min}`;
    if (field.errors['max']) return `Valeur maximum: ${field.errors['max'].max}`;
    
    return 'Champ invalide.';
  }

  getSubscriptionDisplayName(type: SubscriptionType): string {
    switch (type) {
      case 'BASIC': return 'Basique';
      case 'PREMIUM': return 'Premium';
      case 'VIP': return 'VIP';
      default: return type;
    }
  }

  getAdminLevelDisplayName(level: AdminLevel): string {
    switch (level) {
      case 'SUPPORT': return 'Support';
      case 'MODERATOR': return 'Modérateur';
      case 'SUPER_ADMIN': return 'Super Administrateur';
      default: return level;
    }
  }

  // Handle field-level validation errors from backend
  private handleFieldErrors(errors: { [key: string]: string }): void {
    Object.keys(errors).forEach(fieldName => {
      const errorMessage = errors[fieldName];
      
      // Try to find the field in all form steps
      let control = this.step1Form.get(fieldName);
      if (!control) control = this.step2Form.get(fieldName);
      if (!control) control = this.step3Form.get(fieldName);
      if (!control) control = this.step4Form.get(fieldName);
      
      if (control) {
        control.setErrors({ serverError: errorMessage });
        control.markAsTouched();
      }
    });
  }
}