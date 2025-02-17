import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { RoleName } from '../../core/models/role.model';

export const ITEMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./items.component')
      .then(m => m.ItemsComponent),
    canActivate: [authGuard, roleGuard([RoleName.ADMIN, RoleName.INVENTORY_STAFF, RoleName.LOGISTICS_MANAGER])],
    title: 'Inventory Items'
  }
];
