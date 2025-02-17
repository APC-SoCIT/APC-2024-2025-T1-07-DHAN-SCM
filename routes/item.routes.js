const express = require('express');
const router = express.Router();
const Item = require('../models/item');

// Get all items
router.get('/', async (req, res) => {
    try {
        const items = await Item.find().populate('productId');
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new item
router.post('/', async (req, res) => {
    const item = new Item({
        serialNumber: req.body.serialNumber,
        productId: req.body.productId,
        status: req.body.status || 'available',
        condition: req.body.condition || 'new',
        location: req.body.location,
        notes: req.body.notes,
        purchaseDate: req.body.purchaseDate
    });

    try {
        const newItem = await item.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get item by ID
router.get('/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('productId');
        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update item
router.put('/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (item) {
            Object.assign(item, req.body);
            item.lastUpdated = Date.now();
            const updatedItem = await item.save();
            res.json(updatedItem);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Add maintenance record
router.post('/:id/maintenance', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (item) {
            item.maintenanceHistory.push({
                date: req.body.date || Date.now(),
                description: req.body.description,
                performedBy: req.body.performedBy
            });
            item.lastUpdated = Date.now();
            const updatedItem = await item.save();
            res.json(updatedItem);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete item
router.delete('/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (item) {
            await item.remove();
            res.json({ message: 'Item deleted' });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
