const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
            humidity: String
        }
    },
    maintenanceSchedule: {
        frequency: {
            type: Number,  // in days
            default: 90
        },
        requirements: [String],
        calibrationNeeded: {
            type: Boolean,
            default: false
        },
        calibrationFrequency: {
            type: Number,  // in days
            default: 180
        }
    },
    warranty: {
        duration: Number,  // in months
        coverage: String,
        supplier: String
    },
    documentation: {
        userManual: String,
        serviceManual: String,
        calibrationProcedure: String
    },
    support: {
        supplier: String,
        contact: String,
        serviceLevel: String
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

module.exports = mongoose.model('Product', productSchema);
