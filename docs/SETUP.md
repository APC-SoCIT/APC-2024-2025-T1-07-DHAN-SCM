# Setup Guide

This document provides instructions on how to set up and configure the Medical Equipment Inventory System.

## Prerequisites

### Backend Requirements
- Node.js (v18 or higher)
- MongoDB (v4.4 or higher)
- npm (v8 or higher)

### Frontend Requirements
- Angular CLI (v16 or higher)
- Node.js (v18 or higher)
- npm (v8 or higher)

## Installation

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ermandac/Inventory-System.git
   cd Inventory-System
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` file with your settings:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/inventory-system
   
   # JWT Configuration
   JWT_SECRET=your_secure_jwt_secret_here
   JWT_EXPIRATION=24h
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # CORS Configuration (for development)
   CORS_ORIGIN=http://localhost:4200
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd src
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp src/environments/environment.example.ts src/environments/environment.ts
   ```

4. Update the environment file with your settings:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:3000/api',
     defaultPageSize: 10,
     maintenanceAlertDays: 7,
     warrantyAlertDays: 30
   };
   ```

## Running the Application

### Start the Backend Server

1. Start MongoDB (if not running):
   ```bash
   sudo systemctl start mongod
   ```

2. Start the backend server:
   ```bash
   npm run dev  # for development with nodemon
   # or
   npm start    # for production
   ```

### Start the Frontend Application

1. Start the Angular development server:
   ```bash
   ng serve
   ```

2. Access the application:
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3000

## Development Tools

### Database Management

1. MongoDB Compass (recommended for database management):
   - Download from: https://www.mongodb.com/try/download/compass
   - Connect using: `mongodb://localhost:27017`

### API Testing

1. Postman Collection:
   - Import the provided Postman collection from `docs/postman`
   - Set up environment variables:
     - `baseUrl`: http://localhost:3000/api
     - `token`: Your JWT token after login

## Troubleshooting

### Common Issues

1. MongoDB Connection Issues:
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   
   # Start MongoDB if not running
   sudo systemctl start mongod
   ```

2. Port Already in Use:
   ```bash
   # Find process using port 3000 (backend)
   sudo lsof -i :3000
   
   # Find process using port 4200 (frontend)
   sudo lsof -i :4200
   ```

3. CORS Issues:
   - Verify CORS_ORIGIN in `.env` matches your frontend URL
   - Check browser console for CORS errors
   - Ensure both frontend and backend are running

### Getting Help

1. Check the logs:
   ```bash
   # Backend logs
   npm run logs
   
   # Frontend logs
   ng serve --verbose
   ```

2. Report issues:
   - Use the GitHub issue tracker
   - Include relevant logs and error messages
   - Describe steps to reproduce the issue

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
