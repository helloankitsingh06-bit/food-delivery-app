import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // ================= COMMON HEADERS =================
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

  getRestaurants(): Observable<any> {
    return this.http.get(`${this.apiUrl}/customer/restaurants`, {
      headers: this.getHeaders()
    });
  }

  getAllRestaurants(): Observable<any> {
    return this.http.get(`${this.apiUrl}/customer/restaurants`, {
      headers: this.getHeaders()
    });
  }

  getRestaurantMenu(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/customer/menu/${id}`, {
      headers: this.getHeaders()
    });
  }

  placeOrder(restaurantId: number, data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/customer/order?restaurantId=${restaurantId}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  getCustomerOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/customer/orders`, {
      headers: this.getHeaders()
    });
  }

  // ================= RESTAURANT =================

  // ✅ THIS IS YOUR REQUIRED METHOD (already correct)
  addMenuItem(restaurantId: number, data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/restaurant/menu?restaurantId=${restaurantId}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  getRestaurantOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurant/orders`, {
      headers: this.getHeaders()
    });
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/restaurant/order/update/${orderId}?status=${status}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // ================= MENU =================

  getMenuByRestaurant(restaurantId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/restaurant/menu?restaurantId=${restaurantId}`,
      { headers: this.getHeaders() }
    );
  }

  deleteMenuItem(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/restaurant/menu/${id}`,
      { headers: this.getHeaders() }
    );
  }

  updateMenuItem(id: number, item: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/restaurant/menu/${id}`,
      item,
      { headers: this.getHeaders() }
    );
  }

  // ================= DELIVERY =================

  getDeliveryOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/delivery/orders`, {
      headers: this.getHeaders()
    });
  }

  updateDeliveryStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/delivery/update/${orderId}?status=${status}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  getMyRestaurant(userId: number) {
    return this.http.get(`${this.apiUrl}/restaurant/my?userId=${userId}`, {
      headers: this.getHeaders()
    });
  }
}