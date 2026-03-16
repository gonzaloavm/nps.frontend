import { Injectable, signal, inject, effect } from '@angular/core';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';
import { allowSessionExpiredAccess } from '../guards/session-expired.guard';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class ActivityService {

  private authService = inject(AuthService);
  private readonly router = inject(Router);

  private refreshTimer: any = null;
  private countdownInterval: any = null;

  private readonly SESSION_DURATION_MS = 5 * 60 * 1000;
  private readonly REFRESH_THRESHOLD_MS = 30 * 1000;
  private readonly WARNING_THRESHOLD_MS = 30 * 1000;
  private readonly TICK_INTERVAL = 1000;

  // Llave para sincronizar pestañas
  private readonly STORAGE_KEY = 'nps_session_deadline';

  public isWarningVisible = signal<boolean>(false);
  public isRefreshing = signal<boolean>(false);
  private sessionDeadline = signal<number>(Date.now() + this.SESSION_DURATION_MS);
  public remainingMs = signal<number>(0);

  constructor() {

    // Escuchar cambios desde otras pestañas
    window.addEventListener('storage', (event) => {
      if (event.key === this.STORAGE_KEY && event.newValue) {
        const remoteDeadline = parseInt(event.newValue, 10);
        this.sessionDeadline.set(remoteDeadline);
        this.isWarningVisible.set(false);
        console.log('[ActivityService] 🌐 Sincronizado desde otra pestaña:', remoteDeadline);
      }

      // CIERRE DE SESIÓN SINCRONIZADO
      if (event.key === 'nps_logout_signal') {
        console.warn('[ActivityService] 🚪 Señal de logout recibida de otra pestaña');
        this.stopTimers();

        // Limpiamos todo localmente sin volver a emitir la señal (evita bucles)
        this.authService.clearLocalSession();
        this.router.navigate(['/login']);
      }
    });

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

  public updateActivity(): void {
    const newDeadline = Date.now() + this.SESSION_DURATION_MS;

    // Actualizamos localmente
    this.sessionDeadline.set(newDeadline);
    this.isWarningVisible.set(false);

    // 2. Notificamos a las demás pestañas
    localStorage.setItem(this.STORAGE_KEY, newDeadline.toString());

    console.log('[ActivityService] 🚀 Actividad local actualizada y notificada');
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

    const now = Date.now();
    const timeToRefresh = (exp - now) - this.REFRESH_THRESHOLD_MS;

    if (timeToRefresh > 0) {
      this.refreshTimer = setTimeout(() => this.refreshToken(), timeToRefresh);
    } else {
      this.refreshToken();
    }

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
    localStorage.removeItem(this.STORAGE_KEY); // Limpiar al expirar
    allowSessionExpiredAccess();
    this.authService.logout('/other/session-expired');
  }

  public async keepSession(): Promise<void> {
    await this.refreshToken();
    this.updateActivity();
  }
}
