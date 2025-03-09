@echo off
echo Installing dependencies for Social Feed Sidebar...
cd /d "%~dp0"

:: Create a local npm cache to avoid permission issues
set NPM_CONFIG_CACHE=%~dp0.npm-cache

:: Try to install dependencies
npm install twitter-api-v2 keytar vscode-uri oauth-1.0a crypto-js

echo.
echo Launching VS Code with the extension...
code --extensionDevelopmentPath="%~dp0" --new-window

echo.
echo If VS Code launched successfully, the extension should be running in development mode.
echo Look for the Social Feed icon in the activity bar (side panel).
echo.
echo Note: If you see module not found errors, right-click this batch file and run as administrator.

pause 