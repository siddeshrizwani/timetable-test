@echo off
echo Installing Python dependencies for timetable solver...
cd backend\engine
pip install -r requirements.txt
if %ERRORLEVEL% EQU 0 (
    echo Python dependencies installed successfully!
) else (
    echo Error installing Python dependencies. Please make sure Python and pip are installed.
    echo You can install ortools manually with: pip install ortools
)
pause
