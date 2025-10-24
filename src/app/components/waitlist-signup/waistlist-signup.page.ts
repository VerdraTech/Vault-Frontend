import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-waitlist-signup',
  templateUrl: './waistlist-signup.page.html',
  styleUrls: ['./waistlist-signup.page.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, RouterModule],
})
export class WaitlistSignupComponent implements OnInit {
  waitlistForm!: FormGroup;
  isSubmitting = false;
  isSuccess = false;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.waitlistForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.waitlistForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  async onSubmit() {
    if (this.waitlistForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      try {
        await this.submitToWaitlist(this.waitlistForm.value);

        this.isSuccess = true;

        this.waitlistForm.reset();

        setTimeout(() => {
          const successElement = document.querySelector('.success-message');
          if (successElement) {
            console.log(this.waitlistForm.value, successElement);
            successElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }
        }, 100);
      } catch (error) {
        console.error('Error submitting to waitlist:', error);
        this.handleSubmissionError();
      } finally {
        this.isSubmitting = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private async submitToWaitlist(formData: {
    name: string;
    email: string;
  }): Promise<void> {
    // Make actual API call to your backend
    const response = await fetch(`${environment.BASE_URL}/waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Waitlist submission result:', result);

    if (result.status !== 'success') {
      throw new Error(result.message || 'Failed to join waitlist');
    }
  }

  private handleSubmissionError() {
    // You could show a toast notification or error message here
    console.error('Failed to submit to waitlist');
    // Example: this.presentToast('Failed to join waitlist. Please try again.');
  }

  private markFormGroupTouched() {
    Object.keys(this.waitlistForm.controls).forEach((key) => {
      const control = this.waitlistForm.get(key);
      control?.markAsTouched();
    });
  }

  // Method to reset the form if needed
  resetForm() {
    this.waitlistForm.reset();
    this.isSuccess = false;
  }
}
