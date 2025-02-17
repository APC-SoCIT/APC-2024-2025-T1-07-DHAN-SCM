import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { RoleName } from '../../core/models/role.model';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./reports.component')
      .then(m => m.ReportsComponent),
    canActivate: [authGuard, roleGuard([RoleName.ADMIN, RoleName.INVENTORY_STAFF, RoleName.LOGISTICS_MANAGER])],
    title: 'Reports'
  }
];
