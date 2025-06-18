#!/bin/bash

# =====================================================
# Unix/Linux/macOS Setup Script for University Timetable System
# =====================================================
# This script automates the setup process on Unix-like systems
# =====================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "ℹ $1"
}

check_command() {
    if command -v "$1" &> /dev/null; then
        print_success "$1 is installed"
        return 0
    else
        print_error "$1 is not installed or not in PATH"
        return 1
    fi
}

echo
echo "========================================"
echo "University Timetable System Setup"
echo "========================================"
echo

# Check prerequisites
echo "Checking prerequisites..."

# Check Node.js
if check_command "node"; then
    NODE_VERSION=$(node --version)
    print_info "Node.js version: $NODE_VERSION"
else
    print_error "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check npm
if check_command "npm"; then
    NPM_VERSION=$(npm --version)
    print_info "npm version: $NPM_VERSION"
else
    print_error "npm is required but not installed"
    exit 1
fi

# Check Python
if check_command "python3"; then
    PYTHON_VERSION=$(python3 --version)
    print_info "Python version: $PYTHON_VERSION"
elif check_command "python"; then
    PYTHON_VERSION=$(python --version)
    print_info "Python version: $PYTHON_VERSION"
else
    print_error "Please install Python from https://python.org/"
    exit 1
fi

# Check PostgreSQL
if check_command "psql"; then
    PSQL_VERSION=$(psql --version | head -n1)
    print_info "PostgreSQL version: $PSQL_VERSION"
else
    print_warning "PostgreSQL is not installed or not in PATH"
    print_info "Please install PostgreSQL from https://postgresql.org/"
fi

echo
echo "========================================"
echo "Installing Dependencies"
echo "========================================"
echo

# Install backend dependencies
print_info "Installing backend dependencies..."
if [ ! -f "backend/package.json" ]; then
    print_error "backend/package.json not found"
    exit 1
fi

cd backend
npm install
print_success "Backend dependencies installed"
cd ..

# Install frontend dependencies
print_info "Installing frontend dependencies..."
if [ ! -f "frontend/package.json" ]; then
    print_error "frontend/package.json not found"
    exit 1
fi

cd frontend
npm install
print_success "Frontend dependencies installed"
cd ..

echo
echo "========================================"
echo "Setting up Python Environment"
echo "========================================"
echo

# Setup Python virtual environment
print_info "Setting up Python virtual environment..."

# Determine Python command
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
else
    PYTHON_CMD="python"
fi

# Run Python setup
$PYTHON_CMD setup_python.py
if [ $? -eq 0 ]; then
    print_success "Python environment setup completed"
else
    print_error "Python setup failed"
    exit 1
fi

echo
echo "========================================"
echo "Environment Configuration"
echo "========================================"
echo

# Copy environment files if they don't exist
if [ ! -f "backend/.env" ]; then
    if [ -f "backend/.env.example" ]; then
        print_info "Copying backend environment template..."
        cp backend/.env.example backend/.env
        print_success "Backend .env file created from template"
        print_warning "Please edit backend/.env to configure your database settings"
    else
        print_warning "backend/.env.example not found"
    fi
else
    print_success "Backend .env file already exists"
fi

if [ ! -f "frontend/.env" ]; then
    if [ -f "frontend/.env.example" ]; then
        print_info "Copying frontend environment template..."
        cp frontend/.env.example frontend/.env
        print_success "Frontend .env file created from template"
    else
        print_warning "frontend/.env.example not found"
    fi
else
    print_success "Frontend .env file already exists"
fi

# Make scripts executable
if [ -f "setup_python.py" ]; then
    chmod +x setup_python.py
fi

echo
echo "========================================"
echo "Setup Completed Successfully!"
echo "========================================"
echo
echo "Next steps:"
echo "1. Configure your database settings in backend/.env"
echo "2. Create PostgreSQL database and user (see LOCAL_DEVELOPMENT_SETUP.md)"
echo "3. Run database schema: psql -U timetable -d TimeTable -f schema.sql"
echo "4. Seed the database: cd backend && node seed.js"
echo "5. Start the application: npm run dev:full"
echo
echo "For detailed instructions, see LOCAL_DEVELOPMENT_SETUP.md"
echo

# Check if PostgreSQL is running (optional)
if command -v systemctl &> /dev/null; then
    if systemctl is-active --quiet postgresql; then
        print_success "PostgreSQL service is running"
    else
        print_warning "PostgreSQL service is not running"
        print_info "Start it with: sudo systemctl start postgresql"
    fi
elif command -v brew &> /dev/null; then
    if brew services list | grep postgresql | grep started &> /dev/null; then
        print_success "PostgreSQL service is running"
    else
        print_warning "PostgreSQL service is not running"
        print_info "Start it with: brew services start postgresql"
    fi
fi

echo
print_success "Setup script completed!"
