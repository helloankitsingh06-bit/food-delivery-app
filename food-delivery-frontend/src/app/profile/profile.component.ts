import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpService } from '../services/http.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user: any = {};
  restaurant: any = null;
  isLoading = true;
  isEditing = false;
  errorMessage = '';
  successMessage = '';

  displayName: string = '';
  displayRole: string = '';

  userForm = {
    name: '',
    email: '',
    phone: '',
    address: ''
  };

  restaurantForm = {
    id: null as number | null,
    name: '',
    location: '',
    address: '',
    cuisine: '',
    imageUrl: '',
    rating: 0
  };

  constructor(
    private authService: AuthService,
    private httpService: HttpService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();

    // 🔥 IMPORTANT: reload data whenever user comes back to profile
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.router.url === '/profile') {
          this.loadData();
        }
      });
  }

  loadData() {
    this.isLoading = true;
    this.user = this.authService.getCurrentUser();

    console.log('User:', this.user);

    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    this.displayRole = this.user.role;

    // ✅ RESTAURANT USER
    if (this.user.role === 'RESTAURANT') {
      this.httpService.getRestaurantByOwnerId(this.user.id).subscribe({
        next: (restaurant) => {
          console.log('Restaurant API response:', restaurant);

          this.restaurant = restaurant;

          if (restaurant) {
            this.restaurantForm = {
              id: restaurant.id,
              name: restaurant.name || '',
              location: restaurant.location || '',
              address: restaurant.address || '',
              cuisine: restaurant.cuisine || '',
              imageUrl: restaurant.imageUrl || '',
              rating: restaurant.rating || 0
            };

            this.displayName = restaurant.name || 'Restaurant';
          } else {
            this.displayName = this.user.username || this.user.name;
          }

          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching restaurant:', err);
          this.displayName = this.user.username || this.user.name;
          this.isLoading = false;
        }
      });

    } else {
      // ✅ CUSTOMER / DELIVERY
      this.userForm = {
        name: this.user.name || '',
        email: this.user.email || '',
        phone: this.user.phone || '',
        address: this.user.address || ''
      };

      this.displayName = this.user.name || 'User';
      this.isLoading = false;
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // ✅ UPDATE CUSTOMER
  updateCustomerProfile() {
    this.httpService.updateUser(this.user.id, this.userForm).subscribe({
      next: () => {
        const updatedUser = { ...this.user, ...this.userForm };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        this.user = updatedUser;
        this.displayName = updatedUser.name;

        this.showSuccess('Profile updated successfully!');
        this.isEditing = false;
      },
      error: (error) => {
        this.showError(error.error?.message || 'Failed to update profile');
      }
    });
  }

  // ✅ UPDATE RESTAURANT
  updateRestaurantProfile() {
    if (!this.restaurantForm.id) {
      this.showError('No restaurant found to update');
      return;
    }

    this.httpService.updateRestaurant(this.restaurantForm.id, this.restaurantForm).subscribe({
      next: (response) => {
        this.restaurant = response;
        this.displayName = response.name;

        this.showSuccess('Restaurant updated successfully!');
        this.isEditing = false;

        // 🔥 reload fresh data
        this.loadData();
      },
      error: (error) => {
        this.showError(error.error?.message || 'Failed to update restaurant');
      }
    });
  }

  // ✅ DELETE RESTAURANT
  deleteRestaurant() {
    if (!this.restaurantForm.id) return;

    if (confirm('⚠️ Are you sure you want to delete your restaurant?')) {
      this.httpService.deleteRestaurant(this.restaurantForm.id).subscribe({
        next: () => {
          this.showSuccess('Restaurant deleted successfully!');
          
          this.restaurant = null; // 🔥 clear UI instantly

          setTimeout(() => {
            this.router.navigate(['/create-restaurant']);
          }, 1500);
        },
        error: (error) => {
          this.showError(error.error?.message || 'Failed to delete restaurant');
        }
      });
    }
  }

  goBack() {
    if (this.user.role === 'RESTAURANT') {
      this.router.navigate(['/orders']);
    } else {
      this.router.navigate(['/restaurants']);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // ✅ MESSAGE HANDLING
  private showSuccess(message: string) {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 3000);
  }

  private showError(message: string) {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 3000);
  }
}