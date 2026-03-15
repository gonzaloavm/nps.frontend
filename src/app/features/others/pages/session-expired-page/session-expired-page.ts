import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-session-expired-page',
  imports: [],
  templateUrl: './session-expired-page.html',
  styleUrl: './session-expired-page.css',
})
export class SessionExpiredPage {
  constructor(private router: Router) {}

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
