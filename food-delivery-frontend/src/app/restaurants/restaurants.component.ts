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
  displayedRestaurants: any[] = [];
  
  loading = true;
  loadingMore = false;
  errorMessage = '';
  searchTerm = '';

  // Infinite scroll
  currentPage = 1;
  pageSize = 6;
  hasMoreRestaurants = true;

  showLocationDropdown = false;
  locations: { name: string; type: 'home' | 'work' | 'other' }[] = [];
  selectedLocation = '';
  locationDistance = 2.3; // simulated km

  showFilter = false;
  filters = {
    highRating: false,
    lowPrice: false,
    vegOnly: false
  };
  selectedCuisines: string[] = [];
  availableCuisines: string[] = ['Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese', 'American'];

  userRole = '';

  // Slider
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

  // Auto refresh
  refreshInterval: any;
  badgeRefreshInterval: any;

  // Cart
  cart: any[] = [];
  showCart = false;

  constructor(
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadLocationsFromLocal();
    this.loadSavedLocation();
    this.loadRestaurants();
    this.startSlider();

    this.refreshInterval = setInterval(() => {
      this.loadRestaurants(false);
    }, 5000);

    this.badgeRefreshInterval = setInterval(() => {
      this.cdr.detectChanges();
    }, 30000);
  }

  ngOnDestroy(): void {
    this.stopSlider();
    if (this.refreshInterval) clearInterval(this.refreshInterval);
    if (this.badgeRefreshInterval) clearInterval(this.badgeRefreshInterval);
  }

  // ================= LOCATIONS =================
  loadLocationsFromLocal() {
    const stored = localStorage.getItem('user_locations');
    if (stored) {
      this.locations = JSON.parse(stored);
    } else {
      this.locations = [
        { name: 'Delhi', type: 'home' },
        { name: 'Bangalore', type: 'work' },
        { name: 'Mumbai', type: 'other' }
      ];
      this.saveLocationsToLocal();
    }
  }

  saveLocationsToLocal() {
    localStorage.setItem('user_locations', JSON.stringify(this.locations));
  }

  loadSavedLocation() {
    const saved = localStorage.getItem('user_location');
    if (saved && this.locations.some(l => l.name === saved)) {
      this.selectedLocation = saved;
    } else {
      this.selectedLocation = this.locations[0]?.name || 'Select Location';
    }
    this.updateDistance();
  }

  updateDistance() {
    this.locationDistance = +(Math.random() * 5 + 1).toFixed(1);
  }

  toggleLocationDropdown(event: Event) {
    event.stopPropagation();
    this.showLocationDropdown = !this.showLocationDropdown;
  }

  selectLocation(locationName: string, event: Event) {
    event.stopPropagation();
    this.selectedLocation = locationName;
    localStorage.setItem('user_location', this.selectedLocation);
    this.updateDistance();
    this.showLocationDropdown = false;
  }

  addLocation() {
    const locName = prompt('Enter new address name');
    if (locName && locName.trim()) {
      let type: 'home' | 'work' | 'other' = 'other';
      const typeChoice = prompt('Type: home, work, or other?');
      if (typeChoice === 'home') type = 'home';
      else if (typeChoice === 'work') type = 'work';
      this.locations.push({ name: locName.trim(), type });
      this.saveLocationsToLocal();
      this.selectedLocation = locName.trim();
      localStorage.setItem('user_location', this.selectedLocation);
      this.updateDistance();
    }
  }

  editLocation(index: number, event: Event) {
    event.stopPropagation();
    const loc = this.locations[index];
    const newName = prompt('Edit address name', loc.name);
    if (newName && newName.trim()) {
      let newType = loc.type;
      const newTypeChoice = prompt('Type: home, work, or other?', loc.type);
      if (newTypeChoice === 'home') newType = 'home';
      else if (newTypeChoice === 'work') newType = 'work';
      else if (newTypeChoice === 'other') newType = 'other';
      this.locations[index] = { name: newName.trim(), type: newType };
      this.saveLocationsToLocal();
      if (this.selectedLocation === loc.name) {
        this.selectedLocation = newName.trim();
        localStorage.setItem('user_location', this.selectedLocation);
        this.updateDistance();
      }
    }
  }

  deleteLocation(index: number, event: Event) {
    event.stopPropagation();
    const removed = this.locations[index];
    this.locations.splice(index, 1);
    this.saveLocationsToLocal();
    if (this.selectedLocation === removed.name) {
      this.selectedLocation = this.locations[0]?.name || 'Select Location';
      localStorage.setItem('user_location', this.selectedLocation);
      this.updateDistance();
    }
  }

  // ================= API =================
  loadRestaurants(showLoader: boolean = true) {
    if (showLoader) {
      this.loading = true;
      this.resetPagination();
    }
    this.httpService.getAllRestaurants().subscribe({
      next: (data: any[]) => {
        const updated = (data || []).map(r => {
          let cleanAddress = 'City Center';
          if (r.address && typeof r.address === 'string') {
            const trimmed = r.address.trim();
            if (trimmed !== '' && trimmed.toLowerCase() !== 'null' && trimmed.toLowerCase() !== 'undefined') {
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
            rawImageUrl: r.imageUrl
          };
        });
        if (JSON.stringify(updated) !== JSON.stringify(this.restaurants)) {
          this.restaurants = updated;
          this.applyLiveFilters();
          this.resetPagination();
        }
        this.loading = false;
        this.loadMoreRestaurants();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load restaurants';
        this.loading = false;
        if (err.status === 401 || err.status === 403) this.authService.logout();
      }
    });
  }

  // ================= FILTERS =================
  onSearch() { this.applyLiveFilters(); }
  toggleFilter(event: Event) { event.stopPropagation(); this.showFilter = !this.showFilter; }

  toggleCuisineFilter(cuisine: string, event: any) {
    if (event.target.checked) {
      this.selectedCuisines.push(cuisine);
    } else {
      this.selectedCuisines = this.selectedCuisines.filter(c => c !== cuisine);
    }
    this.applyLiveFilters();
  }

  applyFilters() { this.applyLiveFilters(); this.showFilter = false; }

  applyLiveFilters() {
    let data = [...this.restaurants];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase().trim();
      data = data.filter(r => r.name.toLowerCase().includes(term) || r.cuisine.toLowerCase().includes(term));
    }
    data = data.filter(r =>
      (!this.filters.highRating || r.rating >= 4) &&
      (!this.filters.lowPrice || r.price <= 300)
    );
    if (this.selectedCuisines.length) {
      data = data.filter(r => this.selectedCuisines.includes(r.cuisine));
    }
    if (this.filters.vegOnly) {
      data = data.filter(r => Math.random() > 0.4); // simulated
    }
    this.filteredRestaurants = data;
    this.resetPagination();
  }

  resetFilters() {
    this.filters = { highRating: false, lowPrice: false, vegOnly: false };
    this.selectedCuisines = [];
    this.applyLiveFilters();
    this.showFilter = false;
  }

  // ================= INFINITE SCROLL =================
  resetPagination() {
    this.currentPage = 1;
    this.displayedRestaurants = [];
    this.hasMoreRestaurants = true;
  }

  loadMoreRestaurants() {
    if (this.loadingMore || !this.hasMoreRestaurants) return;
    this.loadingMore = true;
    setTimeout(() => {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      const newItems = this.filteredRestaurants.slice(start, end);
      if (newItems.length) {
        this.displayedRestaurants = [...this.displayedRestaurants, ...newItems];
        this.currentPage++;
      }
      this.hasMoreRestaurants = end < this.filteredRestaurants.length;
      this.loadingMore = false;
      this.cdr.detectChanges();
    }, 300);
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if (this.loading || this.loadingMore || !this.hasMoreRestaurants) return;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    if (scrollTop + windowHeight >= docHeight - 200) {
      this.loadMoreRestaurants();
    }
  }

  // ================= REAL-TIME BADGES & DELIVERY =================
  isTrending(restaurant: any): boolean {
    return restaurant.rating >= 4.5;
  }

  getOpenStatus(restaurant: any): { isOpen: boolean; closingSoon: boolean } {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentMinutes = hours * 60 + minutes;
    const openTime = 9 * 60;
    const closeTime = 22 * 60;
    const isOpen = currentMinutes >= openTime && currentMinutes < closeTime;
    const closingSoon = isOpen && (closeTime - currentMinutes) <= 60;
    return { isOpen, closingSoon };
  }

  getDeliveryTime(restaurant: any): number {
    const baseTime = 20;
    const distanceFactor = Math.floor(this.locationDistance * 3);
    const randomPrep = restaurant.id % 10;
    return baseTime + distanceFactor + randomPrep;
  }

  // ================= NAVIGATION =================
  viewMenu(id: number) { this.router.navigate(['/menu', id]); }
  goToProfile() { this.router.navigate(['/profile']); }
  goToCreateRestaurant() {
    if (this.isRestaurantOwner()) this.router.navigate(['/create-restaurant']);
    else this.errorMessage = 'Only restaurant owners can add restaurants';
  }
  isRestaurantOwner(): boolean {
    const user = this.authService.getCurrentUser();
    if (user && user.role) {
      this.userRole = user.role;
      return user.role === 'RESTAURANT';
    }
    return false;
  }

  // ================= SLIDER =================
  startSlider() {
    this.stopSlider();
    this.slideInterval = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
      this.cdr.detectChanges();
    }, 4000);
  }
  stopSlider() { if (this.slideInterval) clearInterval(this.slideInterval); }
  pauseSlider() { this.stopSlider(); }
  resumeSlider() { this.startSlider(); }
  nextSlide() { this.currentSlide = (this.currentSlide + 1) % this.slides.length; }
  prevSlide() { this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length; }
  goToSlide(index: number) { this.currentSlide = index; }

  // ================= CART =================
  toggleCart() { this.showCart = !this.showCart; }
  getTotal() { return this.cart.reduce((sum, item) => sum + item.price * item.qty, 0); }

  // ================= CLICK OUTSIDE =================
  @HostListener('document:click')
  closeDropdown() {
    this.showLocationDropdown = false;
    this.showFilter = false;
  }

  closeFilter() { this.showFilter = false; }

  trackByIndex(index: number) { return index; }
}