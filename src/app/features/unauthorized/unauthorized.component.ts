import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    MatCardModule,
    MatButtonModule
  ],
  template: `
    <div class="unauthorized-container">
      <mat-card class="unauthorized-card">
        <mat-card-header>
          <mat-card-title>Access Denied</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>{{ errorMessage }}</p>
          <p *ngIf="resourceDetails">
            Attempted to access: {{ resourceDetails }}
          </p>
          <p>Please contact your system administrator if you believe this is an error.</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" routerLink="/">
            Return to Dashboard
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .unauthorized-card {
      max-width: 400px;
      text-align: center;
    }
  `]
})
export class UnauthorizedComponent implements OnInit {
  errorMessage: string = 'You do not have permission to access this page.';
  resourceDetails: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Check query parameters for more details about the unauthorized access
    this.route.queryParams.subscribe(params => {
      const reason = params['reason'];
      const resource = params['resource'];
      const type = params['type'];

      switch (reason) {
        case 'insufficient_permissions':
          this.errorMessage = 'You do not have sufficient permissions for this action.';
          if (resource && type) {
            this.resourceDetails = `Resource: ${resource}, Action: ${type}`;
          }
          break;
        case 'permission_check_error':
          this.errorMessage = 'An error occurred while checking your permissions.';
          break;
        case 'logged_out':
          this.errorMessage = 'You have been logged out. Please log in again.';
          break;
        default:
          this.errorMessage = 'You do not have permission to access this page.';
      }
    });
  }
}
