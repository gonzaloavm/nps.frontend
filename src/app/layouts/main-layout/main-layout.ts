import { Component, inject, signal } from '@angular/core';
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
  private readonly activityService = inject(ActivityService)

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

  logout(){
    this.authService.logout();
    this.activityService.stop();
  }
}
