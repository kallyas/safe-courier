# Safe Courier API

A modern, secure, and high-performance courier delivery service API.

## Table Of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [Installation & Setup](#installation--setup)
6. [Environment Variables](#environment-variables)
7. [API Documentation](#api-documentation)
8. [Performance Optimizations](#performance-optimizations)
9. [Security Features](#security-features)
10. [Contributing](#contributing)
11. [License](#license)

## Project Overview

Safe Courier API is a modern backend service that powers the Safe Courier delivery service platform. It provides a comprehensive set of APIs for managing users, parcels, and tracking deliveries with robust security and performance optimizations.

## Key Features

- **User Management**: Registration, authentication, and profile management
- **Parcel Management**: Create, update, cancel, and track parcels
- **Search Functionality**: Advanced search for users and parcels
- **Role-Based Access Control**: Different permissions for users, couriers, and administrators
- **Real-time Tracking**: Track parcels with their current status and location
- **Caching**: Redis-based caching for improved performance
- **Logging**: Comprehensive logging with Winston
- **Rate Limiting**: Protection against abuse and DoS attacks
- **Swagger Documentation**: Interactive API documentation

## Technology Stack

- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB ODM
- **Redis**: Caching and token management
- **JWT**: Authentication
- **Joi**: Validation
- **Winston**: Logging
- **Helmet**: Security headers
- **Compression**: Response compression
- **Docker**: Containerization
- **Swagger**: API documentation

## Architecture

The application follows a modular architecture with separation of concerns:

- **controllers**: Handle HTTP requests and responses
- **models**: Define data schemas and business logic
- **routes**: Define API endpoints
- **Middlewares**: Handle cross-cutting concerns
- **Utils**: Utility functions and helpers
- **Config**: Configuration settings

## Installation & Setup

### Prerequisites

- Node.js (v18 or later)
- MongoDB
- Redis (optional, but recommended for production)

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/kallyas/safe-courier.git
   cd safe-courier
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start MongoDB and Redis (if using):
   ```bash
   # Using Docker
   docker-compose up -d mongo redis
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Production Deployment

#### Using Docker

1. Build and run with Docker Compose:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

#### Manual Deployment

1. Set environment variables for production
2. Build the application:
   ```bash
   npm ci --only=production
   ```
3. Start the server:
   ```bash
   npm start
   ```

## Environment Variables

See the `.env.example` file for all required and optional environment variables.

Important variables include:

- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (`development`, `production`, `test`)
- `DB_URL`: MongoDB connection string
- `ACCESS_TOKEN_SECRET`: JWT secret key
- `REDIS_URL`: Redis connection string (optional)

## API Documentation

The API is documented using Swagger. When the server is running, visit:

```
http://localhost:5000/api/v1/api-docs
```

### Main Endpoints

#### Authentication

- `POST /api/v1/auth/signup`: Register a new user
- `POST /api/v1/auth/login`: Login
- `POST /api/v1/auth/logout`: Logout

#### User Management

- `GET /api/v1/users`: Get all users (admin only)
- `GET /api/v1/user/:id`: Get user by ID
- `PUT /api/v1/user/:id`: Update user
- `DELETE /api/v1/user/:id`: Delete user

#### Parcel Management

- `GET /api/v1/parcels`: Get all parcels
- `POST /api/v1/parcels`: Create a parcel
- `GET /api/v1/parcels/:parcelId`: Get parcel by ID
- `GET /api/v1/parcels/track/:trackingCode`: Track parcel (public)
- `PUT /api/v1/parcels/:parcelId/cancel`: Cancel parcel
- `PUT /api/v1/parcels/:parcelId/destination`: Update destination
- `PUT /api/v1/parcels/:parcelId/status`: Update status (admin only)
- `PUT /api/v1/parcels/:parcelId/presentLocation`: Update location (admin only)

#### Search

- `GET /api/v1/users/search`: Search users
- `GET /api/v1/parcels/search`: Search parcels
- `POST /api/v1/search/advanced`: Advanced search with multiple filters

## Performance Optimizations

The API includes several performance optimizations:

1. **Caching**: Redis-based caching for database queries
2. **Compression**: Response compression to reduce bandwidth
3. **Connection Pooling**: MongoDB connection pooling
4. **Pagination**: All list endpoints support pagination
5. **Indexing**: Strategic database indexes for faster queries
6. **Efficient Queries**: Optimized MongoDB queries with projection

## Security Features

The API implements multiple security measures:

1. **Helmet**: Security headers to protect against common vulnerabilities
2. **Rate Limiting**: Prevent abuse and brute force attacks
3. **JWT with Expiry**: Secure authentication with token expiration
4. **Password Hashing**: Secure password storage using bcrypt
5. **Input Validation**: Joi validation for all inputs
6. **CORS Protection**: Configurable CORS policy
7. **Role-Based Access Control**: Different permissions based on user roles
8. **Token Blacklisting**: Invalidate tokens on logout

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.