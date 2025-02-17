# Medical Equipment Inventory Management System

## Project Overview
A comprehensive inventory management system designed for medical equipment distribution companies. This system helps track medical equipment from reception through demos and final delivery to healthcare facilities.

## Features
- Product catalog management for medical equipment
- Individual unit tracking with status monitoring
- Demo and delivery management
- Maintenance and calibration history
- Warranty tracking
- Location and assignment management

## Technology Stack
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **API**: RESTful architecture
- **Package Manager**: npm

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm (comes with Node.js)

### Installation
1. Clone the repository:
```bash
git clone [repository-url]
cd inventory-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/inventory-system
NODE_ENV=development
```

4. Start the server:
```bash
npm start
```

## Project Structure
```
inventory-system/
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
