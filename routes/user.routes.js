const express = require('express');
const User = require('../models/user');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Create new user (admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        
        // Don't send back password or tokens
        const userToSend = user.toObject();
        delete userToSend.password;
        delete userToSend.tokens;
        
        res.status(201).json(userToSend);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(400).json({ error: error.message });
    }
});

// Get all users (admin only)
router.get('/', auth, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find({}).select('-password -tokens');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user by ID (admin only or self)
router.get('/:id', auth, async (req, res) => {
    try {
        // Allow users to get their own info or admins to get any user's info
        if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ error: 'Not authorized to view this user' });
        }

        const user = await User.findById(req.params.id).select('-password -tokens');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user (admin only or self)
router.put('/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'role'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates' });
    }

    try {
        // Only admins can update roles
        if (req.body.role && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can update roles' });
        }

        // Allow users to update their own info or admins to update any user's info
        if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ error: 'Not authorized to update this user' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        updates.forEach(update => user[update] = req.body[update]);
        await user.save();

        // Don't send back password or tokens
        const userToSend = user.toObject();
        delete userToSend.password;
        delete userToSend.tokens;

        res.json(userToSend);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete user (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
