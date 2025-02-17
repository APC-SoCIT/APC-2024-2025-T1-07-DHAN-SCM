# Setup Guide

This document provides instructions on how to set up and configure the Medical Equipment Inventory System.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v4.4 or higher)
- npm (v8 or higher)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env` file and set these required variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/inventory-system
   JWT_SECRET=your_secure_jwt_secret_here
   JWT_EXPIRATION=24h
   ```
5. Start the server:
   ```bash
   npm start
   ```

## Initial Setup

### Creating the First Admin User

Use the interactive admin creation script:

```bash
# Run the admin creation script
node scripts/create-admin.js
```

You will be prompted to enter:
1. Admin email (must be a valid email format)
2. Username (minimum 3 characters)
3. Password (must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character)
4. First name
5. Last name

Example session:
```
=== Create Admin User ===

Enter admin email: admin@example.com
Enter admin username: admin
Enter admin password: Admin123!@#
Enter admin first name: Admin
Enter admin last name: User

Admin user created successfully!
```

### Verifying the Setup

1. Test the login endpoint:
   ```bash
   # Login and get JWT token
   curl -X POST -H "Content-Type: application/json" \
   -d '{"email":"admin@example.com","password":"Admin123!@#"}' \
   http://localhost:3000/api/auth/users/login
   ```

2. You should receive a response with user details and a JWT token:
   ```json
   {
     "user": {
       "_id": "user_id",
       "email": "admin@example.com",
       "username": "admin",
       "role": "admin",
       "firstName": "Admin",
       "lastName": "User"
     },
     "token": "your_jwt_token_here"
   }
   ```

3. Test accessing a protected endpoint:
   ```bash
   # Get current user profile
   curl -H "Authorization: Bearer your_token_here" \
   http://localhost:3000/api/auth/users/me
   ```

## Security Configuration

### JWT Token

The system uses JWT (JSON Web Token) for authentication. Configure these settings in your `.env` file:

- `JWT_SECRET`: A secure random string used to sign JWT tokens
- `JWT_EXPIRATION`: Token expiration time (e.g., "24h", "7d")

Example:
```
JWT_SECRET=your_very_long_and_secure_random_string_here
JWT_EXPIRATION=24h
```

### Password Requirements

User passwords must meet these security requirements:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port number | No | 3000 |
| `NODE_ENV` | Environment (development/production) | No | development |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret for JWT signing | Yes | - |
| `JWT_EXPIRATION` | JWT token expiration | No | 24h |

## Next Steps

After completing the setup:
1. Create additional users with appropriate roles
2. Configure email settings if needed
3. Set up regular database backups
4. Review and update security settings as needed
