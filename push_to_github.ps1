# PowerShell script to push project to GitHub
# Usage: .\push_to_github.ps1 -GitHubUsername "your-username" -RepoName "your-repo-name"

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername,
    
    [Parameter(Mandatory=$true)]
    [string]$RepoName
)

Write-Host "Setting up Git repository..." -ForegroundColor Green

# Initialize git if not already done
if (-not (Test-Path .git)) {
    git init
    Write-Host "Git repository initialized" -ForegroundColor Green
}

# Check if git user is configured
$userName = git config user.name
$userEmail = git config user.email

if (-not $userName -or -not $userEmail) {
    Write-Host "Git user not configured. Please set:" -ForegroundColor Yellow
    Write-Host "git config --global user.name 'Your Name'" -ForegroundColor Cyan
    Write-Host "git config --global user.email 'your.email@example.com'" -ForegroundColor Cyan
    exit 1
}

# Add all files
Write-Host "Adding files to git..." -ForegroundColor Green
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host "Committing changes..." -ForegroundColor Green
    git commit -m "Initial commit: ATS System with Resume Builder, Job Management, Blog Posts, and Admin Dashboard"
} else {
    Write-Host "No changes to commit" -ForegroundColor Yellow
}

# Set main branch
git branch -M main

# Add remote (remove if exists, then add)
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "Removing existing remote..." -ForegroundColor Yellow
    git remote remove origin
}

Write-Host "Adding GitHub remote..." -ForegroundColor Green
git remote add origin "https://github.com/$GitHubUsername/$RepoName.git"

Write-Host "Pushing to GitHub..." -ForegroundColor Green
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "Repository URL: https://github.com/$GitHubUsername/$RepoName" -ForegroundColor Cyan
} else {
    Write-Host "Error pushing to GitHub. Make sure:" -ForegroundColor Red
    Write-Host "1. The repository exists on GitHub" -ForegroundColor Yellow
    Write-Host "2. You have push access" -ForegroundColor Yellow
    Write-Host "3. You're authenticated (use GitHub CLI or personal access token)" -ForegroundColor Yellow
}

