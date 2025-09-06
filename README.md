# Habu E-commerce Platform

A full-stack e-commerce platform built with React, TypeScript, Express.js, and MySQL.

## 🚀 Live Demo

- **Frontend**: https://habu-frontend.onrender.com
- **Backend API**: https://habu-backend.onrender.com
- **Health Check**: https://habu-backend.onrender.com/health

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Zustand** for state management
- **Axios** for API calls
- **React Hook Form** with Zod validation

### Backend
- **Node.js** with TypeScript
- **Express.js** framework
- **MySQL** database
- **JWT** authentication
- **Multer** for file uploads
- **Winston** for logging
- **Bcryptjs** for password hashing

## 📁 Project Structure

```
habu/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── store/          # Zustand state management
│   │   ├── lib/            # API and utility functions
│   │   └── types/          # TypeScript type definitions
│   ├── package.json
│   └── vite.config.ts
├── server/                  # Express backend API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── config/         # Database and app config
│   │   └── utils/          # Utility functions
│   ├── uploads/            # File upload directory
│   ├── package.json
│   └── tsconfig.json
└── render.yaml             # Render deployment config
```

## 🚀 Deployment on Render

### Prerequisites
1. GitHub repository with your code
2. Render account (free tier available)

### Step 1: Deploy Database
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "PostgreSQL" (or MySQL)
3. Configure:
   - **Name**: `habu-database`
   - **Database**: `habu_production`
   - **User**: `habu_user`
   - **Plan**: Free tier
4. Click "Create Database"
5. Note down the connection details

### Step 2: Deploy Backend
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `habu-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free tier
4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   DB_HOST=<from-database-service>
   DB_PORT=<from-database-service>
   DB_USER=<from-database-service>
   DB_PASSWORD=<from-database-service>
   DB_NAME=<from-database-service>
   JWT_SECRET=<generate-random-string>
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=https://habu-frontend.onrender.com
   ```
5. Click "Create Web Service"

### Step 3: Deploy Frontend
1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `habu-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free tier
4. Add Environment Variables:
   ```
   VITE_API_BASE_URL=https://habu-backend.onrender.com
   ```
5. Click "Create Static Site"

### Step 4: Update CORS Settings
1. Go to your backend service
2. Update `CORS_ORIGIN` to your frontend URL
3. Redeploy the backend service

## 🔧 Local Development

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm or yarn

### Backend Setup
```bash
cd server
npm install
cp env.example .env
# Edit .env with your database credentials
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Database Setup
```sql
CREATE DATABASE habu_ecommerce;
USE habu_ecommerce;
-- Tables will be created automatically on first run
```

## 📊 Features

### Admin Panel
- ✅ Dashboard with analytics
- ✅ Product management (CRUD)
- ✅ Category management
- ✅ Order management
- ✅ User management
- ✅ Image upload for products

### Client Features
- ✅ Product browsing and search
- ✅ Shopping cart functionality
- ✅ User authentication
- ✅ Order history
- ✅ Wishlist
- ✅ Responsive design

### API Endpoints
- `GET /api/products` - List products
- `POST /api/products` - Create product (admin)
- `GET /api/categories` - List categories
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart

## 🔐 Default Admin Credentials
- **Email**: admin@habu.com
- **Password**: admin123

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check environment variables
   - Ensure database service is running
   - Verify connection string format

2. **CORS Errors**
   - Update `CORS_ORIGIN` in backend
   - Ensure frontend URL is correct

3. **Build Failures**
   - Check Node.js version (18+)
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall

4. **File Upload Issues**
   - Check upload directory permissions
   - Verify file size limits
   - Ensure proper MIME types

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=10000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=habu_ecommerce
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3001
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue on GitHub or contact the development team.

---

**Happy Coding! 🚀**
