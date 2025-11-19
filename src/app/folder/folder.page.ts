import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
  standalone: false,
})
export class FolderPage implements OnInit {
  public folder!: string;
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router)
  private http = inject(HttpClient)
  private authService = inject(AuthService)

  constructor() {}

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.http.get<any>('https://localhost:8000/auth/me', {withCredentials: true}).subscribe((response) => {
      this.authService.setUser(response.id)
    })
  }

  navigateProfile() {
    this.router.navigate(['/profile'])
  }
}
