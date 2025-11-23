import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { EnvResolverService } from 'src/app/core/env-resolver/env-resolver.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class LoginPage {
  apiUrl = inject(EnvResolverService)

  constructor() { }

  ngOnInit() {
    window.location.href = `${this.apiUrl}/auth/login`
  }
}
