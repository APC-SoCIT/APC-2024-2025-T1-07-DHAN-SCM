# API Documentation

## Authentication Endpoints

### Register User (Admin Only)
```http
POST /api/auth/users
Authorization: Bearer <admin_token>
Content-Type: application/json

Request:
{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "secure_password",
    "role": "inventory_staff",
    "firstName": "John",
    "lastName": "Doe"
}

Response: 201 Created
{
    "_id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "inventory_staff",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true
}

Errors:
400 Bad Request - Invalid input or email exists
401 Unauthorized - Invalid token
403 Forbidden - Not an admin
```

### Login
```http
POST /api/auth/users/login
Content-Type: application/json

Request:
{
    "email": "john@example.com",
    "password": "secure_password"
}

Response: 200 OK
{
    "user": {
        "_id": "user_id",
        "username": "john_doe",
        "email": "john@example.com",
        "role": "inventory_staff",
        "firstName": "John",
        "lastName": "Doe",
        "isActive": true,
        "lastLogin": "2025-02-13T06:59:20.782Z"
    },
    "token": "jwt_token_here"
}

Errors:
400 Bad Request - Invalid credentials
401 Unauthorized - Account inactive
```

### Logout
```http
POST /api/auth/users/logout
Authorization: Bearer <token>

Response: 200 OK
{
    "message": "Logged out successfully"
}

Errors:
401 Unauthorized - Invalid token
```

### Logout All Sessions
```http
POST /api/auth/users/logoutAll
Authorization: Bearer <token>
```

### Get Current User Profile
```http
GET /api/auth/users/me
Authorization: Bearer <token>

Response: 200 OK
{
    "_id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "inventory_staff",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true,
    "lastLogin": "2025-02-13T06:59:20.782Z"
}

Errors:
401 Unauthorized - Invalid token
```

### Update Current User Profile
```http
PATCH /api/auth/users/me
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
    "firstName": "John",
    "lastName": "Doe",
    "password": "new_password"
}

Response: 200 OK
{
    "_id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "inventory_staff",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true,
    "lastLogin": "2025-02-13T06:59:20.782Z"
}

Errors:
400 Bad Request - Invalid input
401 Unauthorized - Invalid token
```

### Get All Users (Admin Only)
```http
GET /api/auth/users
Authorization: Bearer <admin_token>

Query Parameters:
- page (optional): Page number (default: 1)
- limit (optional): Items per page (default: 10)
- role (optional): Filter by role
- search (optional): Search by email or username

Response: 200 OK
{
    "users": [
        {
            "_id": "user_id",
            "username": "john_doe",
            "email": "john@example.com",
            "role": "inventory_staff",
            "firstName": "John",
            "lastName": "Doe",
            "isActive": true,
            "lastLogin": "2025-02-13T06:59:20.782Z"
        }
    ],
    "total": 1,
    "page": 1,
    "totalPages": 1
}

Errors:
401 Unauthorized - Invalid token
403 Forbidden - Not an admin
```

### Update User (Admin Only)
```http
PATCH /api/auth/users/:id
Authorization: Bearer <admin_token>

{
    "role": "inventory_staff",
    "isActive": true
}
```

## Role-Based Access Control

### Available Roles
- `admin`: Full system access
- `customer`: Can create and review purchase orders
- `inventory_staff`: Can manage stock levels
- `logistics_manager`: Can track shipments and coordinate deliveries

### Role Permissions
- **Admin**
  - User management
  - System configuration
  - Full access to all features

- **Customer**
  - Create purchase orders

- **Inventory Staff**
  - Access inventory summary
  - Update item status
  - Record maintenance and calibration
  - Generate inventory reports
  - View stock alerts

## Inventory Management Endpoints

### Create New Item
```http
POST /api/items
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
    "serialNumber": "XR3000-ABC123",
    "productId": "product_id",
    "status": "inventory",
    "purchaseInfo": {
        "date": "2025-02-13T00:00:00.000Z",  // Required
        "cost": 50000,
        "supplier": "Medical Supplies Inc",
        "orderReference": "PO-2025-001"
    },
    "warranty": {
        "startDate": "2025-02-13T00:00:00.000Z",
        "endDate": "2026-02-13T00:00:00.000Z",
        "claimHistory": []  // Required array, can be empty initially
    }
}

Response: 201 Created
{
    "_id": "item_id",
    "serialNumber": "XR3000-ABC123",
    "productId": "product_id",
    "status": "inventory",
    "purchaseInfo": {
        "date": "2025-02-13T00:00:00.000Z",
        "cost": 50000,
        "supplier": "Medical Supplies Inc",
        "orderReference": "PO-2025-001"
    },
    "warranty": {
        "startDate": "2025-02-13T00:00:00.000Z",
        "endDate": "2026-02-13T00:00:00.000Z",
        "claimHistory": []
    },
    "createdAt": "2025-02-13T00:00:00.000Z",
    "updatedAt": "2025-02-13T00:00:00.000Z"
}

Errors:
400 Bad Request - Invalid input or missing required fields
401 Unauthorized - Invalid token
```

## Inventory Management Endpoints

### Get Inventory Summary
```http
GET /api/inventory/summary
Authorization: Bearer <token>

Response: 200 OK
[
    {
        "_id": "product_id",
        "productName": "Digital X-Ray Machine",
        "statusCounts": [
            { "status": "inventory", "count": 3 },
            { "status": "demo", "count": 1 },
            { "status": "delivery", "count": 1 }
        ],
        "totalCount": 5
    }
]

Errors:
401 Unauthorized - Invalid token
```

### Get Maintenance Due Items
```http
GET /api/inventory/maintenance-due
Authorization: Bearer <token>

Response: 200 OK
[
    {
        "_id": "item_id",
        "serialNumber": "XR3000-ABC123",
        "productName": "Digital X-Ray Machine",
        "status": "inventory",
        "lastMaintenance": {
            "date": "2024-12-01T00:00:00.000Z",
            "type": "preventive",
            "nextDueDate": "2025-02-01T00:00:00.000Z"
        },
        "lastCalibration": {
            "date": "2024-11-15T00:00:00.000Z",
            "nextDueDate": "2025-02-15T00:00:00.000Z"
        }
    }
]

Errors:
401 Unauthorized - Invalid token
```

### Get Warranty Expiring Items
```http
GET /api/inventory/warranty-expiring
Authorization: Bearer <token>

Response: 200 OK
[
    {
        "_id": "item_id",
        "serialNumber": "XR3000-ABC123",
        "productName": "Digital X-Ray Machine",
        "status": "inventory",
        "warrantyEnd": "2025-03-01T00:00:00.000Z"
    }
]

Errors:
401 Unauthorized - Invalid token
```

### Update Item Status
```http
PATCH /api/inventory/:id/status
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
    "status": "demo",
    "notes": "Sent for product demonstration",
    "destinationInfo": {  // Required if status is 'delivery'
        "customerName": "City Hospital",
        "address": "123 Medical Center Blvd",
        "contactPerson": "Dr. Smith",
        "contactNumber": "+1-555-0123"
    }
}

Response: 200 OK
{
    "_id": "item_id",
    "serialNumber": "XR3000-ABC123",
    "status": "demo",
    "statusHistory": [
        {
            "status": "demo",
            "date": "2025-02-13T09:10:30.000Z",
            "changedBy": "user_id",
            "notes": "Sent for product demonstration"
        }
    ]
}

Errors:
400 Bad Request - Invalid status
401 Unauthorized - Invalid token
404 Not Found - Item not found
```

### Record Maintenance
```http
POST /api/inventory/:id/maintenance
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
    "type": "preventive",
    "description": "Regular maintenance check",
    "performedBy": "John Doe",
    "nextDueDate": "2025-05-13T00:00:00.000Z",
    "attachments": ["maintenance_report.pdf"],
    "cost": 500
}

Response: 201 Created
{
    "_id": "item_id",
    "serialNumber": "XR3000-ABC123",
    "maintenanceHistory": [
        {
            "date": "2025-02-13T09:10:30.000Z",
            "type": "preventive",
            "description": "Regular maintenance check",
            "performedBy": "John Doe",
            "nextDueDate": "2025-05-13T00:00:00.000Z",
            "attachments": ["maintenance_report.pdf"],
            "cost": 500
        }
    ]
}

Errors:
400 Bad Request - Invalid input
401 Unauthorized - Invalid token
404 Not Found - Item not found
```

### Record Calibration
```http
POST /api/inventory/:id/calibration
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
    "performedBy": "John Doe",
    "certificate": "CAL2025-123",
    "nextDueDate": "2025-05-13T00:00:00.000Z",
    "results": "All parameters within acceptable range"
}

Response: 201 Created
{
    "_id": "item_id",
    "serialNumber": "XR3000-ABC123",
    "calibrationHistory": [
        {
            "date": "2025-02-13T09:10:30.000Z",
            "performedBy": "John Doe",
            "certificate": "CAL2025-123",
            "nextDueDate": "2025-05-13T00:00:00.000Z",
            "results": "All parameters within acceptable range"
        }
    ]
}

Errors:
400 Bad Request - Invalid input
401 Unauthorized - Invalid token
404 Not Found - Item not found
```

### Generate Inventory Report
```http
GET /api/inventory/report
Authorization: Bearer <token>

Response: 200 OK
[
    {
        "category": "Imaging Equipment",
        "products": [
            {
                "productName": "Digital X-Ray Machine",
                "serialNumber": "XR3000-ABC123",
                "status": "inventory",
                "lastMaintenance": {
                    "date": "2024-12-01T00:00:00.000Z",
                    "type": "preventive"
                },
                "lastCalibration": {
                    "date": "2024-11-15T00:00:00.000Z"
                },
                "warrantyEnd": "2025-12-31T00:00:00.000Z"
            }
        ],
        "totalItems": 5,
        "statusBreakdown": {
            "inventory": 3,
            "demo": 1,
            "delivery": 1
        }
    }
]

Errors:
401 Unauthorized - Invalid token
```
  - Review order history
  - View product catalog

- **Inventory Staff**
  - Manage stock levels
  - Update product information
  - Generate inventory reports

- **Logistics Manager**
  - Track shipments
  - Update delivery status
  - Manage delivery routes



## Products API

### List All Products
```http
GET /api/products
```
Returns a list of all product types in the catalog.

#### Response
```javascript
[
    {
        "name": "Advanced Patient Monitor",
        "model": "LifeWatch Pro 2000",
        "manufacturer": "MedTech Solutions",
        "category": "Patient Monitoring",
        // ... other product details
    }
]
```

### Create Product
```http
POST /api/products
```
Add a new product type to the catalog.

#### Request Body
```javascript
{
    "name": "Digital X-Ray System",
    "model": "DR-2000",
    "manufacturer": "Medical Imaging Corp",
    "category": "Imaging Equipment",
    "specifications": {
        "resolution": "3.5 lp/mm",
        "detector": "43x43cm Flat Panel"
    },
    "certifications": [
        {
            "type": "CE",
            "number": "CE123456",
            "validUntil": "2026-12-31"
        }
    ]
}
```

## Items API

### List All Items
```http
GET /api/items
```
Returns a list of all individual equipment units.

#### Response
```javascript
[
    {
        "serialNumber": "LWP2000-2025-0042",
        "status": "inventory",
        "productId": "ref_to_product",
        // ... other item details
    }
]
```

### Create Item
```http
POST /api/items
```
Add a new equipment unit.

#### Request Body
```javascript
{
    "serialNumber": "LWP2000-2025-0042",
    "productId": "ref_to_product",
    "status": "inventory",
    "purchaseInfo": {
        "date": "2025-02-13",
        "supplier": "MedTech Solutions",
        "orderReference": "PO-2025-042"
    }
}
```

### Update Item Status
```http
PUT /api/items/:id
```
Update an item's status and information.

#### Request Body for Demo Status
```javascript
{
    "status": "demo",
    "destinationInfo": {
        "customerName": "City General Hospital",
        "address": "123 Healthcare Ave",
        "contactPerson": "Dr. Sarah Chen",
        "contactNumber": "+65 9123 4567",
        "expectedReturnDate": "2025-03-13"
    }
}
```

#### Request Body for Delivery Status
```javascript
{
    "status": "delivery",
    "destinationInfo": {
        "customerName": "Southeast Medical Center",
        "address": "456 Hospital Road",
        "contactPerson": "Mr. David Lim",
        "contactNumber": "+65 8765 4321"
    }
}
```

## Error Responses
All endpoints may return the following errors:

```javascript
// 400 Bad Request
{
    "message": "Invalid request parameters"
}

// 404 Not Found
{
    "message": "Resource not found"
}

// 500 Internal Server Error
{
    "message": "Internal server error"
}
```
