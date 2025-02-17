import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User } from '@core/models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Try to load user from local storage on service initialization
    this.loadUserFromLocalStorage();
  }

  // Create a new user
  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user).pipe(
      tap(createdUser => {
        // Optionally handle user creation logic
      })
    );
  }

  // Get all users
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  // Get user by ID
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // Update user
  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${user._id}`, user).pipe(
      tap(updatedUser => {
        // If updating current user, update local storage
        if (this.currentUserSubject.value?._id === updatedUser._id) {
          this.setCurrentUser(updatedUser);
        }
      })
    );
  }

  // Delete user
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get current logged-in user
  getCurrentUser(): Observable<User | null> {
    return this.currentUser$;
  }

  // Set current user (typically after login)
  setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }

  // Load user from local storage
  private loadUserFromLocalStorage(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch (error) {
        // Clear invalid local storage
        localStorage.removeItem('currentUser');
      }
    }
  }

  // Logout
  logout(): void {
    this.setCurrentUser(null);
  }
}
