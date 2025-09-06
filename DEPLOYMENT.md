# 🚀 Render Deployment Guide

This guide will walk you through deploying your Habu E-commerce Platform to Render.

## 📋 Prerequisites

1. **GitHub Repository**: Your code must be in a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com) (free tier available)
3. **Domain Names**: Choose unique names for your services

## 🗄️ Step 1: Deploy Database

### Create PostgreSQL Database
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure the database:
   ```
   Name: habu-database
   Database: habu_production
   User: habu_user
   Plan: Free (0.1 GB RAM, 1 GB storage)
   ```
4. Click **"Create Database"**
5. Wait for deployment (2-3 minutes)
6. **Save the connection details** - you'll need them for the backend

## 🔧 Step 2: Deploy Backend API

### Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure the service:
   ```
   Name: habu-backend
   Environment: Node
   Region: Oregon (US West)
   Branch: main (or your default branch)
   Root Directory: server
   Build Command: npm install
   Start Command: npm start
   Plan: Free (0.1 GB RAM)
   ```

### Environment Variables
Add these environment variables in the Render dashboard:

```env
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

**Important**: 
- Use the **"From Service"** option for database variables
- Generate a strong JWT_SECRET (32+ characters)
- Update CORS_ORIGIN after deploying frontend

### Deploy Backend
1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Test the health endpoint: `https://habu-backend.onrender.com/health`

## 🎨 Step 3: Deploy Frontend

### Create Static Site
1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure the site:
   ```
   Name: habu-frontend
   Branch: main (or your default branch)
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   Plan: Free
   ```

### Environment Variables
Add this environment variable:

```env
VITE_API_BASE_URL=https://habu-backend.onrender.com
```

### Deploy Frontend
1. Click **"Create Static Site"**
2. Wait for deployment (3-5 minutes)
3. Note your frontend URL: `https://habu-frontend.onrender.com`

## 🔄 Step 4: Update CORS Settings

1. Go back to your **Backend Service**
2. Navigate to **Environment** tab
3. Update `CORS_ORIGIN` to your frontend URL:
   ```
   CORS_ORIGIN=https://habu-frontend.onrender.com
   ```
4. Click **"Save Changes"**
5. The backend will automatically redeploy

## ✅ Step 5: Verify Deployment

### Test Backend
```bash
# Health check
curl https://habu-backend.onrender.com/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

### Test Frontend
1. Visit your frontend URL
2. Try logging in with admin credentials:
   - **Email**: admin@habu.com
   - **Password**: admin123
3. Test product browsing and cart functionality

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
**Error**: `Database connection failed`
**Solution**:
- Check environment variables are correctly set
- Ensure database service is running
- Verify connection string format

#### 2. CORS Errors
**Error**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`
**Solution**:
- Update `CORS_ORIGIN` in backend environment variables
- Ensure frontend URL is exactly correct (no trailing slash)
- Redeploy backend after changes

#### 3. Build Failures
**Error**: Build command failed
**Solution**:
- Check Node.js version (18+ required)
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall
- Check for TypeScript errors

#### 4. File Upload Issues
**Error**: Cannot upload images
**Solution**:
- Check upload directory permissions
- Verify file size limits (5MB max)
- Ensure proper MIME types

#### 5. Environment Variables Not Loading
**Error**: `process.env.VARIABLE is undefined`
**Solution**:
- Check variable names are exact (case-sensitive)
- Ensure variables are saved in Render dashboard
- Redeploy service after adding variables

### Debugging Tips

1. **Check Logs**: Use Render's log viewer to see real-time logs
2. **Health Endpoint**: Always test `/health` endpoint first
3. **Database**: Verify database is accessible from backend
4. **Environment**: Double-check all environment variables
5. **CORS**: Test API calls from browser developer tools

## 📊 Monitoring

### Render Dashboard
- Monitor service health and performance
- View logs and metrics
- Check resource usage
- Set up alerts for downtime

### Health Checks
- Backend: `https://habu-backend.onrender.com/health`
- Frontend: Check if site loads properly
- Database: Monitor connection status

## 🔄 Updates and Redeployment

### Automatic Deployments
- Render automatically redeploys on git push to main branch
- Environment variable changes trigger redeployment
- Manual redeploy available in dashboard

### Manual Deployment
1. Go to service dashboard
2. Click **"Manual Deploy"**
3. Select branch and commit
4. Click **"Deploy"**

## 💰 Cost Management

### Free Tier Limits
- **Web Services**: 750 hours/month
- **Databases**: 1 GB storage, 0.1 GB RAM
- **Static Sites**: Unlimited bandwidth
- **Sleep Mode**: Services sleep after 15 minutes of inactivity

### Optimization Tips
1. Use sleep mode for development
2. Optimize images and assets
3. Implement caching strategies
4. Monitor resource usage

## 🚀 Production Considerations

### Security
- Use strong JWT secrets
- Enable HTTPS (automatic on Render)
- Implement rate limiting
- Regular security updates

### Performance
- Enable compression
- Optimize database queries
- Implement caching
- Monitor performance metrics

### Backup
- Regular database backups
- Code repository backups
- Environment variable documentation

## 📞 Support

### Render Support
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Render Status](https://status.render.com)

### Project Support
- GitHub Issues for bug reports
- Documentation for setup questions
- Community forums for general help

---

**🎉 Congratulations! Your Habu E-commerce Platform is now live on Render!**

**Live URLs:**
- Frontend: `https://habu-frontend.onrender.com`
- Backend: `https://habu-backend.onrender.com`
- Health Check: `https://habu-backend.onrender.com/health`
