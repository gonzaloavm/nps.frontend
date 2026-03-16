import { Injectable, signal, inject, effect, computed } from '@angular/core';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';
import { allowSessionExpiredAccess } from '../guards/session-expired.guard';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private authService = inject(AuthService);

  // Timers
  private refreshTimer: any = null;
  private countdownInterval: any = null;

  // Configuración de Tiempos (1 minuto de sesión)
  private readonly SESSION_DURATION_MS = 5 * 60 * 1000;
  private readonly REFRESH_THRESHOLD_MS = 30 * 1000; // Refrescar JWT a la mitad de su vida
  private readonly WARNING_THRESHOLD_MS = 30 * 1000; // Mostrar modal a los 30s de inactividad
  private readonly TICK_INTERVAL = 1000;

  // Signals de estado
  public isWarningVisible = signal<boolean>(false);
  public isRefreshing = signal<boolean>(false);

  // El "Deadline" es el momento exacto donde la sesión muere (LastActivity + 1min)
  private sessionDeadline = signal<number>(Date.now() + this.SESSION_DURATION_MS);

  // Signal computada para que todo el sistema (Modal y Header) use el mismo valor
  public remainingMs = signal<number>(0);

  constructor() {
    effect(() => {
      const token = this.authService.accessToken();
      const hasValidToken = token && !this.authService.isTokenExpired();

      if (hasValidToken) {
        this.startTimers();
      } else {
        this.stopTimers();
      }
    });
  }

  // Se llama desde el Interceptor en cada petición exitosa (Excepto Login/Refresh)
  public updateActivity(): void {
    const newDeadline = Date.now() + this.SESSION_DURATION_MS;
    console.log('[ActivityService] updateActivity → nueva deadline:', newDeadline);
    this.sessionDeadline.set(newDeadline);
    this.isWarningVisible.set(false);
  }


  private startTimers(): void {
    this.stopTimers();
    this.scheduleLogic();
  }

  public stop(): void {
    this.stopTimers();
  }

  private stopTimers(): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.isWarningVisible.set(false);
    this.refreshTimer = null;
    this.countdownInterval = null;
  }

  private scheduleLogic(): void {
    const exp = this.getTokenExpiration();
    if (!exp) return;

    // 1. Programar el Refresh técnico del JWT
    const now = Date.now();
    const timeToRefresh = (exp - now) - this.REFRESH_THRESHOLD_MS;

    console.log('[ActivityService] scheduleLogic → exp:', exp, 'timeToRefresh:', timeToRefresh);

    if (timeToRefresh > 0) {
      this.refreshTimer = setTimeout(() => this.refreshToken(), timeToRefresh);
    } else {
      this.refreshToken();
    }

    // 2. Intervalo de UI (Tick cada segundo)
    this.countdownInterval = setInterval(() => {
      // Calculamos el tiempo real restante
      const remaining = Math.max(0, this.sessionDeadline() - Date.now());

      // Seteamos el valor para que la UI y el Header reaccionen
      this.remainingMs.set(remaining);

      console.log('[ActivityService] Tick → remainingMs:', remaining);

      if (remaining <= this.WARNING_THRESHOLD_MS && remaining > 0) {
        this.isWarningVisible.set(true);
      }

      if (remaining <= 0) {
        this.handleSessionExpired();
      }
    }, this.TICK_INTERVAL);
  }


  private async refreshToken(): Promise<void> {
    // Si la sesión ya expiró en el front, no intentamos refrescar,
    // dejamos que el sistema limpie todo.
    if (this.isRefreshing() || this.remainingMs() <= 0) return;

    this.isRefreshing.set(true);
    try {
      await firstValueFrom(this.authService.refreshSession());
    } catch (error) {
      this.handleSessionExpired();
    } finally {
      this.isRefreshing.set(false);
    }
  }

  private getTokenExpiration(): number | null {
    const token = this.authService.accessToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000;
    } catch { return null; }
  }

  private handleSessionExpired(): void {
    this.stopTimers();
    allowSessionExpiredAccess();
    this.authService.logout('/other/session-expired');
  }

  // Método para el botón del Modal
  public async keepSession(): Promise<void> {
    // IMPORTANTE: Como tu middleware de C# ignora el endpoint de Refresh,
    // necesitamos resetear el timer localmente aquí.
    await this.refreshToken();
    this.updateActivity();
  }
}
