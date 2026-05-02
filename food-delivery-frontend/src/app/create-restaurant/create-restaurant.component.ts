import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-create-restaurant',
  templateUrl: './create-restaurant.component.html',
  styleUrls: ['./create-restaurant.component.css']
})
export class CreateRestaurantComponent implements OnInit {
  
  restaurantData = {
    name: '',
    address: '',
    cuisine: '',
    imageUrl: '',
    location: '',
    rating: 0,
    ownerEmail: ''
  };

  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    
    if (!user || user.role !== 'RESTAURANT') {
      this.errorMessage = 'Access denied. Only restaurant owners can create restaurants.';
      setTimeout(() => {
        this.router.navigate(['/restaurants']);
      }, 2000);
      return;
    }
    
    // ✅ CHANGED: Check if restaurant already exists using user ID
    this.httpService.getRestaurantByOwnerId(user.id).subscribe({
      next: (restaurant) => {
        if (restaurant && restaurant.id) {
          // Already has a restaurant → go to orders
          this.router.navigate(['/orders']);
          return;
        }
      },
      error: (err) => {
        // 404 means no restaurant → allow creation (do nothing)
        if (err.status !== 404) {
          console.error('Error checking restaurant:', err);
        }
      }
    });
    
    // Set owner email from logged-in user
    if (user && user.email) {
      this.restaurantData.ownerEmail = user.email;
    } else {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        this.restaurantData.ownerEmail = parsedUser.email;
      }
    }
  }

  onSubmit() {
    if (!this.restaurantData.name) {
      this.errorMessage = 'Restaurant name is required';
      return;
    }
    
    if (!this.restaurantData.address) {
      this.errorMessage = 'Address is required';
      return;
    }
    
    if (!this.restaurantData.ownerEmail) {
      this.errorMessage = 'You must be logged in as restaurant owner';
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    console.log('Sending restaurant data:', this.restaurantData);
    
    this.httpService.createRestaurant(this.restaurantData).subscribe({
      next: (response) => {
        console.log('Restaurant created successfully, response:', response);
        this.successMessage = 'Restaurant created! Redirecting...';
        this.loading = false;
        
        // ✅ NAVIGATE IMMEDIATELY (remove the 2-second delay)
        this.router.navigate(['/orders']);
      },
      error: (error) => {
        console.error('Create restaurant error:', error);
        this.errorMessage = error.error?.message || error.message || 'Failed to create restaurant';
        this.loading = false;
      }
    });
  }
  
  goBack() {
    this.router.navigate(['/restaurants']);
  }
}