import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  credentials = {
    email: '',   // ✅ FIXED (was username)
    password: ''
  };

  errorMessage = '';
  loading = false;

  constructor(private httpService: HttpService, private router: Router) {}

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.httpService.login(this.credentials).subscribe({
      next: (response: any) => {

        console.log("Login success", response);

        // ✅ FIX: handle string or object response
        const token = response.token || response;

        localStorage.setItem('token', token);

        if (response.user) {
          localStorage.setItem('user_data', JSON.stringify(response.user));

          // ✅ Role-based navigation
          if (response.user.role === 'CUSTOMER') {
            this.router.navigate(['/restaurants']);
          } else if (response.user.role === 'RESTAURANT') {
            this.router.navigate(['/dashboard']);
          } else if (response.user.role === 'DELIVERY') {
            this.router.navigate(['/delivery']);
          }
        } else {
          // fallback if only token returned
          this.router.navigate(['/restaurants']);
        }

        this.loading = false;
      },

      error: (error: any) => {
        console.error(error);
        this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
        this.loading = false;
      }
    });
  }
}