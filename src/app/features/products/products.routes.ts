import { Routes } from '@angular/router';
import { ProductsComponent } from './products.component';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { RoleName } from '../../core/models/role.model';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    component: ProductsComponent,
    canActivate: [authGuard, roleGuard([RoleName.ADMIN, RoleName.INVENTORY_STAFF, RoleName.CUSTOMER])],
    title: 'Product Catalog'
  }
];
