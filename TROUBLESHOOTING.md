# Habu E-commerce Troubleshooting Guide

## 🚀 Quick Start

### PowerShell Users (Windows)
```powershell
# Use the PowerShell script
.\start-dev.ps1

# Or start manually
cd server; npm run dev
# In another terminal
cd frontend; npm run dev
```

### Command Prompt Users
```cmd
# Start backend
cd server && npm run dev

# Start frontend (in another terminal)
cd frontend && npm run dev
```

## 🔧 Common Issues & Solutions

### 1. PowerShell Command Syntax Error
**Error:** `The token '&&' is not a valid statement separator`

**Solution:** Use PowerShell syntax:
```powershell
cd server; npm run dev
# Or use the provided start-dev.ps1 script
```

### 2. 401 Unauthorized Errors
**Error:** `api/auth/login:1 Failed to load resource: the server responded with a status of 401`

**Causes:**
- Backend server not running
- Wrong credentials
- Database not initialized

**Solutions:**
1. Ensure backend server is running on port 3000
2. Use correct test credentials:
   - **Admin:** `admin@flowerecommerce.com` / `admin123`
   - **Client:** `client@example.com` / `client123`
3. Initialize database with sample data

### 3. Image Loading Failures
**Error:** `Failed to load resource: net::ERR_CONNECTION_RESET`

**Solution:** Updated image URLs to use Unsplash (working URLs)

### 4. Database Connection Issues
**Error:** Database connection failed

**Solutions:**
1. Ensure MySQL is running
2. Create database: `flower_ecommerce`
3. Run initialization script: `server/database/init.sql`

## 🧪 Test Credentials

### Admin User
- **Email:** `admin@flowerecommerce.com`
- **Password:** `admin123`
- **Access:** Full admin panel, all CRUD operations

### Client User
- **Email:** `client@example.com`
- **Password:** `client123`
- **Access:** Shopping cart, orders, profile

## 🔍 Debugging Tools

### Frontend Debug Component
- Available in development mode
- Shows real-time auth state
- Located at bottom-right corner
- Displays: authentication status, user info, token status

### Backend Logs
- Check server console for detailed error messages
- Database connection status
- API endpoint responses

## 📊 Role-Based Access Test

### Admin Features
1. Login with admin credentials
2. Navigate to `/admin/dashboard`
3. Test product management
4. Test order management
5. Test user management

### Client Features
1. Login with client credentials
2. Navigate to `/dashboard`
3. Test shopping cart
4. Test order placement
5. Test profile management

## 🛠️ Development Commands

```bash
# Backend
cd server
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Frontend
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🌐 URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **API Documentation:** http://localhost:3000/api-docs (if Swagger is enabled)

## 📝 Notes

- Both servers must be running for full functionality
- Database must be initialized with sample data
- Use the provided PowerShell script for easy startup
- Check browser console for detailed error messages
- Ensure all dependencies are installed (`npm install` in both directories)
