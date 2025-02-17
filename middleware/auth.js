const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new Error();
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({
            _id: decoded._id,
            'tokens.token': token,
            isActive: true
        });
        
        if (!user) {
            throw new Error();
        }
        
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

// Middleware for role-based access control
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.some(role => req.user.hasPermission(role))) {
            return res.status(403).send({
                error: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};

module.exports = {
    auth,
    authorize
};
