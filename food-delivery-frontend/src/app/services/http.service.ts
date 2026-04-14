import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  // ================= AUTH =================
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, data);
  }

  // ================= CUSTOMER =================
  getAllRestaurants(): Observable<any> {
    return this.http.get(`${this.apiUrl}/customer/restaurants`, { headers: this.getHeaders() });
  }

  getRestaurantMenu(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/customer/menu/${id}`, { headers: this.getHeaders() });
  }

  // ✅ FIXED (takes 2 args)
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

  // ================= RESTAURANT =================
  addMenuItem(restaurantId: number, item: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/restaurant/menu/${restaurantId}`,
      item,
      { headers: this.getHeaders() }
    );
  }

  getRestaurantOrders(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurant/orders/${id}`, { headers: this.getHeaders() });
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/restaurant/order/update/${orderId}?status=${status}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // ================= DELIVERY =================

  // ✅ FIXED (no argument needed now)
  getDeliveryOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/delivery/orders`, { headers: this.getHeaders() });
  }

  // ✅ FIXED (same name as component expects)
  updateDeliveryStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/delivery/update/${orderId}?status=${status}`,
      {},
      { headers: this.getHeaders() }
    );
  }
}