import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Router } from '@angular/router';
import { RoleService } from './role.service';
import { AuthStateService } from './auth-state.service';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private router: Router,
    private roleService: RoleService,
    private authStateService: AuthStateService
  ) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        this.authStateService.updateUserRole(user.role);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        this.logout();
      }
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(response => {
        // Store user in local storage
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);

        // Update current user and role
        this.currentUserSubject.next(response.user);
        this.authStateService.updateUserRole(response.user.role);
      })
    );
  }

  logout(): void {
    // Clear local storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    // Reset current user and role
    this.currentUserSubject.next(null);
    this.authStateService.clearUserRole();

    // Navigate to login page
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token; // Returns true if token exists
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.getValue();
  }

  getCurrentUserToken(): string | null {
    return localStorage.getItem('token');
  }
}
