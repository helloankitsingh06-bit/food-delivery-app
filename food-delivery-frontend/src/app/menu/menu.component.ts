import { Component, OnInit } from '@angular/core';
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
  cart: any[] = [];
  loading = true;
  errorMessage = '';
  showCart = false;
  isRestaurantOwner = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private httpService: HttpService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.restaurantId = +this.route.snapshot.paramMap.get('id')!;
    this.loadMenu();
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
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load menu. Please try again.';
        this.loading = false;
      }
    });
  }

  loadCart(): void {
    const savedCart = localStorage.getItem(`cart_${this.restaurantId}`);
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
    }
  }

  saveCart(): void {
    localStorage.setItem(`cart_${this.restaurantId}`, JSON.stringify(this.cart));
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

  getCartTotal(): number {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  placeOrder(): void {
    if (this.cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
     localStorage.setItem('checkout_cart', JSON.stringify(this.cart));
     localStorage.setItem('checkout_total', JSON.stringify(this.getCartTotal()));

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
      const newItem = {
        name,
        price: parseFloat(price)
      };

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
