const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const User = require('./models/user');
require('dotenv').config();

const app = express();

// CORS Configuration
app.use(cors({
    origin: ['http://localhost:4200'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('Connected to MongoDB');
    
    // Skip admin user creation since users already exist
    console.log('Database connected and ready');
}).catch((error) => {
    console.error('MongoDB connection error:', error);
});

// Import routes
const productRoutes = require('./routes/product.routes');
const itemRoutes = require('./routes/item.routes');
const authRoutes = require('./routes/auth.routes');

// Basic route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Inventory Management System API',
        version: '1.0.0',
        documentation: '/api/docs'
    });
});

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/items', itemRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
