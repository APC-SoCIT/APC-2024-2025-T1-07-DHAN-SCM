import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService, User } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card *ngIf="user" class="profile-card">
      <mat-card-header>
        <div mat-card-avatar>
          <mat-icon>account_circle</mat-icon>
        </div>
        <mat-card-title>{{ user.name }}</mat-card-title>
        <mat-card-subtitle>{{ user.email }}</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <div class="profile-info">
          <p><strong>Role:</strong> {{ user.role }}</p>
          <p><strong>ID:</strong> {{ user.id }}</p>
        </div>
      </mat-card-content>
      
      <mat-card-actions>
        <button mat-raised-button color="primary" (click)="editProfile()">Edit Profile</button>
        <button mat-raised-button color="warn" (click)="logout()">Logout</button>
      </mat-card-actions>
    </mat-card>
    
    <div *ngIf="!user" class="no-user-message">
      <p>Please log in to view your profile.</p>
      <button mat-raised-button color="primary" (click)="goToLogin()">Login</button>
    </div>
  `,
  styles: [`
    .profile-card {
      max-width: 400px;
      margin: 20px auto;
    }
    .profile-info {
      margin: 15px 0;
    }
    .no-user-message {
      text-align: center;
      margin-top: 50px;
    }
    .profile-container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }
    mat-card-actions {
      display: flex;
      gap: 10px;
      padding: 16px;
    }
    [mat-card-avatar] {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  editProfile(): void {
    // Implement profile editing logic
    console.log('Edit profile clicked');
  }

  logout(): void {
    this.authService.logout();
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
