import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule,
    CommonModule,
  ],
})
export class SignupPage {
  email: string = '';
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor() {}

  async joinWaitlist() {
    if (!this.email || this.isSubmitting) {
      return;
    }

    // Clear previous messages
    this.errorMessage = '';
    this.successMessage = '';

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    this.isSubmitting = true;

    try {
      const response = await fetch(`${environment.BASE_URL}/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: this.email,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMsg = `Server error (${response.status})`;

        try {
          const errorJson = JSON.parse(errorText);
          errorMsg = errorJson.message || errorMsg;
        } catch {
          errorMsg = errorText || errorMsg;
        }

        throw new Error(errorMsg);
      }

      const result = await response.json();
      console.log('Waitlist submission result:', result);

      // Check if the API returned a success status
      if (result.status === 'success' || response.ok) {
        this.successMessage = 'Successfully joined the waitlist!';
        console.log('Successfully joined waitlist:', this.email);

        // Reset form after a short delay
        setTimeout(() => {
          this.email = '';
          this.successMessage = '';
        }, 3000);
      } else {
        throw new Error(result.message || 'Failed to join waitlist');
      }
    } catch (error) {
      console.error('Error joining waitlist:', error);
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to join waitlist. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
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
