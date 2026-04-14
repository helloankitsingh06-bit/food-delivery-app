import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpService } from '../services/http.service';
import { AuthService } from '../services/auth.service';
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

  loading = true;
  errorMessage = '';

  // ✅ REQUIRED VARIABLES (your errors)
  searchTerm: string = '';
  statusFilter: string = 'ALL';
  dateFilter: string = 'ALL';

  userRole: string = '';
  userName: string = '';
  userAvatar: string = '';

  notificationCount: number = 0;

  showNotifications = false;
  showProfileMenu = false;
  showSidebar = false;
  showRatingModal = false;
  showIssueModal = false;
  showHelpModal: boolean = false;

  ratingFeedback = '';
  issueType = '';
  issueDescription = '';

  selectedOrder: any = null;

  private destroy$ = new Subject<void>();

  constructor(
    private httpService: HttpService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeUser();
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeUser(): void {
    const user = this.authService.getUser();
    this.userRole = this.authService.getUserRole();
    this.userName = user?.name || 'User';
    this.userAvatar = user?.avatar || '';
  }

  loadOrders(): void {
    this.httpService.getCustomerOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.orders = data;
          this.filteredOrders = data;
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Failed to load orders';
          this.loading = false;
        }
      });
  }

  filterOrders(): void {
    let filtered = [...this.orders];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(o =>
        o.id?.toLowerCase().includes(term) ||
        o.restaurantName?.toLowerCase().includes(term)
      );
    }

    this.filteredOrders = filtered;
  }

  // ===== UI FUNCTIONS =====

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  closeTracking(): void {
    this.selectedOrder = null;
  }

  closeRatingModal(): void {
    this.showRatingModal = false;
  }

  closeHelpModal(): void {
    this.showIssueModal = false;
  }

  submitRating(): void {
    alert('Rating submitted');
  }

  submitIssue(): void {
    alert('Issue submitted');
  }

  getEstimatedDeliveryTime(): string {
    return '30-45 mins';
  }
  
}