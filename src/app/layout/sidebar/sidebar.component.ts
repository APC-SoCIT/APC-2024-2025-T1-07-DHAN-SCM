import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  // TODO: Implement role-based menu items visibility
  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Products', icon: 'inventory_2', route: '/products', roles: ['admin', 'inventory'] },
    { label: 'Items', icon: 'category', route: '/items', roles: ['admin', 'inventory'] },
    { label: 'Orders', icon: 'shopping_cart', route: '/orders', roles: ['admin', 'customer'] },
    { label: 'Shipments', icon: 'local_shipping', route: '/shipments', roles: ['admin', 'logistics'] },
    { label: 'Users', icon: 'people', route: '/users', roles: ['admin'] },
    { label: 'Reports', icon: 'assessment', route: '/reports', roles: ['admin', 'inventory', 'logistics'] }
  ];
}
