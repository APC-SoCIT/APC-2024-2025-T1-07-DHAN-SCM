import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { RoleName } from '../../core/models/role.model';

export const SHIPMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./shipments.component')
      .then(m => m.ShipmentsComponent),
    canActivate: [authGuard, roleGuard([RoleName.ADMIN, RoleName.LOGISTICS_MANAGER])],
    title: 'Shipments'
  }
];
