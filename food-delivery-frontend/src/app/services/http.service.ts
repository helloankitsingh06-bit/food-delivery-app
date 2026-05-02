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

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, data);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  registerDeliveryPartner(partnerData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/delivery-partners/register`, partnerData, {
      headers: this.getHeaders()
    });
  }

  getDeliveryPartnerByPhone(phoneNumber: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/delivery-partners/${phoneNumber}`, {
      headers: this.getHeaders()
    });
  }

  getAllDeliveryPartners(): Observable<any> {
    return this.http.get(`${this.apiUrl}/delivery-partners`, {
      headers: this.getHeaders()
    });
  }

  updateDeliveryPartnerStatus(partnerId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/delivery-partners/${partnerId}/status`, 
      { status },
      { headers: this.getHeaders() }
    );
  }

  cancelOrder(orderId: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/customer/order/cancel/${orderId}`,
      {},
      { headers: this.getHeaders() }
    );
  }

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

  getUserProfile(userId: number) {
    return this.http.get<any>(`${this.apiUrl}/users/${userId}`);
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

  getPastOrders(): Observable<any> {
    return this.getCustomerOrders();
  }

  addMenuItem(restaurantId: number, data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/restaurant/menu?restaurantId=${restaurantId}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  addMenuItemWithImage(restaurantId: number, formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(
      `${this.apiUrl}/restaurant/menu-with-image?restaurantId=${restaurantId}`,
      formData,
      { headers: headers }
    );
  }

  updateMenuItemWithImage(id: number, formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(
      `${this.apiUrl}/restaurant/menu-with-image/${id}`,
      formData,
      { headers: headers }
    );
  }

  getRestaurantOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurant/orders`, {
      headers: this.getHeaders()
    });
  }

  getRestaurantOrdersByRestaurantId(restaurantId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurant/orders?restaurantId=${restaurantId}`, {
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

  updateUser(userId: number, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}`, userData, {
      headers: this.getHeaders()
    });
  }

  changePassword(userId: number, passwordsOrCurrent: any, newPassword?: string): Observable<any> {
    let body;
    if (typeof passwordsOrCurrent === 'object') {
      body = passwordsOrCurrent;
    } else {
      body = {
        currentPassword: passwordsOrCurrent,
        newPassword: newPassword
      };
    }
    return this.http.put(
      `${this.apiUrl}/users/change-password/${userId}`,
      body,
      { headers: this.getHeaders() }
    );
  }

  createRestaurant(restaurantData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/restaurant/create`, restaurantData, {
      headers: this.getHeaders()
    });
  }

  getRestaurantsByOwner(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurant/my-restaurants?email=${email}`, {
      headers: this.getHeaders()
    });
  }

  getRestaurantByOwnerEmail(ownerEmail: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurant/owner/email/${ownerEmail}`, {
      headers: this.getHeaders()
    });
  }

  getRestaurantByOwnerId(ownerId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurant/owner/${ownerId}`, {
      headers: this.getHeaders()
    });
  }

  updateRestaurant(restaurantId: number, restaurantData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/restaurants/${restaurantId}`, restaurantData, {
      headers: this.getHeaders()
    });
  }

  deleteRestaurant(restaurantId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/restaurants/${restaurantId}`, {
      headers: this.getHeaders()
    });
  }

  getAllRestaurantsList(): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurants`, {
      headers: this.getHeaders()
    });
  }

  getCustomerStats() {
    return this.http.get(`/api/orders/customer/stats`);
  }

  getRestaurantStats(ownerId: number) {
    return this.http.get(`/api/restaurants/${ownerId}/stats`);
  }

  getDeliveryStats() {
    return this.http.get(`/api/delivery/stats`);
  }

  uploadImage(formData: FormData) {
    return this.http.post(`/api/upload`, formData);
  }

  changePasswordLegacy(data: any) {
    return this.http.post(`/api/auth/change-password`, data);
  }
}