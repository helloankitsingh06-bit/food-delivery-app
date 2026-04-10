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
  loading = true;
  errorMessage = '';
  selectedOrder: any = null;

  constructor(
    private httpService: HttpService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDeliveries();
    setInterval(() => this.loadDeliveries(), 15000);
  }

  loadDeliveries(): void {
    this.loading = true;
    this.httpService.getDeliveryOrders().subscribe({
      next: (data) => {
        this.deliveries = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load deliveries';
        this.loading = false;
        if (error.status === 401) {
          this.authService.logout();
        }
      }
    });
  }

  getPendingCount(): number {
    return this.deliveries.filter(d => d.status === 'PENDING').length;
  }

  getActiveCount(): number {
    return this.deliveries.filter(d => d.status === 'ACCEPTED' || d.status === 'PICKED_UP').length;
  }

  getCompletedCount(): number {
    return this.deliveries.filter(d => d.status === 'DELIVERED').length;
  }

  getItemsList(items: any[]): string {
    return items ? items.join(', ') : '';
  }

  acceptDelivery(orderId: number): void {
    if (confirm('Accept this delivery?')) {
      this.httpService.updateDeliveryStatus(orderId, 'ACCEPTED').subscribe({
        next: () => {
          this.loadDeliveries();
          alert('Delivery accepted!');
        },
        error: () => alert('Failed to accept delivery')
      });
    }
  }

  updateDeliveryStatus(orderId: number, status: string): void {
    this.httpService.updateDeliveryStatus(orderId, status).subscribe({
      next: () => {
        this.loadDeliveries();
        alert(`Delivery status updated to ${status}`);
      },
      error: () => alert('Failed to update delivery status')
    });
  }

  viewOrderDetails(order: any): void {
    this.selectedOrder = order;
  }

  closeDetails(): void {
    this.selectedOrder = null;
  }

  getStatusIcon(status: string): string {
    const icons: {[key: string]: string} = {
      'PENDING': '⏳',
      'ACCEPTED': '✓',
      'PICKED_UP': '🚚',
      'DELIVERED': '✅'
    };
    return icons[status] || '📦';
  }

  logout(): void {
    this.authService.logout();
  }
}
