# 🚀 Railway Deployment Guide

Deploy your university timetable system to Railway with a single unified server serving both frontend and backend.

## 💰 **Cost**: ~$5-20/month with usage-based pricing

## 🎯 **What You'll Get**
- **Single unified service** serving both React frontend and API
- **Automatic deployments** from GitHub on every push
- **Built-in PostgreSQL database** with automatic backups
- **Custom domain with SSL** included and managed
- **Easy scaling** and real-time monitoring
- **Environment variable management** with Railway's dashboard

## 📋 **Quick Deployment (5 minutes)**

### **1. Prepare Repository**
```bash
# Ensure your code is in a GitHub repository
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### **2. Create Railway Project**
1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `timetable-intern` repository
4. Railway will automatically detect Node.js and use the unified server setup

### **3. Add Database**
1. In your project dashboard, click **"Add Service"** → **"Database"** → **"PostgreSQL"**
2. Railway automatically creates database and connection variables

### **4. Configure Environment Variables**
In Railway dashboard → Your Service → **Variables** tab, add:

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
SESSION_SECRET=your-super-secret-session-key-here
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```

**Generate SESSION_SECRET:**
```bash
# Run this locally to generate a secure session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **5. Setup Google OAuth**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Set authorized redirect URI: `https://your-railway-domain.railway.app/api/auth/google/callback`
6. Copy Client ID and Client Secret to Railway environment variables

### **6. Deploy & Migrate**
1. Railway will automatically build and deploy your app
2. Once deployed, run database migrations:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and connect to your project
railway login
railway link

# Run migrations
railway run npm run migrate
```

## 🔧 **Railway Configuration**

Your project includes `railway.json` which tells Railway how to build and deploy:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 🌐 **Custom Domain (Optional)**

1. In Railway dashboard → **Settings** → **Domains**
2. Click **"Custom Domain"**
3. Enter your domain (e.g., `timetable.yourschool.edu`)
4. Update your domain's DNS to point to Railway's servers
5. SSL certificate will be automatically provisioned

## ✅ **Verify Deployment**

After deployment, verify everything works:

1. **Health Check**: Visit `https://your-app.railway.app/api/health`
2. **Database Check**: Run `railway run npm run check-db` to verify database setup
3. **Frontend**: Visit `https://your-app.railway.app/` (should load React app)
4. **Login**: Test Google OAuth login functionality
5. **Admin Panel**: Login and test batch/subject creation
6. **Timetable Generation**: Create a batch and generate timetable

## 📊 **Monitoring & Logs**

Railway provides built-in monitoring:

- **Logs**: Real-time logs in Railway dashboard
- **Metrics**: CPU, Memory, Network usage
- **Deployments**: History of all deployments
- **Health Checks**: Automatic health monitoring at `/api/health`

## 🔄 **Automatic Deployments**

Railway automatically deploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push origin main

# Railway automatically builds and deploys
# No manual intervention needed!
```

## 💡 **Tips for Railway**

1. **Environment Variables**: Use Railway's variable references (e.g., `${{Postgres.DATABASE_URL}}`)
2. **Build Optimization**: Railway caches dependencies for faster builds
3. **Scaling**: Easily scale up/down based on usage in Railway dashboard
4. **Monitoring**: Set up alerts for high CPU/memory usage
5. **Backups**: PostgreSQL backups are automatic on Railway

## 🐛 **Troubleshooting**

**Build Fails:**
- Check build logs in Railway dashboard
- Ensure all dependencies are in `package.json`
- Verify build command runs locally

**App Won't Start:**
- Check deploy logs for errors
- Verify environment variables are set correctly
- Test health check endpoint

**Database Connection Issues:**
- Verify `DATABASE_URL` variable is set
- Check PostgreSQL service is running
- Ensure migrations have been run

**Google OAuth Not Working:**
- Verify redirect URI matches your Railway domain
- Check Client ID and Secret are correct
- Ensure Google+ API is enabled

## 🎉 **You're Done!**

Your timetable system is now live on Railway with:
- ✅ Unified frontend + backend on single domain
- ✅ Automatic SSL and custom domain support
- ✅ PostgreSQL database with batch-specific timeslots
- ✅ Google OAuth authentication
- ✅ Automatic deployments from GitHub
- ✅ Professional monitoring and scaling

Visit your app and start creating university timetables! 🎓📅
1. Railway will automatically deploy your backend
2. You'll get a URL like: `https://your-app.railway.app`
3. Check logs to ensure the unified server is running correctly

### 7. **Run Database Schema**
1. Once deployed, initialize the database schema
2. The project now uses a unified schema for clean deployments:

```bash
# Install Railway CLI locally
npm install -g @railway/cli

# Login to Railway
railway login

# Connect to your project
railway link

# Run unified schema (for new deployments)
railway run npm run migrate

# OR for existing databases with data, use incremental migrations:
railway run npm run migrate:incremental
```

**For fresh Railway PostgreSQL databases**, use the unified schema (`npm run migrate`) which creates all tables in one clean operation.

**For existing databases with data**, use incremental migrations (`npm run migrate:incremental`) to preserve existing data.

### 8. **Install Python Dependencies**
Create a `requirements.txt` in your backend folder:

```txt
ortools>=9.4.1874
pandas>=1.5.0
numpy>=1.24.0
```

Update your backend's `package.json` to include a postinstall script:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "postinstall": "pip3 install -r requirements.txt || pip install -r requirements.txt"
  }
}
```

## 🔧 **Railway Configuration Tips**

### 1. **Custom Domains**
1. In Railway dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. SSL is automatically handled

### 2. **Environment Management**
- Use Railway's environment variables interface
- Variables are automatically injected
- Use `${{Postgres.DATABASE_URL}}` syntax for database references

### 3. **Monitoring**
- Check the Metrics tab for resource usage
- View real-time logs in the Deployments tab
- Set up alerts for high usage

## ✅ **Testing Your Deployment**

1. **Health Check**: Visit `https://your-app.railway.app/api/health`
2. **Frontend**: Visit `https://your-app.railway.app/` (React app served by backend)
3. **API Endpoints**: Test `https://your-app.railway.app/api/batches`
4. **Full Integration**: Test timetable generation through the unified UI

## 💰 **Cost Optimization**
- Railway charges based on usage ($5/month minimum)
- PostgreSQL database included in base cost
- Monitor usage in dashboard to avoid surprises
- Consider sleeping services during low usage

## 🆘 **Troubleshooting**

### **Common Issues:**
1. **Build Failures**: Check build logs in Railway dashboard
2. **Database Connection**: Verify environment variables are set correctly
3. **Python Errors**: Ensure requirements.txt is in backend folder
4. **CORS Errors**: Update frontend URL in backend CORS settings

### **Helpful Commands:**
```bash
# Check Railway logs
railway logs

# Connect to database
railway connect postgres

# Redeploy service
railway redeploy

# Check environment variables
railway variables
```

## 🔄 **Continuous Deployment**
- Railway automatically deploys when you push to your main branch
- Use GitHub environments for staging/production separation
- Consider using Railway's PR deployments for testing

This Railway deployment gives you a modern, scalable solution with minimal configuration!
