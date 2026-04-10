import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api';
  private tokenKey = 'jwt_token';
  private userKey = 'user_data';
  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  private userRoleSubject = new BehaviorSubject<string>(this.getUserRole());

  constructor(private http: HttpClient, private router: Router) {}

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
    this.loggedInSubject.next(true);
    this.userRoleSubject.next(authResult.user.role);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.loggedInSubject.next(false);
    this.userRoleSubject.next('');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): any {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  getUserRole(): string {
    const user = this.getUser();
    return user ? user.role : '';
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getLoggedInStatus(): Observable<boolean> {
    return this.loggedInSubject.asObservable();
  }

  getUserRoleObservable(): Observable<string> {
    return this.userRoleSubject.asObservable();
  }
}