import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [IonicModule, ReactiveFormsModule]
})
export class ProfilePage implements OnInit {
  private formBuilder = inject(FormBuilder);

  profileForm = this.formBuilder.group({
    tier: [{ value: '', disabled: true }],
    name: [{ value: '', disabled: true }],
    email: [{ value: '', disabled: true }]
  })

  constructor() { }

  ngOnInit() {
  }

  editInfo() {
    this.profileForm.controls['name'].enable();
    this.profileForm.controls['email'].enable();
  }

  saveInfo() {
    // backend call
    this.profileForm.disable();
  }

  cancel() {
    this.profileForm.disable();
  }
}
