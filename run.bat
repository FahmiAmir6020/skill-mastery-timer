@echo off
setlocal
title Skill Mastery Timer

rem Always run from this file's project directory, regardless of the caller's cwd.
cd /d "%~dp0" || goto :directory_error

echo.
echo  Skill Mastery Timer launcher
echo  Project: %CD%
echo.

where.exe node.exe >nul 2>&1
if errorlevel 1 goto :node_error
where.exe npm.cmd >nul 2>&1
if errorlevel 1 goto :npm_error
node.exe --version
if errorlevel 1 goto :node_error
call npm.cmd --version
if errorlevel 1 goto :npm_error
if not exist "node_modules\vite\bin\vite.js" goto :dependencies_error

rem Reuse the app if this project is already answering on its configured URL.
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$ProgressPreference='SilentlyContinue'; try { $r=Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:5173/' -TimeoutSec 2; if ($r.Content -match '<title>Skill Mastery Timer</title>' -and $r.Content -match '/@vite/client') { exit 0 } else { exit 2 } } catch { exit 1 }"
if "%ERRORLEVEL%"=="0" goto :already_running
if "%ERRORLEVEL%"=="2" goto :port_conflict

echo Starting the existing Vite development server...
echo The browser will open when Vite is ready. Press Ctrl+C to stop the server.
echo.
call npm.cmd run dev -- --open
set "SERVER_EXIT=%ERRORLEVEL%"
if not "%SERVER_EXIT%"=="0" (
  echo.
  echo ERROR: Vite stopped with exit code %SERVER_EXIT%.
  echo Check the messages above. Port 5173 may already be in use.
  echo If dependencies are missing, run npm install manually from this folder.
  pause
)
exit /b %SERVER_EXIT%

:already_running
echo Skill Mastery Timer is already running at http://localhost:5173/.
echo Opening the existing app. Its server remains in the terminal where it was started.
start "" "http://localhost:5173/"
if errorlevel 1 (
  echo ERROR: Windows could not open the browser. Open http://localhost:5173/ manually.
  pause
)
exit /b 0

:port_conflict
echo ERROR: Something other than this Skill Mastery Timer is responding at http://localhost:5173/.
echo Stop that server or change this project's Vite port before launching.
pause
exit /b 2

:directory_error
echo ERROR: Could not change to the project folder: %~dp0
pause
exit /b 1

:node_error
echo ERROR: Node.js was not found on PATH. Install Node.js LTS, then reopen VS Code or Explorer.
pause
exit /b 1

:npm_error
echo ERROR: npm was not found on PATH. Repair or reinstall Node.js LTS, then reopen VS Code or Explorer.
pause
exit /b 1

:dependencies_error
echo ERROR: Project dependencies are not installed (Vite was not found in node_modules).
echo From this folder, run: npm install
echo Then run run.bat again. This launcher will not install or upgrade packages automatically.
pause
exit /b 1
