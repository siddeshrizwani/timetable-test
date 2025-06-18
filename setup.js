#!/usr/bin/env node

/**
 * One-Command Setup Script
 * University Timetable Management System
 * 
 * This script provides an interactive setup experience
 * Usage: node setup.js
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCommand(command) {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function runCommand(command, description) {
  log(`🔄 ${description}...`, 'blue');
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    return false;
  }
}

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function checkPrerequisites() {
  log('\n🔍 Checking prerequisites...', 'blue');
  
  const checks = [
    { command: 'node', name: 'Node.js', url: 'https://nodejs.org/' },
    { command: 'npm', name: 'npm', note: 'comes with Node.js' },
    { command: 'python', name: 'Python', url: 'https://python.org/' },
    { command: 'psql', name: 'PostgreSQL', url: 'https://postgresql.org/', optional: true }
  ];

  let allGood = true;
  for (const check of checks) {
    if (checkCommand(check.command)) {
      log(`✅ ${check.name} is installed`, 'green');
    } else {
      if (check.optional) {
        log(`⚠️  ${check.name} is not installed (optional)`, 'yellow');
        if (check.url) log(`   Install from: ${check.url}`, 'yellow');
      } else {
        log(`❌ ${check.name} is required but not installed`, 'red');
        if (check.url) log(`   Install from: ${check.url}`, 'red');
        allGood = false;
      }
    }
  }

  return allGood;
}

async function setupEnvironmentFiles() {
  log('\n📝 Setting up environment files...', 'blue');

  // Backend .env
  if (!fs.existsSync('backend/.env')) {
    if (fs.existsSync('backend/.env.example')) {
      fs.copyFileSync('backend/.env.example', 'backend/.env');
      log('✅ Created backend/.env from template', 'green');
      log('⚠️  Please edit backend/.env with your database settings', 'yellow');
    } else {
      log('❌ backend/.env.example not found', 'red');
    }
  } else {
    log('✅ backend/.env already exists', 'green');
  }

  // Frontend .env
  if (!fs.existsSync('frontend/.env')) {
    if (fs.existsSync('frontend/.env.example')) {
      fs.copyFileSync('frontend/.env.example', 'frontend/.env');
      log('✅ Created frontend/.env from template', 'green');
    } else {
      log('❌ frontend/.env.example not found', 'red');
    }
  } else {
    log('✅ frontend/.env already exists', 'green');
  }
}

async function main() {
  log('🚀 University Timetable System - Interactive Setup', 'blue');
  log('=' .repeat(60), 'blue');

  // Check if we're in the right directory
  if (!fs.existsSync('package.json') || !fs.existsSync('backend') || !fs.existsSync('frontend')) {
    log('❌ Please run this script from the project root directory', 'red');
    process.exit(1);
  }

  // Check prerequisites
  const prereqsOk = await checkPrerequisites();
  if (!prereqsOk) {
    log('\n❌ Please install missing prerequisites and try again', 'red');
    process.exit(1);
  }

  // Ask user what they want to do
  log('\n🎯 What would you like to do?', 'blue');
  log('1. Full setup (install dependencies, setup Python, configure environment)');
  log('2. Install dependencies only');
  log('3. Setup Python environment only');
  log('4. Setup environment files only');
  log('5. Check system health');
  log('6. Exit');

  const choice = await askQuestion('\nEnter your choice (1-6): ');

  switch (choice.trim()) {
    case '1':
      await fullSetup();
      break;
    case '2':
      await installDependencies();
      break;
    case '3':
      await setupPython();
      break;
    case '4':
      await setupEnvironmentFiles();
      break;
    case '5':
      await checkHealth();
      break;
    case '6':
      log('👋 Goodbye!', 'blue');
      break;
    default:
      log('❌ Invalid choice', 'red');
  }

  rl.close();
}

async function fullSetup() {
  log('\n🔄 Starting full setup...', 'blue');
  
  await installDependencies();
  await setupPython();
  await setupEnvironmentFiles();
  
  log('\n🎉 Full setup completed!', 'green');
  log('\n📋 Next steps:', 'blue');
  log('1. Configure database settings in backend/.env');
  log('2. Create PostgreSQL database: createdb TimeTable');
  log('3. Run schema: psql -U timetable -d TimeTable -f schema.sql');
  log('4. Seed database: cd backend && node seed.js');
  log('5. Start application: npm run dev:full');
}

async function installDependencies() {
  log('\n📦 Installing dependencies...', 'blue');
  
  if (!runCommand('npm install', 'Installing root dependencies')) return;
  if (!runCommand('cd backend && npm install', 'Installing backend dependencies')) return;
  if (!runCommand('cd frontend && npm install', 'Installing frontend dependencies')) return;
  
  log('✅ All dependencies installed successfully', 'green');
}

async function setupPython() {
  log('\n🐍 Setting up Python environment...', 'blue');
  
  const pythonCmd = checkCommand('python3') ? 'python3' : 'python';
  
  if (!runCommand(`${pythonCmd} setup_python.py`, 'Setting up Python environment')) {
    log('❌ Python setup failed. Please run manually: python setup_python.py', 'red');
  }
}

async function checkHealth() {
  log('\n🏥 Checking system health...', 'blue');
  
  // Check if dependencies are installed
  if (fs.existsSync('node_modules') && fs.existsSync('backend/node_modules') && fs.existsSync('frontend/node_modules')) {
    log('✅ Dependencies installed', 'green');
  } else {
    log('❌ Dependencies missing', 'red');
  }
  
  // Check Python environment
  if (fs.existsSync('backend/venv')) {
    log('✅ Python virtual environment exists', 'green');
  } else {
    log('❌ Python virtual environment missing', 'red');
  }
  
  // Check environment files
  if (fs.existsSync('backend/.env') && fs.existsSync('frontend/.env')) {
    log('✅ Environment files exist', 'green');
  } else {
    log('❌ Environment files missing', 'red');
  }
  
  // Try database check
  if (fs.existsSync('backend/.env')) {
    log('🔍 Checking database connection...', 'blue');
    try {
      execSync('cd backend && node check-database.js', { stdio: 'inherit' });
    } catch {
      log('❌ Database check failed', 'red');
    }
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  log('\n\n⚠️  Setup interrupted by user', 'yellow');
  rl.close();
  process.exit(0);
});

main().catch(error => {
  log(`\n❌ Setup failed: ${error.message}`, 'red');
  rl.close();
  process.exit(1);
});
