@echo off
echo ============================================
echo   Classroom Discourse Analyzer
echo ============================================
echo.

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed.
    echo Please install from https://nodejs.org/
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
    echo Installation complete. Starting app...
    echo.
)

echo Open browser: http://localhost:3000
echo Press Ctrl+C to stop.
echo.

call npm run dev
pause
