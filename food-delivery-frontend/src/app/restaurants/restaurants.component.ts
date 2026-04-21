import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  AfterViewInit
} from '@angular/core';

import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.css']
})
export class RestaurantsComponent implements OnInit, AfterViewInit, OnDestroy {

  // ================= DATA =================
  restaurants: any[] = [];
  filteredRestaurants: any[] = [];

  loading = true;
  errorMessage = '';
  searchTerm = '';

  // ================= LOCATION =================
  showLocationDropdown = false;
  locations: string[] = [];
  selectedLocation = '';

  // ================= SLIDER =================
  slides = [
    {
      type: 'image',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80',
      title: 'Delicious Food',
      subtitle: 'Taste beyond imagination'
    },
    {
      type: 'image',
      image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2',
      title: 'Live Cooking',
      subtitle: 'Watch chefs in action'
    },
    {
      type: 'image',
      image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1400&q=80',
      title: 'Top Chefs',
      subtitle: 'Curated by experts'
    }
  ];

  currentSlide = 0;
  sliderInterval: any;
  progressInterval: any;
  progress = 0;

  loadedImages: boolean[] = [];

  // ================= TOUCH (🔥 FIX ADDED) =================
  private touchStartX = 0;
  private touchEndX = 0;

  // ================= CART =================
  cart: any[] = [];
  showCart = false;
  showPopup = false;
  lastAddedItem: any = null;

  constructor(
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.loadLocations();
    this.loadSavedLocation();
    this.loadRestaurants();
    this.preloadImages();
  }

  ngAfterViewInit(): void {
    this.startSlider();
  }

  ngOnDestroy(): void {
    clearInterval(this.sliderInterval);
    clearInterval(this.progressInterval);
  }

  // ================= SLIDER =================
  startSlider(): void {
    this.startProgress();

    this.sliderInterval = setInterval(() => {
      this.nextSlide();
    }, 4000);
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.resetProgress();
  }

  prevSlide(): void {
    this.currentSlide =
      (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.resetProgress();
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.resetProgress();
  }

  pauseSlider(): void {
    clearInterval(this.sliderInterval);
    clearInterval(this.progressInterval);
  }

  resumeSlider(): void {
    this.startSlider();
  }

  // ================= PROGRESS =================
  startProgress(): void {
    this.progress = 0;

    this.progressInterval = setInterval(() => {
      this.progress += 2.5;
      if (this.progress >= 100) this.progress = 0;
    }, 100);
  }

  resetProgress(): void {
    clearInterval(this.progressInterval);
    this.startProgress();
  }

  // ================= TOUCH FUNCTIONS (🔥 FIX) =================
  onTouchStart(event: any): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: any): void {
    this.touchEndX = event.changedTouches[0].screenX;

    const diff = this.touchStartX - this.touchEndX;

    if (diff > 50) {
      this.nextSlide();
    } else if (diff < -50) {
      this.prevSlide();
    }
  }

  // ================= IMAGE PRELOAD =================
  preloadImages(): void {
    this.slides.forEach((slide, i) => {
      if (slide.type === 'image') {
        const img = new Image();
        img.src = slide.image;
        img.onload = () => this.loadedImages[i] = true;
      }
    });
  }

  onImageLoad(index: number): void {
    this.loadedImages[index] = true;
  }

  onImageError(event: any): void {
    event.target.src =
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400';
  }

  // ================= RESTAURANTS =================
  loadRestaurants(): void {
    this.loading = true;

    this.httpService.getAllRestaurants().subscribe({
      next: (data: any) => {
        this.restaurants = data || [];
        this.filteredRestaurants = [...this.restaurants];
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
    const term = this.searchTerm.toLowerCase();

    this.filteredRestaurants = this.restaurants.filter(r =>
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

  selectLocation(loc: string, event: Event): void {
  event.stopPropagation();
  this.selectedLocation = loc;
  localStorage.setItem('user_location', loc);
  this.showLocationDropdown = false;
  }

  addLocation(): void {
    const loc = prompt('Enter address');
    if (loc && loc.trim()) {
      this.locations.unshift(loc.trim());
      this.saveLocations();
    }
  }

  editLocation(index: number, event: Event): void {
    event.stopPropagation();
    const updated = prompt('Edit address', this.locations[index]);
    if (updated && updated.trim()) {
      this.locations[index] = updated.trim();
      this.saveLocations();
    }
  }

  deleteLocation(index: number, event: Event): void {
    event.stopPropagation();
    this.locations.splice(index, 1);
    this.saveLocations();
  }

  saveLocations(): void {
    localStorage.setItem('user_locations', JSON.stringify(this.locations));
  }

  loadLocations(): void {
    const saved = localStorage.getItem('user_locations');
    this.locations = saved ? JSON.parse(saved) : ['Select Location'];
  }

  loadSavedLocation(): void {
    const saved = localStorage.getItem('user_location');
    this.selectedLocation = saved || this.locations[0];
  }

  // ================= CART =================
  addToCart(item: any): void {
    const existing = this.cart.find(i => i.name === item.name);

    if (existing) {
      existing.qty++;
    } else {
      this.cart.push({
        name: item.name,
        price: item.price || 200,
        qty: 1
      });
    }

    this.lastAddedItem = item;
    this.showPopup = true;

    setTimeout(() => this.showPopup = false, 2000);
  }

  toggleCart(): void {
    this.showCart = !this.showCart;
  }

  getTotal(): number {
    return this.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  // ================= CLICK OUTSIDE =================
  @HostListener('document:click')
  closeDropdown(): void {
    this.showLocationDropdown = false;
  }

}