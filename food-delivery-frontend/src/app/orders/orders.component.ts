import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../services/http.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit, OnDestroy {

  // Core Data
  orders: any[] = [];
  filteredOrders: any[] = [];
  menuItems: any[] = [];
  notifications: any[] = [];
  savedAddresses: any[] = [];

  // Loading / Error
  loading = true;
  errorMessage = '';

  // Filters
  searchTerm = '';
  statusFilter = 'ALL';
  dateFilter = 'ALL';
  activeTab = 'new';

  // User Info
  userRole = '';
  userName = '';
  userEmail = '';
  restaurantName = '';
  displayName = '';
  userAvatar = '';

  // Stats
  totalOrders = 0;
  activeOrders = 0;
  pendingOrders = 0;
  todayRevenue = 0;
  completedDeliveries = 0;
  todayEarnings = 0;
  deliveryRating = '';
  completedOrdersCount = 0;
  notificationCount = 0;

  // Delivery
  isOnline = false;

  // UI State
  showNotifications = false;
  showProfileMenu = false;
  showSidebar = false;
  showRatingModal = false;
  showHelpModal = false;

  // Modals
  selectedOrder: any = null;
  ratingOrder: any = null;
  ratingValue = 0;
  hoverRating = 0;
  ratingFeedback = '';
  issueType = '';
  issueDescription = '';
  helpOrderId: any = null;

  // Edit State
  editItem: any = null;
  editName = '';
  editPrice = 0;

  // Internal
  activeSection = 'orders';
  restaurantId = 0;
  private destroy$ = new Subject<void>();

  readonly orderStatuses = [
    'PLACED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
  ];

  readonly issueTypes = [
    { value: 'WRONG_ORDER',    label: 'Wrong Order',    icon: 'fa-exchange-alt' },
    { value: 'MISSING_ITEMS',  label: 'Missing Items',  icon: 'fa-box-open' },
    { value: 'QUALITY',        label: 'Quality Issue',  icon: 'fa-thumbs-down' },
    { value: 'DELIVERY',       label: 'Delivery Issue', icon: 'fa-motorcycle' },
    { value: 'OTHER',          label: 'Other',          icon: 'fa-ellipsis-h' },
  ];

  private readonly statusOrder = ['PLACED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'];

  constructor(
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user || user.role !== 'RESTAURANT') {
      this.router.navigate(['/restaurants']);
      return;
    }
    this.loadDisplayName();
    this.initUser();
    this.loadMyRestaurant();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onContainerClick(event: Event): void {
    this.showNotifications = false;
    this.showProfileMenu = false;
  }

  loadDisplayName(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    if (user.role === 'RESTAURANT') {
      this.httpService.getRestaurantByOwnerId(user.id).subscribe({
        next: (restaurant: any) => {
          this.displayName = restaurant?.name || user.username || user.name || 'Restaurant';
        },
        error: () => {
          this.displayName = user.username || user.name || 'Restaurant';
        }
      });
    } else {
      this.displayName = user.name || user.username || 'User';
    }
  }

  initUser(): void {
    const user = this.authService.getCurrentUser();
    this.userRole = this.authService.getUserRole() || '';

    if (user) {
      this.userRole = user.role || this.userRole;
      this.userName = user.name || 'User';
      this.userEmail = user.email || '';
      this.userAvatar = user.avatar || '';

      if (user.role === 'RESTAURANT') {
        this.httpService.getMyRestaurant(user.id).subscribe({
          next: (restaurant: any) => {
            this.restaurantName = restaurant?.name || user.name || '';
          },
          error: () => {
            this.restaurantName = user.name || '';
          }
        });
      } else {
        this.restaurantName = user.name || '';
      }
    }
  }

  loadMyRestaurant(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.loadOrders();
      return;
    }

    if (user.role === 'RESTAURANT') {
      this.httpService.getMyRestaurant(user.id).subscribe({
        next: (res: any) => {
          this.restaurantId = res?.id || 0;
          this.loadMenu();
          this.loadOrders();
        },
        error: () => {
          this.loadOrders();
        }
      });
    } else {
      this.loadOrders();
    }
  }

  loadOrders(): void {
    this.loading = true;
    this.errorMessage = '';

    if (this.userRole === 'RESTAURANT') {
      if (!this.restaurantId) {
        console.warn('Restaurant ID not available yet');
        this.loading = false;
        return;
      }
      this.httpService.getRestaurantOrdersByRestaurantId(this.restaurantId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data: any[]) => {
            this.orders = data || [];
            this.computeStats();
            this.filterOrders();
            this.loading = false;
          },
          error: (err) => {
            console.error('Restaurant orders error:', err);
            this.errorMessage = 'Failed to load orders. Please try again.';
            this.loading = false;
          }
        });
    } else {
      this.httpService.getCustomerOrders()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data: any[]) => {
            this.orders = data || [];
            this.computeStats();
            this.filterOrders();
            this.loading = false;
          },
          error: (err) => {
            console.error('Customer orders error:', err);
            this.errorMessage = 'Failed to load orders. Please try again.';
            this.loading = false;
          }
        });
    }
  }

  computeStats(): void {
    const today = new Date().toDateString();

    this.totalOrders = this.orders.length;

    this.activeOrders = this.orders.filter(o =>
      ['PLACED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(o.status)
    ).length;

    this.pendingOrders = this.orders.filter(o =>
      ['PLACED', 'PREPARING'].includes(o.status)
    ).length;

    this.completedOrdersCount = this.orders.filter(o =>
      o.status === 'DELIVERED' && new Date(o.orderDate).toDateString() === today
    ).length;

    this.completedDeliveries = this.completedOrdersCount;

    this.todayRevenue = this.orders
      .filter(o => o.status === 'DELIVERED' && new Date(o.orderDate).toDateString() === today)
      .reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0);

    this.todayEarnings = Math.round(this.todayRevenue * 0.1);
  }

  filterOrders(): void {
    let data = [...this.orders];

    if (this.activeTab === 'new') {
      data = data.filter(o => o.status === 'PLACED');
    } else if (this.activeTab === 'preparing') {
      data = data.filter(o => o.status === 'PREPARING');
    } else if (this.activeTab === 'ready') {
      data = data.filter(o => o.status === 'READY');
    } else if (this.activeTab === 'picked') {
      data = data.filter(o => o.status === 'OUT_FOR_DELIVERY');
    } else if (this.activeTab === 'past') {
      data = data.filter(o => o.status === 'DELIVERED');
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      data = data.filter(o =>
        o.id?.toString().includes(term) ||
        o.restaurantName?.toLowerCase().includes(term) ||
        (o.items && o.items.join(' ').toLowerCase().includes(term))
      );
    }

    if (this.statusFilter !== 'ALL') {
      data = data.filter(o => o.status === this.statusFilter);
    }

    if (this.dateFilter !== 'ALL') {
      const now = new Date();
      data = data.filter(o => {
        const d = new Date(o.orderDate);
        if (this.dateFilter === 'TODAY') {
          return d.toDateString() === now.toDateString();
        } else if (this.dateFilter === 'WEEK') {
          const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
          return d >= weekAgo;
        } else if (this.dateFilter === 'MONTH') {
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }
        return true;
      });
    }

    this.filteredOrders = data;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'ALL';
    this.dateFilter = 'ALL';
    this.filterOrders();
  }

  // Tab badge counts
  get placedOrdersCount(): number {
    return this.orders.filter(o => o.status === 'PLACED').length;
  }

  get preparingOrdersCount(): number {
    return this.orders.filter(o => o.status === 'PREPARING').length;
  }

  get readyOrdersCount(): number {
    return this.orders.filter(o => o.status === 'READY').length;
  }

  get pickedOrdersCount(): number {
    return this.orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length;
  }

  get activeOrdersCount(): number {
    return this.orders.filter(o =>
      ['PLACED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(o.status)
    ).length;
  }

  get pastOrdersCount(): number {
    return this.orders.filter(o => o.status === 'DELIVERED').length;
  }

  get cancelledOrdersCount(): number {
    return this.orders.filter(o => o.status === 'CANCELLED').length;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.filterOrders();
  }

  isActiveStatus(status: string): boolean {
    return ['PLACED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(status);
  }

  isStepDone(currentStatus: string, step: string): boolean {
    if (!currentStatus) return false;
    const currentIdx = this.statusOrder.indexOf(currentStatus);
    const stepIdx = this.statusOrder.indexOf(step);
    return currentIdx >= stepIdx && stepIdx !== -1;
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      'PLACED':           '#c9a227',
      'PREPARING':        '#e67e22',
      'READY':            '#27ae60',
      'OUT_FOR_DELIVERY': '#2980b9',
      'DELIVERED':        '#8e44ad',
      'CANCELLED':        '#c0392b'
    };
    return map[status] || '#888';
  }

  formatStatus(status: string): string {
    const map: Record<string, string> = {
      'PLACED':           'Placed',
      'PREPARING':        'Preparing',
      'READY':            'Ready',
      'OUT_FOR_DELIVERY': 'On the Way',
      'DELIVERED':        'Delivered',
      'CANCELLED':        'Cancelled'
    };
    return map[status] || status;
  }

  canCancelOrder(status: string): boolean {
    return ['PLACED', 'PREPARING'].includes(status);
  }

  // Navigation
  goToProfile(): void { this.router.navigate(['/profile']); }
  goToOrders(): void  { this.router.navigate(['/orders']); }
  goToMenu(): void    { this.router.navigate(['/menu']); }
  goToSettings(): void { this.router.navigate(['/settings']); }

  goToManageMenu(): void {
    this.router.navigate(['/manage-menu', this.restaurantId || 1]);
  }

  navigateToRestaurants(): void {
    this.router.navigate(['/restaurants']);
  }

  viewAnalytics(): void {
    this.router.navigate(['/analytics']);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  // UI Toggles
  toggleSidebar(): void    { this.showSidebar = !this.showSidebar; }
  toggleNotifications(): void { this.showNotifications = !this.showNotifications; this.showProfileMenu = false; }
  toggleProfileMenu(): void   { this.showProfileMenu = !this.showProfileMenu; this.showNotifications = false; }
  toggleOnlineStatus(): void  { this.isOnline = !this.isOnline; }
  setSection(section: string): void { this.activeSection = section; }

  // Tracking
  trackOrder(id: any): void {
    this.selectedOrder = this.orders.find(o => o.id === id) || null;
  }

  closeTracking(): void { this.selectedOrder = null; }

  getEstimatedDeliveryTime(): string {
    if (!this.selectedOrder) return '—';
    return this.selectedOrder.estimatedDeliveryTime || '30–45 mins';
  }

  trackLiveLocation(orderId: any): void {
    console.log('Track live location for order:', orderId);
  }

  // Rating
  rateOrder(order: any): void {
    this.ratingOrder = order;
    this.ratingValue = 0;
    this.hoverRating = 0;
    this.ratingFeedback = '';
    this.showRatingModal = true;
  }

  closeRatingModal(): void {
    this.showRatingModal = false;
    this.ratingOrder = null;
    this.ratingValue = 0;
    this.hoverRating = 0;
  }

  getRatingLabel(): string {
    const val = this.hoverRating || this.ratingValue;
    const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];
    return labels[val] || 'Tap to rate';
  }

  submitRating(): void {
    if (this.ratingValue === 0) return;
    const payload = {
      orderId: this.ratingOrder?.id,
      rating: this.ratingValue,
      feedback: this.ratingFeedback
    };
    console.log('Rating submitted:', payload);
    this.closeRatingModal();
  }

  // Help / Issue
  reportIssue(orderId: any): void {
    this.helpOrderId = orderId;
    this.issueType = '';
    this.issueDescription = '';
    this.showHelpModal = true;
  }

  closeHelpModal(): void {
    this.showHelpModal = false;
    this.helpOrderId = null;
  }

  submitIssue(): void {
    if (!this.issueType) return;
    const payload = {
      orderId: this.helpOrderId,
      type: this.issueType,
      description: this.issueDescription
    };
    console.log('Issue submitted:', payload);
    this.closeHelpModal();
  }

  // Order Actions
  cancelOrder(orderId: any): void {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    this.httpService.cancelOrder(orderId).subscribe({
      next: () => {
        const order = this.orders.find(o => o.id === orderId);
        if (order) order.status = 'CANCELLED';
        this.computeStats();
        this.filterOrders();
      },
      error: () => alert('Could not cancel order. Please try again.')
    });
  }

  reorderItems(orderId: any): void {
    this.router.navigate(['/restaurants'], { queryParams: { reorder: orderId } });
  }

  downloadReceipt(orderId: any): void {
    console.log('Download receipt for order:', orderId);
  }

  viewOrderDetails(orderId: any): void {
    this.trackOrder(orderId);
  }

  printOrderTicket(orderId: any): void {
    window.print();
  }

  setPreparationTime(orderId: any): void {
    const time = prompt('Enter preparation time (e.g. 20 mins):');
    if (time) {
      const order = this.orders.find(o => o.id === orderId);
      if (order) order.estimatedDeliveryTime = time;
    }
  }

  // ✅ FIXED: Only map 'ON_WAY' to 'OUT_FOR_DELIVERY'; 'READY' stays 'READY'
  updateOrderStatus(orderId: any, status: string): void {
    let backendStatus = status;
    if (status === 'ON_WAY') {
      backendStatus = 'OUT_FOR_DELIVERY';   // Correct spelling
    }
    // Do NOT map 'READY' to anything – keep as 'READY'

    this.httpService.updateOrderStatus(orderId, backendStatus).subscribe({
      next: () => this.loadOrders(),
      error: () => this.loadOrders()
    });
  }

  updateDeliveryStatus(orderId: any, status: string): void {
    this.updateOrderStatus(orderId, status);
  }

  contactCustomer(customerId: any): void {
    console.log('Contact customer:', customerId);
  }

  contactDeliveryPartner(partnerId: any): void {
    console.log('Contact delivery partner:', partnerId);
  }

  callCustomer(phone: string): void {
    if (phone) window.location.href = `tel:${phone}`;
  }

  navigateToAddress(address: string): void {
    if (address) window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank');
  }

  reportDeliveryIssue(orderId: any): void {
    this.reportIssue(orderId);
  }

  openSupportChat(): void {
    console.log('Open support chat');
  }

  viewRouteMap(): void {
    this.router.navigate(['/route-map']);
  }

  toggleFavorite(restaurantId: any): void {
    const orders = this.orders.filter(o => o.restaurantId === restaurantId);
    const isFav = orders[0]?.isFavorite;
    orders.forEach(o => o.isFavorite = !isFav);
  }

  markAllRead(): void {
    this.notificationCount = 0;
    this.notifications = [];
    this.showNotifications = false;
  }

  // Menu
  loadMenu(): void {
    if (!this.restaurantId) return;
    this.httpService.getMenuByRestaurant(this.restaurantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any[]) => { this.menuItems = data || []; },
        error: () => console.warn('Menu load failed')
      });
  }

  startEdit(item: any): void {
    this.editItem = item;
    this.editName = item.name;
    this.editPrice = item.price;
  }

  saveEdit(): void {
    if (!this.editItem) return;
    this.httpService.updateMenuItem(this.editItem.id, { name: this.editName, price: this.editPrice }).subscribe({
      next: () => { this.editItem = null; this.loadMenu(); },
      error: () => alert('Update failed')
    });
  }

  deleteMenu(id: number): void {
    if (!confirm('Delete this menu item?')) return;
    this.httpService.deleteMenuItem(id).subscribe({
      next: () => this.loadMenu(),
      error: () => alert('Delete failed')
    });
  }

  addTestItem(): void {
    const item = { name: 'Burger', price: 150 };
    this.httpService.addMenuItem(this.restaurantId, item)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadMenu(),
        error: (err: any) => { console.error(err); alert('Failed to add menu item'); }
      });
  }
}