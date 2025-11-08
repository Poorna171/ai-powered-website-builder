# Instructions to Push Project to GitHub

## Step 1: Create a GitHub Repository
1. Go to https://github.com and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name it (e.g., "ats-system" or "resume-builder-ats")
5. Choose Public or Private
6. **DO NOT** initialize with README, .gitignore, or license
7. Click "Create repository"

## Step 2: Push to GitHub

After creating the repository, GitHub will show you commands. Use these commands in your terminal:

```bash
# Navigate to project directory
cd "C:\Users\Poornatejas\OneDrive\Desktop\ats-system-main"

# Add all files (if not already done)
git add .

# Commit changes (if not already done)
git commit -m "Initial commit: ATS System with Resume Builder, Job Management, Blog Posts, and Admin Dashboard"

# Add your GitHub repository as remote (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Important Notes:
- Make sure `.env` files are NOT committed (they're in .gitignore)
- The `temp_resume_builder/` folder is also ignored
- All sensitive data (API keys, MongoDB connection strings) should be in `.env` files only

## If you need to set git user info first:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

