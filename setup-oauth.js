#!/usr/bin/env node

/**
 * OAuth Setup Script for IMPACT Course Management System
 * This script helps set up OAuth credentials for the provisioning system
 */

const fs = require('fs').promises;
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function setupOAuth() {
  console.log('🔧 Setting up OAuth for IMPACT Course Management System...\n');

  try {
    // 1. Check if Firebase CLI is available
    console.log('📋 Checking Firebase CLI...');
    try {
      await execAsync('firebase --version');
      console.log('✅ Firebase CLI is available');
    } catch (error) {
      throw new Error('Firebase CLI not found. Please install it: npm install -g firebase-tools');
    }

    // 2. Get current Firebase project
    console.log('🔍 Getting current Firebase project...');
    const { stdout: projectOutput } = await execAsync('firebase projects:list');
    console.log('Current Firebase projects:');
    console.log(projectOutput);

    // 3. Create OAuth configuration
    console.log('⚙️  Creating OAuth configuration...');
    await createOAuthConfig();

    // 4. Create environment template
    console.log('📝 Creating environment template...');
    await createEnvironmentTemplate();

    // 5. Instructions
    console.log('\n✅ OAuth setup configuration created!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to https://console.cloud.google.com/');
    console.log('2. Create a new project or select your existing project');
    console.log('3. Enable these APIs:');
    console.log('   - Google+ API');
    console.log('   - Cloud Resource Manager API');
    console.log('   - Service Usage API');
    console.log('   - Firebase Management API');
    console.log('4. Go to "APIs & Services" → "Credentials"');
    console.log('5. Click "Create Credentials" → "OAuth 2.0 Client IDs"');
    console.log('6. Choose "Web application"');
    console.log('7. Add these Authorized redirect URIs:');
    console.log('   - https://mwl-impact.web.app/provision/callback');
    console.log('   - http://localhost:5173/provision/callback');
    console.log('8. Copy the Client ID and Client Secret');
    console.log('9. Update .env.local with your credentials');
    console.log('10. Deploy: npm run build && firebase deploy --only hosting');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

async function createOAuthConfig() {
  const config = {
    oauth: {
      clientId: 'YOUR_OAUTH_CLIENT_ID',
      clientSecret: 'YOUR_OAUTH_CLIENT_SECRET',
      redirectUris: [
        'https://mwl-impact.web.app/provision/callback',
        'http://localhost:5173/provision/callback'
      ],
      scopes: [
        'openid',
        'email',
        'profile',
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/firebase'
      ]
    },
    firebase: {
      projectId: 'mwl-impact',
      region: 'europe-west2'
    },
    provisioning: {
      repository: 'https://github.com/leighrobertabbott/IMPACT-Course-Admin.git',
      branch: 'main'
    }
  };

  await fs.writeFile('oauth-config.json', JSON.stringify(config, null, 2));
  console.log('✅ OAuth configuration created (oauth-config.json)');
}

async function createEnvironmentTemplate() {
  const envTemplate = `# IMPACT Course Management System - Environment Variables
# Copy this to .env.local and fill in your values

# App Configuration
VITE_APP_URL=https://mwl-impact.web.app
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# Firebase Configuration (for your main site)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=mwl-impact.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mwl-impact
VITE_FIREBASE_STORAGE_BUCKET=mwl-impact.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Build Configuration
VITE_BUILD_DIR=dist
VITE_FIRESTORE_REGION=europe-west2

# Email Configuration (for your main site)
VITE_RESEND_API_KEY=your-resend-api-key

# Provisioning Configuration
VITE_GITHUB_REPO_URL=https://github.com/leighrobertabbott/IMPACT-Course-Admin.git
VITE_PROVISIONING_ENABLED=true
`;

  await fs.writeFile('.env.template', envTemplate);
  console.log('✅ Environment template created (.env.template)');
}

// Run the setup
if (require.main === module) {
  setupOAuth();
}

module.exports = { setupOAuth };
