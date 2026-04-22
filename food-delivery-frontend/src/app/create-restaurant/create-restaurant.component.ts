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
    // Check if user is RESTAURANT
    const user = this.authService.getCurrentUser();
    
    if (!user || user.role !== 'RESTAURANT') {
      this.errorMessage = 'Access denied. Only restaurant owners can create restaurants.';
      setTimeout(() => {
        this.router.navigate(['/restaurants']);
      }, 2000);
      return;
    }
    
    // ✅ CHECK IF RESTAURANT ALREADY EXISTS
    this.httpService.getRestaurantsByOwner(user.email).subscribe({
      next: (restaurants) => {
        if (restaurants && restaurants.length > 0) {
          // Restaurant already exists! Redirect to orders
          this.router.navigate(['/orders']);
          return;
        }
      },
      error: () => {
        // No restaurant found, allow them to create (do nothing, continue)
      }
    });
    
    // Get logged-in user's email
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
    
    console.log('Sending:', this.restaurantData);
    
    this.httpService.createRestaurant(this.restaurantData).subscribe({
      next: (response) => {
        this.successMessage = 'Restaurant created successfully!';
        this.loading = false;
        
        setTimeout(() => {
          this.router.navigate(['/orders']);  // ✅ Redirect to orders page
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to create restaurant';
        this.loading = false;
      }
    });
  }
  
  goBack() {
    this.router.navigate(['/restaurants']);
  }
}