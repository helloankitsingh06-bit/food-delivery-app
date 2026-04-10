import { Injectable } from '@angular/core';
<<<<<<< HEAD
import { HttpClient, HttpHeaders } from '@angular/common/http';
=======
import { HttpClient } from '@angular/common/http';
>>>>>>> 51a45ed969f7088da582356274be73b751b03675
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

<<<<<<< HEAD
// ============================================
// INTERFACES
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  restaurantId?: string;
  phone?: string;
}

// ============================================
// AUTH SERVICE
// ============================================

=======
>>>>>>> 51a45ed969f7088da582356274be73b751b03675
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api';
  private tokenKey = 'jwt_token';
  private userKey = 'user_data';
<<<<<<< HEAD
  private refreshTokenKey = 'refresh_token';
  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  private userRoleSubject = new BehaviorSubject<string>(this.getUserRole());
  private currentUser: User | null = null;

  constructor(
    private http: HttpClient, 
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  
  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
        this.currentUser = null;
      }
    }
  }

  // ============================================
  // AUTHENTICATION METHODS (Your existing methods)
  // ============================================
  
=======
  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  private userRoleSubject = new BehaviorSubject<string>(this.getUserRole());

  constructor(private http: HttpClient, private router: Router) {}

>>>>>>> 51a45ed969f7088da582356274be73b751b03675
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          this.setSession(response);
        }
      })
    );
  }

  private setSession(authResult: any): void {
    localStorage.setItem(this.tokenKey, authResult.token);
    localStorage.setItem(this.userKey, JSON.stringify(authResult.user));
<<<<<<< HEAD
    
    if (authResult.refreshToken) {
      localStorage.setItem(this.refreshTokenKey, authResult.refreshToken);
    }
    
    this.currentUser = authResult.user;
=======
>>>>>>> 51a45ed969f7088da582356274be73b751b03675
    this.loggedInSubject.next(true);
    this.userRoleSubject.next(authResult.user.role);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
<<<<<<< HEAD
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem('favorites');
    this.currentUser = null;
=======
>>>>>>> 51a45ed969f7088da582356274be73b751b03675
    this.loggedInSubject.next(false);
    this.userRoleSubject.next('');
    this.router.navigate(['/login']);
  }

<<<<<<< HEAD
  // ============================================
  // TOKEN METHODS
  // ============================================
  
=======
>>>>>>> 51a45ed969f7088da582356274be73b751b03675
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

<<<<<<< HEAD
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  // ============================================
  // USER METHODS (Enhanced)
  // ============================================
  
  getUser(): User | null {
    if (!this.currentUser) {
      this.loadUserFromStorage();
    }
    return this.currentUser;
=======
  getUser(): any {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
>>>>>>> 51a45ed969f7088da582356274be73b751b03675
  }

  getUserRole(): string {
    const user = this.getUser();
<<<<<<< HEAD
    return user?.role || 'CUSTOMER';
  }

  getUserName(): string {
    const user = this.getUser();
    return user?.name || 'User';
  }

  getUserAvatar(): string {
    const user = this.getUser();
    return user?.avatar || 'assets/default-avatar.png';
  }

  getUserId(): string | null {
    const user = this.getUser();
    return user?.id || null;
  }

  getRestaurantId(): string | null {
    const user = this.getUser();
    return user?.restaurantId || null;
  }

  // ============================================
  // AUTH STATE OBSERVABLES
  // ============================================
  
=======
    return user ? user.role : '';
  }

>>>>>>> 51a45ed969f7088da582356274be73b751b03675
  isLoggedIn(): boolean {
    return this.hasToken();
  }

<<<<<<< HEAD
  isAuthenticated(): boolean {
    return this.hasToken();
=======
  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
>>>>>>> 51a45ed969f7088da582356274be73b751b03675
  }

  getLoggedInStatus(): Observable<boolean> {
    return this.loggedInSubject.asObservable();
  }

  getUserRoleObservable(): Observable<string> {
    return this.userRoleSubject.asObservable();
  }
<<<<<<< HEAD

  // ============================================
  // ROLE CHECK METHODS
  // ============================================
  
  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  isCustomer(): boolean {
    return this.hasRole('CUSTOMER');
  }

  isRestaurant(): boolean {
    return this.hasRole('RESTAURANT');
  }

  isDelivery(): boolean {
    return this.hasRole('DELIVERY');
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  // ============================================
  // PROFILE MANAGEMENT
  // ============================================
  
  updateUserProfile(userData: Partial<User>): Observable<any> {
    const headers = this.getHeaders();
    return this.http.patch(`${this.apiUrl}/users/profile`, userData, { headers }).pipe(
      tap((response: any) => {
        if (response.user) {
          localStorage.setItem(this.userKey, JSON.stringify(response.user));
          this.currentUser = response.user;
        }
      })
    );
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/auth/change-password`, 
      { oldPassword, newPassword }, 
      { headers }
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password`, { token, newPassword });
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/verify-email`, { token });
  }

  // ============================================
  // TOKEN REFRESH
  // ============================================
  
  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    return this.http.post(`${this.apiUrl}/auth/refresh-token`, { refreshToken }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          if (response.refreshToken) {
            localStorage.setItem(this.refreshTokenKey, response.refreshToken);
          }
        }
      })
    );
  }

  // ============================================
  // HELPER METHODS
  // ============================================
  
  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() > expiry;
    } catch (e) {
      return true;
    }
  }

  // Get token payload
  getTokenPayload(): any {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }

  // Update user avatar
  updateAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });
    return this.http.post(`${this.apiUrl}/users/avatar`, formData, { headers }).pipe(
      tap((response: any) => {
        if (response.avatar) {
          const user = this.getUser();
          if (user) {
            user.avatar = response.avatar;
            localStorage.setItem(this.userKey, JSON.stringify(user));
            this.currentUser = user;
          }
        }
      })
    );
  }
}

// Import HttpHeaders at the top if not already there
=======
}
>>>>>>> 51a45ed969f7088da582356274be73b751b03675
