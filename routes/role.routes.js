const express = require('express');
const router = express.Router();
const Role = require('../models/role');
const { auth, authorize } = require('../middleware/auth');

// Get all roles
router.get('/', auth, async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Error fetching roles', error: error.message });
  }
});

// Get role by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ message: 'Error fetching role', error: error.message });
  }
});

// Create a new role (admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const role = new Role(req.body);
    await role.save();
    res.status(201).json(role);
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(400).json({ message: 'Error creating role', error: error.message });
  }
});

// Update a role (admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(400).json({ message: 'Error updating role', error: error.message });
  }
});

// Delete a role
router.delete('/:id', auth, async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ message: 'Error deleting role', error: error.message });
  }
});

module.exports = router;
