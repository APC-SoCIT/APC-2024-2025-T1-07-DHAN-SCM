import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginPresenterService {
  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  login(email: string, password: string, route: ActivatedRoute): void {
    this.authService.login(email, password).subscribe({
      next: () => {
        const returnUrl = route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
        this.showSuccessNotification();
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.showErrorNotification();
      }
    });
  }

  private showSuccessNotification(): void {
    this.snackBar.open('Login successful', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showErrorNotification(): void {
    this.snackBar.open('Login failed. Please check your credentials.', 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
}
