import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Role, RoleName, Permission, PermissionType, ResourceType, DEFAULT_ROLES } from '@core/models/role.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/roles`;
  private currentRoleSubject = new Subject<Role | null>();

  constructor(private http: HttpClient) {}

  getAllRoles(): Observable<Role[]> {
    console.log('[RoleService] Fetching all roles');
    return this.http.get<Role[]>(this.apiUrl).pipe(
      tap(roles => console.log('[RoleService] Roles found:', roles))
    );
  }

  getRoleById(id: string): Observable<Role> {
    console.log(`[RoleService] Fetching role with id: ${id}`);
    return this.http.get<Role>(`${this.apiUrl}/${id}`).pipe(
      tap(role => console.log(`[RoleService] Role found for ${id}:`, role)),
      catchError(error => {
        console.error(`[RoleService] Error fetching role for ${id}:`, error);
        throw error;
      })
    );
  }

  getRoleByName(name: RoleName): Observable<Role | null> {
    // Validate input
    if (!name) {
      console.error(`[RoleService] Attempted to fetch role with empty/undefined name`);
      return of(null);
    }

    console.log(`[RoleService] Fetching role with name: ${name}`);
    
    // Attempt to fetch roles from the API
    return this.http.get<Role[]>(`${this.apiUrl}`).pipe(
      map(roles => {
        // Validate API response
        if (!roles || roles.length === 0) {
          console.error(`[RoleService] No roles found in the database`);
          return null;
        }

        console.log(`[RoleService] Available roles: ${roles.map(r => r.name).join(', ')}`);
        
        // Direct role name matching since we're using enum values
        const matchedRole = roles.find(role => role.name === name);
        
        console.log(`[RoleService] Looking for role: ${name}`);
        console.log(`[RoleService] Found role:`, matchedRole);
        
        if (!matchedRole) {
          console.error(`[RoleService] No matching role found for input: ${name}`);
          console.error(`[RoleService] Available roles: ${roles.map(r => r.name).join(', ')}`);
        }
        
        console.log(`[RoleService] Matched role:`, matchedRole);
        return matchedRole || null;
      }),
      catchError(error => {
        console.error(`[RoleService] Error fetching roles:`, error);
        
        // Fallback to default roles if API call fails
        const defaultRoles: { [key: string]: Role } = {
          'admin': {
            _id: 'default-admin',
            name: RoleName.ADMIN,
            description: 'Full system access with all permissions',
            permissions: Object.values(ResourceType).flatMap(resource => 
              Object.values(PermissionType).map(type => ({ resource, type }))
            ),
            isDefault: false
          },
          'customer': {
            _id: 'default-customer',
            name: RoleName.CUSTOMER,
            description: 'Can create and review purchase orders',
            permissions: [
              { resource: ResourceType.PURCHASE_ORDERS, type: PermissionType.CREATE },
              { resource: ResourceType.PURCHASE_ORDERS, type: PermissionType.READ },
              { resource: ResourceType.PURCHASE_ORDERS, type: PermissionType.LIST }
            ],
            isDefault: false
          },
          'inventory_staff': {
            _id: 'default-inventory-staff',
            name: RoleName.INVENTORY_STAFF,
            description: 'Manage and update inventory items and products',
            permissions: [
              { resource: ResourceType.PRODUCTS, type: PermissionType.CREATE },
              { resource: ResourceType.PRODUCTS, type: PermissionType.READ },
              { resource: ResourceType.PRODUCTS, type: PermissionType.UPDATE },
              { resource: ResourceType.PRODUCTS, type: PermissionType.LIST },
              { resource: ResourceType.INVENTORY_ITEMS, type: PermissionType.CREATE },
              { resource: ResourceType.INVENTORY_ITEMS, type: PermissionType.READ },
              { resource: ResourceType.INVENTORY_ITEMS, type: PermissionType.UPDATE },
              { resource: ResourceType.INVENTORY_ITEMS, type: PermissionType.LIST }
            ],
            isDefault: false
          },
          'logistics_manager': {
            _id: 'default-logistics-manager',
            name: RoleName.LOGISTICS_MANAGER,
            description: 'Track and coordinate shipments and deliveries',
            permissions: [
              { resource: ResourceType.SHIPMENTS, type: PermissionType.CREATE },
              { resource: ResourceType.SHIPMENTS, type: PermissionType.READ },
              { resource: ResourceType.SHIPMENTS, type: PermissionType.UPDATE },
              { resource: ResourceType.SHIPMENTS, type: PermissionType.LIST }
            ],
            isDefault: false
          }
        };

        const fallbackRole = defaultRoles[name] || defaultRoles['admin'];
        console.log(`[RoleService] Using fallback role:`, fallbackRole);
        return of(fallbackRole);
      })
    );
  }

  createRole(role: Role): Observable<Role> {
    console.log(`[RoleService] Creating role:`, role);
    return this.http.post<Role>(this.apiUrl, role).pipe(
      tap(createdRole => console.log(`[RoleService] Role created:`, createdRole)),
      catchError(error => {
        console.error(`[RoleService] Error creating role:`, error);
        throw error;
      })
    );
  }

  updateRole(role: Role): Observable<Role> {
    console.log(`[RoleService] Updating role:`, role);
    return this.http.put<Role>(`${this.apiUrl}/${role._id}`, role).pipe(
      tap(updatedRole => console.log(`[RoleService] Role updated:`, updatedRole)),
      catchError(error => {
        console.error(`[RoleService] Error updating role:`, error);
        throw error;
      })
    );
  }

  deleteRole(id: string): Observable<void> {
    console.log(`[RoleService] Deleting role with id: ${id}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => console.log(`[RoleService] Role deleted: ${id}`)),
      catchError(error => {
        console.error(`[RoleService] Error deleting role:`, error);
        throw error;
      })
    );
  }

  // Check if a role has a specific permission
  hasPermission(role: Role, resource: string, permissionType: PermissionType): boolean {
    console.log(`[RoleService] Checking permission:
      Role: ${role.name}
      Resource: ${resource}
      Permission Type: ${permissionType}
      Role Permissions: ${JSON.stringify(role.permissions)}`);
    
    const hasPermission = role.permissions.some(
      permission => 
        permission.resource === resource && 
        permission.type === permissionType
    );
    
    console.log(`[RoleService] Permission check result: ${hasPermission}`);
    
    return hasPermission;
  }

  // Initialize default roles if not exist
  initializeDefaultRoles(): Observable<Role[]> {
    console.log('[RoleService] Initializing default roles');
    return this.getAllRoles().pipe(
      map(existingRoles => {
        const rolesToCreate = DEFAULT_ROLES.filter(
          defaultRole => !existingRoles.some(
            existingRole => existingRole.name === defaultRole.name
          )
        );
        
        return rolesToCreate;
      }),
      tap(rolesToCreate => console.log('[RoleService] Roles to create:', rolesToCreate)),
      map(rolesToCreate => {
        // Create roles that don't exist
        rolesToCreate.forEach(role => {
          this.createRole(role).subscribe();
        });
        
        return rolesToCreate;
      })
    );
  }

  // Get default role (fallback to first role if no default)
  getDefaultRole(): Observable<Role | null> {
    console.log('[RoleService] Getting default role');
    return this.getRoleByName(RoleName.ADMIN).pipe(
      catchError(() => 
        this.getAllRoles().pipe(
          map(roles => roles.length > 0 ? roles[0] : null)
        )
      )
    );
  }

  // Clear the current role
  clearCurrentRole(): void {
    console.log('[RoleService] Clearing current role');
    
    // Clear the current role subject
    this.currentRoleSubject.next(null);
    
    // Remove any stored role information
    localStorage.removeItem('userRole');
    
    console.log('[RoleService] Current role cleared');
  }
}
