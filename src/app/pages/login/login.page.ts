import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/auth/auth.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class LoginPage implements OnInit {
  private authService = inject(AuthService);
  isLoading = false;

  constructor() { }

  ngOnInit() {
    // Check if user is already authenticated
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        // Redirect to home if already authenticated
        // You can customize this based on your routing
      }
    });
  }

  handleLogin() {
    this.isLoading = true;
    // Redirect to backend OAuth login
    this.authService.login();
  }
}