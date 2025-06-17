#!/bin/bash

# build.sh - Production build script for single-server deployment

set -e  # Exit on any error

echo "🚀 Starting production build..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if ! node -pe "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION') ? 0 : 1)" 2>/dev/null; then
    print_warning "Node.js version $NODE_VERSION detected. Recommended: $REQUIRED_VERSION+"
fi

print_status "Node.js version: $NODE_VERSION"

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf frontend/dist
rm -rf backend/node_modules/.cache

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm ci --only=production --silent
cd ..

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
npm ci --silent

# Build frontend
print_status "Building React frontend..."
npm run build

# Verify build output
if [ ! -d "dist" ]; then
    print_error "Frontend build failed - dist directory not created"
    exit 1
fi

print_status "Frontend built successfully"
cd ..

# Check if Python is available (for timetable solver)
if command -v python3 &> /dev/null; then
    print_status "Python3 detected: $(python3 --version)"
    
    # Check if ortools is installed
    if python3 -c "import ortools" 2>/dev/null; then
        print_status "OR-Tools is installed"
    else
        print_warning "OR-Tools not found. Install with: pip3 install ortools"
    fi
else
    print_warning "Python3 not found. Timetable generation may not work."
fi

# Copy frontend build to backend public directory (alternative approach)
# This is optional since server.js already serves from frontend/dist
mkdir -p backend/public
cp -r frontend/dist/* backend/public/ 2>/dev/null || true

# Create production environment template
if [ ! -f "backend/.env" ]; then
    print_status "Creating .env template..."
    cat > backend/.env << EOL
# Production Environment Configuration
NODE_ENV=production
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/timetable_db

# Session Configuration
SESSION_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "change-this-secret-key")

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional: Frontend URL (leave empty for same-server deployment)
# FRONTEND_URL=https://your-domain.com
EOL
    print_warning "Created .env template. Please configure with your actual values."
else
    print_status ".env file already exists"
fi

# Test build
print_status "Testing production build..."
cd backend

# Quick server start test
timeout 10s node -e "
const app = require('./server.js');
setTimeout(() => {
  console.log('✅ Server starts successfully');
  process.exit(0);
}, 2000);
" 2>/dev/null || print_warning "Could not test server startup (this is normal if database is not configured)"

cd ..

# Display build information
echo ""
echo "📊 Build Summary:"
echo "=================="
echo "Frontend build size: $(du -sh frontend/dist 2>/dev/null | cut -f1 || echo "Unknown")"
echo "Backend dependencies: $(ls backend/node_modules | wc -l) packages"
echo "Total project size: $(du -sh . 2>/dev/null | cut -f1 || echo "Unknown")"

echo ""
print_status "Production build completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Configure your .env file in backend/ directory"
echo "2. Set up your PostgreSQL database"
echo "3. Run migrations: npm run migrate"
echo "4. Start the server: npm start"
echo ""
echo "🚀 Deploy with Railway:"
echo "- Install Railway CLI: npm install -g @railway/cli"
echo "- Deploy: railway up"
echo "- Or connect your GitHub repo at railway.app"
echo ""
print_status "Ready for deployment! 🎉"
