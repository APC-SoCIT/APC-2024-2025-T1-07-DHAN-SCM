# Medical Equipment Inventory Management System

## Project Overview
A comprehensive inventory management system designed for medical equipment distribution companies. This system helps track medical equipment from reception through demos and final delivery to healthcare facilities.

## Features
- Product catalog management for medical equipment
- Individual unit tracking with status monitoring
- Demo and delivery management
- Maintenance and calibration history tracking
  - Separate maintenance types (preventive, corrective, inspection)
  - Dedicated calibration records with certificates
  - Last maintenance date tracking and sorting
- Warranty tracking with expiration alerts
- Advanced sorting and filtering
  - Sort by serial number, product name, status, or last maintenance date
  - Filter by status (inventory, demo, delivery, maintenance)
  - Customizable items per page (default: 10)
- Location and assignment management

## Technology Stack
### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB
- **API**: RESTful architecture
- **Authentication**: JWT-based

### Frontend
- **Framework**: Angular 17
- **UI Library**: Angular Material
- **State Management**: NgRx
- **CSS**: SCSS

### Tools
- **Package Manager**: npm
- **Version Control**: Git
- **API Documentation**: Swagger

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm (comes with Node.js)
- Angular CLI (v17 or higher)

### Installation
1. Clone the repository:
```bash
git clone [repository-url]
cd inventory-system
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/inventory-system
NODE_ENV=development
JWT_SECRET=your-secret-key
```

4. Start the development servers:
```bash
# Start backend server
cd backend
npm run dev

# In a new terminal, start frontend server
cd ../
npm start
```

The application will be available at:
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000/api

## Project Structure
```
inventory-system/
├── backend/
│   ├── models/
│   │   ├── product.js
│   │   └── item.js
│   ├── routes/
│   │   ├── product.routes.js
│   │   └── item.routes.js
│   ├── config/
│   │   └── db.js
│   └── server.js
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── components/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── products/
│   │   │   ├── items/
│   │   │   └── reports/
│   │   └── layout/
│   │       ├── header/
│   │       └── sidebar/
│   ├── assets/
│   └── environments/
├── docs/
│   ├── API.md
│   ├── FRONTEND.md
│   ├── MODELS.md
│   └── CHECKLIST.md
├── package.json
└── README.md
├── models/
│   ├── product.js        # Product catalog schema
│   └── item.js           # Individual item schema
├── routes/
│   ├── product.routes.js # Product API endpoints
│   └── item.routes.js    # Item API endpoints
├── server.js             # Main application file
├── package.json          # Project dependencies
└── .env                  # Environment variables
```

## Documentation
For detailed documentation, please refer to:
- [API Documentation](docs/API.md)
- [Data Models](docs/MODELS.md)
- [Usage Guide](docs/USAGE.md)

## Contributing
This is a capstone project. Please follow the project guidelines and coding standards.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
