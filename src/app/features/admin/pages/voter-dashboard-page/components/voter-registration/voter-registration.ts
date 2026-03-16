import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterRequest } from '../../../../../../core/models/auth-model';
import { AuthService } from '../../../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-voter-registration',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './voter-registration.html',
  styleUrl: './voter-registration.css',
})
export class VoterRegistration {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  // Evento para avisar al padre que debe refrescar la tabla
  userCreated = output<void>();

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
      role: 'Voter'
    };

    this.authService.register(request).subscribe({
      next: () => {
        this.successMessage.set(`Usuario '${request.username}' registrado con éxito.`);
        this.registerForm.reset();
        this.isLoading.set(false);

        // Notificamos al Dashboard para que recargue la lista
        this.userCreated.emit();

        // Limpiamos el mensaje de éxito tras 5 segundos
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
        // Usamos la estructura de errores de tu API
        const firstError = err.apiErrors?.[0]?.message || 'Error al crear el usuario';
        this.errorMessage.set(firstError);
        this.isLoading.set(false);
      }
    });
  }
}
