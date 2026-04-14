import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.css']
})
export class RestaurantsComponent implements OnInit {
  restaurants: any[] = [];
  loading = true;
  errorMessage = '';
  searchTerm = '';

  constructor(
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.loading = true;
    this.httpService.getAllRestaurants().subscribe({
      next: (data) => {
        this.restaurants = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load restaurants. Please try again.';
        this.loading = false;
        if (error.status === 401) {
          this.authService.logout();
        }
      }
    });
  }

  get filteredRestaurants(): any[] {
    if (!this.searchTerm) return this.restaurants;
    return this.restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      restaurant.cuisine?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  getTotalCuisines(): number {
    const cuisines = new Set(this.restaurants.map(r => r.cuisine));
    return cuisines.size;
  }

  getAverageRating(): string {
    if (this.restaurants.length === 0) return '0';
    const total = this.restaurants.reduce((sum, r) => sum + (parseFloat(r.rating) || 4.5), 0);
    return (total / this.restaurants.length).toFixed(1);
  }

  viewMenu(restaurantId: number): void {
    this.router.navigate(['/menu', restaurantId]);
  }

  logout(): void {
    this.authService.logout();
  }
}
