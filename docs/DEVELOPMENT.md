# Development Guide

## Project Context
This inventory management system is designed for medical equipment distribution companies. It tracks individual units of medical equipment through various states: inventory, demo, and delivery.

## Core Concepts

### 1. Authentication & Authorization

#### User Model
```javascript
const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'customer', 'inventory_staff', 'logistics_manager'] },
    firstName: String,
    lastName: String,
    isActive: { type: Boolean, default: true },
    lastLogin: Date
});
```

#### Role-Based Access
```javascript
// Middleware example
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id });
        
        if (!user || !user.isActive) {
            throw new Error();
        }
        
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

// Role check example
const requireRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role && req.user.role !== 'admin') {
            return res.status(403).send({ error: 'Access denied.' });
        }
        next();
    };
};
```

### 2. Two-Tier Data Model
```
Product (Catalog)           Item (Individual Units)
├── Specifications    →     ├── Serial Number
├── Requirements            ├── Status
└── Documentation          └── Current Location
```

#### Product Model (Template)
- Represents a type of medical equipment
- Contains shared specifications
- Stores compliance and maintenance requirements

#### Item Model (Instance)
- Represents individual units
- Tracks current status
- Manages location and assignment

### 2. Status Flow
```
                    ┌─────────────┐
                    │  Inventory  │
                    └─────┬───────┘
                          │
                    ┌─────┴───────┐
              ┌─────┤    Demo     ├─────┐
              │     └─────────────┘     │
              │                         │
        Return to                       │
        Inventory                       │
              │                         │
              ▼                         ▼
    ┌─────────────────┐         ┌─────────────┐
    │    Inventory    │         │  Delivery   │
    └─────────────────┘         └─────────────┘
```

## Quick Reference

### 1. Status Definitions
- **Inventory**: Equipment in warehouse
- **Demo**: Out for customer evaluation
- **Delivery**: Sold and being delivered

### 2. Key API Endpoints
```
# Authentication
POST   /api/auth/users/login    # Login user
POST   /api/auth/users/logout   # Logout user
GET    /api/auth/users/me       # Get current user
PATCH  /api/auth/users/me       # Update profile
POST   /api/auth/users          # Create user (admin)
GET    /api/auth/users          # List users (admin)

# Products
GET    /api/products           # List all products
POST   /api/products           # Create product
GET    /api/products/:id       # Get product
PUT    /api/products/:id       # Update product

# Items
GET    /api/items              # List all items
POST   /api/items              # Create item
GET    /api/items/:id          # Get item
PUT    /api/items/:id          # Update item
```

### 3. Common Code Patterns

#### User Authentication
```javascript
// Login
const response = await fetch('/api/auth/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123'
    })
});
const { user, token } = await response.json();

// Using authentication
const response = await fetch('/api/protected/endpoint', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});
```

#### Creating a New Product
```javascript
const product = {
    name: "Digital X-Ray System",
    model: "DR-2000",
    manufacturer: "Medical Imaging Corp",
    category: "Imaging Equipment",
    specifications: {
        resolution: "3.5 lp/mm",
        detector: "43x43cm Flat Panel"
    }
};

// POST /api/products
```

#### Adding New Inventory
```javascript
const item = {
    serialNumber: "DR2000-2025-001",
    productId: "product_id_reference",
    status: "inventory",
    purchaseInfo: {
        date: "2025-02-13",
        supplier: "Medical Imaging Corp",
        orderReference: "PO-2025-042"
    }
};

// POST /api/items
```

#### Sending for Demo
```javascript
const demoUpdate = {
    status: "demo",
    destinationInfo: {
        customerName: "City General Hospital",
        address: "123 Healthcare Ave",
        contactPerson: "Dr. Sarah Chen",
        contactNumber: "+65 9123 4567",
        expectedReturnDate: "2025-03-13"
    }
};

// PUT /api/items/:id
```

### 4. Database Indexes
```javascript
// Item Model Indexes
itemSchema.index({ status: 1 });
itemSchema.index({ serialNumber: 1 }, { unique: true });

// Product Model Indexes
productSchema.index({ model: 1 });
productSchema.index({ category: 1 });
```

## Common Development Tasks

### 1. Adding New Product Fields
1. Update Product schema in `models/product.js`
2. Add validation if required
3. Update API documentation
4. Test with existing products

### 2. Modifying Status Flow
1. Update status enum in Item schema
2. Modify status validation logic
3. Update status flow documentation
4. Test all status transitions

### 3. Adding New API Endpoints
1. Create route handler
2. Add to appropriate router file
3. Document in API.md
4. Add example in USAGE.md

## Testing Guidelines

### 1. API Testing
```bash
# Create product
curl -X POST -H "Content-Type: application/json" -d '{
    "name": "Test Product",
    "model": "TEST-001",
    "category": "Testing"
}' http://localhost:3000/api/products

# Create item
curl -X POST -H "Content-Type: application/json" -d '{
    "serialNumber": "TEST001-001",
    "productId": "product_id",
    "status": "inventory"
}' http://localhost:3000/api/items
```

### 2. Status Transition Testing
```javascript
// Test all valid transitions
inventory → demo
demo → inventory
demo → delivery
inventory → delivery
```

## Troubleshooting

### 1. Common Errors
- Duplicate serial number
- Invalid status transition
- Missing required fields
- Invalid product reference

### 2. Debug Checklist
1. Check MongoDB connection
2. Verify request payload
3. Check status transitions
4. Validate references

## Future Development

### 1. Planned Features
- [ ] User authentication
- [ ] Role-based access control
- [ ] Automated reports
- [ ] Email notifications
- [ ] Maintenance scheduling

### 2. Technical Debt
- Implement request validation
- Add comprehensive error handling
- Improve query performance
- Add automated tests

## Environment Setup

### Development
```bash
# Install dependencies
npm install

# Start MongoDB
mongod

# Start server
npm run dev
```

### Production
```bash
# Set environment variables
export NODE_ENV=production
export MONGODB_URI=your_mongodb_uri

# Start server
npm start
```

## Maintenance

### 1. Database Maintenance
- Regular backups
- Index optimization
- Data cleanup

### 2. Code Maintenance
- Keep dependencies updated
- Review error logs
- Monitor performance

## Security Considerations

### 1. Data Validation
- Sanitize all inputs
- Validate status transitions
- Check references

### 2. API Security
- Rate limiting
- Input validation
- Error handling

## Support and Resources
- Project Documentation: `/docs`
- MongoDB Documentation: [MongoDB Docs](https://docs.mongodb.com)
- Express.js Guide: [Express Guide](https://expressjs.com/guide)
