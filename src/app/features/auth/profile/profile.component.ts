import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService, User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="profile-container">
      <mat-card>
        <mat-card-header>
          <div mat-card-avatar>
            <mat-icon>account_circle</mat-icon>
          </div>
          <mat-card-title>{{ user?.name }}</mat-card-title>
          <mat-card-subtitle>{{ user?.email }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="profile-info">
            <p><strong>Role:</strong> {{ user?.role }}</p>
            <p><strong>ID:</strong> {{ user?.id }}</p>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="onEditProfile()">
            Edit Profile
          </button>
          <button mat-raised-button color="warn" (click)="onLogout()">
            Logout
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }

    .profile-info {
      margin: 20px 0;
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

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  onEditProfile(): void {
    // TODO: Implement edit profile functionality
  }

  onLogout(): void {
    this.authService.logout();
  }
}
