#!/usr/bin/env python3
"""
=====================================================
Python Environment Setup Script
University Timetable Management System
=====================================================

This script helps set up the Python environment for the 
timetable optimization engine.

Usage:
    python setup_python.py

Or run directly:
    python -m setup_python
=====================================================
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors."""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error during {description}:")
        print(f"   Command: {command}")
        print(f"   Error: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible."""
    print("🐍 Checking Python version...")
    
    major, minor = sys.version_info[:2]
    if major < 3 or (major == 3 and minor < 8):
        print(f"❌ Python {major}.{minor} detected. Python 3.8 or higher is required.")
        print("   Please upgrade Python and try again.")
        return False
    
    print(f"✅ Python {major}.{minor} is compatible")
    return True

def create_virtual_environment():
    """Create a Python virtual environment."""
    venv_path = Path("backend/venv")
    
    if venv_path.exists():
        print("📁 Virtual environment already exists at backend/venv")
        return True
    
    print("📁 Creating virtual environment...")
    return run_command(
        "python -m venv backend/venv",
        "Creating virtual environment"
    )

def get_activate_command():
    """Get the appropriate activation command for the current OS."""
    if platform.system() == "Windows":
        return "backend\\venv\\Scripts\\activate"
    else:
        return "source backend/venv/bin/activate"

def install_requirements():
    """Install Python requirements."""
    print("📦 Installing Python packages...")
    
    # Determine the correct pip command based on OS
    if platform.system() == "Windows":
        pip_command = "backend\\venv\\Scripts\\pip"
    else:
        pip_command = "backend/venv/bin/pip"
    
    # Upgrade pip first
    if not run_command(f"{pip_command} install --upgrade pip", "Upgrading pip"):
        return False
    
    # Install requirements
    return run_command(
        f"{pip_command} install -r requirements.txt",
        "Installing Python packages from requirements.txt"
    )

def test_installation():
    """Test if the installation was successful."""
    print("🧪 Testing installation...")
    
    if platform.system() == "Windows":
        python_command = "backend\\venv\\Scripts\\python"
    else:
        python_command = "backend/venv/bin/python"
    
    test_commands = [
        (f"{python_command} -c \"import ortools; print('OR-Tools version:', ortools.__version__)\"", 
         "Testing OR-Tools import"),
        (f"{python_command} -c \"import json; print('JSON module available')\"", 
         "Testing JSON module"),
        (f"{python_command} -c \"import sys; print('Python executable:', sys.executable)\"", 
         "Checking Python executable")
    ]
    
    all_tests_passed = True
    for command, description in test_commands:
        if not run_command(command, description):
            all_tests_passed = False
    
    return all_tests_passed

def test_solver():
    """Test the timetable solver."""
    print("🔍 Testing timetable solver...")
    
    solver_path = Path("backend/engine/solve_.py")
    if not solver_path.exists():
        print("❌ Solver file not found at backend/engine/solve_.py")
        return False
    
    if platform.system() == "Windows":
        python_command = "backend\\venv\\Scripts\\python"
    else:
        python_command = "backend/venv/bin/python"
    
    # Test with a simple import check
    return run_command(
        f"{python_command} -c \"import sys; sys.path.append('backend/engine'); import solve_; print('Solver module loaded successfully')\"",
        "Testing solver module"
    )

def print_instructions():
    """Print post-setup instructions."""
    activate_cmd = get_activate_command()
    
    print("\n" + "="*60)
    print("🎉 PYTHON SETUP COMPLETED SUCCESSFULLY!")
    print("="*60)
    
    print("\n📋 Next Steps:")
    print(f"1. Activate the virtual environment:")
    if platform.system() == "Windows":
        print(f"   {activate_cmd}")
    else:
        print(f"   {activate_cmd}")
    
    print("\n2. To work with the Python engine:")
    print("   cd backend/engine")
    print("   python solve_.py")
    
    print("\n3. To start the full application:")
    print("   npm run dev:full")
    
    print("\n4. To manually test the solver:")
    print("   cd backend")
    if platform.system() == "Windows":
        print("   venv\\Scripts\\activate")
    else:
        print("   source venv/bin/activate")
    print("   cd engine")
    print("   python solve_.py")
    
    print("\n💡 Tips:")
    print("   - Always activate the virtual environment before working with Python")
    print("   - Use 'deactivate' to exit the virtual environment")
    print("   - The virtual environment is located at backend/venv")
    
    print("\n🔧 If you encounter issues:")
    print("   - Ensure PostgreSQL is running")
    print("   - Check that all environment variables are set")
    print("   - Verify database connection in backend/.env")
    print("="*60)

def main():
    """Main setup function."""
    print("🚀 Python Environment Setup for University Timetable System")
    print("="*60)
    
    # Check if we're in the right directory
    if not Path("backend").exists() or not Path("requirements.txt").exists():
        print("❌ Error: Please run this script from the project root directory")
        print("   Expected structure:")
        print("   - backend/")
        print("   - requirements.txt")
        print("   - setup_python.py")
        return False
    
    steps = [
        ("Checking Python version", check_python_version),
        ("Creating virtual environment", create_virtual_environment),
        ("Installing requirements", install_requirements),
        ("Testing installation", test_installation),
        ("Testing solver", test_solver),
    ]
    
    for step_name, step_function in steps:
        print(f"\n🔄 {step_name}...")
        if not step_function():
            print(f"\n❌ Setup failed at step: {step_name}")
            print("Please fix the error above and try again.")
            return False
    
    print_instructions()
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error during setup: {e}")
        sys.exit(1)
