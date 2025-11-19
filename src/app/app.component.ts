import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './core/auth/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { EnvResolverService } from './core/env-resolver/env-resolver.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  public appPages = [
    { title: 'Inbox', url: '/folder/inbox', icon: 'mail' },
    { title: 'Dashboard', url: '/folder/dashboard', icon: 'analytics' },
    { title: 'Outbox', url: '/folder/outbox', icon: 'paper-plane' },
    { title: 'Inventory', url: '/folder/inventory', icon: 'archive' },
    { title: 'Favorites', url: '/folder/favorites', icon: 'heart' },
    { title: 'Marketplace', url: '/folder/marketplace', icon: 'storefront' },
    { title: 'Trash', url: '/folder/trash', icon: 'trash' },
    { title: 'Spam', url: '/folder/spam', icon: 'warning' },
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];

  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private envService = inject(EnvResolverService);
  private router = inject(Router);
  loggedIn = false;
  isLandingPage = false;
  private routerSubscription?: Subscription;

  constructor() {}

  ngOnInit() {
    console.log('Start App');
    console.log('API URL:', this.envService.apiUrl);

    // Subscribe to auth state changes
    this.authService.loggedIn$.subscribe((isLoggedIn) => {
      this.loggedIn = isLoggedIn;
    });

    // Subscribe to router events to detect landing page
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isLandingPage = event.url === '/' || event.url === '';
      });

    // Check initial route
    this.isLandingPage = this.router.url === '/' || this.router.url === '';

    // Fetch CSRF token first (required for API requests)
    this.authService.fetchCsrfToken().subscribe({
      next: (token) => {
        console.log('CSRF token fetched:', token ? 'success' : 'failed');
      },
      error: (error) => {
        console.error('Failed to fetch CSRF token:', error);
      },
    });

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

    // Then try to get user info - the interceptor will handle token refresh automatically
    // Don't manually set loggedIn=false here - let the interceptor handle it
    this.http
      .get<any>(`${this.envService.apiUrl}/auth/me`, { withCredentials: true })
      .subscribe({
        next: (response) => {
          console.log('User authenticated:', response.id);
          this.authService.setUser(response.id);
          this.authService.setLoggedIn(true);
        },
        error: (error) => {
          // The interceptor will handle 401 errors and attempt refresh
          // Only log here, don't manually set loggedIn state
          if (error.status === 401) {
            console.log(
              'Authentication check failed - interceptor should have handled refresh'
            );
            console.log('Error details:', error.error?.detail || error.message);
            // Don't set loggedIn=false here - interceptor already handled it
          } else {
            console.error('Error checking authentication:', error);
          }
        },
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
