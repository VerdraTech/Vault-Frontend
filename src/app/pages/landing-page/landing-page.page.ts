import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';
import { from, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';

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

    from(
      fetch(`${environment.BASE_URL}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: this.formData.name,
          email: this.formData.email,
        }),
      })
    )
      .pipe(
        switchMap((res) => {
          if (res.ok) {
            return from(res.json());
          }
          return from(res.text()).pipe(
            switchMap((text) =>
              throwError(() => new Error(text || `HTTP ${res.status}`))
            )
          );
        })
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
            err?.message || 'Failed to join waitlist. Please try again.';
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
