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
    { title: 'Inbox', url: '/folder/inbox', icon: 'mail' },
    { title: 'Outbox', url: '/folder/outbox', icon: 'paper-plane' },
    { title: 'Inventory', url: '/folder/inventory', icon: 'paper-plane' },
    { title: 'Favorites', url: '/folder/favorites', icon: 'heart' },
    { title: 'Archived', url: '/folder/archived', icon: 'archive' },
    { title: 'Trash', url: '/folder/trash', icon: 'trash' },
    { title: 'Spam', url: '/folder/spam', icon: 'warning' },
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];

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
