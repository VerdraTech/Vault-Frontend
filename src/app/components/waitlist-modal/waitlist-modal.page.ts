import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  HostListener,
  inject,
} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-waitlist-modal',
  templateUrl: './waitlist-modal.page.html',
  styleUrls: ['./waitlist-modal.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class WaitlistModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Join Our Waitlist';
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  private http = inject(HttpClient);
  private formBuilder = inject(FormBuilder);

  waitlistForm: FormGroup = this.formBuilder.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  ngOnInit() {
    // Ionic modal handles initialization automatically
  }

  ngOnChanges(changes: SimpleChanges) {
    // Ionic modal handles body overflow automatically
  }

  ngOnDestroy() {
    // Ionic modal handles body overflow automatically
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnter(event: KeyboardEvent) {
    if (this.isOpen && !this.isSubmitting) {
      // Only submit if focus is on an input field, not if it's on a button or other element
      const target = event.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'ION-INPUT' ||
        target.closest('ion-input') !== null;
      if (isInput && this.waitlistForm.valid) {
        event.preventDefault();
        this.submitForm();
      }
    }
  }

  onClose() {
    this.close.emit();
  }

  submitForm() {
    if (this.waitlistForm.invalid || this.isSubmitting) {
      return;
    }

    this.clearMessages();
    this.isSubmitting = true;

    this.http
      .post<{
        status: string;
        message?: string;
        name?: string;
        email?: string;
      }>(`${environment.apiUrl}/waitlist`, this.waitlistForm.value, {
        withCredentials: true,
      })
      .subscribe({
        next: (result) => {
          if (result?.status === 'success') {
            this.successMessage = 'Successfully joined the waitlist!';
            this.success.emit();
            setTimeout(() => {
              this.waitlistForm.reset();
              this.onClose();
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
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        },
      });
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
