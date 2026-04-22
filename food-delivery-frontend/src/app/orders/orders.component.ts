import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpService } from '../services/http.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit, OnDestroy {

  orders: any[] = [];
  filteredOrders: any[] = [];

  // ✅ MENU
  menuItems: any[] = [];

  loading = true;
  errorMessage = '';

  searchTerm = '';
  statusFilter = 'ALL';
  dateFilter = 'ALL';

  userRole = '';
  userName = '';
  userEmail = '';
  restaurantName = '';
  displayName = '';  // ✅ ADDED - This will show the correct name in header
  userAvatar = '';

  notificationCount = 0;

  ratingFeedback = '';
  issueType = '';
  issueDescription = '';

  showNotifications = false;
  showProfileMenu = false;
  showSidebar = false;

  showRatingModal = false;
  showHelpModal = false;

  selectedOrder: any = null;

  editItem: any = null;
  editName: string = '';
  editPrice: number = 0;

  activeSection: string = 'orders';

  restaurantId: number = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDisplayName();  // ✅ ADDED - Load display name first
    this.initUser();
    this.loadMyRestaurant();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ NEW METHOD - Load display name for header
  loadDisplayName(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.role === 'RESTAURANT') {
      this.httpService.getRestaurantByOwnerId(user.id).subscribe({
        next: (restaurant) => {
          this.displayName = restaurant.name;
        },
        error: () => {
          this.displayName = user.username || user.name;
        }
      });
    } else if (user) {
      this.displayName = user.name;
    }
  }

  // ===== LOAD USER INFO =====
  initUser(): void {
    const user = this.authService.getCurrentUser();
    this.userRole = this.authService.getUserRole();
    
    if (user) {
      this.userRole = user.role;
      this.userName = user.name || 'User';
      this.userEmail = user.email;
      this.userAvatar = user.avatar || '';
      
      // If user is restaurant owner, fetch their restaurant name
      if (user.role === 'RESTAURANT' && user.email) {
        this.httpService.getRestaurantByOwnerEmail(user.email).subscribe({
          next: (restaurant) => {
            if (restaurant && restaurant.name) {
              this.restaurantName = restaurant.name;
            } else {
              this.restaurantName = user.name;
            }
          },
          error: () => {
            // No restaurant found yet, show user name
            this.restaurantName = user.name;
          }
        });
      } else {
        this.restaurantName = user.name;
      }
    }
  }

  // ===== NAVIGATION =====
  goToOrders() {
    this.router.navigate(['/orders']);
  }

  goToMenu() {
    this.router.navigate(['/menu']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  // ✅ FIXED HERE
  goToManageMenu() {
    const restaurantId = 1; // 🔥 replace with actual logged-in restaurant ID
    this.router.navigate(['/manage-menu', restaurantId]);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  // ===== EDIT =====
  startEdit(item: any): void {
    this.editItem = item;
    this.editName = item.name;
    this.editPrice = item.price;
  }

  saveEdit(): void {
    const updated = {
      name: this.editName,
      price: this.editPrice
    };

    this.httpService.updateMenuItem(this.editItem.id, updated).subscribe({
      next: () => {
        alert('Updated!');
        this.editItem = null;
        this.loadMenu();
      },
      error: () => {
        alert('Update failed');
      }
    });
  }

  // ===== LOAD ORDERS =====
  loadOrders(): void {
    const role = this.userRole;

    const request =
      role === 'RESTAURANT'
        ? this.httpService.getRestaurantOrders()
        : this.httpService.getCustomerOrders();

    request
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.orders = data || [];
          this.filteredOrders = [...this.orders];
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Failed to load orders';
          this.loading = false;
        }
      });
  }

  // ===== LOAD MENU =====
  loadMenu(): void {
    this.httpService.getMenuByRestaurant(this.restaurantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.menuItems = data;
        },
        error: () => {
          alert('Failed to load menu');
        }
      });
  }

  // ===== DELETE MENU =====
  deleteMenu(id: number): void {
    this.httpService.deleteMenuItem(id).subscribe({
      next: () => {
        alert('Deleted!');
        this.loadMenu();
      },
      error: () => {
        alert('Delete failed');
      }
    });
  }

  // ===== FILTER =====
  filterOrders(): void {
    let data = [...this.orders];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      data = data.filter(o =>
        o.id?.toString().toLowerCase().includes(term) ||
        o.restaurantName?.toLowerCase().includes(term)
      );
    }

    if (this.statusFilter !== 'ALL') {
      data = data.filter(o => o.status === this.statusFilter);
    }

    this.filteredOrders = data;
  }

  // ===== UI =====
  toggleSidebar() { this.showSidebar = !this.showSidebar; }
  toggleNotifications() { this.showNotifications = !this.showNotifications; }
  toggleProfileMenu() { this.showProfileMenu = !this.showProfileMenu; }

  setSection(section: string): void {
    this.activeSection = section;
  }

  trackOrder(id: any) {
    this.selectedOrder = this.orders.find(o => o.id === id);
  }

  closeTracking() { this.selectedOrder = null; }
  closeRatingModal() { this.showRatingModal = false; }
  closeHelpModal() { this.showHelpModal = false; }

  submitRating() { alert('Rating submitted'); }
  submitIssue() { alert('Issue submitted'); }

  getEstimatedDeliveryTime(): string {
    return '30-45 mins';
  }

  // ===== ADD MENU =====
  addTestItem(): void {
    const item = {
      name: 'Burger',
      price: 150
    };

    this.httpService.addMenuItem(this.restaurantId, item)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          alert('Menu item added!');
          this.loadMenu();
        },
        error: (err) => {
          console.error(err);
          alert('Failed to add menu');
        }
      });
  }

  // ===== LOAD MY RESTAURANT =====
  loadMyRestaurant(): void {
    const user = this.authService.getCurrentUser();

    this.httpService.getMyRestaurant(user.id).subscribe({
      next: (res: any) => {
        this.restaurantId = res.id;
        this.loadMenu();
        this.loadOrders();
      },
      error: () => {
        alert('Failed to load restaurant');
      }
    });
  }
}