import { Injectable, signal, inject, effect } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { allowSessionExpiredAccess } from '../guards/session-expired.guard';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private authService = inject(AuthService);
  private readonly router = inject(Router);

  // Constantes de configuración
  private readonly SESSION_DURATION_MS = 5 * 60 * 1000;
  private readonly REFRESH_THRESHOLD_MS = 30 * 1000;
  private readonly WARNING_THRESHOLD_MS = 30 * 1000;
  private readonly TICK_INTERVAL = 1000;
  private readonly STORAGE_KEY = 'nps_session_deadline';

  // Estado de la sesión (Signals)
  public isWarningVisible = signal<boolean>(false);
  public isRefreshing = signal<boolean>(false);
  public remainingMs = signal<number>(0);
  private sessionDeadline = signal<number>(Date.now() + this.SESSION_DURATION_MS);

  private refreshTimer: any = null;
  private countdownInterval: any = null;

  constructor() {
    this.initStorageListener();

    // Controlar timers según el estado del token
    effect(() => {
      const token = this.authService.accessToken();
      const hasValidToken = token && !this.authService.isTokenExpired();
      hasValidToken ? this.startTimers() : this.stopTimers();
    });
  }

  // ==================================================
  // Métodos Públicos (Acciones de Usuario)
  // ==================================================

  public updateActivity(): void {
    const newDeadline = Date.now() + this.SESSION_DURATION_MS;
    this.sessionDeadline.set(newDeadline);
    this.isWarningVisible.set(false);

    // Sincronizar con otras pestañas
    localStorage.setItem(this.STORAGE_KEY, newDeadline.toString());
  }

  public async keepSession(): Promise<void> {
    await this.refreshToken();
    this.updateActivity();
  }

  public stop(): void {
    this.stopTimers();
  }

  // ==================================================
  // Lógica Interna de Timers
  // ==================================================

  private startTimers(): void {
    this.stopTimers();
    this.scheduleLogic();
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

    // Calcular momento exacto para renovar el JWT
    const now = Date.now();
    const timeToRefresh = (exp - now) - this.REFRESH_THRESHOLD_MS;

    if (timeToRefresh > 0) {
      this.refreshTimer = setTimeout(() => this.refreshToken(), timeToRefresh);
    } else {
      this.refreshToken();
    }

    // Monitor de cuenta regresiva para inactividad
    this.countdownInterval = setInterval(() => {
      const remaining = Math.max(0, this.sessionDeadline() - Date.now());
      this.remainingMs.set(remaining);

      if (remaining <= this.WARNING_THRESHOLD_MS && remaining > 0) {
        this.isWarningVisible.set(true);
      }

      if (remaining <= 0) {
        this.handleSessionExpired();
      }
    }, this.TICK_INTERVAL);
  }

  // ==================================================
  // Gestión de Sesión y Comunicación
  // ==================================================

  private async refreshToken(): Promise<void> {
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

  private handleSessionExpired(): void {
    this.stopTimers();
    localStorage.removeItem(this.STORAGE_KEY);
    allowSessionExpiredAccess();
    this.authService.logout('/other/session-expired');
  }

  private initStorageListener(): void {
    window.addEventListener('storage', (event) => {
      // Sincronizar tiempo de vida entre pestañas
      if (event.key === this.STORAGE_KEY && event.newValue) {
        const remoteDeadline = parseInt(event.newValue, 10);
        this.sessionDeadline.set(remoteDeadline);
        this.isWarningVisible.set(false);
      }

      // Cerrar sesión globalmente
      if (event.key === 'nps_logout_signal') {
        this.stopTimers();
        this.authService.clearLocalSession();
        this.router.navigate(['/login']);
      }
    });
  }

  private getTokenExpiration(): number | null {
    const token = this.authService.accessToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000;
    } catch { return null; }
  }
}
