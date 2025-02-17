# Data Models Documentation

## User Model
Represents a user in the system with role-based access control.

### Schema
```javascript
{
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: [validateEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false  // Don't include in queries by default
    },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'customer', 'inventory_staff', 'logistics_manager'],
        default: 'customer'
    },
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}
```

### Methods
```javascript
// Generate JWT token
userSchema.methods.generateAuthToken = async function() {
    const token = jwt.sign(
        { _id: this._id.toString(), role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
    );
    return token;
};

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});
```

## Product Model
Represents a type of medical equipment in the catalog.

### Schema
```javascript
{
    name: {
        type: String,
        required: true,
        trim: true
    },
    model: {
        type: String,
        required: true,
        trim: true
    },
    manufacturer: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Diagnostic System', 'Patient Monitoring', 'Laboratory Equipment', 
               'Imaging Equipment', 'Surgical Equipment', 'Medical Supplies']
    },
    specifications: {
        type: Map,
        of: String
    },
    certifications: [{
        type: {
            type: String,
            enum: ['CE', 'FDA', 'ISO', 'Other']
        },
        number: String,
        validUntil: Date
    }],
    technicalDetails: {
        powerRequirements: String,
        dimensions: String,
        weight: String,
        operatingConditions: {
            temperature: String,
            humidity: String
        }
    },
    maintenanceSchedule: {
        frequency: Number,  // in days
        requirements: [String],
        calibrationNeeded: Boolean,
        calibrationFrequency: Number  // in days
    }
}
```

## Item Model
Represents an individual unit of medical equipment.

### Schema
```javascript
{
    serialNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        enum: ['demo', 'inventory', 'delivery'],
        default: 'inventory'
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    destinationInfo: {
        customerName: String,
        address: String,
        contactPerson: String,
        contactNumber: String,
        expectedReturnDate: Date  // for demo units
    },
    maintenanceHistory: [{
        date: Date,
        type: {
            type: String,
            enum: ['preventive', 'corrective', 'calibration', 'inspection']
        },
        description: String,
        performedBy: String,
        nextDueDate: Date
    }],
    warranty: {
        startDate: Date,
        endDate: Date
    },
    purchaseInfo: {
        date: Date,
        supplier: String,
        orderReference: String
    }
}
```

## Status Workflows

### Demo Workflow
1. Item starts in 'inventory' status
2. Changed to 'demo' status when sent for demonstration
   - Requires destination information
   - Includes expected return date
3. Returns to 'inventory' or changes to 'delivery' status

### Delivery Workflow
1. Item can move from 'inventory' or 'demo' to 'delivery' status
2. Requires complete destination information
3. Status is final (item has left inventory)

## Example Usage

### Creating a New Product
```javascript
const product = new Product({
    name: "Advanced Patient Monitor",
    model: "LifeWatch Pro 2000",
    manufacturer: "MedTech Solutions",
    category: "Patient Monitoring",
    specifications: {
        "screenSize": "15-inch HD",
        "parameters": "ECG, SpO2, NIBP, Temp, Resp"
    }
});
```

### Creating a New Item
```javascript
const item = new Item({
    serialNumber: "LWP2000-2025-0042",
    productId: productId,  // Reference to product
    status: "inventory",
    purchaseInfo: {
        date: new Date(),
        supplier: "MedTech Solutions",
        orderReference: "PO-2025-042"
    }
});
```
