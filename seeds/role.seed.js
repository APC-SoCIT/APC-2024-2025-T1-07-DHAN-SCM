const mongoose = require('mongoose');
const Role = require('../models/role');
require('dotenv').config();

const defaultRoles = [
  {
    name: 'Admin',
    description: 'Full system access with all permissions',
    permissions: [
      // Products
      { resource: 'products', type: 'create' },
      { resource: 'products', type: 'read' },
      { resource: 'products', type: 'update' },
      { resource: 'products', type: 'delete' },
      { resource: 'products', type: 'list' },
      
      // Purchase Orders
      { resource: 'purchase_orders', type: 'create' },
      { resource: 'purchase_orders', type: 'read' },
      { resource: 'purchase_orders', type: 'update' },
      { resource: 'purchase_orders', type: 'delete' },
      { resource: 'purchase_orders', type: 'list' },
      
      // Inventory Items
      { resource: 'inventory_items', type: 'create' },
      { resource: 'inventory_items', type: 'read' },
      { resource: 'inventory_items', type: 'update' },
      { resource: 'inventory_items', type: 'delete' },
      { resource: 'inventory_items', type: 'list' },
      
      // Shipments
      { resource: 'shipments', type: 'create' },
      { resource: 'shipments', type: 'read' },
      { resource: 'shipments', type: 'update' },
      { resource: 'shipments', type: 'delete' },
      { resource: 'shipments', type: 'list' },
      
      // Users
      { resource: 'users', type: 'create' },
      { resource: 'users', type: 'read' },
      { resource: 'users', type: 'update' },
      { resource: 'users', type: 'delete' },
      { resource: 'users', type: 'list' },
      
      // Roles
      { resource: 'roles', type: 'create' },
      { resource: 'roles', type: 'read' },
      { resource: 'roles', type: 'update' },
      { resource: 'roles', type: 'delete' },
      { resource: 'roles', type: 'list' }
    ],
    isDefault: false
  },
  {
    name: 'Customer',
    description: 'Can create and review purchase orders',
    permissions: [
      { resource: 'purchase_orders', type: 'create' },
      { resource: 'purchase_orders', type: 'read' },
      { resource: 'purchase_orders', type: 'list' }
    ],
    isDefault: false
  },
  {
    name: 'Inventory Staff',
    description: 'Manage and update inventory items and products',
    permissions: [
      { resource: 'products', type: 'create' },
      { resource: 'products', type: 'read' },
      { resource: 'products', type: 'update' },
      { resource: 'products', type: 'list' },
      { resource: 'inventory_items', type: 'create' },
      { resource: 'inventory_items', type: 'read' },
      { resource: 'inventory_items', type: 'update' },
      { resource: 'inventory_items', type: 'list' }
    ],
    isDefault: false
  },
  {
    name: 'Logistics Manager',
    description: 'Track and coordinate shipments and deliveries',
    permissions: [
      { resource: 'shipments', type: 'create' },
      { resource: 'shipments', type: 'read' },
      { resource: 'shipments', type: 'update' },
      { resource: 'shipments', type: 'list' }
    ],
    isDefault: false
  }
];

async function seedRoles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing roles
    await Role.deleteMany({});
    console.log('Existing roles cleared');

    // Insert default roles
    const insertedRoles = await Role.insertMany(defaultRoles);
    console.log('Roles seeded successfully:', insertedRoles.length);

    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error seeding roles:', error);
    process.exit(1);
  }
}

seedRoles();
