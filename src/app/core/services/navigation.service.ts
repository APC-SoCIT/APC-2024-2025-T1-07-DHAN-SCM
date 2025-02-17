import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { RoleName } from '@core/models/role.model';
import { AuthorizationService } from './authorization.service';
import { Role } from '@core/models/role.model';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  allowedRoles: RoleName[];
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private visibleNavItems = new BehaviorSubject<NavItem[]>([]);
  visibleNavItems$ = this.visibleNavItems.asObservable();

  private navigationItems: NavItem[] = [
    // Admin Role - Full System Access
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
      allowedRoles: [RoleName.ADMIN, RoleName.INVENTORY_STAFF, RoleName.LOGISTICS_MANAGER, RoleName.CUSTOMER]
    },
    // Admin-only items
    {
      label: 'Users',
      icon: 'people',
      route: '/users',
      allowedRoles: [RoleName.ADMIN]
    },
    {
      label: 'Roles',
      icon: 'security',
      route: '/roles',
      allowedRoles: [RoleName.ADMIN]
    },
    // Products
    {
      label: 'Products',
      icon: 'inventory_2',
      route: '/products',
      allowedRoles: [RoleName.ADMIN, RoleName.INVENTORY_STAFF, RoleName.CUSTOMER]
    },
    // Inventory
    {
      label: 'Inventory',
      icon: 'inventory',
      route: '/items',
      allowedRoles: [RoleName.ADMIN, RoleName.INVENTORY_STAFF]
    },
    // Purchase Orders
    {
      label: 'Purchase Orders',
      icon: 'shopping_cart',
      route: '/orders',
      allowedRoles: [RoleName.ADMIN, RoleName.INVENTORY_STAFF, RoleName.LOGISTICS_MANAGER, RoleName.CUSTOMER]
    },
    // Shipments
    {
      label: 'Shipments',
      icon: 'local_shipping',
      route: '/shipments',
      allowedRoles: [RoleName.ADMIN, RoleName.LOGISTICS_MANAGER]
    },
    // Reports
    {
      label: 'Reports',
      icon: 'assessment',
      route: '/reports',
      allowedRoles: [RoleName.ADMIN, RoleName.INVENTORY_STAFF, RoleName.LOGISTICS_MANAGER]
    }
  ];

  constructor(
    private authorizationService: AuthorizationService,
    private router: Router
  ) {
    // Initial setup
    this.setupRoleSubscription();
  }

  // Setup role subscription with ability to reset
  private setupRoleSubscription(): void {
    this.authorizationService.currentUserRole$.subscribe(role => {
      console.log('[NavigationService] Role changed:', role);
      
      if (role) {
        const filteredItems = this.getNavigationItems();
        console.log('[NavigationService] Filtered nav items:', 
          JSON.stringify(filteredItems, null, 2)
        );
        this.visibleNavItems.next(filteredItems);
      } else {
        console.log('[NavigationService] No role, clearing navigation items');
        this.visibleNavItems.next([]);
      }
    });
  }

  // Method to force refresh navigation items
  refreshNavigationItems(): void {
    console.log('[NavigationService] Forcing navigation items refresh');
    const currentRole = this.authorizationService.getCurrentUserRole();
    
    if (currentRole) {
      const filteredItems = this.getNavigationItems();
      this.visibleNavItems.next(filteredItems);
    } else {
      this.visibleNavItems.next([]);
    }
  }

  // New method to handle navigation
  navigateTo(route: string): void {
    console.log(`[NavigationService] Navigating to: ${route}`);
    
    // Check if the route is allowed for the current role
    const currentRole = this.authorizationService.getCurrentUserRole();
    if (!currentRole) {
      console.error('[NavigationService] No current role, cannot navigate');
      return;
    }

    const navItem = this.navigationItems.find(item => item.route === route);
    if (!navItem) {
      console.error(`[NavigationService] Route not found: ${route}`);
      return;
    }

    // Check if the route is allowed for the current role
    if (!navItem.allowedRoles.includes(currentRole.name)) {
      console.error(`[NavigationService] Route not allowed for current role: ${route}`);
      this.router.navigate(['/unauthorized'], {
        queryParams: {
          reason: 'insufficient_permissions',
          route: route
        }
      });
      return;
    }

    // Perform navigation
    this.router.navigate([route]);
  }

  getVisibleNavItems(): Observable<NavItem[]> {
    return this.visibleNavItems.asObservable();
  }

  clearNavigationItems(): void {
    console.log('[NavigationService] Clearing navigation items');
    this.visibleNavItems.next([]);
  }

  private getNavigationItems(): NavItem[] {
    // Get the current user role from the authorization service
    const currentRole = this.authorizationService.getCurrentUserRole();
    console.log('[NavigationService] Current role:', currentRole);

    if (!currentRole) {
      console.error('[NavigationService] No role found, returning empty navigation items');
      return [];
    }

    // Log all navigation items before filtering
    console.log('[NavigationService] Total navigation items:', this.navigationItems.length);

    // Filter navigation items based on the current role
    const filteredItems = this.navigationItems.filter(item => {
      // Check if the item's allowed roles include the current role
      const hasAccess = item.allowedRoles.includes(currentRole.name);
      
      console.log(`[NavigationService] Checking navigation item: ${item.label}
        Allowed Roles: ${JSON.stringify(item.allowedRoles)}
        Current Role: ${currentRole.name}
        Has Access: ${hasAccess}`);
      
      return hasAccess;
    });

    console.log('[NavigationService] Filtered navigation items:', 
      JSON.stringify(filteredItems, null, 2)
    );

    return filteredItems;
  }
}
