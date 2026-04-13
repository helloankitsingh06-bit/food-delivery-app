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
    username: '',
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

        // ✅ FIX 1: Store token with correct key
        localStorage.setItem('token', response.token);

        // ✅ Store user info
        localStorage.setItem('user_data', JSON.stringify(response.user));

        console.log("Login success", response);

        // ✅ Navigation based on role
        if (response.user.role === 'CUSTOMER') {
          this.router.navigate(['/restaurants']);
        } else if (response.user.role === 'RESTAURANT') {
          this.router.navigate(['/dashboard']);
        } else if (response.user.role === 'DELIVERY') {
          this.router.navigate(['/delivery']);
        }

        // ✅ FIX 2: stop loading
        this.loading = false;
      },

      error: (error: any) => {
        this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
        this.loading = false;
      }
    });
  }
}