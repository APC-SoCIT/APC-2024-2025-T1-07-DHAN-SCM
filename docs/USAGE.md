# Usage Guide

## Overview
This guide explains how to use the Medical Equipment Inventory Management System for common tasks in a distribution company setting.

## Authentication

### Logging In

1. Access the login endpoint with your credentials:
   ```bash
   curl -X POST -H "Content-Type: application/json" \
   -d '{"email":"your.email@example.com","password":"your_password"}' \
   http://localhost:3000/api/auth/users/login
   ```

2. Save the JWT token from the response:
   ```json
   {
     "user": {
       "email": "your.email@example.com",
       "role": "your_role"
     },
     "token": "your_jwt_token_here"
   }
   ```

3. Include this token in all subsequent requests:
   ```bash
   curl -H "Authorization: Bearer your_jwt_token_here" \
   http://localhost:3000/api/protected/endpoint
   ```

### User Roles

The system has four roles with different permissions:

1. **Admin**
   - Create and manage users
   - Access all system features
   - View system analytics

2. **Customer**
   - Browse product catalog
   - Create purchase orders
   - Track order status

3. **Inventory Staff**
   - Manage product inventory
   - Update stock levels
   - Process incoming shipments

4. **Logistics Manager**
   - Manage shipments
   - Track deliveries
   - Coordinate with suppliers

## Common Tasks

### 1. Adding New Equipment to Inventory

#### Step 1: Create Product Type (if new)
First, check if the product type exists in the catalog. If not:
```javascript
// POST /api/products
{
    "name": "Digital X-Ray System",
    "model": "DR-2000",
    "manufacturer": "Medical Imaging Corp",
    "category": "Imaging Equipment",
    "specifications": {
        "resolution": "3.5 lp/mm",
        "detector": "43x43cm Flat Panel"
    }
}
```

#### Step 2: Add Individual Units
For each physical unit received:
```javascript
// POST /api/items
{
    "serialNumber": "DR2000-2025-001",
    "productId": "product_id_from_step_1",
    "status": "inventory",
    "purchaseInfo": {
        "date": "2025-02-13",
        "supplier": "Medical Imaging Corp",
        "orderReference": "PO-2025-042"
    }
}
```

### 2. Managing Demo Units

#### Sending Equipment for Demo
```javascript
// PUT /api/items/:id
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

#### Demo Return Scenarios
1. Return to Inventory:
```javascript
// PUT /api/items/:id
{
    "status": "inventory",
    "destinationInfo": null
}
```

2. Convert to Delivery:
```javascript
// PUT /api/items/:id
{
    "status": "delivery",
    "destinationInfo": {
        "customerName": "City General Hospital",
        "address": "123 Healthcare Ave",
        "contactPerson": "Dr. Sarah Chen",
        "contactNumber": "+65 9123 4567"
    }
}
```

### 3. Processing Deliveries
When equipment is sold and ready for delivery:
```javascript
// PUT /api/items/:id
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

### 4. Maintenance Records
Add maintenance record to an item:
```javascript
// POST /api/items/:id/maintenance
{
    "date": "2025-02-13",
    "type": "preventive",
    "description": "Regular maintenance check",
    "performedBy": "Tech Support Team",
    "nextDueDate": "2025-05-13"
}
```

## Best Practices

### 1. Serial Number Format
Use consistent format: `[MODEL]-[YEAR]-[SEQUENCE]`
Example: `DR2000-2025-001`

### 2. Status Management
- Always update status when equipment location changes
- Include complete destination information for demo/delivery
- Add notes for special circumstances

### 3. Documentation
- Keep maintenance records up to date
- Document all equipment movements
- Update warranty information promptly

## Troubleshooting

### Common Issues

1. Duplicate Serial Numbers
- Error: "E11000 duplicate key error"
- Solution: Verify serial number is unique before adding

2. Invalid Status Changes
- Error: "Invalid status transition"
- Solution: Ensure status change follows valid workflow

3. Missing Required Fields
- Error: "Field X is required"
- Solution: Check all required fields are provided

## Support
For technical support or questions:
1. Check documentation
2. Contact system administrator
3. Submit issue ticket
