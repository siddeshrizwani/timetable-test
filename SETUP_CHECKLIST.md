# 📋 Setup Checklist

## Pre-Setup Requirements

### Software Installation
- [ ] **Node.js** (v18.x or higher) - [Download](https://nodejs.org/)
- [ ] **PostgreSQL** (v13 or higher) - [Download](https://postgresql.org/download/)
- [ ] **Python** (v3.8 or higher) - [Download](https://python.org/downloads/)
- [ ] **Git** - [Download](https://git-scm.com/)

### Verification Commands
```bash
node --version    # Should show v18.x or higher
npm --version     # Should show v9.x or higher  
python --version  # Should show 3.8.x or higher
psql --version    # Should show PostgreSQL version
git --version     # Should show Git version
```

## Database Setup

### PostgreSQL Database Creation
- [ ] PostgreSQL service is running
- [ ] Database `TimeTable` created
- [ ] User `timetable` created with password `admin`
- [ ] User has proper permissions on the database

### Database Commands
```sql
-- Run these in psql as postgres user
CREATE DATABASE "TimeTable";
CREATE USER timetable WITH PASSWORD 'admin';
GRANT ALL PRIVILEGES ON DATABASE "TimeTable" TO timetable;
\c "TimeTable"
GRANT ALL ON SCHEMA public TO timetable;
```

## Project Setup

### Dependencies Installation
- [ ] Root dependencies installed: `npm install`
- [ ] Backend dependencies installed: `cd backend && npm install`
- [ ] Frontend dependencies installed: `cd frontend && npm install`

### Python Environment Setup
- [ ] Virtual environment created: `python -m venv backend/venv`
- [ ] Virtual environment activated
- [ ] Python packages installed: `pip install -r requirements.txt`
- [ ] OR-Tools successfully imported in Python

### Environment Configuration
- [ ] Backend `.env` file created from `.env.example`
- [ ] Frontend `.env` file created from `.env.example`
- [ ] Database connection details configured in backend `.env`
- [ ] API URL configured in frontend `.env`

### Database Schema and Data
- [ ] Schema applied: `psql -U timetable -d TimeTable -f schema.sql`
- [ ] Database seeded: `cd backend && node seed.js`
- [ ] Database health check passed: `cd backend && npm run check-db`

## Testing the Setup

### Backend Testing
- [ ] Backend starts without errors: `cd backend && npm run dev`
- [ ] API endpoints respond at `http://localhost:5000/api`
- [ ] Database connection successful
- [ ] Python engine accessible from backend

### Frontend Testing
- [ ] Frontend starts without errors: `cd frontend && npm run dev`
- [ ] Frontend accessible at `http://localhost:5173`
- [ ] Frontend can communicate with backend API
- [ ] Login page loads correctly

### Full Application Testing
- [ ] Both frontend and backend start together: `npm run dev:full`
- [ ] Can log in with admin credentials:
  - Email: `admin@university.com`
  - Password: `adminpass123`
- [ ] Dashboard loads after login
- [ ] Can navigate between different sections
- [ ] Timetable generation works (Python engine)

## Automated Setup Options

### Windows Users
```bash
# Run the automated setup script
setup_windows.bat
```

### macOS/Linux Users
```bash
# Make executable and run
chmod +x setup_unix.sh
./setup_unix.sh
```

### Python-Specific Setup
```bash
# Cross-platform Python setup
python setup_python.py
```

## Common Issues Checklist

### Database Issues
- [ ] PostgreSQL service is running
- [ ] Correct database name and credentials
- [ ] User has proper permissions
- [ ] Schema file executed successfully
- [ ] No port conflicts (5432)

### Node.js Issues
- [ ] Correct Node.js version installed
- [ ] No port conflicts (3000, 5000, 5173)
- [ ] node_modules installed correctly
- [ ] Environment variables set correctly

### Python Issues  
- [ ] Virtual environment activated
- [ ] OR-Tools installed successfully
- [ ] No Python path conflicts
- [ ] Python executable accessible from backend

### Network Issues
- [ ] No firewall blocking local ports
- [ ] CORS configured correctly
- [ ] Frontend API URL points to correct backend

## Post-Setup Verification

### System Health Check
```bash
# Check database
cd backend && npm run check-db

# Test Python environment
cd backend && source venv/bin/activate  # Linux/Mac
cd backend && venv\Scripts\activate     # Windows
python -c "import ortools; print('OR-Tools version:', ortools.__version__)"

# Test full application
npm run dev:full
```

### Default Access
- **Frontend URL**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Admin Login**: admin@university.com / adminpass123
- **Teacher Login**: a.einstein@university.com / teacherpass123

## Development Workflow

### Daily Startup
1. Ensure PostgreSQL is running
2. Navigate to project directory
3. Activate Python virtual environment (if working with engine)
4. Start application: `npm run dev:full`

### Making Changes
- **Frontend**: Edit files in `frontend/src/`, hot reload active
- **Backend**: Edit files in `backend/`, nodemon restarts automatically  
- **Database**: Create migration files in `backend/migrations/`
- **Python Engine**: Edit files in `backend/engine/`

### Git Workflow
1. Create feature branch: `git checkout -b feature-name`
2. Make and test changes
3. Commit: `git commit -m "Description"`
4. Push: `git push origin feature-name`
5. Create Pull Request

## Final Verification

- [ ] All setup steps completed successfully
- [ ] Application runs without errors
- [ ] Can perform basic operations (login, navigation)
- [ ] Timetable generation works
- [ ] No console errors in browser or terminal
- [ ] Documentation reviewed and understood

---

✅ **Setup Complete!** You're ready to start developing with the University Timetable Management System.

For detailed troubleshooting, see `LOCAL_DEVELOPMENT_SETUP.md`.
