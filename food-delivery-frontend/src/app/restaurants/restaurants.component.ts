import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.css']
})
export class RestaurantsComponent implements OnInit, OnDestroy {

  restaurants: any[] = [];
  filteredRestaurants: any[] = [];

  loading = true;
  errorMessage = '';
  searchTerm = '';

  showLocationDropdown = false;
  locations: string[] = ['Delhi', 'Bangalore', 'Mumbai'];
  selectedLocation = '';

  showFilter = false;

  filters = {
    highRating: false,
    lowPrice: false
  };

  userRole: string = '';

  // ================= SLIDER WITH ALL WORKING IMAGES =================
  slides = [
    {
      image: 'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?w=1200&q=80',
      title: 'Delicious Food',
      subtitle: 'Taste beyond imagination'
    },
    {
      image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?w=1200&q=80',
      title: 'Gourmet',
      subtitle: 'Fine dining at its best'
    },
    {
      image: 'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?w=1200&q=80',
      title: 'Top Restaurants',
      subtitle: 'Curated for you'
    }
  ];

  currentSlide = 0;
  slideInterval: any;

  // 🔥 AUTO REFRESH
  refreshInterval: any;

  // ================= CART =================
  cart: any[] = [];
  showCart = false;

  constructor(
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.loadSavedLocation();
    this.loadRestaurants();
    this.startSlider();

    // 🔥 REAL-TIME REFRESH
    this.refreshInterval = setInterval(() => {
      this.loadRestaurants(false);
    }, 5000);
  }

  ngOnDestroy(): void {
    this.stopSlider();

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  // ================= TRACKBY =================
  trackByIndex(index: number): number {
    return index;
  }

  // ================= IMAGE =================
  getImageUrl(r: any): string {
    const path =
      r?.imageUrl ||
      r?.image ||
      r?.img ||
      r?.photo ||
      r?.logo;

    if (!path || typeof path !== 'string') {
      return 'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?w=800&q=80';
    }

    const cleanPath = path.replace(/\\/g, '/');

    if (cleanPath.startsWith('http')) {
      return cleanPath;
    }

    const baseUrl = 'http://localhost:8080';
    return `${baseUrl}/${cleanPath.replace(/^\/+/, '')}`;
  }

  // ================= API =================
  loadRestaurants(showLoader: boolean = true): void {
    if (showLoader) this.loading = true;

    this.httpService.getAllRestaurants().subscribe({
      next: (data: any[]) => {

        const updated = (data || []).map(r => {

          // 🔥 FIX ADDRESS
          let cleanAddress = 'City Center';

          if (r.address && typeof r.address === 'string') {
            const trimmed = r.address.trim();

            if (
              trimmed !== '' &&
              trimmed.toLowerCase() !== 'null' &&
              trimmed.toLowerCase() !== 'undefined'
            ) {
              cleanAddress = trimmed;
            }
          }

          return {
            id: r.id,
            name: r.name || 'Restaurant',
            cuisine: r.cuisine || 'Multi-Cuisine',
            rating: Number(r.rating) || 4,
            price: Number(r.price) || 300,
            address: cleanAddress,
            imageUrl: this.getImageUrl(r)
          };
        });

        if (JSON.stringify(updated) !== JSON.stringify(this.restaurants)) {
          this.restaurants = updated;

          // 🔥 KEEP SEARCH + FILTERS AFTER REFRESH
          this.applyLiveFilters();

          this.cdr.detectChanges();
        }

        this.loading = false;
      },

      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load restaurants';
        this.loading = false;

        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
        }
      }
    });
  }

  // ================= SEARCH =================
  onSearch(): void {
    this.applyLiveFilters();
  }

  // ================= FILTER =================
  toggleFilter() {
    this.showFilter = !this.showFilter;
  }

  applyFilters() {
    this.applyLiveFilters();
    this.showFilter = false;
  }

  toggleQuickFilter(type: 'rating' | 'price') {
    if (type === 'rating') {
      this.filters.highRating = !this.filters.highRating;
    } else {
      this.filters.lowPrice = !this.filters.lowPrice;
    }

    this.applyLiveFilters();
  }

  // 🔥 CENTRAL FILTER LOGIC
  applyLiveFilters() {
    let data = [...this.restaurants];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase().trim();
      data = data.filter(r =>
        r.name.toLowerCase().includes(term) ||
        r.cuisine.toLowerCase().includes(term)
      );
    }

    data = data.filter(r =>
      (!this.filters.highRating || r.rating >= 4) &&
      (!this.filters.lowPrice || r.price <= 300)
    );

    this.filteredRestaurants = data;
  }

  // ================= SORT =================
  sortRestaurants(event: any) {
    const value = event.target.value;
    const sorted = [...this.filteredRestaurants];

    if (value === 'low') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (value === 'high') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (value === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating);
    }

    this.filteredRestaurants = sorted;
  }

  // ================= NAV =================
  viewMenu(id: number) {
    this.router.navigate(['/menu', id]);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  // Check if logged-in user is RESTAURANT
  isRestaurantOwner(): boolean {
    const user = this.authService.getCurrentUser();
    if (user && user.role) {
      this.userRole = user.role;
      return user.role === 'RESTAURANT';
    }
    return false;
  }

  goToCreateRestaurant() {
    if (this.isRestaurantOwner()) {
      this.router.navigate(['/create-restaurant']);
    } else {
      this.errorMessage = 'Only restaurant owners can add restaurants';
    }
  }

  // ================= LOCATION =================
  toggleLocationDropdown(event: Event) {
    event.stopPropagation();
    this.showLocationDropdown = !this.showLocationDropdown;
  }

  selectLocation(location: string, event: Event) {
    event.stopPropagation();
    this.selectedLocation = location;
    localStorage.setItem('user_location', location);
    this.showLocationDropdown = false;
  }

  addLocation() {
    const loc = prompt('Enter new address');
    if (loc) {
      this.locations.unshift(loc);
      this.selectedLocation = loc;
      localStorage.setItem('user_location', loc);
    }
  }

  editLocation(index: number, event: Event) {
    event.stopPropagation();

    const updated = prompt('Edit address', this.locations[index]);

    if (updated) {
      const old = this.locations[index];
      this.locations[index] = updated;

      if (this.selectedLocation === old) {
        this.selectedLocation = updated;
      }

      localStorage.setItem('user_location', updated);
    }
  }

  deleteLocation(index: number, event: Event) {
    event.stopPropagation();

    const removed = this.locations[index];
    this.locations.splice(index, 1);

    if (this.selectedLocation === removed) {
      this.selectedLocation = this.locations[0] || 'Select Location';
    }
  }

  loadSavedLocation() {
    const saved = localStorage.getItem('user_location');
    this.selectedLocation = saved || 'Select Location';
  }

  // ================= SLIDER =================
  startSlider() {
    this.stopSlider();

    this.slideInterval = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
      this.cdr.detectChanges();
    }, 4000);
  }

  stopSlider() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  pauseSlider() {
    this.stopSlider();
  }

  resumeSlider() {
    this.startSlider();
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  // ================= CART =================
  toggleCart() {
    this.showCart = !this.showCart;
  }

  getTotal() {
    return this.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  // ================= CLICK OUTSIDE =================
  @HostListener('document:click')
  closeDropdown() {
    this.showLocationDropdown = false;
  }
}