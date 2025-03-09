@echo off
echo Testing Social Feed Sidebar Extension...
echo.

REM Set cache directory to avoid permission issues
set NPM_CONFIG_CACHE=%~dp0.npm-cache

REM Launch VS Code with the extension development host
code --extensionDevelopmentPath="%~dp0"

echo.
echo If VS Code launched successfully, the extension should be running in development mode.
echo Look for the Social Feed icon in the activity bar (side panel). 