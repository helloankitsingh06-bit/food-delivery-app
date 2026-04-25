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
  // NEW: locations as objects with type
  locations: { name: string; type: 'home' | 'work' | 'other' }[] = [];
  selectedLocation = '';

  showFilter = false;
  activeFilter: 'rating' | 'budget' = 'rating';

  filters = {
    highRating: false,
    lowPrice: false
  };

  userRole: string = '';

  // ================= SLIDER =================
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

  // AUTO REFRESH
  refreshInterval: any;

  // CART
  cart: any[] = [];
  showCart = false;

  constructor(
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadLocationsFromLocal();    // load saved locations
    this.loadSavedLocation();
    this.loadRestaurants();
    this.startSlider();

    this.refreshInterval = setInterval(() => {
      this.loadRestaurants(false);
    }, 5000);
  }

  ngOnDestroy(): void {
    this.stopSlider();
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  // ================= LOCATIONS PERSISTENCE =================
  loadLocationsFromLocal() {
    const stored = localStorage.getItem('user_locations');
    if (stored) {
      this.locations = JSON.parse(stored);
    } else {
      // default locations
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
  }

  // ================= LOCATION UI =================
  toggleLocationDropdown(event: Event) {
    event.stopPropagation();
    this.showLocationDropdown = !this.showLocationDropdown;
  }

  selectLocation(locationName: string, event: Event) {
    event.stopPropagation();
    this.selectedLocation = locationName;
    localStorage.setItem('user_location', this.selectedLocation);
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
    }
  }

  // ================= IMAGE HELPER =================
  getImageUrl(r: any): string {
    const path = r?.imageUrl || r?.image || r?.img || r?.photo || r?.logo;
    if (!path || typeof path !== 'string') {
      return 'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?w=800&q=80';
    }
    const cleanPath = path.replace(/\\/g, '/');
    if (cleanPath.startsWith('http')) return cleanPath;
    const baseUrl = 'http://localhost:8080';
    return `${baseUrl}/${cleanPath.replace(/^\/+/, '')}`;
  }

  // ================= API =================
  loadRestaurants(showLoader: boolean = true) {
    if (showLoader) this.loading = true;
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
            rawImageUrl: r.imageUrl   // keep original database value
          };
        });
        if (JSON.stringify(updated) !== JSON.stringify(this.restaurants)) {
          this.restaurants = updated;
          this.applyLiveFilters();
          this.cdr.detectChanges();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load restaurants';
        this.loading = false;
        if (err.status === 401 || err.status === 403) this.authService.logout();
      }
    });
  }

  // ================= FILTER & SEARCH =================
  onSearch() { this.applyLiveFilters(); }
  toggleFilter(event: Event) { event.stopPropagation(); this.showFilter = !this.showFilter; }
  applyFilters() { this.applyLiveFilters(); this.showFilter = false; }
  toggleQuickFilter(type: 'rating' | 'price') {
    if (type === 'rating') this.filters.highRating = !this.filters.highRating;
    else this.filters.lowPrice = !this.filters.lowPrice;
    this.applyLiveFilters();
  }
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
    this.filteredRestaurants = data;
  }
  
  // ✅ NEW RESET FILTERS METHOD
  resetFilters() {
    this.filters = { highRating: false, lowPrice: false };
    this.applyLiveFilters();
    this.showFilter = false;
  }

  sortRestaurants(event: any) {
    const value = event.target.value;
    const sorted = [...this.filteredRestaurants];
    if (value === 'low') sorted.sort((a, b) => a.price - b.price);
    else if (value === 'high') sorted.sort((a, b) => b.price - a.price);
    else if (value === 'rating') sorted.sort((a, b) => b.rating - a.rating);
    this.filteredRestaurants = sorted;
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

  // needed for filter panel
  closeFilter() { this.showFilter = false; }
}