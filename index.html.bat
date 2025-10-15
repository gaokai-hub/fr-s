@echo off
chcp 65001 >nul
cd /d "%~dp0"
cls

REM Very simple launcher - no Chinese characters to avoid encoding issues

echo Starting development server...
echo 

echo After server starts, open this URL in your browser:
echo http://localhost:5173/
echo 
echo Press Ctrl+C to stop the server.
echo 

REM Try to install dependencies if node_modules folder doesn't exist
if not exist node_modules (
echo Installing dependencies...
echo 
npm install
echo 
)

REM Start the development server directly
npm run dev

pause