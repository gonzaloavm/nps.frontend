import { Component, inject, signal, computed } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { UpperCasePipe } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ActivityService } from '../../core/services/activity.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, UpperCasePipe, RouterLink],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  isSidebarOpen = signal(false);
  isProfileOpen = signal(false);

  public readonly authService = inject(AuthService);
  private readonly activityService = inject(ActivityService);

  constructor() {
    this.checkSessionStatus();
  }

  private checkSessionStatus() {
    if (this.authService.accessToken()) {
      this.authService.verifySession().subscribe({
        next: () => console.log('[System] Sesión sincronizada al iniciar pestaña'),
        error: () => this.authService.logout()
      });
    }
  }

  // Tiempo formateado como mm:ss
  formattedTime = computed(() => {
    const ms = this.activityService.remainingMs();
    if (ms <= 0) return '0:00';
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  toggleSidebar() {
    this.isSidebarOpen.set(!this.isSidebarOpen());
  }

  toggleProfile() {
    this.isProfileOpen.update(v => !v);
  }

  closeMenus() {
    this.isSidebarOpen.set(false);
    this.isProfileOpen.set(false);
  }

  logout() {
    this.authService.logout();
    this.activityService.stop();
  }
}
