#!/usr/bin/env node

const fs = require('fs').promises;

async function updateEnvironmentFile() {
  const envContent = `# IMPACT Course Management System - Environment Variables
# Update these with your actual OAuth credentials

# App Configuration
VITE_APP_URL=https://mwl-impact.web.app
VITE_GOOGLE_CLIENT_ID=1068856174628-og6gbd7630cclvi7o492skrlnq93p937.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=YOUR_OAUTH_CLIENT_SECRET_HERE

# Firebase Configuration (for your main site)
VITE_FIREBASE_API_KEY=AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=mwl-impact.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mwl-impact
VITE_FIREBASE_STORAGE_BUCKET=mwl-impact.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1068856174628
VITE_FIREBASE_APP_ID=1:1068856174628:web:XXXXXXXXXXXXXXXXXXXX

# Build Configuration
VITE_BUILD_DIR=dist
VITE_FIRESTORE_REGION=europe-west2

# Email Configuration (for your main site)
VITE_RESEND_API_KEY=your-resend-api-key

# Provisioning Configuration
VITE_GITHUB_REPO_URL=https://github.com/leighrobertabbott/IMPACT-Course-Admin.git
VITE_PROVISIONING_ENABLED=true
`;

  try {
    await fs.writeFile('.env.local', envContent);
    console.log('✅ Environment file updated with your OAuth Client ID!');
    console.log('⚠️  You still need to add your OAuth Client Secret');
    console.log('📝 Edit .env.local and replace YOUR_OAUTH_CLIENT_SECRET_HERE with your actual client secret');
  } catch (error) {
    console.error('❌ Failed to update environment file:', error.message);
  }
}

updateEnvironmentFile();
