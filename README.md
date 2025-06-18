# 🎓 University Timetable Management System

An intelligent, automated timetable generation system for universities using constraint-based optimization algorithms.

## 🚀 Quick Start

### For Local Development Setup

**Windows Users:**
```bash
# Run the automated setup script
setup_windows.bat
```

**macOS/Linux Users:**
```bash
# Make the script executable and run it
chmod +x setup_unix.sh
./setup_unix.sh
```

**Manual Setup:**
See [LOCAL_DEVELOPMENT_SETUP.md](./LOCAL_DEVELOPMENT_SETUP.md) for detailed instructions.

## 📋 Prerequisites

- **Node.js** (v18.x or higher)
- **PostgreSQL** (v13 or higher)  
- **Python** (v3.8 or higher)
- **npm** (v9.x or higher)

## ⚡ Quick Development Start

```bash
# 1. Clone and setup
git clone <repository-url>
cd timetable-intern

# 2. Install dependencies
npm run setup

# 3. Setup Python environment
python setup_python.py

# 4. Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit .env files with your database settings

# 5. Setup database
createdb TimeTable
psql -U postgres -d TimeTable -f schema.sql

# 6. Seed database
cd backend && node seed.js

# 7. Start the application
npm run dev:full
```

Access the application at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

**Default Login:**
- Email: `admin@university.com`
- Password: `adminpass123`

## 🏗️ System Architecture

### Tech Stack
- **Frontend**: React.js + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **Optimization Engine**: Python + Google OR-Tools
- **Authentication**: JWT-based

### Key Features
- ✅ Automated conflict-free timetable generation
- ✅ Constraint-based optimization algorithms
- ✅ Multi-batch scheduling support
- ✅ Teacher and room allocation management
- ✅ Real-time conflict detection
- ✅ Customizable time slots and schedules
- ✅ Export functionality (PDF, Excel)
- ✅ Role-based access control
- ✅ Responsive web interface

## 📂 Project Structure

```
timetable-intern/
├── 📁 backend/                 # Node.js backend server
│   ├── 📁 config/             # Database configuration
│   ├── 📁 engine/             # Python timetable optimization engine
│   ├── 📁 middleware/         # Express middleware (auth, CORS, etc.)
│   ├── 📁 migrations/         # Database migration scripts
│   ├── 📁 routes/             # API route handlers
│   ├── 📄 server.js           # Main server file
│   ├── 📄 seed.js             # Database seeding script
│   └── 📄 .env.example        # Environment configuration template
├── 📁 frontend/               # React frontend application
│   ├── 📁 src/               # React components and pages
│   │   ├── 📁 pages/         # Page components
│   │   ├── 📁 auth/          # Authentication components
│   │   └── 📁 assets/        # Static assets
│   └── 📄 .env.example       # Frontend environment template
├── 📄 schema.sql             # Complete database schema
├── 📄 requirements.txt       # Python dependencies
├── 📄 LOCAL_DEVELOPMENT_SETUP.md  # Detailed setup guide
├── 📄 setup_python.py        # Python environment setup script
├── 📄 setup_windows.bat      # Windows automated setup
└── 📄 setup_unix.sh          # Unix/Linux/macOS automated setup
```

## 🔧 Available Scripts

### Root Directory
```bash
npm run setup              # Install all dependencies
npm run dev:full          # Start both frontend and backend
npm run build             # Build entire application
npm run seed              # Seed database with sample data
npm run check-db          # Check database health
npm run migrate           # Run database migrations
```

### Backend
```bash
cd backend
npm run dev              # Start development server with hot reload
npm start                # Start production server
npm run check-db         # Database health check
node seed.js             # Seed database
```

### Frontend
```bash
cd frontend
npm run dev              # Start Vite development server
npm run build            # Build for production
npm run preview          # Preview production build
```

## 🗄️ Database Management

### Initial Setup
```bash
# Create database and user
createdb TimeTable
createuser timetable --pwprompt

# Apply schema
psql -U timetable -d TimeTable -f schema.sql

# Seed with sample data
cd backend && node seed.js
```

### Health Check
```bash
cd backend
npm run check-db
```

## 🐍 Python Engine

The timetable optimization engine uses Google OR-Tools for constraint programming:

```bash
# Setup Python environment
python setup_python.py

# Activate virtual environment
# Windows: backend\venv\Scripts\activate
# Unix/Linux: source backend/venv/bin/activate

# Test the engine
cd backend/engine
python solve_.py
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### Core Resources
- `GET/POST /api/batches` - Batch management
- `GET/POST /api/subjects` - Subject management
- `GET/POST /api/teachers` - Teacher management
- `GET/POST /api/rooms` - Room management
- `GET/POST /api/timetables` - Timetable generation

See API documentation at `/api/docs` when running in development mode.

## 👥 User Roles

### Admin
- Manage batches, subjects, teachers, and rooms
- Generate and modify timetables
- View system analytics
- Manage user accounts

### Teacher
- View assigned schedules
- Submit availability preferences
- Access student and class information

## � Environment Configuration

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=timetable
DB_PASSWORD=admin
DB_DATABASE=TimeTable

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Server
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```env
# API
VITE_API_BASE_URL=http://localhost:5000/api

# App
VITE_APP_NAME=University Timetable System
VITE_NODE_ENV=development
```

## 🚀 Deployment

### Railway (Recommended)
1. Connect repository to Railway
2. Add PostgreSQL database service
3. Set environment variables
4. Deploy automatically on push

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
NODE_ENV=production npm start
```

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests  
cd frontend && npm test

# Database health check
npm run check-db
```

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed:**
- Ensure PostgreSQL is running
- Check credentials in `.env` file
- Verify database exists

**Python Module Not Found:**
- Activate virtual environment
- Install requirements: `pip install -r requirements.txt`

**Port Already in Use:**
- Kill existing processes
- Change port in configuration

**Frontend Build Errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `npm run dev -- --force`

See [LOCAL_DEVELOPMENT_SETUP.md](./LOCAL_DEVELOPMENT_SETUP.md) for detailed troubleshooting guide.

## 📚 Documentation

- [LOCAL_DEVELOPMENT_SETUP.md](./LOCAL_DEVELOPMENT_SETUP.md) - Complete setup guide
- [DEPLOY_RAILWAY.md](./DEPLOY_RAILWAY.md) - Railway deployment guide
- `/api/docs` - API documentation (development only)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Commit with clear messages: `git commit -m "Add feature description"`
5. Push and create a Pull Request

## 📞 Support

For support and questions:
- Check the troubleshooting section
- Review the setup guide
- Create an issue on GitHub

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

---

**Happy Scheduling! 🎉**

*Building intelligent timetables for modern universities.*
