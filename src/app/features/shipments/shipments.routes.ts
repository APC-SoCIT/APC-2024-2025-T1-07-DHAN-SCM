import { Routes } from '@angular/router';

export const SHIPMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./shipments.component')
      .then(m => m.ShipmentsComponent)
  }
];
