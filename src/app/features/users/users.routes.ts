import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';
import { authGuard } from '@core/guards/auth.guard';
import { RoleName } from '@core/models/role.model';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./users.component')
      .then(m => m.UsersComponent),
    canActivate: [authGuard, roleGuard([RoleName.ADMIN])]
  }
];
