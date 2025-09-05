@echo off
echo Starting Crypto Tracker API server with monitoring...

:start
node api/index.js
echo Server crashed or stopped with exit code %errorlevel%

echo Waiting 5 seconds before restarting...
timeout /t 5 /nobreak >nul

echo Restarting server...
goto start
