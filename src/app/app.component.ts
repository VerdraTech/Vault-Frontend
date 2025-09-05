import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from './core/auth/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  public appPages = [
    { title: 'Inbox', url: '/folder/inbox', icon: 'mail' },
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
  loggedIn = true;
  
  constructor(
    private router: Router
  ) {}

  ngOnInit() {
    console.log('Start App')
     this.http.get<any>('https://localhost:8000/auth/me', { withCredentials: true }).subscribe((response) => {
      console.log(response.id)
      this.authService.setUser(response.id)
    })
  }
}
