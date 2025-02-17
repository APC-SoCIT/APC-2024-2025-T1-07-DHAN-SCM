import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, tap, catchError, take } from 'rxjs/operators';
import { 
  Role, 
  PermissionType, 
  ResourceType, 
  RoleName, 
  Permission, 
  DEFAULT_ROLES 
} from '@core/models/role.model';
import { User } from '@core/models/user.model';
import { RoleService } from './role.service';
import { UserService } from './user.service';
import { AuthStateService } from './auth-state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {
  private currentUserRoleSubject = new BehaviorSubject<Role | null>(null);
  currentUserRole$ = this.currentUserRoleSubject.asObservable();

  constructor(
    private roleService: RoleService,
    private userService: UserService,
    private authStateService: AuthStateService
  ) {
    // Listen to role changes from auth state
    this.authStateService.userRole$.subscribe(role => {
      if (role) {
        this.updateCurrentUserRole(role);
      } else {
        this.clearCurrentUserRole();
      }
    });
  }

  private extractCurrentUser(): User | null {
    try {
      const userSource = this.userService.getCurrentUser();
      
      // If it's an observable, try to extract synchronously
      if (userSource instanceof Observable) {
        console.log(`[AuthorizationService] User source is an Observable`);
        
        // This is a synchronous extraction, which might not work perfectly
        let extractedUser: User | null = null;
        userSource.pipe(
          take(1)
        ).subscribe({
          next: (user) => {
            extractedUser = user;
            console.log(`[AuthorizationService] Extracted user from Observable:`, extractedUser);
          },
          error: (err) => {
            console.error(`[AuthorizationService] Error extracting user from Observable:`, err);
            extractedUser = null;
          }
        });
        
        return extractedUser;
      }
      
      // If it's already a user object
      if (userSource && typeof userSource === 'object' && '_id' in userSource) {
        console.log(`[AuthorizationService] Direct user object:`, userSource);
        return userSource as User;
      }
      
      console.error(`[AuthorizationService] Unable to extract current user`);
      return null;
    } catch (error) {
      console.error(`[AuthorizationService] Error in extractCurrentUser:`, error);
      return null;
    }
  }

  private fetchCurrentUserRole(): Observable<Role | null> {
    console.log(`[AuthorizationService] Fetching current user role`);
    
    // Extract current user
    const currentUser = this.extractCurrentUser();
    
    if (!currentUser) {
      console.error(`[AuthorizationService] No current user found`);
      return of(null);
    }
    
    // Convert user role to RoleName
    const roleName = this.convertUserRoleToRoleName(currentUser.role);
    
    console.log(`[AuthorizationService] Converted role name for current user: ${roleName}`);
    
    // Fetch the role
    return this.roleService.getRoleByName(roleName).pipe(
      map(role => {
        console.log(`[AuthorizationService] Fetched role for current user:`, role);
        
        if (!role) {
          console.error(`[AuthorizationService] No role found for current user`);
          console.error(`[AuthorizationService] User details:`, currentUser);
        }
        
        return role || null;
      }),
      catchError(error => {
        console.error(`[AuthorizationService] Error fetching current user role:`, error);
        return of(null);
      })
    );
  }

  private convertUserRoleToRoleName(role: User['role'] | string): RoleName {
    console.log(`[AuthorizationService] Converting role: ${role}`);
    
    // Handle null or undefined input
    if (!role) {
      console.error(`[AuthorizationService] Attempting to convert null/undefined role`);
      return RoleName.CUSTOMER; // Default fallback
    }
    
    // Normalize the role to a string if it's an object
    const roleString = typeof role === 'object' ? (role as User['role']).toString() : role;
    
    // Convert role name to lowercase for consistent matching
    const normalizedRole = roleString.toLowerCase().replace(/\s+/g, '_');
    
    // Convert MongoDB role name to RoleName enum
    switch (normalizedRole) {
      case 'admin':
        return RoleName.ADMIN;
      case 'inventory_staff':
      case 'inventory staff':
        return RoleName.INVENTORY_STAFF;
      case 'logistics_manager':
      case 'logistics manager':
        return RoleName.LOGISTICS_MANAGER;
      case 'customer':
        return RoleName.CUSTOMER;
      default:
        console.error(`[AuthorizationService] Unknown role: ${roleString}, defaulting to CUSTOMER`);
        return RoleName.CUSTOMER;
    }
  }

  private checkPermission(requiredPermission: Permission, userRole: Role): boolean {
    console.log(`[AuthorizationService] Checking permission:`, requiredPermission);
    console.log(`[AuthorizationService] Against role:`, userRole);

    if (!userRole || !userRole.permissions) {
      console.error(`[AuthorizationService] Invalid role or missing permissions`);
      return false;
    }

    // Map 'list' permission to 'read' since they serve the same purpose
    const effectivePermission = {
      ...requiredPermission,
      type: requiredPermission.type === PermissionType.LIST ? PermissionType.READ : requiredPermission.type
    };

    console.log(`[AuthorizationService] Effective permission after mapping:`, effectivePermission);

    // Log all permissions for the role
    console.log(`[AuthorizationService] Role permissions:`, 
      JSON.stringify(userRole.permissions, null, 2)
    );

    // Check if the role has the required permission
    const hasPermission = userRole.permissions.some(rolePermission => {
      const matches = 
        rolePermission.resource === effectivePermission.resource && 
        rolePermission.type === effectivePermission.type;
      
      console.log(`[AuthorizationService] Comparing permissions:
        Required: ${JSON.stringify(effectivePermission)}
        Role Permission: ${JSON.stringify(rolePermission)}
        Matches: ${matches}`);
      
      return matches;
    });

    console.log(`[AuthorizationService] Final permission check result: ${hasPermission}`);
    return hasPermission;
  }

  // Initialize user role with more robust error handling
  private initializeUserRole(): void {
    // Check if user is authenticated first
    const token = localStorage.getItem('token');
    const storedUserRole = localStorage.getItem('userRole');

    if (!token) {
      console.log('[AuthorizationService] No token found, skipping role initialization');
      this.currentUserRoleSubject.next(null);
      return;
    }

    // If stored user role exists, try to use it
    if (storedUserRole) {
      try {
        const roleName = this.convertUserRoleToRoleName(storedUserRole);
        
        this.roleService.getRoleByName(roleName).pipe(
          tap(role => {
            console.log('[AuthorizationService] Initialized role from stored role:', role);
            if (!role) {
              console.error(`[AuthorizationService] Could not find role for: ${storedUserRole}`);
            }
          }),
          catchError(error => {
            console.error('[AuthorizationService] Error fetching role from stored role:', error);
            return of(null);
          })
        ).subscribe({
          next: (role) => this.currentUserRoleSubject.next(role),
          error: (err) => {
            console.error('[AuthorizationService] Error in role initialization:', err);
            this.currentUserRoleSubject.next(null);
          }
        });
      } catch (error) {
        console.error('[AuthorizationService] Error processing stored role:', error);
        this.currentUserRoleSubject.next(null);
      }
      return;
    }

    // If no stored role, fall back to fetching current user role
    this.fetchCurrentUserRole().pipe(
      tap(role => {
        console.log('[AuthorizationService] Initializing user role:', role);
        if (!role) {
          console.error(`[AuthorizationService] No role found during initialization`);
          const currentUser = this.extractCurrentUser();
          console.error(`[AuthorizationService] Current user details:`, currentUser);
        }
      })
    ).subscribe({
      next: (role) => {
        // Store the role name in localStorage for future use
        if (role) {
          localStorage.setItem('userRole', role.name);
          this.currentUserRoleSubject.next(role);
        } else {
          this.currentUserRoleSubject.next(null);
        }
      },
      error: (err) => {
        console.error('[AuthorizationService] Error initializing user role:', err);
        this.currentUserRoleSubject.next(null);
      }
    });
  }

  // Get the current user role synchronously
  getCurrentUserRole(): Role | null {
    console.log('[AuthorizationService] Getting current user role');
    
    // First, check the current role subject
    const currentRole = this.currentUserRoleSubject.value;
    if (currentRole) {
      console.log('[AuthorizationService] Returning role from subject:', currentRole);
      return currentRole;
    }
    
    // If no role in subject, try to get from localStorage
    const storedUserRole = localStorage.getItem('userRole');
    if (storedUserRole) {
      try {
        const roleName = this.convertUserRoleToRoleName(storedUserRole);
        
        // This is a synchronous lookup in predefined roles
        const role = DEFAULT_ROLES.find((r: Role) => r.name === roleName);
        
        console.log('[AuthorizationService] Returning role from localStorage:', role);
        return role || null;
      } catch (error) {
        console.error('[AuthorizationService] Error getting role from localStorage:', error);
      }
    }
    
    console.error('[AuthorizationService] No current user role found');
    return null;
  }

  /**
   * Check if the current user has a specific permission for a resource
   * @param resource The resource type to check permissions for
   * @param permissionType The type of permission to check
   * @returns Observable<boolean> indicating whether the user has the permission
   */
  hasPermission(resource: ResourceType, permissionType: PermissionType): Observable<boolean> {
    console.log(`[AuthorizationService] Checking permission for resource: ${resource}, type: ${permissionType}`);
    
    return this.fetchCurrentUserRole().pipe(
      map(role => {
        if (!role) {
          console.error(`[AuthorizationService] No role found for permission check`);
          const currentUser = this.extractCurrentUser();
          console.error(`[AuthorizationService] Current user details:`, currentUser);
          return false;
        }

        console.log(`[AuthorizationService] Checking permissions for role:
          Role Name: ${role.name}
          Role Permissions: ${JSON.stringify(role.permissions, null, 2)}`);
        
        const requiredPermission: Permission = { resource, type: permissionType };
        const hasPermission = this.checkPermission(requiredPermission, role);
        
        console.log(`[AuthorizationService] Permission check result: ${hasPermission}`);
        return hasPermission;
      })
    );
  }

  // Convenience methods for common permission checks
  canCreate(resource: ResourceType): Observable<boolean> {
    return this.hasPermission(resource, PermissionType.CREATE);
  }

  canRead(resource: ResourceType): Observable<boolean> {
    return this.hasPermission(resource, PermissionType.READ);
  }

  canUpdate(resource: ResourceType): Observable<boolean> {
    return this.hasPermission(resource, PermissionType.UPDATE);
  }

  canDelete(resource: ResourceType): Observable<boolean> {
    return this.hasPermission(resource, PermissionType.DELETE);
  }

  canList(resource: ResourceType): Observable<boolean> {
    return this.hasPermission(resource, PermissionType.LIST);
  }

  // Reload user role (e.g., after role change)
  reloadUserRole(): void {
    this.fetchCurrentUserRole().subscribe({
      next: (role) => {
        console.log('[AuthorizationService] User role:', role);
        if (!role) {
          console.error(`[AuthorizationService] No role found for permission check`);
          const currentUser = this.extractCurrentUser();
          console.error(`[AuthorizationService] Current user details:`, currentUser);
        }
        this.currentUserRoleSubject.next(role);
      },
      error: (err) => {
        console.error('[AuthorizationService] Error fetching user role:', err);
        this.currentUserRoleSubject.next(null);
      }
    });
  }

  // Clear the current user role
  clearUserRole(): void {
    console.log('[AuthorizationService] Clearing user role');
    
    // Remove from localStorage
    localStorage.removeItem('userRole');
    
    // Reset the current user role subject
    this.currentUserRoleSubject.next(null);
    
    // Additional cleanup if needed
    console.log('[AuthorizationService] User role cleared');
  }

  // Update the current user's role
  updateCurrentUserRole(roleName: string): void {
    // Find the role based on the role name
    const role: Role = {
      _id: this.generateRoleId(roleName),
      name: roleName as RoleName,
      description: this.getRoleDescription(roleName),
      permissions: this.getRolePermissions(roleName)
    };

    console.log('[AuthorizationService] Updating current user role:', role);
    this.currentUserRoleSubject.next(role);
  }

  // Clear the current user's role
  clearCurrentUserRole(): void {
    console.log('[AuthorizationService] Clearing current user role');
    this.currentUserRoleSubject.next(null);
  }

  // Helper method to generate a role ID
  private generateRoleId(roleName: string): string {
    return `role_${roleName.toLowerCase().replace(/\s+/g, '_')}`;
  }

  // Helper method to get role description
  private getRoleDescription(roleName: string): string {
    const descriptions: { [key: string]: string } = {
      'ADMIN': 'Full system access with all permissions',
      'INVENTORY_STAFF': 'Manages inventory and product information',
      'LOGISTICS_MANAGER': 'Handles shipments and logistics',
      'CUSTOMER': 'Basic access for viewing and creating orders'
    };
    return descriptions[roleName.toUpperCase()] || 'Unknown Role';
  }

  // Helper method to get role permissions
  private getRolePermissions(roleName: string): Permission[] {
    const rolePermissions: { [key: string]: Permission[] } = {
      'ADMIN': [
        // Users management
        { resource: ResourceType.USERS, type: PermissionType.CREATE },
        { resource: ResourceType.USERS, type: PermissionType.READ },
        { resource: ResourceType.USERS, type: PermissionType.UPDATE },
        { resource: ResourceType.USERS, type: PermissionType.DELETE },
        // Roles management
        { resource: ResourceType.ROLES, type: PermissionType.CREATE },
        { resource: ResourceType.ROLES, type: PermissionType.READ },
        { resource: ResourceType.ROLES, type: PermissionType.UPDATE },
        { resource: ResourceType.ROLES, type: PermissionType.DELETE },
        // Products management
        { resource: ResourceType.PRODUCTS, type: PermissionType.CREATE },
        { resource: ResourceType.PRODUCTS, type: PermissionType.READ },
        { resource: ResourceType.PRODUCTS, type: PermissionType.UPDATE },
        { resource: ResourceType.PRODUCTS, type: PermissionType.DELETE },
        // Inventory management
        { resource: ResourceType.INVENTORY_ITEMS, type: PermissionType.CREATE },
        { resource: ResourceType.INVENTORY_ITEMS, type: PermissionType.READ },
        { resource: ResourceType.INVENTORY_ITEMS, type: PermissionType.UPDATE },
        { resource: ResourceType.INVENTORY_ITEMS, type: PermissionType.DELETE },
        // Orders management
        { resource: ResourceType.PURCHASE_ORDERS, type: PermissionType.CREATE },
        { resource: ResourceType.PURCHASE_ORDERS, type: PermissionType.READ },
        { resource: ResourceType.PURCHASE_ORDERS, type: PermissionType.UPDATE },
        { resource: ResourceType.PURCHASE_ORDERS, type: PermissionType.DELETE },
        // Shipments management
        { resource: ResourceType.SHIPMENTS, type: PermissionType.CREATE },
        { resource: ResourceType.SHIPMENTS, type: PermissionType.READ },
        { resource: ResourceType.SHIPMENTS, type: PermissionType.UPDATE },
        { resource: ResourceType.SHIPMENTS, type: PermissionType.DELETE }
      ],
      'INVENTORY_STAFF': [
        // Products management (no delete)
        { resource: ResourceType.PRODUCTS, type: PermissionType.CREATE },
        { resource: ResourceType.PRODUCTS, type: PermissionType.READ },
        { resource: ResourceType.PRODUCTS, type: PermissionType.UPDATE },
        // Full inventory management
        { resource: ResourceType.INVENTORY_ITEMS, type: PermissionType.CREATE },
        { resource: ResourceType.INVENTORY_ITEMS, type: PermissionType.READ },
        { resource: ResourceType.INVENTORY_ITEMS, type: PermissionType.UPDATE },
        { resource: ResourceType.INVENTORY_ITEMS, type: PermissionType.DELETE },
        // View orders
        { resource: ResourceType.PURCHASE_ORDERS, type: PermissionType.READ }
      ],
      'LOGISTICS_MANAGER': [
        // Full shipments management
        { resource: ResourceType.SHIPMENTS, type: PermissionType.CREATE },
        { resource: ResourceType.SHIPMENTS, type: PermissionType.READ },
        { resource: ResourceType.SHIPMENTS, type: PermissionType.UPDATE },
        { resource: ResourceType.SHIPMENTS, type: PermissionType.DELETE },
        // Update order status
        { resource: ResourceType.PURCHASE_ORDERS, type: PermissionType.READ },
        { resource: ResourceType.PURCHASE_ORDERS, type: PermissionType.UPDATE },
        // View inventory
        { resource: ResourceType.INVENTORY_ITEMS, type: PermissionType.READ }
      ],
      'CUSTOMER': [
        // View products
        { resource: ResourceType.PRODUCTS, type: PermissionType.READ },
        // Manage own orders
        { resource: ResourceType.PURCHASE_ORDERS, type: PermissionType.CREATE },
        { resource: ResourceType.PURCHASE_ORDERS, type: PermissionType.READ }
      ]
    };
    return rolePermissions[roleName.toUpperCase()] || [];
  }


}
