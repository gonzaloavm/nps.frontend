import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, map, catchError, finalize } from 'rxjs';
import {
  LoginResponse,
  RefreshSessionResponse,
  CurrentUser,
  UserTokenPayload,
  LoginRequest,
  RegisterRequest,
  RegisterResponse
} from '../models/auth-model';
import { handleApiError } from '../utils/api-utils';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = `${environment.apiUrl}/api/auth`;
  private readonly TOKEN_KEY = 'auth_token';

  private readonly _accessToken = signal<string | null>(this.getInitialToken());

  public readonly currentUser = computed(() => {
    const token = this._accessToken();
    if (!token) return null;
    try {
      return this.decodeToken(token);
    } catch {
      this._accessToken.set(null);
      return null;
    }
  });

  public readonly accessToken = this._accessToken.asReadonly();

  constructor() {
    effect(() => {
      const token = this._accessToken();
      if (token) localStorage.setItem(this.TOKEN_KEY, token);
      else localStorage.removeItem(this.TOKEN_KEY);
    });
  }

  initAuth(): Promise<void> {
    return new Promise((resolve) => {
      if (this.accessToken() && !this.isTokenExpired()) {
        resolve();
        return;
      }

      this.refreshSession().subscribe({
        next: () => resolve(),
        error: () => resolve()
      });
    });
  }

  login(credentials: LoginRequest): Observable<void> {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.baseUrl}/login`,
      credentials,
      { withCredentials: true }
    ).pipe(
      tap(res => {
        // LoginResponse puede exponer token o jwt según tu DTO
        const token = (res.data as any)?.token ?? (res.data as any)?.jwt;
        if (token) this._accessToken.set(token);
      }),
      map(() => void 0),
      catchError(handleApiError)
    );
  }

  register(userData: RegisterRequest): Observable<ApiResponse<RegisterResponse>> {
    return this.http.post<ApiResponse<RegisterResponse>>(
      `${this.baseUrl}/register`,
      userData
    ).pipe(
      map(res => res),
      catchError(handleApiError)
    );
  }

  refreshSession(): Observable<ApiResponse<RefreshSessionResponse>> {
    return this.http.post<ApiResponse<RefreshSessionResponse>>(
      `${this.baseUrl}/refresh`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(res => {
        const token = (res.data as any)?.jwt ?? (res.data as any)?.token;
        if (token) this._accessToken.set(token);
      }),
      catchError(handleApiError)
    );
  }

  verifySession(): Observable<ApiResponse<boolean>> {
    // Agregamos un parámetro aleatorio para que el navegador no cachee el GET
    const cacheBuster = new Date().getTime();

    return this.http.get<ApiResponse<boolean>>(
      `${this.baseUrl}/verify-session?t=${cacheBuster}`,
      { withCredentials: true }
    ).pipe(
      catchError(handleApiError)
    );
  }

  logout(redirectTo: string = '/login') {
    this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        finalize(() => {
          this._accessToken.set(null);
          this.router.navigate([redirectTo]);
        })
      ).subscribe({
        error: () => {
          this._accessToken.set(null);
          this.router.navigate([redirectTo]);
        }
      });
  }

  role(): string | null {
    const user = this.currentUser();
    if (!user) return null;
    return Array.isArray(user.roles) && user.roles.length > 0 ? user.roles[0] : null;
  }

  private getInitialToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  private decodeToken(token: string): CurrentUser {
    try {
      const base64Url = token.split('.')[1] ?? '';
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload) as UserTokenPayload;
      const roles = decoded.role ? (Array.isArray(decoded.role) ? decoded.role : [decoded.role]) : [];
      return {
        id: decoded.nameid ? parseInt(decoded.nameid, 10) : NaN,
        username: decoded.unique_name ?? '',
        roles
      };
    } catch {
      return { id: NaN, username: '', roles: [] };
    }
  }

  public isTokenExpired(): boolean {
    const token = this.accessToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expires = payload.exp * 1000;
      console.log(Date.now());
      console.log(expires);
      return (Date.now() + 10000) >= expires;
    } catch {
      return true;
    }
  }
}
