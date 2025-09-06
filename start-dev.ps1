# Flower E-commerce Development Environment Startup Script

Write-Host "Starting Flower E-commerce Development Environment..." -ForegroundColor Green
Write-Host ""

# Start Backend Server
Write-Host "Starting Backend Server (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm run dev" -WindowStyle Normal

# Wait for backend to start
Write-Host "Waiting 3 seconds for backend to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

# Start Frontend Server
Write-Host "Starting Frontend Server (Port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
