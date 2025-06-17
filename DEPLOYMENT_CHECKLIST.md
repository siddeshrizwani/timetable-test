# 📋 Single Server Deployment Checklist

Use this checklist to ensure a successful deployment of your timetable system.

## 🚀 Pre-Deployment Checklist

### **1. Code Preparation**
- [ ] All code committed to Git repository
- [ ] No sensitive data (passwords, keys) in code
- [ ] Environment variables properly configured
- [ ] Dependencies updated and tested
- [ ] Build process tested locally

### **2. Frontend Build**
- [ ] React app builds without errors (`npm run frontend:build`)
- [ ] Build output exists in `frontend/dist/`
- [ ] Static assets load correctly
- [ ] API calls use relative paths or environment variables
- [ ] Routing works with SPA configuration

### **3. Backend Configuration**
- [ ] Server configured to serve static files
- [ ] API routes prefixed with `/api`
- [ ] CORS configured for production
- [ ] Health check endpoint added
- [ ] Environment variables template created

### **4. Database Setup**
- [ ] PostgreSQL database created
- [ ] Database connection string ready
- [ ] Migration scripts tested
- [ ] Initial data (if any) prepared

### **5. Security**
- [ ] Strong SESSION_SECRET generated
- [ ] Google OAuth credentials configured
- [ ] Database credentials secured
- [ ] No debug modes enabled in production

## 🛠️ Deployment Steps

### **Option A: Railway Deployment**

1. **Setup Railway**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Create Project**
   ```bash
   railway init
   railway link
   ```

3. **Configure Environment**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set DATABASE_URL=<postgres-url>
   railway variables set SESSION_SECRET=<secure-key>
   railway variables set GOOGLE_CLIENT_ID=<client-id>
   railway variables set GOOGLE_CLIENT_SECRET=<client-secret>
   ```

4. **Deploy**
   ```bash
   railway up
   ```

### **Option B: Heroku Deployment**

1. **Create Heroku App**
   ```bash
   heroku create your-timetable-app
   heroku addons:create heroku-postgresql:mini
   ```

2. **Configure Environment**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set SESSION_SECRET=$(openssl rand -base64 32)
   heroku config:set GOOGLE_CLIENT_ID=<client-id>
   heroku config:set GOOGLE_CLIENT_SECRET=<client-secret>
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### **Option C: VPS Deployment**

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PostgreSQL
   sudo apt install postgresql postgresql-contrib
   
   # Install PM2
   npm install -g pm2
   ```

2. **Deploy Application**
   ```bash
   # Clone repository
   git clone <your-repo>
   cd timetable-intern
   
   # Build application
   ./build.sh  # or build.bat on Windows
   
   # Configure environment
   cp backend/.env.example backend/.env
   # Edit backend/.env with your values
   
   # Run migrations
   npm run migrate
   
   # Start with PM2
   pm2 start backend/server.js --name "timetable-app"
   pm2 startup
   pm2 save
   ```

3. **Configure Nginx (Optional)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## ✅ Post-Deployment Verification

### **1. Application Health**
- [ ] Server starts without errors
- [ ] Health check endpoint responds: `GET /api/health`
- [ ] Database connection successful
- [ ] No critical errors in logs

### **2. Frontend Functionality**
- [ ] Home page loads correctly
- [ ] Login functionality works
- [ ] Admin dashboard accessible
- [ ] Faculty dashboard accessible
- [ ] All routes work (no 404s)

### **3. API Functionality**
- [ ] Authentication endpoints work
- [ ] CRUD operations for batches work
- [ ] CRUD operations for subjects work
- [ ] CRUD operations for teachers work
- [ ] Timetable generation works

### **4. Database Operations**
- [ ] User registration/login works
- [ ] Data persistence verified
- [ ] Migrations applied successfully
- [ ] Batch-specific timeslots created

### **5. Performance**
- [ ] Page load times acceptable
- [ ] API response times reasonable
- [ ] Database queries optimized
- [ ] Static assets cached properly

## 🔧 Environment Variables

Make sure these are set in your production environment:

```env
# Required
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:port/db
SESSION_SECRET=<secure-random-string>

# OAuth (Required for login)
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Optional
FRONTEND_URL=<your-domain-if-needed>
```

## 🐛 Troubleshooting

### **Common Issues:**

**Build Fails:**
```bash
# Clear cache and rebuild
rm -rf frontend/dist frontend/node_modules
cd frontend && npm install && npm run build
```

**Server Won't Start:**
```bash
# Check logs
pm2 logs timetable-app
# Or for direct run
cd backend && npm start
```

**Database Connection Error:**
```bash
# Test connection
cd backend
node -e "require('./config/db').query('SELECT NOW()').then(r => console.log('Connected:', r.rows[0])).catch(console.error)"
```

**Frontend 404 Errors:**
- Ensure build files exist in `frontend/dist/`
- Check server.js serves static files correctly
- Verify SPA routing configuration

**API Errors:**
- Check CORS configuration
- Verify API routes are prefixed with `/api`
- Check authentication middleware

## 📞 Support

If you encounter issues:

1. Check the logs first
2. Verify environment variables
3. Test database connectivity
4. Check build process
5. Review this checklist

## 🎉 Success!

Once everything is working:
- [ ] Application accessible at your domain
- [ ] SSL certificate configured (if needed)
- [ ] Monitoring set up (optional)
- [ ] Backup strategy in place (optional)
- [ ] Team notified of deployment

Your timetable system is now live and ready for users! 🚀
