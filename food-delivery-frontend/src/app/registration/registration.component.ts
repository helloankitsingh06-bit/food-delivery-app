import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {

  userData = {
    username: '',
    password: '',
    email: '',
    role: 'CUSTOMER'
  };

  roles = ['CUSTOMER', 'RESTAURANT', 'DELIVERY'];

  successMessage = '';
  errorMessage = '';
  loading = false;

  constructor(private httpService: HttpService, private router: Router) {}

  onSubmit(): void {

    // 🔥 DEBUG LINE (VERY IMPORTANT)
    console.log("FORM DATA:", this.userData);

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.httpService.register(this.userData).subscribe({
      next: () => {
        this.successMessage = 'Registration successful! Redirecting to login...';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error: any) => {
        console.error(error);
        this.errorMessage = 'Registration failed';
        this.loading = false;
      }
    });
  }
}