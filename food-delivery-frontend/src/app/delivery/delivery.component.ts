import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.css']
})
export class DeliveryComponent implements OnInit {

  deliveries: any[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  selectedOrder: any = null;

  constructor(
    private httpService: HttpService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDeliveries();

    // Auto refresh every 15 sec
    setInterval(() => this.loadDeliveries(), 15000);
  }

  // ✅ LOAD DELIVERIES
  loadDeliveries(): void {
    this.loading = true;

    this.httpService.getDeliveryOrders().subscribe({
      next: (data: any[]) => {
        this.deliveries = data || [];
        this.loading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load deliveries';
        this.loading = false;

        if (error.status === 401) {
          this.authService.logout();
        }
      }
    });
  }

  // ✅ COUNTERS
  getPendingCount(): number {
    return this.deliveries.filter(d => d.status === 'PENDING').length;
  }

  getActiveCount(): number {
    return this.deliveries.filter(d =>
      d.status === 'ACCEPTED' || d.status === 'PICKED_UP'
    ).length;
  }

  getCompletedCount(): number {
    return this.deliveries.filter(d => d.status === 'DELIVERED').length;
  }

  // ✅ ITEMS FORMAT
  getItemsList(items: any[]): string {
    return items ? items.join(', ') : '';
  }

  // ✅ ACCEPT DELIVERY
  acceptDelivery(orderId: any): void {
    if (confirm('Accept this delivery?')) {
      this.httpService.updateDeliveryStatus(orderId, 'ACCEPTED').subscribe({
        next: () => {
          this.loadDeliveries();
          alert('Delivery accepted!');
        },
        error: () => {
          alert('Failed to accept delivery');
        }
      });
    }
  }

  // ✅ UPDATE STATUS
  updateDeliveryStatus(orderId: any, status: string): void {
    this.httpService.updateDeliveryStatus(orderId, status).subscribe({
      next: () => {
        this.loadDeliveries();
        alert(`Delivery status updated to ${status}`);
      },
      error: () => {
        alert('Failed to update delivery status');
      }
    });
  }

  // ✅ VIEW DETAILS
  viewOrderDetails(order: any): void {
    this.selectedOrder = order;
  }

  // ✅ CLOSE DETAILS
  closeDetails(): void {
    this.selectedOrder = null;
  }

  // ✅ STATUS ICON
  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      PENDING: '⏳',
      ACCEPTED: '✓',
      PICKED_UP: '🚚',
      DELIVERED: '✅'
    };

    return icons[status] || '📦';
  }

  // ✅ LOGOUT
  logout(): void {
    this.authService.logout();
  }
}