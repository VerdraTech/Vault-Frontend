# GitHub Pages Deployment Guide

This guide will help you deploy your Vault Frontend to GitHub Pages.

## Prerequisites

1. **GitHub Repository**: Make sure your code is pushed to a GitHub repository
2. **Node.js**: Ensure you have Node.js installed
3. **Git**: Make sure Git is configured with your GitHub credentials

## Quick Deployment

### Option 1: Using the Deployment Script (Recommended)

```bash
# Navigate to the frontend directory
cd Vault-Frontend

# Run the deployment script
./deploy.sh
```

### Option 2: Manual Deployment

```bash
# Navigate to the frontend directory
cd Vault-Frontend

# Build for GitHub Pages
npm run build:gh-pages

# Deploy to GitHub Pages
npm run deploy
```

## What the Scripts Do

- **`build:gh-pages`**: Builds the Angular app with the correct base href for GitHub Pages (`/Vault/`)
- **`deploy`**: Uses gh-pages to push the built files to the `gh-pages` branch
- **`predeploy`**: Automatically runs before deploy to ensure the latest build is used

## GitHub Pages Configuration

After your first deployment, you'll need to configure GitHub Pages:

1. Go to your GitHub repository
2. Click on **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **Deploy from a branch**
5. Choose **gh-pages** branch
6. Select **/ (root)** folder
7. Click **Save**

## Your Site URL

Once deployed, your site will be available at:

```
https://[your-github-username].github.io/Vault/
```

## Troubleshooting

### Common Issues

1. **404 Error**: Make sure GitHub Pages is configured to use the `gh-pages` branch
2. **Assets not loading**: Ensure the base href is correctly set to `/Vault/`
3. **Build fails**: Check for TypeScript or linting errors
4. **Deployment fails**: Verify your Git credentials and repository permissions

### Manual Base Href Configuration

If you need to change the base href, update the `build:gh-pages` script in `package.json`:

```json
"build:gh-pages": "ng build --configuration production --base-href /your-repo-name/"
```

## Updating Your Site

To update your deployed site:

1. Make your changes to the code
2. Run `./deploy.sh` or `npm run deploy`
3. Wait a few minutes for GitHub Pages to update

## Environment Configuration

Make sure your production environment is properly configured in:

- `src/environments/environment.prod.ts`

This file is used during the production build process.
