// src/app/core/services/activity.service.ts
import { Injectable, signal, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { firstValueFrom, isObservable } from 'rxjs';
import { allowSessionExpiredAccess } from '../guards/session-expired.guard';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private readonly totalPeriod = 5 * 60 * 1000; // 5 minutos
  private readonly warningAt = 60 * 1000; // mostrar aviso cuando quede 60s
  private tickInterval = 1000;

  private countdownTimerId: any = null;
  private timeoutId: any = null;
  private warningTimeoutId: any = null;
  private expiresAt: number | null = null;

  public remainingMs = signal<number>(this.totalPeriod);
  public isWarningVisible = signal<boolean>(false);
  public isRunning = signal<boolean>(false);
  public isRefreshing = signal<boolean>(false);

  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    effect(() => {
      this.remainingMs();
    });
  }

  start(): void {
    if (this.isRunning()) return;
    this.isRunning.set(true);
    this.scheduleAll();
  }

  stop(): void {
    this.clearAllTimers();
    this.isRunning.set(false);
    this.isWarningVisible.set(false);
    this.expiresAt = null;
    this.remainingMs.set(this.totalPeriod);
  }

  restart(): void {
    this.clearAllTimers();
    this.isWarningVisible.set(false);
    this.scheduleAll();
  }

  updateActivity(): void {
    // Llamado por el interceptor en cada petición HTTP para reiniciar el timer
    if (!this.isRunning()) {
      this.start();
      return;
    }
    // Reiniciar sin cambiar isRunning
    this.clearAllTimers();
    this.scheduleAll();
  }

  private scheduleAll(): void {
    const now = Date.now();
    this.expiresAt = now + this.totalPeriod;
    this.remainingMs.set(this.totalPeriod);

    const timeUntilWarning = this.expiresAt - this.warningAt - now;
    this.warningTimeoutId = setTimeout(() => this.showWarning(), Math.max(0, timeUntilWarning));

    const timeUntilLogout = this.expiresAt - now;
    this.timeoutId = setTimeout(() => this.logoutDueToInactivity(), Math.max(0, timeUntilLogout));

    this.countdownTimerId = setInterval(() => {
      const remaining = this.computeRemaining();
      this.remainingMs.set(Math.max(0, remaining));

      console.log('Tiempo restante (ms):', remaining);

    }, this.tickInterval);
  }

  private computeRemaining(): number {
    if (!this.expiresAt) return this.totalPeriod;
    return Math.max(0, this.expiresAt - Date.now());
  }

  private showWarning(): void {
    this.isWarningVisible.set(true);
    this.remainingMs.set(this.warningAt);
  }

  async keepSession(): Promise<void> {
    if (this.isRefreshing()) return;
    this.isRefreshing.set(true);
    try {
      const result = this.authService.refreshSession();
      if (isObservable(result)) {
        await firstValueFrom(result);
      } else {
        await result;
      }
      this.restart();
    } catch {
      this.logoutDueToInactivity();
    } finally {
      this.isRefreshing.set(false);
    }
  }

  private logoutDueToInactivity(): void {
    this.clearAllTimers();
    this.isWarningVisible.set(false);
    this.isRunning.set(false);
    this.remainingMs.set(0);
    this.expiresAt = null;

    // Permitir acceso a la página de sesión expirada
    allowSessionExpiredAccess();

    // Hacer logout
    this.authService.logout('/other/session-expired');
  }


  private clearAllTimers(): void {
    if (this.countdownTimerId) {
      clearInterval(this.countdownTimerId);
      this.countdownTimerId = null;
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
      this.warningTimeoutId = null;
    }
  }
}
