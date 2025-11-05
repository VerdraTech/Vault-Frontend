import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private router?: Router;
  private authService?: AuthService;
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private _injector: Injector) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Lazy inject AuthService to avoid circular dependency
    if (!this.authService) {
      this.authService = this._injector.get(AuthService);
    }
    if (!this.router) {
      this.router = this._injector.get(Router);
    }

    // Skip CSRF token for GET/HEAD/OPTIONS requests (safe methods)
    const isSafeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(request.method);
    
    // Add CSRF token to non-safe requests
    if (!isSafeMethod && this.authService) {
      const csrfToken = this.authService.getCsrfToken();
      if (csrfToken) {
        request = request.clone({
          setHeaders: {
            'x-csrf-token': csrfToken  // Backend expects lowercase
          }
        });
      }
    }

    // Ensure credentials are sent with requests
    request = request.clone({
      withCredentials: true
    });

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized errors
        if (error.status === 401 && !request.url.includes('/auth/')) {
          return this.handle401Error(request, next);
        }

        // Handle 403 Forbidden (CSRF failure)
        if (error.status === 403 && error.error?.detail?.includes('CSRF')) {
          console.error('CSRF token mismatch. Please refresh the page.');
          // Don't auto-redirect - let user decide or route handle it
        }

        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.authService) {
      this.authService = this._injector.get(AuthService);
    }

    // If not already refreshing, try to refresh token
    if (!this.isRefreshing && this.authService) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((token: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token);
          
          // Retry the original request with new token
          return next.handle(this.addCsrfToken(request));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          if (this.authService) {
            this.authService.logout();
          }
          return throwError(() => error);
        })
      );
    } else {
      // If already refreshing, wait for token and retry
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(() => next.handle(this.addCsrfToken(request)))
      );
    }
  }

  private addCsrfToken(request: HttpRequest<unknown>): HttpRequest<unknown> {
    if (!this.authService) {
      this.authService = this._injector.get(AuthService);
    }
    const csrfToken = this.authService?.getCsrfToken();
    if (csrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return request.clone({
        setHeaders: {
          'x-csrf-token': csrfToken  // Backend expects lowercase
        },
        withCredentials: true
      });
    }
    return request.clone({ withCredentials: true });
  }
}
