import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // ✅ SINGLE correct headers method
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // IMPORTANT: use 'token'
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ================= AUTH =================
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, data);
  }

  // ================= RESTAURANTS =================
  getAllRestaurants(): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurants`);
  }

  getRestaurantMenu(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurants/${id}/menu`);
  }

  // ================= ORDERS =================
  placeOrder(restaurantId: number, data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/customer/order?restaurantId=${restaurantId}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  getCustomerOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/customer/orders`, { headers: this.getHeaders() });
  }

  getRestaurantOrders(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurant/orders/${id}`, { headers: this.getHeaders() });
  }

  getDeliveryOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/delivery/orders`, { headers: this.getHeaders() });
  }

  updateOrderStatus(orderId: string, status: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/restaurant/order/update/${orderId}?status=${status}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  updateDeliveryStatus(orderId: string, status: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/delivery/update/${orderId}?status=${status}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  trackOrder(orderId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders/${orderId}/track`, { headers: this.getHeaders() });
  }

  cancelOrder(orderId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders/${orderId}/cancel`, {}, { headers: this.getHeaders() });
  }

  reorder(restaurantId: string, items: string[]): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/orders/reorder`,
      { restaurantId, items },
      { headers: this.getHeaders() }
    );
  }

  // ================= STATS =================
  getCustomerStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/customer/stats`, { headers: this.getHeaders() });
  }

  getRestaurantStats(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurant/stats/${id}`, { headers: this.getHeaders() });
  }

  getDeliveryStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/delivery/stats`, { headers: this.getHeaders() });
  }

  // ================= EXTRA =================
  getNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications`, { headers: this.getHeaders() });
  }

  markNotificationsRead(): Observable<any> {
    return this.http.post(`${this.apiUrl}/notifications/read`, {}, { headers: this.getHeaders() });
  }

  submitRating(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ratings`, data, { headers: this.getHeaders() });
  }

  reportIssue(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/issues`, data, { headers: this.getHeaders() });
  }

  downloadReceipt(orderId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/orders/${orderId}/receipt`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  addFavorite(restaurantId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/favorites`, { restaurantId }, { headers: this.getHeaders() });
  }

  removeFavorite(restaurantId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/favorites/${restaurantId}`, { headers: this.getHeaders() });
  }

  getCustomerContact(customerId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/customers/${customerId}/contact`, { headers: this.getHeaders() });
  }

  updateDeliveryAvailability(isOnline: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/delivery/availability`, { isOnline }, { headers: this.getHeaders() });
  }

  getDeliveryPartnerContact(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/delivery/partners/${id}/contact`, { headers: this.getHeaders() });
  }

  // ✅ FIXED (IMPORTANT)
  addMenuItem(restaurantId: number, item: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/restaurant/menu/${restaurantId}`,
      item,
      { headers: this.getHeaders() }
    );
  }
}