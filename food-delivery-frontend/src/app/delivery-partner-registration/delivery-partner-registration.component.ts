import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';   // ✅ ADDED

@Component({
  selector: 'app-delivery-partner-registration',
  templateUrl: './delivery-partner-registration.component.html',
  styleUrls: ['./delivery-partner-registration.component.css']
})
export class DeliveryPartnerRegistrationComponent implements OnInit {

  partner = {
    fullName: '',
    phoneNumber: '',
    email: '',
    city: '',
    fullAddress: '',
    vehicleType: 'Bike',
    vehicleNumber: '',
    drivingLicenseNumber: '',
    bankAccountNumber: '',
    ifscCode: '',
    panNumber: '',
    aadhaarNumber: ''
  };

  isLoading = false;
  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService    // ✅ ADDED
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  // ✅ Enhanced: tries localStorage first, then falls back to backend API
  private loadUserData(): void {
    // First, try to get from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.partner.phoneNumber = user.phoneNumber || user.phone || '';
      this.partner.email = user.email || '';
      this.partner.fullName = user.name || '';
    }

    // If phone number is still empty, fetch from backend using user ID
    if (!this.partner.phoneNumber) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user && user.id) {
        this.authService.getUserDetails(user.id).subscribe({
          next: (fullUser: any) => {
            if (fullUser && (fullUser.phone || fullUser.phoneNumber)) {
              this.partner.phoneNumber = fullUser.phone || fullUser.phoneNumber;
              console.log('✅ Phone number loaded from backend:', this.partner.phoneNumber);
            } else {
              console.warn('⚠️ Backend returned no phone number');
              alert('Phone number not found. Please contact support.');
            }
          },
          error: (err) => {
            console.error('❌ Failed to fetch user details:', err);
            alert('Could not load phone number. Please log out and log in again.');
          }
        });
      }
    }
  }

  registerPartner(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    // 🔍 FULL PAYLOAD LOGGING – expand in console to inspect all fields
    console.log('📦 FULL partner object:', JSON.stringify(this.partner, null, 2));

    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    this.http.post(`${this.apiUrl}/delivery-partner/register`, this.partner, { headers })
      .subscribe({
        next: (response: any) => {
          console.log('✅ Registration successful:', response);
          this.isLoading = false;

          alert('✅ Registration submitted successfully!');
          localStorage.setItem('deliveryPartnerInfo', JSON.stringify(response));
          this.router.navigate(['/delivery']);
        },
        error: (error) => {
          console.error('❌ Registration failed:', error);
          this.isLoading = false;
          let errorMessage = 'Registration failed. Please try again.';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error && error.error.error) {
            errorMessage = error.error.error;
          }
          alert('❌ ' + errorMessage);
        }
      });
  }

  private validateForm(): boolean {
    if (!this.partner.fullName.trim()) {
      alert('Please enter your full name');
      return false;
    }
    if (!this.partner.phoneNumber.trim()) {
      alert('Please enter your phone number');
      return false;
    }
    if (!this.partner.email.trim()) {
      alert('Please enter your email');
      return false;
    }
    if (!this.partner.city.trim()) {
      alert('Please enter your city');
      return false;
    }
    if (!this.partner.fullAddress.trim()) {
      alert('Please enter your full address');
      return false;
    }
    if (!this.partner.vehicleNumber.trim()) {
      alert('Please enter vehicle number');
      return false;
    }
    if (!this.partner.drivingLicenseNumber.trim()) {
      alert('Please enter driving license number');
      return false;
    }
    if (!this.partner.aadhaarNumber.trim()) {
      alert('Please enter Aadhaar number');
      return false;
    }
    return true;
  }

  formatVehicleNumber(): void {
    this.partner.vehicleNumber = this.partner.vehicleNumber.toUpperCase();
  }

  formatIFSC(): void {
    this.partner.ifscCode = this.partner.ifscCode.toUpperCase();
  }

  formatPAN(): void {
    this.partner.panNumber = this.partner.panNumber.toUpperCase();
  }

  formatAadhar(): void {
    this.partner.aadhaarNumber = this.partner.aadhaarNumber.replace(/\D/g, '');
    if (this.partner.aadhaarNumber.length > 12) {
      this.partner.aadhaarNumber = this.partner.aadhaarNumber.slice(0, 12);
    }
  }
}