# Data Models Documentation

## Product Model
Represents a type of medical equipment in the catalog.

### Schema
```javascript
const productSchema = new mongoose.Schema({
    sku: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
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
            humidity: String,
            pressure: String
        }
    },
    maintenanceRequirements: {
        frequency: Number, // in days
        procedures: [String],
        requiredTools: [String],
        estimatedDuration: Number // in minutes
    },
    documentation: {
        manuals: [String], // URLs or file paths
        datasheets: [String],
        certificates: [String]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
```

## Item Model
Represents an individual piece of equipment in the inventory.

### Schema
```javascript
const itemSchema = new mongoose.Schema({
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
    // For items in 'demo' or 'delivery' status
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
        nextDueDate: Date,
        attachments: [String],
        cost: Number
    }],
    calibrationHistory: [{
        date: Date,
        performedBy: String,
        certificate: String,
        nextDueDate: Date,
        results: String
    }],
    warranty: {
        startDate: Date,
        endDate: Date,
        claimHistory: [{
            date: Date,
            description: String,
            status: String,
            resolution: String
        }]
    },
    purchaseInfo: {
        date: {
            type: Date,
            required: true
        },
        cost: Number,
        supplier: String,
        orderReference: String
    },
    notes: [{
        date: Date,
        text: String,
        author: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
```

### Example Usage
```javascript
// Create a new item
const item = new Item({
    serialNumber: "LWP2000-2025-0042",
    productId: productId,  // Reference to product
    status: "inventory",
    purchaseInfo: {
        date: new Date(),  // Required field
        cost: 5000,
        supplier: "Medical Supplies Inc",
        orderReference: "PO-2025-001"
    },
    warranty: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        claimHistory: []  // Required array, can be empty initially
    }
});
```
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
