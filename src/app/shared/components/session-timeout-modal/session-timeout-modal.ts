import { Component, computed } from '@angular/core';
import { ActivityService } from '../../../core/services/activity.service';

@Component({
  selector: 'app-session-timeout-modal',
  imports: [],
  templateUrl: './session-timeout-modal.html',
  styleUrl: './session-timeout-modal.css',
})
export class SessionTimeoutModal {
  constructor(public activity: ActivityService) {}

  remainingSeconds = computed(() => Math.max(0, Math.ceil(this.activity.remainingMs() / 1000)));

  async onKeepSession(): Promise<void> {
    await this.activity.keepSession();
  }

  onLogout(): void {
    // Forzar cierre inmediato si quieres ofrecer la opción
    this.activity['logoutDueToInactivity']?.();
  }

}
