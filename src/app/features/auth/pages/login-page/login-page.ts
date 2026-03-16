import { Component, signal, inject } from '@angular/core'; // Usamos inject para ser más modernos
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { NgxSpinnerService, NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxSpinnerModule
],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private spinner = inject(NgxSpinnerService);

  loginForm: FormGroup;
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.spinner.show();
    this.errorMessage.set(null);

    const { username, password } = this.loginForm.value;

    this.authService.login({ username, password }).subscribe({
      next: () => {
        this.spinner.hide();
        this.isLoading.set(false);

        const user = this.authService.currentUser();
        const role = user?.roles?.[0];

        if (role === 'Admin') {
          this.router.navigate(['/admin/results']);
        } else {
          this.router.navigate(['/voter/vote']);
        }
      },
      error: (err) => {
        this.spinner.hide();
        this.isLoading.set(false);

        const apiErrors = err?.apiErrors ?? err?.original?.error?.errors ?? null;
        const firstMessage = Array.isArray(apiErrors) && apiErrors.length > 0
          ? apiErrors[0].message
          : err?.original?.error?.detail ?? err?.message;

        this.errorMessage.set(firstMessage || 'Error al iniciar sesión');
      }
    });
  }
}
