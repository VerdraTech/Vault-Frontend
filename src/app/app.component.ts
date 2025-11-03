import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from './core/auth/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  public appPages = [
    { title: 'Dashboard', url: '/folder/dashboard', icon: 'stats-chart' },
    { title: 'Inventory', url: '/folder/inventory', icon: 'cube' },
    { title: 'Sales', url: '/folder/sales', icon: 'trending-up' },
    { title: 'Shipping', url: '/folder/shipping', icon: 'car' },
    { title: 'Analytics', url: '/folder/analytics', icon: 'analytics' },
    { title: 'Settings', url: '/folder/settings', icon: 'settings' },
  ];

  private authService = inject(AuthService);
  loggedIn = true;
  
  constructor(
    private router: Router
  ) {}

  ngOnInit() {
    // this.authService.startSupabase();
   
    // this.authService.loggedIn$.subscribe(loggedIn => {
    //   if (loggedIn) {
    //     this.loggedIn = true;
    //     this.router.navigate(['/folder/inbox'])
    //     //
    //   } else {
    //     this.router.navigate(['/login'])
    //   }
    // })
  }

  // signOut() {
  //   this.authService.signOut();
  //   this.loggedIn = false;
  //   this.router.navigate(['/login'])
  // }
}
