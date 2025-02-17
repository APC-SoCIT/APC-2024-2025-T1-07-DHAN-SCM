const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'customer', 'inventory_staff', 'logistics_manager'],
        default: 'customer'
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    organization: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
});

// Generate JWT token
userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
};

// Hash password before saving
userSchema.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;

    return userObject;
};

// Static method to find user by credentials
userSchema.statics.findByCredentials = async function(email, password) {
    const User = this;
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Invalid login credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid login credentials');
    }

    return user;
};

// Check if user has required role
userSchema.methods.hasPermission = function(requiredRole) {
    const roleHierarchy = {
        admin: 3,
        logistics_manager: 2,
        inventory_staff: 1,
        customer: 0
    };

    return roleHierarchy[this.role] >= roleHierarchy[requiredRole];
};

const User = mongoose.model('User', userSchema);

module.exports = User;

