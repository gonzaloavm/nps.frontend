import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterRequest } from '../../../../core/models/auth-model';

@Component({
  selector: 'app-register-user-voter',
  imports: [ReactiveFormsModule],
  templateUrl: './register-user-voter.html',
  styleUrl: './register-user-voter.css',
})
export class RegisterUserVoter {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  registerForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const request: RegisterRequest = {
      ...this.registerForm.value,
      role: 'Voter' // El admin registra votantes
    };

    this.authService.register(request).subscribe({
      next: (response) => {
        this.successMessage.set(`Usuario registrado con ID: ${response.data!.userId}`);
        this.registerForm.reset(); // Limpiar para el siguiente registro
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Error al crear el usuario');
        this.isLoading.set(false);
      }
    });
  }
}
