const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            console.log('No token provided');
            throw new Error('Authentication token is required');
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);
        
        const user = await User.findOne({
            _id: decoded.userId || decoded._id, // Support both userId and _id
            'tokens.token': token
        });
        
        if (!user) {
            console.log('No user found for token');
            throw new Error('User not found');
        }
        
        console.log('Authenticated user:', {
            _id: user._id,
            username: user.username,
            role: user.role
        });
        
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(401).json({ error: 'Please authenticate.' });
    }
};

// Middleware for role-based access control
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        console.log('Checking authorization for roles:', allowedRoles);
        console.log('User role:', req.user.role);
        
        // Case-insensitive role comparison
        const userRole = req.user.role.toLowerCase();
        const hasPermission = allowedRoles.some(role => 
            role.toLowerCase() === userRole
        );
        
        if (!hasPermission) {
            console.log('Authorization failed. User role not in allowed roles');
            return res.status(403).json({
                error: 'You do not have permission to perform this action',
                requiredRoles: allowedRoles,
                userRole: req.user.role
            });
        }
        
        console.log('Authorization successful');
        next();
    };
};

module.exports = {
    auth,
    authorize
};
