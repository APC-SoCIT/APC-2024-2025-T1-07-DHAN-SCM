# Frontend Documentation

## Architecture Overview

The frontend is built using Angular 17 with a focus on standalone components and modern architectural patterns.

### Core Module

The core module contains essential services and utilities used throughout the application:

#### Services
- **ApiService**: Base service for HTTP requests
- **AuthService**: Handles user authentication and session management
- **ErrorService**: Manages error notifications using Material Snackbar
- **LoadingService**: Controls loading state across the application

#### Interceptors
- **AuthInterceptor**: Adds JWT token to authenticated requests
- **ErrorInterceptor**: Global error handling for HTTP requests
- **LoadingInterceptor**: Shows/hides loading spinner during HTTP requests

#### Guards
- **AuthGuard**: Protects routes from unauthorized access

### Feature Modules

The application is organized into feature modules:

#### Authentication
- Login component with form validation
- Profile component for user information
- Protected routes with auth guard

#### Dashboard
- Main layout with header and sidebar
- Navigation menu for all features
- User menu with profile and logout options
- Dashboard features:
  - Summary cards (Total Items, Maintenance Due, Warranty Expiring, Calibration Status)
  - Status and Category Distribution charts
  - Maintenance Schedule timeline
  - Recent Activities log

#### Items Management
- List view of all inventory items
- Add item dialog with form validation
  - Required fields: serialNumber, productId, status, purchaseInfo.date
  - Optional fields: purchaseInfo.cost, purchaseInfo.supplier, purchaseInfo.orderReference
  - Optional warranty information with start/end dates
- Item details view with maintenance history
- Status updates and maintenance recording

#### Products
### Overview
The Products page provides a comprehensive interface for managing product inventory, allowing users to view, add, edit, and delete products.

### Components

#### ProductsComponent
- **Location**: `src/app/features/products/products.component.ts`
- **Functionality**:
  - Display a table of products with sortable columns
  - Implement search/filter functionality
  - Provide actions for adding, editing, and deleting products

#### Dialogs
1. **AddProductDialogComponent**
   - Location: `src/app/features/products/dialogs/add-product-dialog.component.ts`
   - Allows creation of new products
   - Form validation for product details

2. **EditProductDialogComponent**
   - Location: `src/app/features/products/dialogs/edit-product-dialog.component.ts`
   - Enables editing existing product information
   - Pre-fills form with current product details

### Product Model
```typescript
interface Product {
  _id?: string;
  name: string;
  model: string;
  manufacturer: string;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Features
- Responsive table with pagination
- Sortable columns
- Real-time search functionality
- Add/Edit/Delete product actions
- Form validation
- Error handling

### State Management
- Uses Angular's reactive forms
- Utilizes ProductService for API interactions
- Implements optimistic UI updates

### Best Practices
- Standalone components
- Lazy loading
- Separation of concerns
- Consistent error handling
- Responsive design

### Future Enhancements
- Advanced filtering
- Export functionality
- Bulk actions
- Detailed product view

### Shared Components

#### UI Components
- LoadingSpinner: Global loading indicator
- Error notifications using Material Snackbar
- Material UI components for consistent design

### State Management

The application uses NgRx for state management:
- Store setup completed
- Effects configuration ready
- DevTools enabled for debugging

### Environment Configuration

Two environment configurations:
- `environment.ts`: Development settings
- `environment.prod.ts`: Production settings

### Security

- JWT-based authentication
- Protected routes using AuthGuard
- HTTP interceptors for token management
- Secure storage of user credentials

## Role-Based Access Control (RBAC)

### RBAC Implementation Strategy
- **Approach**: Dynamic, granular access management
- **Key Components**:
  * Role-based route guards
  * Conditional UI rendering
  * Dynamic menu generation

### Role Definitions
1. **Admin**
   - Full system access
   - Manage users, roles, and configuration
   - Access all reports and metrics

2. **Inventory Staff**
   - Manage products and inventory
   - Limited reporting capabilities
   - Cannot modify system settings

3. **Logistics Manager**
   - Manage shipments and order statuses
   - View inventory and purchase orders
   - Generate logistics reports

4. **Customer**
   - Track personal orders
   - View product catalog
   - Manage personal profile

### Frontend RBAC Techniques

#### 1. Route Guards
```typescript
@Injectable()
export class RoleGuard implements CanActivate {
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const requiredRole = route.data['role'];
    return this.authService.hasPermission(requiredRole);
  }
}

// Route configuration example
const routes: Routes = [
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [RoleGuard],
    data: { role: 'ADMIN' }
  }
];
```

#### 2. Conditional Rendering
```typescript
@Component({
  template: `
    <div *ngIf="authService.hasPermission('MANAGE_USERS')">
      <user-management-panel></user-management-panel>
    </div>
  `
})
export class AdminComponent {
  constructor(public authService: AuthorizationService) {}
}
```

#### 3. Dynamic Navigation
```typescript
@Injectable()
export class NavigationService {
  getMenuItems(role: string): MenuItem[] {
    const menuMap = {
      'ADMIN': [
        { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
        { label: 'User Management', icon: 'people', route: '/admin/users' }
      ],
      'INVENTORY_STAFF': [
        { label: 'Inventory', icon: 'inventory', route: '/inventory' }
      ]
      // Other role-based menus
    };

    return menuMap[role] || [];
  }
}
```

### Permission Checking Service
```typescript
@Injectable({ providedIn: 'root' })
export class AuthorizationService {
  private permissions = {
    'ADMIN': ['*'],
    'INVENTORY_STAFF': [
      'VIEW_PRODUCTS', 
      'MANAGE_INVENTORY'
    ],
    'LOGISTICS_MANAGER': [
      'VIEW_SHIPMENTS', 
      'MANAGE_ORDERS'
    ],
    'CUSTOMER': [
      'VIEW_OWN_ORDERS'
    ]
  };

  hasPermission(role: string, permission?: string): boolean {
    const userRole = this.getCurrentUserRole();
    
    if (permission) {
      return this.permissions[userRole]?.includes(permission) || 
             this.permissions[userRole]?.includes('*');
    }
    
    return !!this.permissions[userRole];
  }
}
```

### Best Practices
- Implement least privilege principle
- Use fine-grained permissions
- Validate permissions on both client and server
- Implement secure role assignment

### Security Considerations
- Prevent client-side permission manipulation
- Use server-side permission validation
- Implement comprehensive logging
- Regularly audit role assignments

### Performance Optimization
- Cache role permissions
- Minimize permission check complexity
- Use efficient lookup strategies

### Future Enhancements
- Dynamic role creation
- More granular permission levels
- Advanced role inheritance
- External identity provider integration

## UI/UX Design System

### Recent Improvements (February 2025)
- **Design Philosophy**: Modern, Minimalist, Accessible
- **Color Palette**: Refined with professional, cohesive color scheme
- **Typography**: Enhanced readability and consistency
- **Component Interactions**: Streamlined and purposeful

### Login Page Refinements
- Redesigned interface with clean, minimalist approach
- Responsive design for multiple screen sizes
- Improved form validation and error handling
- Integrated Megaion branding elements

### Navigation Improvements
- Modernized sidebar navigation
- Consistent logo placement
- Improved active and hover states
- Optimized user interaction

## Technology Stack
- **Framework**: Angular 17
- **UI Library**: Angular Material
- **Styling**: SCSS with global design system
- **State Management**: NgRx

## Design Principles
1. **Clarity**: Simple, intuitive interfaces
2. **Consistency**: Uniform design across components
3. **Performance**: Lightweight, responsive interactions
4. **Accessibility**: Inclusive design for all users

## Component Design Guidelines
- Use Angular Material components
- Implement responsive design
- Follow WCAG accessibility standards
- Minimize unnecessary animations
- Prioritize user experience

## Styling Approach
- Utilize CSS variables for theming
- Implement mobile-first design
- Use flexbox and grid for layouts
- Maintain consistent padding and margins

## Performance Considerations
- Lazy load components
- Minimize DOM manipulations
- Use Angular's change detection strategies
- Optimize asset loading

## Future Improvements
- Continuous UX refinement
- Accessibility enhancements
- Performance optimizations

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Best Practices

1. **Component Organization**
   - Use standalone components
   - Keep components focused and single-responsibility
   - Implement lazy loading for feature modules

2. **State Management**
   - Use services for simple state
   - Implement NgRx for complex state
   - Follow immutability principles

3. **Error Handling**
   - Centralized error handling through interceptor
   - User-friendly error messages
   - Proper error logging

4. **Authentication**
   - Secure token storage
   - Protected routes
   - Clear session management

## Future Improvements

1. **Features to Implement**
   - Complete product management UI
   - Implement item tracking interface
   - Add reporting dashboard
   - Enhanced user profile management

2. **Technical Enhancements**
   - Add comprehensive unit tests
   - Implement E2E testing
   - Add performance monitoring
   - Enhanced error tracking

3. **Security Enhancements**
   - Role-based access control
   - Enhanced password policies
   - Session timeout handling
   - Security headers configuration

## Troubleshooting RBAC
- Verify role assignment
- Check permission mappings
- Review authorization service
- Monitor access logs

## Testing RBAC
- Unit tests for permission checks
- Integration tests for role-based access
- Simulate different user roles
- Verify UI restrictions
