import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './core/auth/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { EnvResolverService } from './core/env-resolver/env-resolver.service';
import { distinctUntilChanged, filter, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  public appPages = [
    { title: 'Dashboard', url: '/folder/dashboard', icon: 'stats-chart' },
    { title: 'Inventory', url: '/folder/inventory', icon: 'cube' },
    { title: 'Sales', url: '/folder/sales', icon: 'trending-up' },
    { title: 'Shipping', url: '/folder/shipping', icon: 'car' },
    { title: 'Analytics', url: '/folder/analytics', icon: 'analytics' },
    { title: 'Settings', url: '/folder/settings', icon: 'settings' },
  ];

  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private envService = inject(EnvResolverService);
  private router = inject(Router);
  loggedIn$!: Observable<boolean>;
  isLandingPage = false;
  private routerSubscription?: Subscription;

  constructor() {}

  ngOnInit() {
    console.log('Start App');
    console.log('API URL:', this.envService.apiUrl);
    this.loggedIn$ = this.authService.loggedIn$.pipe(distinctUntilChanged());

    // Subscribe to router events to detect landing page
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isLandingPage = event.url === '/' || event.url === '';
      });

    // Check initial route
    this.isLandingPage = this.router.url === '/' || this.router.url === '';

    // First, check what cookies are available (debug)
    this.http
      .get<any>(`${this.envService.apiUrl}/auth/debug/cookies`, {
        withCredentials: true,
      })
      .subscribe({
        next: (debugInfo) => {
          console.log('Cookie Debug Info:', debugInfo);
        },
        error: (error) => {
          console.error('Debug endpoint error:', error);
        },
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  signOut() {
    this.http
      .get<any>(`${this.envService.apiUrl}/auth/logout`, {
        withCredentials: true,
      })
      .subscribe({
        next: (response) => {
          console.log('Logout successful:', response);
        },
        error: (error) => {
          console.error('Logout failed:', error);
        },
      });
    //this.loggedIn = false;
    this.router.navigate(['/']);
  }
}
