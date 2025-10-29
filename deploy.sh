#!/bin/bash

# GitHub Pages Deployment Script for Vault Frontend
# This script builds and deploys the Angular/Ionic app to GitHub Pages

echo "🚀 Starting GitHub Pages deployment..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository. Please run this from your project root."
    exit 1
fi

# Check if gh-pages package is installed
if ! npm list gh-pages > /dev/null 2>&1; then
    echo "📦 Installing gh-pages package..."
    npm install --save-dev gh-pages
fi

# Build the project for GitHub Pages
echo "🔨 Building project for GitHub Pages..."
npm run build:gh-pages

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

# Deploy to GitHub Pages
echo "📤 Deploying to GitHub Pages..."
npm run deploy

if [ $? -eq 0 ]; then
    echo "✅ Successfully deployed to GitHub Pages!"
    echo "🌐 Your site should be available at: https://[your-username].github.io/Vault/"
    echo "⏰ It may take a few minutes for changes to be visible."
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi
