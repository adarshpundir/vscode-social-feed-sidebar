@echo off
cd /d "%~dp0"

echo Connecting to GitHub and pushing code...

:: GitHub repository information
set GITHUB_USER=adarshpundir
set REPO_NAME=vscode-social-feed-sidebar

:: Initialize git if not already initialized
if not exist .git (
  git init
  git add .
  git commit -m "Initial commit for Social Feed Sidebar VS Code extension"
)

:: Add GitHub remote
git remote add origin https://github.com/%GITHUB_USER%/%REPO_NAME%.git 2>nul || git remote set-url origin https://github.com/%GITHUB_USER%/%REPO_NAME%.git

:: Create and push main branch
git branch -M main
git push -u origin main

:: Create and push feature branch for Twitter integration
git checkout -b feature/twitter-integration
git add .
git commit -m "Add Twitter API integration functionality"
git push -u origin feature/twitter-integration

:: Open browser to create pull request
echo.
echo Repository pushed successfully!
echo.
echo Now open your browser to create a pull request:
echo https://github.com/%GITHUB_USER%/%REPO_NAME%/compare/main...feature/twitter-integration

pause 