import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  AuthChangeEvent,
  AuthSession,
  createClient,
  SupabaseClient,
} from '@supabase/supabase-js';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { EnvResolverService } from '../env-resolver/env-resolver.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase!: SupabaseClient;
  private httpClient = inject(HttpClient);
  private envService = inject(EnvResolverService);
  _session: AuthSession | null = null;
  _loggedIn = new BehaviorSubject<boolean>(false);
  loggedIn$ = this._loggedIn.asObservable();

  currentUser = '';
  private csrfToken: string = '';

  constructor() {}

  startSupabase() {
    this.getSupabaseApiKey().subscribe((response) => {
      this.supabase = createClient(
        response.supabaseUrl,
        response.supabaseApiKey
      );
      this.getAuthChange();
    });
  }

  getSupabaseApiKey(): Observable<any> {
    return this.httpClient.get('http://localhost:4000/api/supabase');
  }

  getAuthChange() {
    const {
      data: { subscription },
    } = this.supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, sess: AuthSession | null) => {
        console.log(event, sess);
        if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !sess)) {
          this._loggedIn.next(false);
        } else if (
          event === 'SIGNED_IN' ||
          (event === 'INITIAL_SESSION' && sess)
        ) {
          this._loggedIn.next(true);
        }
      }
    );
  }

  signIn(email: string, password: string) {
    return from(
      this.supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })
    ).subscribe((response) => {
      if (!response.error) {
        console.log(response);
        //
      } else {
        console.log('failed login');
        //
      }
    });
  }

  signOut() {
    return this.supabase.auth.signOut();
  }

  setUser(userId: string) {
    this.currentUser = userId;
  }

  setLoggedIn(value: boolean) {
    this._loggedIn.next(value);
  }

  /**
   * Fetch CSRF token from backend
   */
  fetchCsrfToken(): Observable<string> {
    return this.httpClient
      .get<{ csrf_token: string }>(
        `${this.envService.apiUrl}/auth/csrf-token`,
        {
          withCredentials: true,
        }
      )
      .pipe(
        map((response) => {
          this.csrfToken = response.csrf_token;
          // Also read from cookie if available (browser sets it automatically)
          const cookieValue = this.getCookie('csrf-token');
          if (cookieValue) {
            this.csrfToken = cookieValue;
          }
          return this.csrfToken;
        }),
        catchError((error) => {
          console.error('Failed to fetch CSRF token:', error);
          return of('');
        })
      );
  }

  /**
   * Get CSRF token (from memory or cookie)
   */
  getCsrfToken(): string {
    if (!this.csrfToken) {
      // Try to read from cookie
      const cookieValue = this.getCookie('csrf-token');
      if (cookieValue) {
        this.csrfToken = cookieValue;
      }
    }
    return this.csrfToken;
  }

  /**
   * Helper to get cookie value by name
   */
  private getCookie(name: string): string {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || '';
    }
    return '';
  }

  /**
   * Refresh the access token using the refresh token cookie
   * Returns true if refresh was successful, false otherwise
   */
  refreshToken(): Observable<boolean> {
    console.log('Attempting to refresh access token...');
    return this.httpClient
      .post<any>(
        `${this.envService.apiUrl}/auth/refresh`,
        {},
        { withCredentials: true }
      )
      .pipe(
        map(() => {
          // Token refresh successful
          console.log('Token refresh successful');
          this._loggedIn.next(true);
          return true;
        }),
        catchError((error) => {
          // Token refresh failed - refresh token expired or invalid
          // User needs to log in again
          console.error('Token refresh failed:', {
            status: error.status,
            statusText: error.statusText,
            message: error.error?.detail || error.message,
            url: error.url,
          });

          // Only log out if refresh token is actually expired/invalid
          // Don't log out on network errors or other issues
          if (error.status === 401) {
            console.log('Refresh token expired or invalid - logging out');
            this._loggedIn.next(false);
            this.currentUser = ''; // Clear user data
          } else {
            console.warn(
              'Refresh failed with non-401 error - keeping current auth state'
            );
          }
          return of(false);
        })
      );
  }
}
