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
