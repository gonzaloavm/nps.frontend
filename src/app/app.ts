import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgxSpinnerComponent } from "ngx-spinner";
import { Subscription, filter } from 'rxjs';
import { ActivityService } from './core/services/activity.service';
import { SessionTimeoutModal } from "./shared/components/session-timeout-modal/session-timeout-modal";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSpinnerComponent, SessionTimeoutModal],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private routerSub?: Subscription;

  constructor(
    private activity: ActivityService,
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
    this.activity.stop();
  }

  private handleRoute(url: string): void {
    const path = url.split('?')[0].split('#')[0].toLowerCase();
    const isLogin =
    path === '/login' ||
    path === '/auth/login' ||
    path === '/signin';

    const isSessionExpired = path === '/other/session-expired';

    if (isLogin || isSessionExpired) {
      this.activity.stop();
    } else {
      this.activity.start();
    }

  }


}
