@echo off
REM =====================================================
REM Windows Setup Script for University Timetable System
REM =====================================================
REM This script automates the setup process on Windows
REM =====================================================

echo.
echo ========================================
echo University Timetable System Setup
echo ========================================
echo.

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed

REM Check if npm is installed
echo Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    pause
    exit /b 1
)
echo ✓ npm is installed

REM Check if Python is installed
echo Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)
echo ✓ Python is installed

REM Check if PostgreSQL is installed
echo Checking PostgreSQL installation...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: PostgreSQL is not installed or not in PATH
    echo Please install PostgreSQL from https://postgresql.org/
    echo.
)
echo ✓ PostgreSQL check completed

echo.
echo ========================================
echo Installing Dependencies
echo ========================================
echo.

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
if not exist package.json (
    echo ERROR: backend/package.json not found
    pause
    exit /b 1
)
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..
echo ✓ Backend dependencies installed

REM Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
if not exist package.json (
    echo ERROR: frontend/package.json not found
    pause
    exit /b 1
)
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..
echo ✓ Frontend dependencies installed

echo.
echo ========================================
echo Setting up Python Environment
echo ========================================
echo.

REM Setup Python virtual environment
echo Setting up Python virtual environment...
python setup_python.py
if %errorlevel% neq 0 (
    echo ERROR: Python setup failed
    pause
    exit /b 1
)
echo ✓ Python environment setup completed

echo.
echo ========================================
echo Environment Configuration
echo ========================================
echo.

REM Copy environment files if they don't exist
if not exist backend\.env (
    if exist backend\.env.example (
        echo Copying backend environment template...
        copy backend\.env.example backend\.env
        echo ✓ Backend .env file created from template
        echo Please edit backend\.env to configure your database settings
    ) else (
        echo WARNING: backend\.env.example not found
    )
) else (
    echo ✓ Backend .env file already exists
)

if not exist frontend\.env (
    if exist frontend\.env.example (
        echo Copying frontend environment template...
        copy frontend\.env.example frontend\.env
        echo ✓ Frontend .env file created from template
    ) else (
        echo WARNING: frontend\.env.example not found
    )
) else (
    echo ✓ Frontend .env file already exists
)

echo.
echo ========================================
echo Setup Completed Successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Configure your database settings in backend\.env
echo 2. Create PostgreSQL database and user (see LOCAL_DEVELOPMENT_SETUP.md)
echo 3. Run database schema: psql -U timetable -d TimeTable -f schema.sql
echo 4. Seed the database: cd backend ^&^& node seed.js
echo 5. Start the application: npm run dev:full
echo.
echo For detailed instructions, see LOCAL_DEVELOPMENT_SETUP.md
echo.
echo Press any key to exit...
pause >nul
