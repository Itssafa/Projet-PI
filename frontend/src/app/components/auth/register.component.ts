import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../core/models';

function phone8Digits(control: AbstractControl): ValidationErrors | null {
  const v = (control.value || '').toString().trim();
  return /^[0-9]{8}$/.test(v) ? null : { phone8: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  loading = false;
  serverError: string | null = null;
  form: any;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      telephone: ['', [Validators.required, phone8Digits]],
      adresse: ['', [Validators.required]],
      userType: ['UTILISATEUR', [Validators.required]],

      // Agency (optional, required only if userType === 'AGENCE_IMMOBILIERE')
      nomAgence: [''],
      numeroLicence: [''],
      siteWeb: [''],
      nombreEmployes: [null as number | null],
      zonesCouverture: ['']
    });
  }

  ngOnInit(): void {
    this.form.get('userType')!.valueChanges.subscribe((type: any) => {
      const agency = type === 'AGENCE_IMMOBILIERE';
      const setReq = (ctrl: string, req: boolean) => {
        const c = this.form.get(ctrl)!;
        c.clearValidators();
        const base: any[] = [];
        if (req) base.push(Validators.required);
        c.setValidators(base);
        c.updateValueAndValidity();
      };
      setReq('nomAgence', agency);
      setReq('numeroLicence', agency);
      // optional fields stay optional
    });
  }

  get f() { return this.form.controls; }

  submit() {
    this.serverError = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const payload = this.form.value as RegisterRequest;
    this.auth.register(payload).subscribe({
      next: () => {
        // Assume backend sends verification email when applicable
        this.router.navigate(['/login'], { queryParams: { registered: '1' } });
      },
      error: (err) => {
        this.serverError = err?.error?.message || 'Inscription impossible. Vérifiez les champs.';
        this.loading = false;
      }
    });
  }
}