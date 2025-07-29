import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/auth/auth.service';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule]
})
export class LoginPage implements OnInit {
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  loginForm: FormGroup = this.buildForm();

  constructor() { }

  ngOnInit() {
  }

  buildForm() {
    this.loginForm = this.formBuilder.group({
      userName: ['', [ Validators.required ]],
      password: ['', [ Validators.required ]]
    })
    return this.loginForm
  }

  handleLogin() {
    const user = this.loginForm.value.userName;
    const pw = this.loginForm.value.password;
    this.authService.signIn(user, pw)
    this.loginForm.reset()
  }
}
