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
   * Refresh the access token using the refresh token cookie
   * Returns true if refresh was successful, false otherwise
   */
  refreshToken(): Observable<boolean> {
    return this.httpClient
      .post<any>(
        `${this.envService.apiUrl}/auth/refresh`,
        {},
        { withCredentials: true }
      )
      .pipe(
        map(() => {
          // Token refresh successful
          this._loggedIn.next(true);
          return true;
        }),
        catchError((error) => {
          // Token refresh failed - refresh token expired or invalid
          // User needs to log in again
          console.error(
            'Token refresh failed - user will be logged out:',
            error
          );
          this._loggedIn.next(false);
          this.currentUser = ''; // Clear user data
          return of(false);
        })
      );
  }
}
