import { Component, computed, inject } from '@angular/core';
import { ActivityService } from '../../../core/services/activity.service';
import { CommonModule } from '@angular/common'; // Asegúrate de importar esto para el pipe async o directivas si no usas control flow
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-session-timeout-modal',
  standalone: true, // Asumo que usas standalone por los imports del ejemplo
  imports: [CommonModule],
  templateUrl: './session-timeout-modal.html',
  styleUrl: './session-timeout-modal.css',
})
export class SessionTimeoutModal {
  // Usamos inject para seguir el estilo moderno de Angular
  public readonly activityService = inject(ActivityService);
  public readonly authService = inject(AuthService);

  // El modal ya no hace cálculos, solo transforma los ms del service a segundos
  remainingSeconds = computed(() =>
    Math.max(0, Math.ceil(this.activityService.remainingMs() / 1000))
  );

  async onKeepSession(): Promise<void> {
    // Al llamar a keepSession, el service:
    // 1. Refresca el JWT.
    // 2. Resetea el deadline de actividad.
    // 3. Cierra automáticamente el modal (isWarningVisible = false).
    await this.activityService.keepSession();
  }

  onLogout(): void {
    this.authService.logout();
  }
}
