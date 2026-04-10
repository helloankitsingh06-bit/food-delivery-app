import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ============================================
  // AUTH ENDPOINTS (Your existing methods)
  // ============================================
  
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials);
  }

  // ============================================
  // RESTAURANT ENDPOINTS (Your existing methods)
  // ============================================
  
  getAllRestaurants(): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurants`);
  }

  getRestaurantMenu(restaurantId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurants/${restaurantId}/menu`);
  }

  addMenuItem(restaurantId: number, menuItem: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/restaurant/menu?restaurantId=${restaurantId}`, menuItem);
  }

  // ============================================
  // ORDER ENDPOINTS (Your existing methods)
  // ============================================
  
  placeOrder(restaurantId: number, orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/customer/order?restaurantId=${restaurantId}`, orderData);
  }

  // ===== ENHANCED ORDERS =====
  getCustomerOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/customer/orders`, { headers: this.getHeaders() });
  }

  getRestaurantOrders(restaurantId: number | string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/restaurant/orders/${restaurantId}`, { headers: this.getHeaders() });
  }

  getDeliveryOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/delivery/orders`, { headers: this.getHeaders() });
  }

  updateOrderStatus(orderId: number | string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/restaurant/order/update/${orderId}?status=${status}`, {}, { headers: this.getHeaders() });
  }

  updateDeliveryStatus(orderId: number | string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/delivery/update/${orderId}?status=${status}`, {}, { headers: this.getHeaders() });
  }

  trackOrder(orderId: number | string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${orderId}/track`, { headers: this.getHeaders() });
  }

  cancelOrder(orderId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders/${orderId}/cancel`, {}, { headers: this.getHeaders() });
  }

  reorder(restaurantId: string, items: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders/reorder`, { restaurantId, items }, { headers: this.getHeaders() });
  }

  // ============================================
  // STATS ENDPOINTS
  // ============================================
  
  getCustomerStats(): Observable<CustomerStats> {
    return this.http.get<CustomerStats>(`${this.apiUrl}/customer/stats`, { headers: this.getHeaders() });
  }

  getRestaurantStats(restaurantId: string | number): Observable<RestaurantStats> {
    return this.http.get<RestaurantStats>(`${this.apiUrl}/restaurant/stats/${restaurantId}`, { headers: this.getHeaders() });
  }

  getDeliveryStats(): Observable<DeliveryStats> {
    return this.http.get<DeliveryStats>(`${this.apiUrl}/delivery/stats`, { headers: this.getHeaders() });
  }

  // ============================================
  // NOTIFICATIONS ENDPOINTS
  // ============================================
  
  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/notifications`, { headers: this.getHeaders() });
  }

  markNotificationsRead(): Observable<any> {
    return this.http.post(`${this.apiUrl}/notifications/read`, {}, { headers: this.getHeaders() });
  }

  // ============================================
  // RATINGS ENDPOINTS
  // ============================================
  
  submitRating(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ratings`, data, { headers: this.getHeaders() });
  }

  // ============================================
  // ISSUES ENDPOINTS
  // ============================================
  
  reportIssue(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/issues`, data, { headers: this.getHeaders() });
  }

  // ============================================
  // RECEIPTS ENDPOINTS
  // ============================================
  
  downloadReceipt(orderId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/orders/${orderId}/receipt`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  // ============================================
  // FAVORITES ENDPOINTS
  // ============================================
  
  addFavorite(restaurantId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/favorites`, { restaurantId }, { headers: this.getHeaders() });
  }

  removeFavorite(restaurantId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/favorites/${restaurantId}`, { headers: this.getHeaders() });
  }

  // ============================================
  // RESTAURANT SPECIFIC ENDPOINTS
  // ============================================
  
  getOrderTicket(orderId: string): Observable<string> {
    return this.http.get(`${this.apiUrl}/orders/${orderId}/ticket`, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  setPreparationTime(orderId: string, minutes: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/orders/${orderId}/prep-time`, { minutes }, { headers: this.getHeaders() });
  }

  getCustomerContact(customerId: string): Observable<{ phone: string }> {
    return this.http.get<{ phone: string }>(`${this.apiUrl}/customers/${customerId}/contact`, { headers: this.getHeaders() });
  }

  // ============================================
  // DELIVERY SPECIFIC ENDPOINTS
  // ============================================
  
  updateDeliveryAvailability(isOnline: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/delivery/availability`, { isOnline }, { headers: this.getHeaders() });
  }

  getDeliveryPartnerContact(partnerId: string): Observable<{ phone: string }> {
    return this.http.get<{ phone: string }>(`${this.apiUrl}/delivery/partners/${partnerId}/contact`, { headers: this.getHeaders() });
  }

  // ============================================
  // ADDITIONAL HELPER ENDPOINTS
  // ============================================
  
  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/profile`, { headers: this.getHeaders() });
  }

  updateUserProfile(userData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/profile`, userData, { headers: this.getHeaders() });
  }

  getSavedAddresses(): Observable<any> {
    return this.http.get(`${this.apiUrl}/customer/addresses`, { headers: this.getHeaders() });
  }

  addSavedAddress(addressData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/customer/addresses`, addressData, { headers: this.getHeaders() });
  }

  getRestaurantById(restaurantId: number | string): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurants/${restaurantId}`);
  }

  searchRestaurants(searchTerm: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurants/search?q=${searchTerm}`);
  }

  getOrderById(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${orderId}`, { headers: this.getHeaders() });
  }
}