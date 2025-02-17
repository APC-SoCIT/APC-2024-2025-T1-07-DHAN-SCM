export enum RoleName {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  INVENTORY_STAFF = 'inventory_staff',
  LOGISTICS_MANAGER = 'logistics_manager'
}

// Display names for roles in the UI
export const RoleDisplayNames: { [key in RoleName]: string } = {
  [RoleName.ADMIN]: 'Admin',
  [RoleName.CUSTOMER]: 'Customer',
  [RoleName.INVENTORY_STAFF]: 'Inventory Staff',
  [RoleName.LOGISTICS_MANAGER]: 'Logistics Manager'
};

export enum ResourceType {
  PRODUCTS = 'products',
  PURCHASE_ORDERS = 'purchase_orders',
  INVENTORY_ITEMS = 'inventory_items',
  SHIPMENTS = 'shipments',
  USERS = 'users',
  ROLES = 'roles'
}

export enum PermissionType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list'
}

export interface Permission {
  resource: ResourceType;
  type: PermissionType;
}

export interface Role {
  _id?: string;
  name: RoleName;
  description?: string;
  permissions: Permission[];
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Predefined role configurations
export const DEFAULT_ROLES: Role[] = [
  {
    name: RoleName.ADMIN,
    description: 'Full system access with all permissions',
    permissions: [
      // Users Management
      { resource: ResourceType.USERS, type: PermissionType.CREATE },
      { resource: ResourceType.USERS, type: PermissionType.READ },
      { resource: ResourceType.USERS, type: PermissionType.UPDATE },
      { resource: ResourceType.USERS, type: PermissionType.DELETE },
      
      // Roles Management
      { resource: ResourceType.ROLES, type: PermissionType.CREATE },
      { resource: ResourceType.ROLES, type: PermissionType.READ },
      { resource: ResourceType.ROLES, type: PermissionType.UPDATE },
      { resource: ResourceType.ROLES, type: PermissionType.DELETE },
      
      // Products
      { resource: ResourceType.PRODUCTS, type: PermissionType.CREATE },
      { resource: ResourceType.PRODUCTS, type: PermissionType.READ },
      { resource: ResourceType.PRODUCTS, type: PermissionType.UPDATE },
      { resource: ResourceType.PRODUCTS, type: PermissionType.DELETE },
      
      // Inventory
      { resource: ResourceType.INVENTORY_ITEMS, type: PermissionType.CREATE },
      { resource: ResourceType.INVENTORY_ITEMS, type: PermissionType.READ },
      { resource: ResourceType.INVENTORY_ITEMS, type: PermissionType.UPDATE },
      { resource: ResourceType.INVENTORY_ITEMS, type: PermissionType.DELETE },
      
      // Purchase Orders
      { resource: ResourceType.PURCHASE_ORDERS, type: PermissionType.CREATE },
      { resource: ResourceType.PURCHASE_ORDERS, type: PermissionType.READ },
      { resource: ResourceType.PURCHASE_ORDERS, type: PermissionType.UPDATE },
      { resource: ResourceType.PURCHASE_ORDERS, type: PermissionType.DELETE },
      
      // Shipments
      { resource: ResourceType.SHIPMENTS, type: PermissionType.CREATE },
      { resource: ResourceType.SHIPMENTS, type: PermissionType.READ },
      { resource: ResourceType.SHIPMENTS, type: PermissionType.UPDATE },
      { resource: ResourceType.SHIPMENTS, type: PermissionType.DELETE }
    ],
    isDefault: true
  },
  {
    name: RoleName.INVENTORY_STAFF,
    description: 'Manage inventory and products',
    permissions: [
      // Dashboard (inventory metrics)
      { resource: ResourceType.PRODUCTS, type: PermissionType.READ },
      
      // Products (create, read, update - no delete)
      { resource: ResourceType.PRODUCTS, type: PermissionType.CREATE },
      { resource: ResourceType.PRODUCTS, type: PermissionType.UPDATE },
      
      // Inventory (full management)
      { resource: ResourceType.INVENTORY_ITEMS, type: PermissionType.CREATE },
      { resource: ResourceType.INVENTORY_ITEMS, type: PermissionType.READ },
      { resource: ResourceType.INVENTORY_ITEMS, type: PermissionType.UPDATE },
      { resource: ResourceType.INVENTORY_ITEMS, type: PermissionType.DELETE },
      
      // Purchase Orders (view only)
      { resource: ResourceType.PURCHASE_ORDERS, type: PermissionType.READ }
    ],
    isDefault: false
  },
  {
    name: RoleName.LOGISTICS_MANAGER,
    description: 'Manage shipments and track orders',
    permissions: [
      // Dashboard (logistics metrics)
      { resource: ResourceType.SHIPMENTS, type: PermissionType.READ },
      
      // Shipments (full management)
      { resource: ResourceType.SHIPMENTS, type: PermissionType.CREATE },
      { resource: ResourceType.SHIPMENTS, type: PermissionType.READ },
      { resource: ResourceType.SHIPMENTS, type: PermissionType.UPDATE },
      { resource: ResourceType.SHIPMENTS, type: PermissionType.DELETE },
      
      // Purchase Orders (view and update status)
      { resource: ResourceType.PURCHASE_ORDERS, type: PermissionType.READ },
      { resource: ResourceType.PURCHASE_ORDERS, type: PermissionType.UPDATE },
      
      // Inventory (view only)
      { resource: ResourceType.INVENTORY_ITEMS, type: PermissionType.READ }
    ],
    isDefault: false
  },
  {
    name: RoleName.CUSTOMER,
    description: 'Limited access for customers',
    permissions: [
      // Dashboard (personal order stats)
      { resource: ResourceType.PURCHASE_ORDERS, type: PermissionType.READ },
      
      // Products (view catalog)
      { resource: ResourceType.PRODUCTS, type: PermissionType.READ },
      
      // Purchase Orders (create and view own)
      { resource: ResourceType.PURCHASE_ORDERS, type: PermissionType.CREATE }
    ],
    isDefault: false
  }
];
