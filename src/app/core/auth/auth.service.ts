import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, throwError, timer } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface User {
  id: string;
  email: string;
  cognito_sub?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_BASE = environment.BASE_URL;
  private readonly REFRESH_INTERVAL = 15 * 60 * 1000;
  private refreshTimer?: any;

  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  private _currentUser = new BehaviorSubject<User | null>(null);

  isAuthenticated$ = this._isAuthenticated.asObservable();
  currentUser$ = this._currentUser.asObservable();

  constructor() {
    setTimeout(() => {
      this.initializeCsrfToken();

      this.startTokenRefresh();
    }, 0);
  }

  private initializeCsrfToken(): void {
    this.http
      .get(`${this.API_BASE}/auth/csrf-token`, {
        withCredentials: true,
      })
      .subscribe({
        next: () => {
          console.log('CSRF token initialized');
        },
        error: (error) => {
          console.error('Failed to initialize CSRF token:', error);
        },
      });
  }

  checkAuthStatus(): void {
    this.getCurrentUser().subscribe({
      next: (user) => {
        this._isAuthenticated.next(true);
        this._currentUser.next(user);
      },
      error: (error) => {
        this._isAuthenticated.next(false);
        this._currentUser.next(null);
        if (error.status && error.status !== 401) {
          this.handleUnauthorized();
        }
      },
    });
  }

  getCurrentUser(): Observable<User> {
    return this.http
      .get<User>(`${this.API_BASE}/auth/me`, {
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  login(): void {
    window.location.href = `${this.API_BASE}/auth/login`;
  }

  refreshToken(): Observable<any> {
    return this.http
      .post(`${this.API_BASE}/auth/refresh`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          console.log('Token refreshed successfully');
          this._isAuthenticated.next(true);
        }),
        catchError((error) => {
          console.error('Token refresh failed:', error);
          if (error.status === 401) {
            this.handleUnauthorized();
          }
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    this.http
      .post(`${this.API_BASE}/auth/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          this._isAuthenticated.next(false);
          this._currentUser.next(null);
          this.stopTokenRefresh();
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Logout error:', error);
          this._isAuthenticated.next(false);
          this._currentUser.next(null);
          this.stopTokenRefresh();
          this.router.navigate(['/']);
        },
      });
  }

  getCsrfToken(): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrf-token') {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  private startTokenRefresh(): void {
    this.stopTokenRefresh();

    this.refreshTimer = setInterval(() => {
      if (this._isAuthenticated.value) {
        this.refreshToken().subscribe({
          error: (error) => {
            console.error('Auto-refresh failed:', error);
          },
        });
      }
    }, this.REFRESH_INTERVAL);
  }

  private stopTokenRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }

  private handleUnauthorized(): void {
    this._isAuthenticated.next(false);
    this._currentUser.next(null);
    this.stopTokenRefresh();
  }

  get isAuthenticated(): boolean {
    return this._isAuthenticated.value;
  }

  get currentUser(): User | null {
    return this._currentUser.value;
  }
}
