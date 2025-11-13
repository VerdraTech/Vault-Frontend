import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { VirtualDemoComponent } from 'src/app/components/virtual-demo/virtual-demo.page';
import { TimelineComponent } from 'src/app/components/timeline/timeline.page';
import { WaitlistModalComponent } from 'src/app/components/waitlist-modal/waitlist-modal.page';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.page.html',
  styleUrls: ['./landing-page.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule,
    CommonModule,
    VirtualDemoComponent,
    TimelineComponent,
    WaitlistModalComponent,
  ],
})
export class LandingPage {
  private http = inject(HttpClient);
  private formBuilder = inject(FormBuilder);

  isModalOpen: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  waitlistForm: FormGroup = this.formBuilder.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  constructor() {}

  openWaitlistModal() {
    this.isModalOpen = true;
    this.clearMessages();
  }

  closeModal() {
    this.isModalOpen = false;
    this.clearMessages();
    this.resetForm();
  }

  onModalDidDismiss() {
    // Sync local state when modal is closed via backdrop or swipe
    this.isModalOpen = false;
    this.clearMessages();
    this.resetForm();
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  resetForm() {
    this.waitlistForm.reset();
  }

  submitWaitlistForm() {
    if (this.waitlistForm.invalid || this.isSubmitting) {
      return;
    }

    this.clearMessages();
    this.isSubmitting = true;
  }

  // Method to handle smooth scrolling to sections
  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  openExternalLink(url: string) {
    window.open(url, '_blank');
  }

  onSuccess() {
    this.successMessage = 'Successfully joined the waitlist!';
    setTimeout(() => {
      this.resetForm();
      this.closeModal();
    }, 2000);
  }

  getBackgroundColor(): string {
    return '#ffffff';
  }
}
