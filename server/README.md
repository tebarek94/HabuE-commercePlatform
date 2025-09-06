# Flower E-commerce Backend API

A production-grade REST API for a flower-selling e-commerce platform built with Node.js, Express, TypeScript, and MySQL.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Product Management**: Full CRUD operations for products and categories
- **Shopping Cart**: Add, update, and manage cart items
- **Order Management**: Create and track orders with status updates
- **Admin Dashboard**: Comprehensive admin panel for managing the platform
- **Security**: Helmet, CORS, rate limiting, input validation
- **Documentation**: Swagger/OpenAPI documentation
- **Testing**: Jest unit and integration tests
- **Docker**: Containerized deployment with docker-compose

## 📋 Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn
- Docker (optional)

## 🛠️ Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=flower_ecommerce
   DB_USER=root
   DB_PASSWORD=your_password
   JWT_SECRET=your_super_secret_jwt_key_here
   ```

4. **Database Setup**
   ```bash
   # Create database
   mysql -u root -p < database/init.sql
   
   # Or run migrations
   npm run migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

### Docker Deployment

1. **Build and run with docker-compose**
   ```bash
   docker-compose up -d
   ```

2. **Access the application**
   - API: `http://localhost:3000`
   - API Documentation: `http://localhost:3000/api-docs`
   - MySQL: `localhost:3306`

## 📚 API Documentation

Once the server is running, visit `http://localhost:3000/api-docs` to view the interactive Swagger documentation.

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

#### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/search?q=term` - Search products
- `GET /api/products/featured` - Get featured products
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

#### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove item from cart
- `DELETE /api/cart/clear` - Clear entire cart

#### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `PATCH /api/orders/:id/status` - Update order status (Admin)

#### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/categories` - Manage categories
- `GET /api/admin/orders` - Manage all orders
- `GET /api/admin/analytics` - Get sales analytics

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- `src/tests/auth.test.ts` - Authentication tests
- `src/tests/products.test.ts` - Product management tests
- `src/tests/setup.ts` - Test database setup

## 🏗️ Project Structure

```
server/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # Database connection
│   │   └── swagger.ts   # API documentation
│   ├── controllers/     # Route controllers
│   │   ├── authController.ts
│   │   └── productController.ts
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts      # Authentication
│   │   ├── errorHandler.ts
│   │   ├── validation.ts
│   │   └── requestLogger.ts
│   ├── routes/          # API routes
│   │   ├── auth.ts
│   │   ├── products.ts
│   │   ├── cart.ts
│   │   ├── orders.ts
│   │   ├── users.ts
│   │   └── admin.ts
│   ├── services/        # Business logic
│   │   ├── authService.ts
│   │   └── productService.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   └── logger.ts
│   ├── tests/           # Test files
│   │   ├── setup.ts
│   │   ├── auth.test.ts
│   │   └── products.test.ts
│   └── index.ts         # Application entry point
├── database/            # Database files
│   └── init.sql         # Initial schema and data
├── docker-compose.yml   # Docker configuration
├── Dockerfile          # Docker image
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
├── jest.config.js      # Jest configuration
└── README.md           # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `3306` |
| `DB_NAME` | Database name | `flower_ecommerce` |
| `DB_USER` | Database user | `root` |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | JWT expiration | `7d` |
| `CORS_ORIGIN` | CORS origin | `http://localhost:3000` |

### Database Schema

The database includes the following main tables:
- `users` - User accounts and authentication
- `categories` - Product categories
- `products` - Product catalog
- `cart_items` - Shopping cart items
- `orders` - Customer orders
- `order_items` - Order line items

## 🚀 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   export NODE_ENV=production
   export DB_HOST=your-production-db-host
   export JWT_SECRET=your-production-jwt-secret
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

### Docker Production

```bash
# Build production image
docker build -t flower-ecommerce-api .

# Run with production environment
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=your-db-host \
  -e JWT_SECRET=your-jwt-secret \
  flower-ecommerce-api
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: express-validator for request validation
- **Rate Limiting**: Prevent brute force attacks
- **CORS**: Configured cross-origin resource sharing
- **Helmet**: Security headers
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Input sanitization

## 📊 Monitoring & Logging

- **Winston Logger**: Structured logging with different levels
- **Request Logging**: Automatic request/response logging
- **Error Tracking**: Comprehensive error handling and logging
- **Health Checks**: `/health` endpoint for monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@flowerecommerce.com or create an issue in the repository.

## 🔄 API Versioning

The API uses URL versioning (`/api/v1/`) for future compatibility. Current version is v1.

## 📈 Performance Considerations

- Database connection pooling
- Indexed database queries
- Response compression
- Efficient pagination
- Caching strategies (Redis ready)

## 🧪 Sample Data

The database initialization includes sample data:
- Admin user: `admin@flowerecommerce.com` / `admin123`
- Client user: `client@example.com` / `client123`
- Sample categories and products
