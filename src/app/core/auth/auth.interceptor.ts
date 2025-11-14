import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse,
  HttpEvent,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Clone the request to include credentials (cookies) if not already set
    let clonedRequest = request;
    if (!request.url.startsWith('http://localhost:4000/api/supabase')) {
      // Only add credentials for our API calls, not external APIs
      clonedRequest = request.clone({
        withCredentials: true,
      });
    }

    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Only handle 401 errors (unauthorized) and exclude refresh/login endpoints
        const isAuthEndpoint =
          request.url.includes('/auth/refresh') ||
          request.url.includes('/auth/login') ||
          request.url.includes('/auth/authorize') ||
          request.url.includes('/auth/debug');

        if (error.status === 401 && !isAuthEndpoint) {
          // If we're not already refreshing, try to refresh the token
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.authService.refreshToken().pipe(
              switchMap((success: boolean) => {
                if (success) {
                  this.isRefreshing = false;
                  this.refreshTokenSubject.next(success);
                  // Retry the original request
                  return next.handle(clonedRequest);
                } else {
                  // Refresh failed, sign out user
                  this.isRefreshing = false;
                  this.authService.setLoggedIn(false);
                  return throwError(() => error);
                }
              }),
              catchError((refreshError) => {
                this.isRefreshing = false;
                this.authService.setLoggedIn(false);
                return throwError(() => refreshError);
              })
            );
          } else {
            // If we're already refreshing, wait for the refresh to complete
            return this.refreshTokenSubject.pipe(
              filter((result) => result !== null),
              take(1),
              switchMap(() => {
                // Retry the original request after refresh completes
                return next.handle(clonedRequest);
              })
            );
          }
        }

        // For non-401 errors or auth endpoints, just pass through
        return throwError(() => error);
      })
    );
  }
}
