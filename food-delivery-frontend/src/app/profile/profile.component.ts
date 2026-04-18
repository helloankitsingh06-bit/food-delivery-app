import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

  user = {
    name: 'Bareeq',
    email: 'bareeq@email.com',
    phone: '9876543210',
    address: 'L&T Construction, Mount Poonamallee Rd'
  };

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  goBack(): void {
    this.router.navigate(['/restaurants']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}