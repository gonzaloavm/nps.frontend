import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized-page',
  imports: [],
  templateUrl: './unauthorized-page.html',
  styleUrl: './unauthorized-page.css',
})
export class UnauthorizedPage {
  constructor(private router: Router) {}

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
