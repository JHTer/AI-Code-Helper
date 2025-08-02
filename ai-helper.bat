@echo off
REM AI Code Helper - Management Script
REM ==================================

REM Load environment variables from .env file if it exists
if exist ".env" (
    echo Loading environment variables from .env file...
    for /f "tokens=2 delims==" %%a in ('findstr "GOOGLE_AI_GEMINI_API_KEY" .env 2^>nul') do (
        set "GOOGLE_AI_GEMINI_API_KEY=%%a"
        setx GOOGLE_AI_GEMINI_API_KEY "%%a" >nul 2>&1
    )
    for /f "tokens=2 delims==" %%a in ('findstr "BIGMODEL_API_KEY" .env 2^>nul') do (
        set "BIGMODEL_API_KEY=%%a"
        setx BIGMODEL_API_KEY "%%a" >nul 2>&1
    )
    echo Environment variables loaded and set system-wide.
    echo Note: You may need to restart your terminal for system-wide changes to take effect.
)

:menu
cls
echo.
echo  ======================================================================
echo  #                     AI Code Helper - Management                    #
echo  #                          Windows Script                            #
echo  ======================================================================
echo.
echo  Select an option:
echo.
echo  [1] Start Full Application (Backend + Frontend + Browser)
echo  [2] Quick Start (Background mode, no browser)
echo  [3] Start Backend Only
echo  [4] Start Frontend Only  
echo  [5] Open Browser (localhost:3000)
echo  [6] Build Frontend for Production
echo  [7] Run Backend Tests
echo  [8] Check System Status
echo  [9] Setup API Keys
echo  [S] Stop All Services
echo  [0] Exit
echo.
set /p choice="Enter your choice (0-9, S): "

if "%choice%"=="1" goto start_full
if "%choice%"=="2" goto quick_start
if "%choice%"=="3" goto start_backend
if "%choice%"=="4" goto start_frontend
if "%choice%"=="5" goto open_browser
if "%choice%"=="6" goto build_frontend
if "%choice%"=="7" goto run_tests
if "%choice%"=="8" goto system_status
if "%choice%"=="9" goto setup_keys
if /i "%choice%"=="S" goto stop_services
if "%choice%"=="0" goto exit
goto menu

:start_full
echo Starting Full Application...
echo.

REM Check if we're in the right directory
if not exist "pom.xml" (
    echo ERROR: pom.xml not found. Please run this script from the project root directory.
    echo Current directory: %CD%
    pause
    goto menu
)

if not exist "ai-code-helper-frontend" (
    echo ERROR: Frontend directory not found. Please ensure the project is properly set up.
    pause
    goto menu
)

REM Check API keys first
if not defined GOOGLE_AI_GEMINI_API_KEY (
    echo ERROR: GOOGLE_AI_GEMINI_API_KEY environment variable is not set!
    echo.
    echo Please edit the .env file and replace 'your-api-key-here' with your actual API key.
    echo Get your API key from: https://aistudio.google.com/app/apikey
    echo.
    echo Alternatively, use option 9 to setup API keys interactively.
    echo.
    pause
    goto menu
)

if "%GOOGLE_AI_GEMINI_API_KEY%"=="your-api-key-here" (
    echo ERROR: Please replace the placeholder API key in .env file!
    echo.
    echo Edit .env file and replace 'your-api-key-here' with your actual API key.
    echo Get your API key from: https://aistudio.google.com/app/apikey
    echo.
    pause
    goto menu
)

echo Starting AI Code Helper...
echo API Key: %GOOGLE_AI_GEMINI_API_KEY:~0,8%... (configured)
echo.

REM Start Backend Server
echo Starting Spring Boot Backend Server...
echo    - URL: http://localhost:8081/api
echo    - Opening new window for backend logs...
start "AI Code Helper - Backend" cmd /k "echo Starting Spring Boot Backend... && mvnw.cmd spring-boot:run"

REM Wait for backend to initialize
echo Waiting 3 seconds for backend to initialize...
timeout /t 3 /nobreak > nul

echo.
echo Starting TypeScript Frontend Development Server...
echo    - URL: http://localhost:3000
echo    - Opening new window for frontend logs...

REM Start Frontend Development Server
start "AI Code Helper - Frontend" cmd /k "cd ai-code-helper-frontend && echo Starting Frontend Development Server... && npm run dev"

REM Wait for frontend to start
echo Waiting 5 seconds for frontend to start...
timeout /t 5 /nobreak > nul

REM Open browser
echo Opening browser...
start "" "http://localhost:3000"

echo.
echo AI Code Helper is starting up!
echo.
echo What's happening:
echo    1. Backend Server: http://localhost:8081/api (Spring Boot + AI)
echo    2. Frontend Dev Server: http://localhost:3000 (TypeScript UI)
echo    3. Browser should open automatically to the frontend
echo.
echo Tips:
echo    - Backend logs are in the "Backend" window
echo    - Frontend logs are in the "Frontend" window  
echo    - Close those windows or press Ctrl+C to stop the servers
echo    - The browser will auto-refresh when you make code changes
echo.
pause
goto menu

:quick_start
echo Quick Starting AI Code Helper...

REM Check API keys
if not defined GOOGLE_AI_GEMINI_API_KEY (
    echo ERROR: API keys not configured. 
    echo Please edit .env file or use option 9 to setup API keys.
    pause
    goto menu
)

if "%GOOGLE_AI_GEMINI_API_KEY%"=="your-api-key-here" (
    echo ERROR: Please replace the placeholder API key in .env file!
    pause
    goto menu
)

REM Start Backend
start "Backend" /min cmd /k "mvnw.cmd spring-boot:run"

REM Start Frontend  
start "Frontend" /min cmd /k "cd ai-code-helper-frontend && npm run dev"

echo Services starting in background...
echo    Backend: http://localhost:8081/api
echo    Frontend: http://localhost:3000
timeout /t 2 /nobreak > nul
goto menu

:start_backend
echo Starting Backend Only...
start "AI Code Helper - Backend" cmd /k "mvnw.cmd spring-boot:run"
echo Backend starting at http://localhost:8081/api
pause
goto menu

:start_frontend
echo Starting Frontend Only...
start "AI Code Helper - Frontend" cmd /k "cd ai-code-helper-frontend && npm run dev"
echo Frontend starting at http://localhost:3000
pause
goto menu

:open_browser
echo Opening Browser...
start "" "http://localhost:3000"
goto menu

:build_frontend
echo Building Frontend for Production...
cd ai-code-helper-frontend
call npm run build
echo Build complete! Check ai-code-helper-frontend/dist/
cd ..
pause
goto menu

:run_tests  
echo Running Backend Tests...
call mvnw.cmd test
pause
goto menu

:system_status
echo Checking System Status...
echo.
echo Backend (Spring Boot):
netstat -an | findstr "8081" && echo Backend running on port 8081 || echo Backend not running
echo.
echo Frontend (Node.js):
netstat -an | findstr "3000" && echo Frontend running on port 3000 || echo Frontend not running
echo.
echo Java processes:
tasklist | findstr "java.exe"
echo.
echo Node processes:
tasklist | findstr "node.exe"
echo.
pause
goto menu

:setup_keys
cls
echo.
echo  ======================================================================
echo  #                   AI Code Helper - API Setup                      #
echo  #                      Required API Keys                            #
echo  ======================================================================
echo.

echo This application requires API keys to function properly:
echo.
echo GOOGLE_AI_GEMINI_API_KEY (Required)
echo    - Used for: AI Chat Model, Embeddings, Streaming
echo    - Get it from: https://aistudio.google.com/app/apikey
echo    - Free tier available with generous limits
echo.
echo BIGMODEL_API_KEY (Optional)
echo    - Used for: MCP Web Search functionality
echo    - Get it from: https://open.bigmodel.cn/
echo    - Can be left empty - will disable web search feature
echo.

REM Check current environment variables
echo Current API Key Status:
echo.
if defined GOOGLE_AI_GEMINI_API_KEY (
    echo GOOGLE_AI_GEMINI_API_KEY: Set (length: %GOOGLE_AI_GEMINI_API_KEY:~0,8%...)
) else (
    echo GOOGLE_AI_GEMINI_API_KEY: Not set
)

if defined BIGMODEL_API_KEY (
    echo BIGMODEL_API_KEY: Set (length: %BIGMODEL_API_KEY:~0,8%...)
) else (
    echo BIGMODEL_API_KEY: Not set (optional)
)
echo.

echo Setup Options:
echo.
echo [1] Edit .env file (recommended - already exists)
echo [2] Set API keys for this session only (temporary)
echo [3] Set API keys permanently (system environment)
echo [4] Continue with test mode (no real AI, for UI testing only)
echo [5] Get detailed instructions
echo [0] Back to main menu
echo.
set /p choice="Choose an option (0-5): "

if "%choice%"=="1" goto edit_env_file
if "%choice%"=="2" goto temp_setup
if "%choice%"=="3" goto permanent_setup
if "%choice%"=="4" goto test_mode
if "%choice%"=="5" goto instructions
if "%choice%"=="0" goto menu
goto setup_keys

:edit_env_file
echo.
echo Opening .env file for editing...
echo.
echo Instructions:
echo 1. Replace 'your-api-key-here' with your actual Google AI Gemini API key
echo 2. Get your API key from: https://aistudio.google.com/app/apikey
echo 3. Save the file and close your editor
echo 4. Return to this window and press any key to continue
echo.
pause
start "" notepad.exe .env
echo.
echo Waiting for you to finish editing...
pause
echo.
echo Environment variables reloaded! You can now start the application.
echo.
pause
goto menu

:temp_setup
echo.
echo Setting API keys for this session...
echo.
set /p GEMINI_KEY="Enter your Google AI Gemini API key: "
set /p BIGMODEL_KEY="Enter your BigModel API key (or press Enter to skip): "

if not "%GEMINI_KEY%"=="" (
    set GOOGLE_AI_GEMINI_API_KEY=%GEMINI_KEY%
    echo GOOGLE_AI_GEMINI_API_KEY set for this session
)

if not "%BIGMODEL_KEY%"=="" (
    set BIGMODEL_API_KEY=%BIGMODEL_KEY%
    echo BIGMODEL_API_KEY set for this session
)

echo.
echo API keys configured! You can now start the application.
echo Note: These keys will be lost when you close this window.
echo.
pause
goto menu

:permanent_setup
echo.
echo Setting API keys permanently in system environment...
echo.
set /p GEMINI_KEY="Enter your Google AI Gemini API key: "
set /p BIGMODEL_KEY="Enter your BigModel API key (or press Enter to skip): "

if not "%GEMINI_KEY%"=="" (
    setx GOOGLE_AI_GEMINI_API_KEY "%GEMINI_KEY%"
    echo GOOGLE_AI_GEMINI_API_KEY set permanently
)

if not "%BIGMODEL_KEY%"=="" (
    setx BIGMODEL_API_KEY "%BIGMODEL_KEY%"
    echo BIGMODEL_API_KEY set permanently
)

echo.
echo API keys saved to Windows environment variables!
echo Note: Restart your command prompt for changes to take effect.
echo.
pause
goto menu

:env_file
echo.
echo Creating .env file for development...
echo.
set /p GEMINI_KEY="Enter your Google AI Gemini API key: "
set /p BIGMODEL_KEY="Enter your BigModel API key (or press Enter to skip): "

(
echo # AI Code Helper - Environment Variables
echo # Generated on %date% at %time%
echo.
echo # Google AI Gemini API Key (Required)
echo # Get from: https://aistudio.google.com/app/apikey
echo GOOGLE_AI_GEMINI_API_KEY=%GEMINI_KEY%
echo.
echo # BigModel API Key (Optional - for web search)
echo # Get from: https://open.bigmodel.cn/
if not "%BIGMODEL_KEY%"=="" echo BIGMODEL_API_KEY=%BIGMODEL_KEY%
if "%BIGMODEL_KEY%"=="" echo # BIGMODEL_API_KEY=your-key-here
echo.
echo # Development Settings
echo SPRING_PROFILES_ACTIVE=development
) > .env

echo .env file created successfully!
echo Load these variables before starting the application.
echo.
pause
goto menu

:test_mode
echo.
echo Test Mode Configuration
echo.
echo This will run the application in test mode with mock API keys.
echo The UI will work, but AI features will show placeholder responses.
echo.
set GOOGLE_AI_GEMINI_API_KEY=mock-gemini-key-for-testing
set BIGMODEL_API_KEY=mock-bigmodel-key-for-testing
set SPRING_PROFILES_ACTIVE=test

echo Test mode configured!
echo You can now start the application to test the UI.
echo WARNING: AI features will not work in test mode.
echo.
pause
goto menu

:instructions
echo.
echo Detailed Setup Instructions
echo.
echo ======================================================================
echo                   Getting Google AI Gemini API Key             
echo ======================================================================
echo.
echo 1. Visit: https://aistudio.google.com/app/apikey
echo 2. Sign in with your Google account (free)
echo 3. Click "Create API Key"
echo 4. Copy the key (starts with AIza...)
echo 5. Free tier with generous limits!
echo.
echo ======================================================================
echo                   Getting BigModel API Key (Optional)          
echo ======================================================================
echo.
echo 1. Visit: https://open.bigmodel.cn/
echo 2. Register account
echo 3. Get your API key from dashboard
echo 4. This enables web search in AI responses
echo.
echo ======================================================================
echo                      Usage Recommendations                     
echo ======================================================================
echo.
echo For Personal Development:
echo    - Use option 2 (permanent setup)
echo    - API keys saved in Windows environment
echo.
echo For Team/Organization:
echo    - Use option 3 (.env file)
echo    - Share .env template, not actual keys
echo    - Add .env to .gitignore
echo.
echo For Testing UI Only:
echo    - Use option 4 (test mode)
echo    - No real API calls, UI works perfectly
echo.
pause
goto menu

:stop_services
echo.
echo  ======================================================================
echo  #                   Stopping AI Code Helper                         #
echo  ======================================================================
echo.

echo Stopping AI Code Helper services...
echo.

REM Kill Spring Boot processes (Java processes running Maven)
echo Stopping Backend Server (Spring Boot)...
taskkill /f /im java.exe 2>nul
taskkill /f /im javaw.exe 2>nul

REM Kill Node.js processes (Frontend dev server)
echo Stopping Frontend Development Server (Node.js)...
taskkill /f /im node.exe 2>nul

REM Kill Maven processes
echo Stopping Maven processes...
taskkill /f /im mvn.exe 2>nul

REM Close related command windows
taskkill /f /im cmd.exe /fi "WINDOWTITLE eq AI Code Helper - Backend*" 2>nul
taskkill /f /im cmd.exe /fi "WINDOWTITLE eq AI Code Helper - Frontend*" 2>nul

echo.
echo AI Code Helper services stopped.
echo.
echo Note: If any processes are still running, you can manually close
echo the "Backend" and "Frontend" command windows.
echo.
pause
goto menu



:exit
echo.
echo Goodbye!
timeout /t 2 /nobreak > nul
exit