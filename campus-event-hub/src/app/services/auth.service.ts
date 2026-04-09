import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { User, AuthResponse, LoginRequest, RegisterRequest, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5001/api/v1/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.checkStoredToken();
  }

  private checkStoredToken(): void {
    if (!this.isBrowser) return;
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('current_user');
    if (token && storedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(storedUser));
        this.isAuthenticatedSubject.next(true);
      } catch (e) {
        this.logout();
      }
    }
  }

  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginRequest).pipe(
      tap(response => {
        this.setSession(response);
      })
    );
  }

  register(registerRequest: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerRequest).pipe(
      tap(response => {
        this.setSession(response);
      }),
      catchError(error => {
        console.error('Registration failed', error);
        return throwError(() => error);
      })
    );
  }

  private setSession(authResponse: AuthResponse): void {
    if (!this.isBrowser) return;
    localStorage.setItem('auth_token', authResponse.token);
    localStorage.setItem('current_user', JSON.stringify(authResponse.user));
    localStorage.setItem('token_expiry', new Date().getTime() + authResponse.expiresIn * 1000 + '');
    this.currentUserSubject.next(authResponse.user);
    this.isAuthenticatedSubject.next(true);
  }

  logout(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('token_expiry');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('auth_token');
  }

  hasRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  isCollegeAdmin(): boolean {
    return this.hasRole([UserRole.COLLEGE_ADMIN, UserRole.SUPER_ADMIN]);
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, {}).pipe(
      tap(response => {
        this.setSession(response);
      })
    );
  }

  // Super Admin Methods
  getAllUsers(): Observable<any> {
    const baseApiUrl = this.apiUrl.replace('/auth', '');
    return this.http.get(`${baseApiUrl}/users`);
  }

  deleteUser(userId: string): Observable<any> {
    const baseApiUrl = this.apiUrl.replace('/auth', '');
    return this.http.delete(`${baseApiUrl}/users/${userId}`);
  }

  getAdminLogs(page = 1, limit = 20): Observable<any> {
    const baseApiUrl = this.apiUrl.replace('/auth', '');
    return this.http.get(`${baseApiUrl}/feedback/admin/logs?page=${page}&limit=${limit}`);
  }
}
