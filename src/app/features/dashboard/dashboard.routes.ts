import { Routes } from '@angular/router';
import { DashboardHomeComponent } from './dashboard.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardHomeComponent,
    title: 'Dashboard'
  }
];
