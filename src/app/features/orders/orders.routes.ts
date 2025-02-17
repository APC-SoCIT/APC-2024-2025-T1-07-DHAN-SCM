import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { RoleName } from '../../core/models/role.model';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./orders.component')
      .then(m => m.OrdersComponent),
    canActivate: [authGuard, roleGuard([RoleName.ADMIN, RoleName.INVENTORY_STAFF, RoleName.LOGISTICS_MANAGER, RoleName.CUSTOMER])],
    title: 'Purchase Orders'
  }
];
