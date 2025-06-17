@echo off
REM build.bat - Production build script for Windows

echo 🚀 Starting production build...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Clean previous builds
echo ✅ Cleaning previous builds...
if exist frontend\dist rmdir /s /q frontend\dist
if exist backend\node_modules\.cache rmdir /s /q backend\node_modules\.cache

REM Install backend dependencies
echo ✅ Installing backend dependencies...
cd backend
call npm ci --only=production --silent
if errorlevel 1 (
    echo ❌ Backend dependency installation failed
    exit /b 1
)
cd ..

REM Install frontend dependencies
echo ✅ Installing frontend dependencies...
cd frontend
call npm ci --silent
if errorlevel 1 (
    echo ❌ Frontend dependency installation failed
    exit /b 1
)

REM Build frontend
echo ✅ Building React frontend...
call npm run build
if errorlevel 1 (
    echo ❌ Frontend build failed
    exit /b 1
)

REM Verify build output
if not exist "dist" (
    echo ❌ Frontend build failed - dist directory not created
    exit /b 1
)

echo ✅ Frontend built successfully
cd ..

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Python not found. Timetable generation may not work.
) else (
    echo ✅ Python detected:
    python --version
)

REM Copy frontend build to backend public directory (optional)
if not exist backend\public mkdir backend\public
xcopy frontend\dist\* backend\public\ /E /Y >nul 2>&1

REM Create production environment template if it doesn't exist
if not exist backend\.env (
    echo ✅ Creating .env template...
    (
        echo # Production Environment Configuration
        echo NODE_ENV=production
        echo PORT=3000
        echo.
        echo # Database Configuration
        echo DATABASE_URL=postgresql://username:password@localhost:5432/timetable_db
        echo.
        echo # Session Configuration
        echo SESSION_SECRET=change-this-secret-key
        echo.
        echo # Google OAuth Configuration
        echo GOOGLE_CLIENT_ID=your-google-client-id
        echo GOOGLE_CLIENT_SECRET=your-google-client-secret
        echo.
        echo # Optional: Frontend URL (leave empty for same-server deployment^)
        echo # FRONTEND_URL=https://your-domain.com
    ) > backend\.env
    echo ⚠️ Created .env template. Please configure with your actual values.
) else (
    echo ✅ .env file already exists
)

echo.
echo ✅ Production build completed successfully!
echo.
echo 📋 Next Steps:
echo 1. Configure your .env file in backend\ directory
echo 2. Set up your PostgreSQL database
echo 3. Run migrations: npm run migrate
echo 4. Start the server: npm start
echo.
echo 🚀 Deploy with Railway:
echo - Install Railway CLI: npm install -g @railway/cli
echo - Deploy: railway up
echo - Or connect your GitHub repo at railway.app
echo.
echo ✅ Ready for deployment! 🎉
pause
