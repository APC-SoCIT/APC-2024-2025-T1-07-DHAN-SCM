const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  resource: {
    type: String,
    required: true,
    enum: [
      'products', 
      'purchase_orders', 
      'inventory_items', 
      'shipments', 
      'users', 
      'roles',
      'all'
    ]
  },
  type: {
    type: String,
    required: true,
    enum: ['create', 'read', 'update', 'delete', 'list']
  }
});

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Admin', 'Customer', 'Inventory Staff', 'Logistics Manager']
  },
  description: {
    type: String,
    default: ''
  },
  permissions: [permissionSchema],
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
