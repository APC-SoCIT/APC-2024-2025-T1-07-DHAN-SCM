import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();

  console.log('[AuthGuard] Checking authentication');
  console.log('[AuthGuard] Requested route:', state.url);
  console.log('[AuthGuard] Is Authenticated:', isAuthenticated);

  if (isAuthenticated) {
    return true;
  }

  // Redirect to login with return URL
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};
