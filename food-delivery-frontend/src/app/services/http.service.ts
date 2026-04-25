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
  getUserProfile(userId: number) {
    return this.http.get<any>(`http://localhost:8080/api/users/${userId}`);
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

  addMenuItem(restaurantId: number, data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/restaurant/menu?restaurantId=${restaurantId}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  // ✅ ADD MENU ITEM WITH IMAGE (FormData)
  addMenuItemWithImage(restaurantId: number, formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    // Don't set Content-Type - let browser set it with boundary
    
    return this.http.post(
      `${this.apiUrl}/restaurant/menu-with-image?restaurantId=${restaurantId}`,
      formData,
      { headers: headers }
    );
  }

  // ✅ UPDATE MENU ITEM WITH IMAGE
  updateMenuItemWithImage(id: number, formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    // Don't set Content-Type - let browser set it with boundary
    
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

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/restaurant/order/update/${orderId}?status=${status}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // ================= MENU =================

  // ✅ GET MENU ITEMS BY RESTAURANT - Already exists and correct
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

  // ================= USER PROFILE =================
  
  // Update user profile with more fields
  updateUser(userId: number, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}`, userData, {
      headers: this.getHeaders()
    });
  }

  // ✅ CHANGE PASSWORD
  changePassword(userId: number, passwords: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/change-password/${userId}`, passwords, {
      headers: this.getHeaders()
    });
  }

  // ================= RESTAURANT MANAGEMENT =================
  
  // CREATE RESTAURANT
  createRestaurant(restaurantData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/restaurant/create`, restaurantData, {
      headers: this.getHeaders()
    });
  }

  // GET RESTAURANTS BY OWNER EMAIL
  getRestaurantsByOwner(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurant/my-restaurants?email=${email}`, {
      headers: this.getHeaders()
    });
  }

  // GET RESTAURANT BY OWNER EMAIL (SINGLE RESTAURANT) - FIXED ENDPOINT
  getRestaurantByOwnerEmail(ownerEmail: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurants/owner/email/${ownerEmail}`, {
      headers: this.getHeaders()
    });
  }

  // GET RESTAURANT BY OWNER ID
  getRestaurantByOwnerId(ownerId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurants/owner/${ownerId}`, {
      headers: this.getHeaders()
    });
  }

  // UPDATE RESTAURANT
  updateRestaurant(restaurantId: number, restaurantData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/restaurants/${restaurantId}`, restaurantData, {
      headers: this.getHeaders()
    });
  }

  // DELETE RESTAURANT
  deleteRestaurant(restaurantId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/restaurants/${restaurantId}`, {
      headers: this.getHeaders()
    });
  }

  // GET ALL RESTAURANTS (PUBLIC)
  getAllRestaurantsList(): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurants`, {
      headers: this.getHeaders()
    });
  }
  // ================= PROFILE STATS =================

// CUSTOMER STATS
  getCustomerStats() {
    return this.http.get(`/api/orders/customer/stats`);
  }

// RESTAURANT STATS
  getRestaurantStats(ownerId: number) {
    return this.http.get(`/api/restaurants/${ownerId}/stats`);
  }

// DELIVERY STATS
  getDeliveryStats() {
    return this.http.get(`/api/delivery/stats`);
  }


// ================= IMAGE UPLOAD =================
  uploadImage(formData: FormData) {
    return this.http.post(`/api/upload`, formData);
  }


// ================= OLD PASSWORD ENDPOINT (keep for compatibility) =================
  // Legacy changePassword method (POST /api/auth/change-password)
  changePasswordLegacy(data: any) {
    return this.http.post(`/api/auth/change-password`, data);
  }
}