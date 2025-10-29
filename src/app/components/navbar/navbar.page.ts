import { Component, input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.page.html',
  styleUrls: ['./navbar.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, CommonModule],
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;

  loggedIn = input<boolean>(false);

  constructor(private router: Router) {}

  ngOnInit() {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.closeMenu();
  }
}
