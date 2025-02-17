const express = require('express');
const User = require('../models/user');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Register new user (admin only)
router.post('/register', auth, authorize('admin'), async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();
        
        user.lastLogin = new Date();
        await user.save();
        
        res.json({ user, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ error: error.message || 'Invalid login credentials' });
    }
});

// Logout user
router.post('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
        await req.user.save();
        res.send({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).send();
    }
});

// Logout all sessions
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send({ message: 'Logged out from all sessions' });
    } catch (error) {
        res.status(500).send();
    }
});

// Get current user profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

// Update user profile
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['firstName', 'lastName', 'email', 'password', 'phoneNumber', 'organization'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates' });
    }
    
    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Admin: Get all users
router.get('/users', auth, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (error) {
        res.status(500).send();
    }
});

// Admin: Update user
router.patch('/users/:id', auth, authorize('admin'), async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['firstName', 'lastName', 'email', 'password', 'role', 'isActive', 'phoneNumber', 'organization'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates' });
    }
    
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send();
        }
        
        updates.forEach(update => user[update] = req.body[update]);
        await user.save();
        res.send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;
