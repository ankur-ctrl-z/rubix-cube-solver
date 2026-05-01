# Start all services
Write-Host "Starting Rubix Cube Solver..." -ForegroundColor Cyan

# Java Solver
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd '$PWD\services\solver-service'; `$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot'; `$env:PATH=`"`$env:JAVA_HOME\bin;`$env:PATH`"; java -jar target/solver-service-1.0.0.jar"
)

# Python CV
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd '$PWD\services\cv-service'; venv\Scripts\activate; python main.py"
)

# Hono Backend
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd '$PWD\apps\api'; npm run dev"
)

# Next.js Frontend
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd '$PWD\apps\web'; npm run dev"
)

Write-Host "All services starting..." -ForegroundColor Green
Write-Host "Java:   http://localhost:8080" -ForegroundColor Yellow
Write-Host "Python: http://localhost:8000" -ForegroundColor Yellow
Write-Host "Hono:   http://localhost:8787" -ForegroundColor Yellow
Write-Host "Web:    http://localhost:3000" -ForegroundColor Yellow