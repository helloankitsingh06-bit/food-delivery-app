import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpService } from '../services/http.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

// ============================================
// INTERFACES
// ============================================

interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage?: string;
  restaurantRating?: number;
  ratingCount?: number;
  items: string[];
  totalPrice: number;
  orderDate: Date;
  deliveryAddress?: string;
  status: string;
  orderType?: 'DELIVERY' | 'PICKUP';
  paymentMethod?: string;
  estimatedDeliveryTime?: string;
  isFavorite?: boolean;
  deliveryPartner?: DeliveryPartner;
  customerId?: string;
  customerPhone?: string;
}

interface DeliveryPartner {
  id: string;
  name: string;
  avatar: string;
  vehicle: string;
  phone?: string;
}

interface Notification {
  id: string;
  type: 'success' | 'update' | 'info' | 'warning';
  message: string;
  time: Date;
  read: boolean;
}

interface CustomerStats {
  totalOrders: number;
  activeOrders: number;
  savedAddresses: any[];
}

interface RestaurantStats {
  todayRevenue: number;
  pendingOrders: number;
}

interface DeliveryStats {
  completedToday: number;
  todayEarnings: number;
}

// ============================================
// ORDERS COMPONENT
// ============================================

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  loading = true;
  errorMessage = '';
  userRole = '';
  userName = '';
  userAvatar = '';
  orderStatuses = ['PLACED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
  selectedOrder: Order | null = null;
  searchTerm = '';
  statusFilter = 'ALL';
  dateFilter = 'ALL';
  activeTab = 'active';
  showNotifications = false;
  showProfileMenu = false;
  showSidebar = false;
  showRatingModal = false;
  showIssueModal = false;
  ratingValue = 0;
  hoverRating = 0;
  ratingFeedback = '';
  selectedOrderForRating: Order | null = null;
  issueType = '';
  issueDescription = '';
  selectedOrderForIssue: Order | null = null;
  notifications: Notification[] = [];
  notificationCount = 0;
  totalOrders = 0;
  activeOrders = 0;
  activeOrdersCount = 0;
  pastOrdersCount = 0;
  cancelledOrdersCount = 0;
  pendingOrders = 0;
  todayRevenue = 0;
  todayEarnings = 0;
  completedDeliveries = 0;
  savedAddresses: any[] = [];
  isOnline = true;
  private refreshInterval: any;
  private destroy$ = new Subject<void>();

  constructor(
    private httpService: HttpService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeUserData();
    this.loadOrders();
    this.loadNotifications();
    this.loadStats();
    this.refreshInterval = setInterval(() => {
      this.loadOrders();
      this.loadNotifications();
    }, 30000);
  }
 
  ngOnDestroy(): void {
    clearInterval(this.refreshInterval);
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeUserData(): void {
    const user = this.authService.getUser();
    this.userRole = this.authService.getUserRole();
    this.userName = user?.name || 'User';
    this.userAvatar = user?.avatar || 'assets/default-avatar.png';
  }

  loadOrders(): void {
    this.loading = true;
    this.errorMessage = '';
    const requestMap: any = {
      'CUSTOMER': () => this.httpService.getCustomerOrders(),
      'RESTAURANT': () => {
        const user = this.authService.getUser();
        return this.httpService.getRestaurantOrders(user!.restaurantId!);
      },
      'DELIVERY': () => this.httpService.getDeliveryOrders()
    };
    const request = requestMap[this.userRole]?.();
    if (request) {
      request.pipe(takeUntil(this.destroy$)).subscribe({
        next: (data: Order[]) => {
          this.orders = this.processOrders(data);
          this.updateOrderCounts();
          this.filterOrders();
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading orders:', error);
          this.errorMessage = 'Failed to load orders. Please try again.';
          this.loading = false;
          this.toastService.showError('Failed to load orders');
        }
      });
    }
  }

  private processOrders(orders: Order[]): Order[] {
    return orders.map(order => ({
      ...order,
      orderDate: new Date(order.orderDate),
      isFavorite: this.getFavoriteStatus(order.restaurantId)
    }));
  }

  loadNotifications(): void {
    this.httpService.getNotifications().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: Notification[]) => {
        this.notifications = data;
        this.notificationCount = data.filter(n => !n.read).length;
      },
      error: (error: any) => console.error('Error loading notifications:', error)
    });
  }

  loadStats(): void {
    if (this.userRole === 'CUSTOMER') {
      this.httpService.getCustomerStats().pipe(takeUntil(this.destroy$)).subscribe({
        next: (stats: CustomerStats) => {
          this.totalOrders = stats.totalOrders;
          this.activeOrders = stats.activeOrders;
          this.savedAddresses = stats.savedAddresses || [];
        }
      });
    } else if (this.userRole === 'RESTAURANT') {
      const user = this.authService.getUser();
      this.httpService.getRestaurantStats(user!.restaurantId!).pipe(takeUntil(this.destroy$)).subscribe({
        next: (stats: RestaurantStats) => {
          this.todayRevenue = stats.todayRevenue;
          this.pendingOrders = stats.pendingOrders;
        }
      });
    } else if (this.userRole === 'DELIVERY') {
      this.httpService.getDeliveryStats().pipe(takeUntil(this.destroy$)).subscribe({
        next: (stats: DeliveryStats) => {
          this.completedDeliveries = stats.completedToday;
          this.todayEarnings = stats.todayEarnings;
        }
      });
    }
  }

  private updateOrderCounts(): void {
    this.activeOrdersCount = this.orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status)).length;
    this.pastOrdersCount = this.orders.filter(o => o.status === 'DELIVERED').length;
    this.cancelledOrdersCount = this.orders.filter(o => o.status === 'CANCELLED').length;
  }

  filterOrders(): void {
    let filtered = [...this.orders];
    switch (this.activeTab) {
      case 'active': filtered = filtered.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status)); break;
      case 'past': filtered = filtered.filter(o => o.status === 'DELIVERED'); break;
      case 'cancelled': filtered = filtered.filter(o => o.status === 'CANCELLED'); break;
    }
    if (this.statusFilter !== 'ALL') filtered = filtered.filter(o => o.status === this.statusFilter);
    if (this.dateFilter !== 'ALL') {
      const now = new Date();
      filtered = filtered.filter(o => {
        const orderDate = new Date(o.orderDate);
        switch (this.dateFilter) {
          case 'TODAY': return orderDate.toDateString() === now.toDateString();
          case 'WEEK': const weekAgo = new Date(now.setDate(now.getDate() - 7)); return orderDate >= weekAgo;
          case 'MONTH': const monthAgo = new Date(now.setMonth(now.getMonth() - 1)); return orderDate >= monthAgo;
          default: return true;
        }
      });
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(o => o.id.toLowerCase().includes(term) || o.restaurantName.toLowerCase().includes(term) || o.items.some(item => item.toLowerCase().includes(term)));
    }
    this.filteredOrders = filtered;
  }

  updateOrderStatus(orderId: string, status: string): void {
    this.httpService.updateOrderStatus(orderId, status).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.toastService.showSuccess(`Order status updated to ${status}`); this.loadOrders(); this.loadStats(); },
      error: () => this.toastService.showError('Failed to update order status')
    });
  }

  updateDeliveryStatus(orderId: string, status: string): void {
    this.httpService.updateDeliveryStatus(orderId, status).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.toastService.showSuccess(`Delivery status updated to ${status}`); this.loadOrders(); this.loadStats(); },
      error: () => this.toastService.showError('Failed to update delivery status')
    });
  }

  trackOrder(orderId: string): void {
    this.httpService.trackOrder(orderId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: Order) => { this.selectedOrder = data; },
      error: () => this.toastService.showError('Failed to track order')
    });
  }

  trackLiveLocation(orderId: string): void { this.router.navigate(['/live-tracking', orderId]); }

  cancelOrder(orderId: string): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.httpService.cancelOrder(orderId).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => { this.toastService.showSuccess('Order cancelled successfully'); this.loadOrders(); this.loadStats(); },
        error: () => this.toastService.showError('Failed to cancel order')
      });
    }
  }

  reorderItems(orderId: string): void {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      this.httpService.reorder(order.restaurantId, order.items).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => { this.toastService.showSuccess('Items added to cart'); this.router.navigate(['/cart']); },
        error: () => this.toastService.showError('Failed to reorder items')
      });
    }
  }

  rateOrder(order: Order): void { this.selectedOrderForRating = order; this.showRatingModal = true; }

  submitRating(): void {
    if (this.ratingValue === 0) { this.toastService.showWarning('Please select a rating'); return; }
    const ratingData = { orderId: this.selectedOrderForRating?.id, restaurantId: this.selectedOrderForRating?.restaurantId, rating: this.ratingValue, feedback: this.ratingFeedback };
    this.httpService.submitRating(ratingData).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.toastService.showSuccess('Thank you for your rating!'); this.closeRatingModal(); this.loadOrders(); },
      error: () => this.toastService.showError('Failed to submit rating')
    });
  }

  closeRatingModal(): void { this.showRatingModal = false; this.selectedOrderForRating = null; this.ratingValue = 0; this.hoverRating = 0; this.ratingFeedback = ''; }

  reportIssue(orderId: string): void {
    const order = this.orders.find(o => o.id === orderId);
    if (order) { this.selectedOrderForIssue = order; this.showIssueModal = true; }
  }

  submitIssue(): void {
    if (!this.issueType) { this.toastService.showWarning('Please select an issue type'); return; }
    if (!this.issueDescription) { this.toastService.showWarning('Please describe the issue'); return; }
    const issueData = { orderId: this.selectedOrderForIssue?.id, type: this.issueType, description: this.issueDescription };
    this.httpService.reportIssue(issueData).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.toastService.showSuccess('Issue reported successfully'); this.closeIssueModal(); },
      error: () => this.toastService.showError('Failed to report issue')
    });
  }

  closeIssueModal(): void { this.showIssueModal = false; this.selectedOrderForIssue = null; this.issueType = ''; this.issueDescription = ''; }

  downloadReceipt(orderId: string): void {
    this.httpService.downloadReceipt(orderId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `receipt-${orderId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.toastService.showSuccess('Receipt downloaded');
      },
      error: () => this.toastService.showError('Failed to download receipt')
    });
  }

  viewOrderDetails(orderId: string): void { this.router.navigate(['/restaurant/order-details', orderId]); }

  printOrderTicket(orderId: string): void {
    this.httpService.getOrderTicket(orderId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (ticket: string) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) { printWindow.document.write(ticket); printWindow.document.close(); printWindow.print(); }
      },
      error: () => this.toastService.showError('Failed to print ticket')
    });
  }

  setPreparationTime(orderId: string): void {
    const time = prompt('Enter preparation time in minutes:');
    if (time && !isNaN(Number(time))) {
      this.httpService.setPreparationTime(orderId, Number(time)).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => this.toastService.showSuccess('Preparation time set'),
        error: () => this.toastService.showError('Failed to set preparation time')
      });
    }
  }

  contactCustomer(customerId: string): void {
    this.httpService.getCustomerContact(customerId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (contact: { phone: string }) => { window.location.href = `tel:${contact.phone}`; },
      error: () => this.toastService.showError('Failed to get customer contact')
    });
  }

  navigateToAddress(address: string): void { const encodedAddress = encodeURIComponent(address); window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank'); }

  callCustomer(phone: string): void { if (phone) { window.location.href = `tel:${phone}`; } }

  reportDeliveryIssue(orderId: string): void { this.router.navigate(['/delivery/report-issue', orderId]); }

  viewRouteMap(): void { this.router.navigate(['/delivery/route-map']); }

  toggleOnlineStatus(): void {
    this.isOnline = !this.isOnline;
    this.httpService.updateDeliveryAvailability(this.isOnline).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.toastService.showSuccess(`You are now ${this.isOnline ? 'Online' : 'Offline'}`); if (this.isOnline) this.loadOrders(); },
      error: () => { this.isOnline = !this.isOnline; this.toastService.showError('Failed to update status'); }
    });
  }

  contactDeliveryPartner(partnerId: string): void {
    this.httpService.getDeliveryPartnerContact(partnerId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (contact: { phone: string }) => { window.location.href = `tel:${contact.phone}`; },
      error: () => this.toastService.showError('Failed to contact delivery partner')
    });
  }

  toggleFavorite(restaurantId: string): void {
    const isFavorite = this.getFavoriteStatus(restaurantId);
    const request = isFavorite ? this.httpService.removeFavorite(restaurantId) : this.httpService.addFavorite(restaurantId);
    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        if (isFavorite) { const index = favorites.indexOf(restaurantId); if (index > -1) favorites.splice(index, 1); this.toastService.showInfo('Removed from favorites'); }
        else { favorites.push(restaurantId); this.toastService.showSuccess('Added to favorites'); }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        this.loadOrders();
      },
      error: () => this.toastService.showError('Failed to update favorites')
    });
  }

  private getFavoriteStatus(restaurantId: string): boolean { const favorites = JSON.parse(localStorage.getItem('favorites') || '[]'); return favorites.includes(restaurantId); }

  toggleNotifications(): void { this.showNotifications = !this.showNotifications; if (this.showNotifications) this.showProfileMenu = false; }

  markAllRead(): void {
    this.httpService.markNotificationsRead().pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.notifications = this.notifications.map(n => ({ ...n, read: true })); this.notificationCount = 0; this.toastService.showSuccess('All notifications marked as read'); },
      error: () => this.toastService.showError('Failed to mark notifications')
    });
  }

  toggleProfileMenu(): void { this.showProfileMenu = !this.showProfileMenu; if (this.showProfileMenu) this.showNotifications = false; }

  toggleSidebar(): void { this.showSidebar = !this.showSidebar; }

  closeTracking(): void { this.selectedOrder = null; }

  navigateToRestaurants(): void { this.router.navigate(['/restaurants']); }

  openSupportChat(): void { this.router.navigate(['/support/chat']); }

  openMenuManager(): void { this.router.navigate(['/restaurant/menu-manager']); }

  viewAnalytics(): void { this.router.navigate(['/restaurant/analytics']); }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = { 'PLACED': '#3B82F6', 'PREPARING': '#F59E0B', 'READY': '#8B5CF6', 'OUT_FOR_DELIVERY': '#06B6D4', 'DELIVERED': '#10B981', 'CANCELLED': '#EF4444' };
    return colors[status] || '#6B7280';
  }

  getEstimatedDeliveryTime(): string { return this.selectedOrder?.estimatedDeliveryTime || '30-45 minutes'; }

  canCancelOrder(status: string): boolean { return ['PLACED', 'PREPARING'].includes(status); }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
      this.toastService.showInfo('You have been logged out');
    }
  }
}