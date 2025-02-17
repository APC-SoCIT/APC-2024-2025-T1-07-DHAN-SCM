import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private userRoleSubject = new BehaviorSubject<string | null>(null);
  userRole$ = this.userRoleSubject.asObservable();

  updateUserRole(role: string | null): void {
    this.userRoleSubject.next(role);
  }

  clearUserRole(): void {
    this.userRoleSubject.next(null);
  }
}
