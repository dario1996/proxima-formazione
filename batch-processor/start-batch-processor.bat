@echo off
echo ===================================
echo LinkedIn Learning CSV Batch Processor
echo ===================================
echo.

REM Check if Maven is available
where mvn >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Maven not found in PATH
    echo Please install Maven and add it to your PATH
    pause
    exit /b 1
)

REM Create necessary directories
if not exist "input" mkdir input
if not exist "processed" mkdir processed

echo Created input and processed directories
echo.

echo Building and starting the application...
echo This may take a few minutes on first run...
echo.

REM Build and run the application
mvn clean spring-boot:run

echo.
echo Application stopped.
pause 