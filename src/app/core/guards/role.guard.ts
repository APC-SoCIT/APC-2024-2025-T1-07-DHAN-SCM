import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthorizationService } from '../services/authorization.service';
import { map, take } from 'rxjs/operators';
import { Role, RoleName } from '../models/role.model';

export const roleGuard = (allowedRoles: RoleName[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthorizationService);
    const router = inject(Router);

    return authService.currentUserRole$.pipe(
      take(1),
      map((role: Role | null) => {
        if (!role) return false;
        
        const hasPermission = allowedRoles.includes(role.name);

        if (!hasPermission) {
          console.log('Access denied. Required roles:', allowedRoles, 'User role:', role);
          router.navigate(['/unauthorized']);
          return false;
        }

        return true;
      })
    );
  };
};
