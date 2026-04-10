import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Auth endpoints
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials);
  }

  // Restaurant endpoints
  getAllRestaurants(): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurants`);
  }

  getRestaurantMenu(restaurantId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurants/${restaurantId}/menu`);
  }

  // ADD THIS METHOD - For adding menu items
  addMenuItem(restaurantId: number, menuItem: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/restaurant/menu?restaurantId=${restaurantId}`, menuItem);
  }

  placeOrder(restaurantId: number, orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/customer/order?restaurantId=${restaurantId}`, orderData);
  }

  getCustomerOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/customer/orders`);
  }

  getRestaurantOrders(restaurantId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurant/orders/${restaurantId}`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/restaurant/order/update/${orderId}?status=${status}`, {});
  }

  updateDeliveryStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/delivery/update/${orderId}?status=${status}`, {});
  }

  getDeliveryOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/delivery/orders`);
  }

  trackOrder(orderId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders/${orderId}/track`);
  }
}
