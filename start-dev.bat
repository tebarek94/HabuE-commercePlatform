@echo off
echo Starting Flower E-commerce Development Environment...
echo.

echo Starting Backend Server (Port 3000)...
start "Backend Server" cmd /k "cd server && npm run dev"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server (Port 3001)...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:3001
echo.
echo Press any key to exit...
pause > nul
