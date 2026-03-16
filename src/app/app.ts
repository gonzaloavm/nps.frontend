import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgxSpinnerComponent } from "ngx-spinner";
import { Subscription, filter } from 'rxjs';
import { ActivityService } from './core/services/activity.service';
import { SessionTimeoutModal } from "./shared/components/session-timeout-modal/session-timeout-modal";
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSpinnerComponent, SessionTimeoutModal],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private routerSub?: Subscription;

  constructor(
    private activityService: ActivityService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.handleRoute(this.router.url);

    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.handleRoute(event.urlAfterRedirects);
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.activityService.stop();
  }

  private handleRoute(url: string): void {
    const path = url.split('?')[0].split('#')[0].toLowerCase();
    const isPublic =
      path === '/login' ||
      path === '/auth/login' ||
      path === '/signin' ||
      path === '/other/session-expired';

    if (isPublic) {
      this.activityService.stop();
    }
    // No se llama a start() porque el ActivityService se activa automáticamente al tener token
  }
}
