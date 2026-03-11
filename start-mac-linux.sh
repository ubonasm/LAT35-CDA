#!/bin/bash

echo "============================================"
echo "  Classroom Discourse Analyzer"
echo "============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed."
    echo "Please install Node.js from https://nodejs.org/"
    echo ""
    echo "On Mac, you can also use Homebrew:"
    echo "  brew install node"
    echo ""
    echo "On Ubuntu/Debian:"
    echo "  sudo apt update && sudo apt install nodejs npm"
    echo ""
    exit 1
fi

echo "[OK] Node.js found: $(node --version)"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "[ERROR] npm is not installed."
    exit 1
fi

echo "[OK] npm found: $(npm --version)"
echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    echo "This may take a few minutes..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo "[ERROR] Failed to install dependencies."
        exit 1
    fi
    echo ""
    echo "[OK] Dependencies installed successfully."
fi

echo ""
echo "============================================"
echo "Starting the application..."
echo "============================================"
echo ""
echo "Open your browser and go to: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
