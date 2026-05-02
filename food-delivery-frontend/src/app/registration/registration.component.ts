import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  // Step tracking: 1 = phone input, 2 = OTP input, 3 = registration form
  step = 1;

  // OTP data
  phone = '';
  otp = '';
  tempToken = '';

  // Registration form fields
  userData = {
    username: '',
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER'
  };

  roles = ['CUSTOMER', 'RESTAURANT', 'DELIVERY'];

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Step 1: Request OTP (with phone formatting)
  requestOtp() {
    let rawPhone = this.phone.trim();

    // If phone doesn't start with '+', add '+'
    if (!rawPhone.startsWith('+')) {
      rawPhone = '+' + rawPhone;
    }

    // Optional: validate that it has at least 10 digits after country code
    if (rawPhone.length < 10) {
      this.errorMessage = 'Invalid phone number. Include country code (e.g., +919876543210)';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.authService.requestOtp(rawPhone).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'OTP sent to ' + rawPhone;
        this.phone = rawPhone; // store formatted phone
        this.step = 2;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Failed to send OTP';
      }
    });
  }

  // Step 2: Verify OTP
  verifyOtp() {
    if (!this.otp || this.otp.length < 4) {
      this.errorMessage = 'Enter valid OTP';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.authService.verifyOtp(this.phone, this.otp).subscribe({
      next: (res) => {
        this.loading = false;
        this.tempToken = res.tempToken;
        this.successMessage = 'Phone verified! Please complete your profile.';
        this.step = 3;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Invalid OTP';
      }
    });
  }

  // Step 3: Final registration using tempToken
  onSubmit() {
    if (!this.userData.username || !this.userData.name || !this.userData.email || !this.userData.password) {
      this.errorMessage = 'All fields are required';
      return;
    }
    if (this.userData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }
    if (!this.tempToken) {
      this.errorMessage = 'Session expired. Please restart OTP verification.';
      this.resetToPhone();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.registerWithTempToken(this.tempToken, this.userData).subscribe({
      next: () => {
        this.successMessage = 'Registration successful! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = error.error?.error || 'Registration failed';
        this.loading = false;
      }
    });
  }

  // Go back to phone step (resend OTP)
  resetToPhone() {
    this.step = 1;
    this.otp = '';
    this.tempToken = '';
    this.errorMessage = '';
    this.successMessage = '';
  }
}