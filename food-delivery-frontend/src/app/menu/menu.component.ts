import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../services/http.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  restaurantId!: number;
  restaurantName = '';
  menuItems: any[] = [];
  filteredMenuItems: any[] = [];
  recommendedItems: any[] = [];
  cart: any[] = [];
  loading = true;
  errorMessage = '';
  showCart = false;
  isRestaurantOwner = false;

  // Search & sort
  searchText = '';
  sortOption = 'default';

  // Coupon & delivery
  couponCode = '';
  discountAmount = 0;
  deliveryFee = 40;
  freeDeliveryThreshold = 300;

  @ViewChild('cartBtn') cartBtnRef!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private httpService: HttpService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.restaurantId = +this.route.snapshot.paramMap.get('id')!;
    this.loadMenu();
    window.scrollTo(0, 0);
    this.loadCart();
    this.checkUserRole();
  }

  checkUserRole(): void {
    const userRole = this.authService.getUserRole();
    this.isRestaurantOwner = userRole === 'RESTAURANT';
  }

  loadMenu(): void {
    this.loading = true;
    this.httpService.getRestaurantMenu(this.restaurantId).subscribe({
      next: (data) => {
        this.menuItems = data;
        if (data.length > 0 && data[0].restaurantName) {
          this.restaurantName = data[0].restaurantName;
        }
        this.filterAndSortItems();
        this.pickRecommendedItems();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load menu. Please try again.';
        this.loading = false;
      }
    });
  }

  filterAndSortItems(): void {
    let filtered = [...this.menuItems];
    if (this.searchText.trim()) {
      const term = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term))
      );
    }
    switch (this.sortOption) {
      case 'priceLowHigh':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'priceHighLow':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'nameAZ':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    this.filteredMenuItems = filtered;
  }

  onSearchOrSortChange(): void {
    this.filterAndSortItems();
  }

  pickRecommendedItems(): void {
    if (this.menuItems.length <= 3) {
      this.recommendedItems = [...this.menuItems];
    } else {
      const shuffled = [...this.menuItems];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      this.recommendedItems = shuffled.slice(0, 3);
    }
  }

  loadCart(): void {
    const savedCart = localStorage.getItem(`cart_${this.restaurantId}`);
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
    }
    this.discountAmount = 0;
    this.couponCode = '';
  }

  saveCart(): void {
    localStorage.setItem(`cart_${this.restaurantId}`, JSON.stringify(this.cart));
  }

  // Flying animation + add to cart
  animateAddToCart(event: any, item: any): void {
    const button = event.target;
    const rect = button.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    const cartBtn = this.cartBtnRef?.nativeElement;
    if (cartBtn) {
      const cartRect = cartBtn.getBoundingClientRect();
      const endX = cartRect.left + cartRect.width / 2;
      const endY = cartRect.top + cartRect.height / 2;

      const flyer = document.createElement('div');
      flyer.className = 'flying-item';
      flyer.innerHTML = '🍕';
      flyer.style.left = startX - 25 + 'px';
      flyer.style.top = startY - 25 + 'px';
      document.body.appendChild(flyer);

      requestAnimationFrame(() => {
        flyer.style.transform = `translate(${endX - startX}px, ${endY - startY}px) scale(0.3)`;
        flyer.style.opacity = '0';
      });

      setTimeout(() => flyer.remove(), 600);

      cartBtn.style.transform = 'scale(1.2)';
      setTimeout(() => { if (cartBtn) cartBtn.style.transform = ''; }, 200);
    }

    this.addToCart(item);
  }

  addToCart(item: any): void {
    const existingItem = this.cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cart.push({ ...item, quantity: 1 });
    }
    this.saveCart();
  }

  removeFromCart(item: any): void {
    const index = this.cart.findIndex(cartItem => cartItem.id === item.id);
    if (index > -1) {
      if (this.cart[index].quantity > 1) {
        this.cart[index].quantity--;
      } else {
        this.cart.splice(index, 1);
      }
      this.saveCart();
    }
  }

  removeItemCompletely(item: any): void {
    const index = this.cart.findIndex(cartItem => cartItem.id === item.id);
    if (index > -1) {
      this.cart.splice(index, 1);
      this.saveCart();
    }
  }

  getCartTotal(): number {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getCartItemCount(): number {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }

  applyCoupon(): void {
    if (this.couponCode === 'PREMIUM10') {
      this.discountAmount = Math.floor(this.getCartTotal() * 0.1);
      alert('Coupon applied! 10% off');
    } else if (this.couponCode === 'FREESHIP') {
      this.deliveryFee = 0;
      alert('Free shipping applied!');
    } else {
      alert('Invalid coupon');
      this.discountAmount = 0;
    }
  }

  getFinalTotal(): number {
    let total = this.getCartTotal() - this.discountAmount;
    if (total < this.freeDeliveryThreshold) {
      total += this.deliveryFee;
    }
    return total > 0 ? total : 0;
  }

  placeOrder(): void {
    if (this.cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    localStorage.setItem('checkout_cart', JSON.stringify(this.cart));
    localStorage.setItem('checkout_total', JSON.stringify(this.getCartTotal()));
    localStorage.setItem('checkout_restaurant_id', this.restaurantId.toString()); // ✅ ADDED THIS LINE
    this.router.navigate(['/payment']);
  }

  toggleCart(): void {
    this.showCart = !this.showCart;
  }

  continueShopping(): void {
    this.showCart = false;
  }

  goBack(): void {
    this.router.navigate(['/restaurants']);
  }

  addMenuItem(): void {
    const name = prompt('Enter item name:');
    const price = prompt('Enter item price:');
    if (name && price) {
      const newItem = { name, price: parseFloat(price) };
      this.httpService.addMenuItem(this.restaurantId, newItem).subscribe({
        next: () => {
          alert('Menu item added successfully!');
          this.loadMenu();
        },
        error: () => alert('Failed to add menu item')
      });
    }
  }
}