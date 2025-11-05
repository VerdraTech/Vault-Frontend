import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

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
  ],
})
export class LandingPage {
  private http = inject(HttpClient);

  isModalOpen: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  formData = {
    name: '',
    email: '',
  };

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
    this.formData.name = '';
    this.formData.email = '';
  }

  submitWaitlistForm() {
    if (!this.formData.name || !this.formData.email || this.isSubmitting) {
      return;
    }

    this.clearMessages();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    this.isSubmitting = true;

    this.http
      .post<{
        status: string;
        message?: string;
        name?: string;
        email?: string;
      }>(
        `${environment.BASE_URL}/waitlist`,
        {
          name: this.formData.name,
          email: this.formData.email,
        },
        {
          withCredentials: true,
        }
      )
      .subscribe({
        next: (result) => {
          console.log('Waitlist submission result:', result);
          if (result?.status === 'success') {
            this.successMessage = 'Successfully joined the waitlist!';
            setTimeout(() => {
              this.resetForm();
              this.closeModal();
            }, 2000);
          } else {
            this.errorMessage = result?.message || 'Failed to join waitlist';
          }
        },
        error: (err) => {
          console.error('Error joining waitlist:', err);
          const msg =
            err?.error?.message ||
            err?.message ||
            'Failed to join waitlist. Please try again.';
          this.errorMessage = msg;
        },
        complete: () => {
          this.isSubmitting = false;
        },
      });
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
}
