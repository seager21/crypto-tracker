@echo off
echo Starting Crypto Tracker Pro...
echo.

echo Installing dependencies...
call npm install
cd frontend
call npm install
cd ..

echo.
echo Starting backend server...
start cmd /k "npm run dev"

echo.
echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo Starting frontend development server...
start cmd /k "npm run dev-frontend"

echo.
echo Both servers are starting!
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5432
echo.
echo Press any key to exit...
pause > nul
