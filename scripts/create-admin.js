require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[^A-Za-z0-9]/.test(password)) return false;
    return true;
}

async function promptQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function createAdminUser() {
    try {
        console.log('\n=== Create Admin User ===\n');

        // Gather admin information
        const email = await promptQuestion('Enter admin email: ');
        if (!validateEmail(email)) {
            throw new Error('Invalid email format');
        }

        const username = await promptQuestion('Enter admin username: ');
        if (username.length < 3) {
            throw new Error('Username must be at least 3 characters long');
        }

        const password = await promptQuestion('Enter admin password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char): ');
        if (!validatePassword(password)) {
            throw new Error('Password does not meet security requirements');
        }

        const firstName = await promptQuestion('Enter admin first name: ');
        const lastName = await promptQuestion('Enter admin last name: ');

        console.log('\nConnecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            throw new Error('An admin user with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 8);

        const admin = new User({
            username,
            email,
            password: hashedPassword,
            role: 'admin',
            firstName,
            lastName,
            isActive: true
        });

        // Save without triggering the password hash middleware
        await User.collection.insertOne(admin);
        console.log('\nAdmin user created successfully!');
        console.log('\nAdmin Details:');
        console.log('Email:', email);
        console.log('Username:', username);
        console.log('Role: admin');

        await mongoose.disconnect();
        rl.close();
    } catch (error) {
        console.error('\nError:', error.message);
        rl.close();
        process.exit(1);
    }
}

createAdminUser();
