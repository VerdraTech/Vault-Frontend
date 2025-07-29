import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthChangeEvent, AuthSession, createClient, SupabaseClient  } from '@supabase/supabase-js';
import { BehaviorSubject, from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase!: SupabaseClient;
  private httpClient = inject(HttpClient)
  _session: AuthSession | null = null;
  _loggedIn = new BehaviorSubject<boolean>(false);
  loggedIn$ = this._loggedIn.asObservable()

  constructor() { }

  startSupabase() {
    this.getSupabaseApiKey().subscribe((response) => {
      this.supabase = createClient(response.supabaseUrl, response.supabaseApiKey)
      this.getAuthChange()
    })
  }

  getSupabaseApiKey(): Observable<any> {
    return this.httpClient.get('http://localhost:4000/api/supabase');
  }

  getAuthChange() {
    const { data: { subscription } } =  this.supabase.auth.onAuthStateChange((event: AuthChangeEvent, sess: AuthSession | null) => {
      console.log(event, sess)
      if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !sess)) {
        this._loggedIn.next(false)
      } else if (event === 'SIGNED_IN' || (event === 'INITIAL_SESSION' && sess)) {
        this._loggedIn.next(true)
      }
    })
  }

  signIn(email: string, password: string) {
    return from(this.supabase.auth.signInWithPassword({
      email: email,
      password: password
    })).subscribe(response => {
      if (!response.error) {
        console.log(response)
        //
      } else {
        console.log('failed login')
        //
      }
    })
  } 

  signOut() {
    return this.supabase.auth.signOut()
  }


}
