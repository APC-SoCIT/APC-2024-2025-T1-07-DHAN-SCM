import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { authGuard } from '../../core/guards/auth.guard';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="unauthorized-container">
      <h1>Unauthorized Access</h1>
      <p>You do not have permission to access this page.</p>
      <button routerLink="/auth/login">Go to Login</button>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      text-align: center;
    }
  `]
})
export class UnauthorizedComponent {}

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent
  }
];
