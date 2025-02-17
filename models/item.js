const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    history: [{
        date: Date,
        type: String,
        description: String
    }],
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
            enum: ['preventive', 'corrective', 'inspection']
        },
        description: String,
        performedBy: String,
        nextDueDate: Date,
        attachments: [String],
        cost: Number
    }],
    calibrationHistory: [{
        date: Date,
        notes: String,
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
    notes: String,
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    nextMaintenanceDate: Date,
    nextCalibrationDate: Date,
    maintenanceType: {
        type: String,
        enum: ['preventive', 'corrective', 'calibration']
    }
});

// Add index for faster status queries
itemSchema.index({ status: 1 });

module.exports = mongoose.model('Item', itemSchema);
