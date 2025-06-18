# 🚀 Local Development Setup Guide

## University Timetable Management System

This comprehensive guide will help you set up the University Timetable Management System on your local machine for development purposes.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Overview](#project-overview)
3. [Database Setup](#database-setup)
4. [Backend Setup](#backend-setup)
5. [Python Environment Setup](#python-environment-setup)
6. [Frontend Setup](#frontend-setup)
7. [Running the Application](#running-the-application)
8. [Development Workflow](#development-workflow)
9. [Troubleshooting](#troubleshooting)
10. [Available Scripts](#available-scripts)

## 🔧 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software
- **Node.js** (v18.x or higher) - [Download here](https://nodejs.org/)
- **npm** (v9.x or higher) - comes with Node.js
- **PostgreSQL** (v13 or higher) - [Download here](https://www.postgresql.org/download/)
- **Python** (v3.8 or higher) - [Download here](https://www.python.org/downloads/)
- **Git** - [Download here](https://git-scm.com/)

### Verify Installations
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check PostgreSQL version
psql --version

# Check Python version
python --version

# Check Git version
git --version
```

## 🏗️ Project Overview

### Architecture
- **Frontend**: React.js with Vite, Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **Timetable Engine**: Python with Google OR-Tools
- **Authentication**: JWT-based

### Directory Structure
```
timetable-intern/
├── backend/                 # Node.js backend server
│   ├── config/             # Database configuration
│   ├── engine/             # Python timetable solver
│   ├── middleware/         # Express middleware
│   ├── migrations/         # Database migration scripts
│   └── routes/             # API routes
├── frontend/               # React frontend application
│   ├── public/             # Static assets
│   └── src/                # React components and pages
├── schema.sql              # Complete database schema
├── requirements.txt        # Python dependencies
└── package.json            # Root project configuration
```

## 🗄️ Database Setup

### 1. Install PostgreSQL

**Windows:**
- Download and install PostgreSQL from the official website
- Remember the password you set for the `postgres` user during installation
- Add PostgreSQL to your system PATH

**macOS:**
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database and User

Open your terminal/command prompt and connect to PostgreSQL:

```bash
# Connect to PostgreSQL as the postgres user
psql -U postgres
```

In the PostgreSQL shell, execute the following commands:

```sql
-- Create the database
CREATE DATABASE "TimeTable";

-- Create a dedicated user for the application
CREATE USER timetable WITH PASSWORD 'admin';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON DATABASE "TimeTable" TO timetable;

-- Connect to the TimeTable database
\c "TimeTable"

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO timetable;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO timetable;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO timetable;

-- Exit PostgreSQL shell
\q
```

### 3. Run Database Schema

From the project root directory, run the schema to create all tables:

```bash
# Run the schema file
psql -U timetable -d TimeTable -f schema.sql
```

If you encounter any permission issues, you can run it as postgres user:

```bash
# Alternative method using postgres user
psql -U postgres -d TimeTable -f schema.sql
```

## 🔧 Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
# Copy the example environment file
cp .env.example .env
```

If `.env.example` doesn't exist, create `.env` manually with the following content:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=timetable
DB_PASSWORD=admin
DB_DATABASE=TimeTable

# Alternative: Use DATABASE_URL for full connection string
# DATABASE_URL=postgresql://timetable:admin@localhost:5432/TimeTable

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development

# Python Engine Path (adjust if needed)
PYTHON_ENGINE_PATH=./engine/solve_.py
```

### 4. Verify Database Connection

Test the database connection:

```bash
npm run check-db
```

### 5. Run Database Migrations and Seeding

```bash
# Run any pending migrations
npm run migrate

# Seed the database with initial data
node seed.js
```

This will create:
- Default admin user: `admin@university.com` / `adminpass123`
- Sample teachers, subjects, rooms, and batches
- Default timeslots for all batches

## 🐍 Python Environment Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment

**Windows:**
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate
```

**macOS/Linux:**
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate
```

### 3. Install Python Dependencies

With the virtual environment activated:

```bash
# Install from requirements.txt in root directory
pip install -r ../requirements.txt

# Or install from engine requirements
pip install -r engine/requirements.txt
```

### 4. Verify Python Setup

Test the Python timetable engine:

```bash
# Test the solver with sample input
cd engine
python solve_.py
```

## 🎨 Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `frontend` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME="University Timetable System"

# Development Configuration
VITE_NODE_ENV=development
```

### 4. Verify Frontend Setup

Start the development server to test:

```bash
npm run dev
```

The frontend should be accessible at `http://localhost:5173`

## 🚀 Running the Application

### Method 1: Run Everything Separately

**Terminal 1 - Database:**
Ensure PostgreSQL is running

**Terminal 2 - Backend:**
```bash
cd backend
# Activate Python virtual environment first
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### Method 2: Run with Concurrently (Recommended)

From the project root:

```bash
# Install dependencies for both frontend and backend
npm run setup

# Run both frontend and backend together
npm run dev:full
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Database**: localhost:5432

### Default Login Credentials

After running the seed script, you can log in with:
- **Email**: `admin@university.com`
- **Password**: `adminpass123`

## 🔄 Development Workflow

### Daily Development Routine

1. **Start your development session:**
   ```bash
   # Pull latest changes
   git pull origin main
   
   # Install any new dependencies
   npm run setup
   
   # Start the application
   npm run dev:full
   ```

2. **Making changes:**
   - Frontend changes: Edit files in `frontend/src/`
   - Backend API changes: Edit files in `backend/routes/`, `backend/middleware/`
   - Database changes: Create migration files in `backend/migrations/`
   - Python engine changes: Edit files in `backend/engine/`

3. **Testing changes:**
   - Frontend hot-reloads automatically
   - Backend restarts automatically with nodemon
   - Test API endpoints using browser or Postman

### Database Operations

**Add new migration:**
```bash
cd backend
# Create new migration file
touch migrations/006_your_migration_name.sql
# Edit the file with your SQL changes
npm run migrate:incremental
```

**Reset database (development only):**
```bash
# Re-run schema and seed
psql -U timetable -d TimeTable -f ../schema.sql
node seed.js
```

### Python Environment

**Always activate the virtual environment before backend development:**

```bash
cd backend
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

**Install new Python packages:**
```bash
pip install package-name
pip freeze > requirements.txt  # Update requirements
```

## 🔧 Available Scripts

### Root Directory Scripts
```bash
npm run setup              # Install all dependencies
npm run build             # Build the entire application
npm run dev:full          # Run both frontend and backend
npm run migrate           # Run database migrations
npm run migrate:incremental # Run incremental migrations
npm run check-db          # Check database connection
```

### Backend Scripts
```bash
cd backend
npm start                 # Start production server
npm run dev              # Start development server with nodemon
npm run check-db         # Test database connection
node seed.js             # Seed database with sample data
```

### Frontend Scripts
```bash
cd frontend
npm run dev              # Start Vite development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Database Connection Issues

**Problem**: "Connection refused" or "password authentication failed"

**Solutions:**
1. Ensure PostgreSQL is running:
   ```bash
   # Windows
   net start postgresql-x64-15
   
   # macOS
   brew services start postgresql
   
   # Linux
   sudo systemctl start postgresql
   ```

2. Verify database credentials in `.env` file
3. Test connection manually:
   ```bash
   psql -U timetable -d TimeTable -h localhost
   ```

#### Python Environment Issues

**Problem**: "Module not found" or "ortools not installed"

**Solutions:**
1. Ensure virtual environment is activated
2. Reinstall dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Verify Python path in backend `.env` file

#### Port Conflicts

**Problem**: "Port already in use"

**Solutions:**
1. Kill processes using the ports:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -ti:5000 | xargs kill -9
   ```

2. Change ports in configuration files:
   - Backend: `backend/.env` (PORT variable)
   - Frontend: `frontend/vite.config.js`

#### Migration Issues

**Problem**: Migration fails or schema conflicts

**Solutions:**
1. Check current migration status:
   ```bash
   cd backend
   node check-database.js
   ```

2. Reset database (development only):
   ```bash
   dropdb -U postgres TimeTable
   createdb -U postgres TimeTable
   psql -U postgres -d TimeTable -f ../schema.sql
   ```

#### Frontend Build Issues

**Problem**: Vite build failures or module resolution errors

**Solutions:**
1. Clear node_modules and reinstall:
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Clear Vite cache:
   ```bash
   npm run dev -- --force
   ```

### Getting Help

If you encounter issues not covered here:

1. Check the console/terminal output for specific error messages
2. Verify all prerequisites are correctly installed
3. Ensure all environment variables are properly set
4. Check the GitHub issues for similar problems
5. Create a new issue with detailed error logs

## 📝 Additional Notes

### Development Best Practices

1. **Environment Variables**: Never commit `.env` files to version control
2. **Database**: Use migrations for schema changes, never edit `schema.sql` directly
3. **Python**: Always work within the virtual environment
4. **Git**: Create feature branches for new functionality
5. **Testing**: Test both frontend and backend after making changes

### Performance Tips

1. **Database**: Add indexes for frequently queried columns
2. **Frontend**: Use React DevTools for debugging
3. **Backend**: Monitor API response times
4. **Python**: Profile the solver for large datasets

### Security Considerations

1. Change default passwords in production
2. Use strong JWT secrets
3. Enable CORS only for trusted origins
4. Validate all user inputs
5. Use HTTPS in production

---

Happy coding! 🎉

If you have any questions or need assistance, please refer to the troubleshooting section or create an issue in the project repository.
