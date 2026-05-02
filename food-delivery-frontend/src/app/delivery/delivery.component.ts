import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpService } from '../services/http.service';
import { AuthService } from '../services/auth.service';

declare var google: any;

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.css']
})
export class DeliveryComponent implements OnInit, OnDestroy {

  deliveries: any[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  selectedOrder: any = null;

  refreshInterval: any;
  trackingInterval: any;

  searchTerm: string = '';
  statusFilter: string = 'ALL';
  previousCount: number = 0;

  map: any;
  directionsService: any;
  directionsRenderer: any;

  isOnline: boolean = true;

  constructor(
    private httpService: HttpService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDeliveries();

    // 🔥 Auto refresh
    this.refreshInterval = setInterval(() => {
      this.loadDeliveries();
    }, 15000);

    // 🔥 ONLINE/OFFLINE DETECTION
    window.addEventListener('offline', () => {
      this.isOnline = false;
      alert('⚠️ You are offline');
    });

    window.addEventListener('online', () => {
      this.isOnline = true;
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshInterval);
    clearInterval(this.trackingInterval);
  }

  // =========================
  // 🚀 LOAD DELIVERIES
  // =========================
  loadDeliveries(): void {
    this.loading = true;

    this.httpService.getDeliveryOrders().subscribe({
      next: (data: any[]) => {

        // 🔔 NEW ORDER ALERT
        if (data.length > this.previousCount) {
          this.playNotificationSound();
        }

        this.previousCount = data.length;
        this.deliveries = data || [];
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load deliveries';
        this.loading = false;
      }
    });
  }

  // =========================
  // 🔍 FILTER + SEARCH
  // =========================
  getFilteredDeliveries(): any[] {
    let filtered = [...this.deliveries];

    if (this.statusFilter !== 'ALL') {
      filtered = filtered.filter(d => {
        if (this.statusFilter === 'ACTIVE') {
          return d.status === 'ACCEPTED' || d.status === 'PICKED_UP';
        }
        return d.status === this.statusFilter;
      });
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        d.orderId?.toString().includes(term) ||
        d.customerName?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  // =========================
  // 📊 COUNTERS
  // =========================
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

  // =========================
  // 📦 ITEMS
  // =========================
  getItemsList(items: any[]): string {
    return items?.length ? items.join(', ') : 'No items';
  }

  // =========================
  // ⏱ TIMER + ETA
  // =========================
  getElapsedTime(time: string): number {
    if (!time) return 0;

    const now = new Date().getTime();
    const orderTime = new Date(time).getTime();

    return Math.floor((now - orderTime) / 60000);
  }

  getETA(time: string): string {
    const mins = this.getElapsedTime(time);
    return (30 - mins) > 0 ? (30 - mins) + ' mins left' : 'Arriving soon';
  }

  // =========================
  // 🔥 PRIORITY ORDER
  // =========================
  isPriority(order: any): boolean {
    return this.getElapsedTime(order.createdAt) > 20;
  }

  // =========================
  // 🔔 SOUND
  // =========================
  playNotificationSound(): void {
    const audio = new Audio('assets/notification.mp3');
    audio.play().catch(() => {});
  }

  // =========================
  // 🎯 STATUS
  // =========================
  getStatusClass(status: string): string {
    const map: any = {
      PENDING: 'pending',
      ACCEPTED: 'active',
      PICKED_UP: 'active',
      DELIVERED: 'completed'
    };
    return map[status] || '';
  }

  getStatusIcon(status: string): string {
    const icons: any = {
      PENDING: '⏳',
      ACCEPTED: '✅',
      PICKED_UP: '🚚',
      DELIVERED: '🎉'
    };
    return icons[status] || '📦';
  }

  // =========================
  // 🚴 ACTIONS
  // =========================
  acceptDelivery(orderId: any): void {
    if (confirm('Accept this delivery?')) {
      this.updateDeliveryStatus(orderId, 'ACCEPTED');
    }
  }

  markPickedUp(orderId: any): void {
    this.updateDeliveryStatus(orderId, 'PICKED_UP');
  }

  markDelivered(orderId: any): void {
    this.updateDeliveryStatus(orderId, 'DELIVERED');
  }

  updateDeliveryStatus(orderId: any, status: string): void {
    this.httpService.updateDeliveryStatus(orderId, status).subscribe({
      next: () => this.loadDeliveries(),
      error: () => alert('Failed to update delivery status')
    });
  }

  // =========================
  // 👁 VIEW DETAILS + MAP
  // =========================
  viewOrderDetails(order: any): void {
    this.selectedOrder = order;

    setTimeout(() => {
      this.loadMap(order);
    }, 300);
  }

  closeDetails(): void {
    this.selectedOrder = null;
    clearInterval(this.trackingInterval);
  }

  // =========================
  // 🗺 MAP + ROUTE
  // =========================
  loadMap(order: any): void {

    const destination = {
      lat: order.lat || 28.6139,
      lng: order.lng || 77.2090
    };

    const riderStart = {
      lat: destination.lat + 0.02,
      lng: destination.lng + 0.02
    };

    this.map = new google.maps.Map(document.getElementById('map'), {
      center: destination,
      zoom: 14
    });

    // 🔥 ROUTE LINE
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      map: this.map
    });

    this.directionsService.route({
      origin: riderStart,
      destination: destination,
      travelMode: 'DRIVING'
    }, (result: any, status: any) => {
      if (status === 'OK') {
        this.directionsRenderer.setDirections(result);
      }
    });

    // 🚴 Rider marker
    const rider = new google.maps.Marker({
      position: riderStart,
      map: this.map,
      label: '🚴'
    });

    // 🔥 LIVE MOVEMENT
    this.trackingInterval = setInterval(() => {
      const pos = rider.getPosition();
      rider.setPosition({
        lat: pos.lat() - 0.001,
        lng: pos.lng() - 0.001
      });
    }, 2000);
  }

  // =========================
  // 🔐 AUTH
  // =========================
  logout(): void {
    this.authService.logout();
  }
}