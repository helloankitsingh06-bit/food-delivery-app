import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.css']
})
export class RestaurantsComponent implements OnInit {

  // ✅ DATA
  restaurants: any[] = [];
  loading = true;
  errorMessage = '';
  searchTerm = '';

  // 📍 Location
  showLocationDropdown = false;

  locations: string[] = [
    'L&T Construction, Mount Poonamallee Rd',
    'L&T Technology, Chennai',
    'Christ University, Bangalore',
    'Camelot Society, Viman Nagar, Pune'
  ];

  selectedLocation = 'L&T Construction, Mount Poonamallee Rd';

  constructor(
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.loadRestaurants();
  }

  // ================= LOAD RESTAURANTS =================
  loadRestaurants(): void {
    this.loading = true;

    this.httpService.getAllRestaurants().subscribe({
      next: (data) => {
        console.log('Restaurants API Response:', data); // ✅ DEBUG
        this.restaurants = data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading restaurants:', error); // ✅ DEBUG
        this.errorMessage = 'Failed to load restaurants';
        this.loading = false;

        // 🔐 If unauthorized → logout
        if (error.status === 401 || error.status === 403) {
          this.authService.logout();
        }
      }
    });
  }

  // ================= SEARCH FILTER =================
  get filteredRestaurants(): any[] {
    if (!this.searchTerm) return this.restaurants;

    const term = this.searchTerm.toLowerCase();

    return this.restaurants.filter(r =>
      r.name?.toLowerCase().includes(term) ||
      r.cuisine?.toLowerCase().includes(term)
    );
  }

  // ================= NAVIGATION =================
  viewMenu(id: number): void {
    this.router.navigate(['/menu', id]);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  // ================= LOCATION =================
  toggleLocationDropdown(event: Event): void {
    event.stopPropagation();
    this.showLocationDropdown = !this.showLocationDropdown;
  }

  selectLocation(location: string, event: Event): void {
    event.stopPropagation();
    this.selectedLocation = location;
    this.showLocationDropdown = false;
  }

  addLocation(): void {
    const newLoc = prompt('Enter new address');

    if (newLoc && newLoc.trim()) {
      this.locations.unshift(newLoc.trim());
      this.selectedLocation = newLoc.trim();
    }
  }

  // ================= CLICK OUTSIDE =================
  @HostListener('document:click')
  closeDropdown(): void {
    this.showLocationDropdown = false;
  }
}