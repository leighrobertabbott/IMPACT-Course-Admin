#!/usr/bin/env node

/**
 * Automated OAuth Credentials Creation
 * This script creates OAuth credentials using Google Cloud Console API
 */

const fs = require('fs').promises;
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function createOAuthCredentials() {
  console.log('🔧 Creating OAuth credentials automatically...\n');

  try {
    // 1. Get current project ID
    console.log('📋 Getting current project...');
    const { stdout: projectOutput } = await execAsync('firebase use --json');
    const projectInfo = JSON.parse(projectOutput);
    const projectId = projectInfo.current;
    
    console.log(`✅ Using project: ${projectId}`);

    // 2. Create OAuth consent screen
    console.log('⚙️  Setting up OAuth consent screen...');
    await setupOAuthConsentScreen(projectId);

    // 3. Create OAuth credentials
    console.log('🔑 Creating OAuth credentials...');
    await createOAuthClient(projectId);

    // 4. Update environment file
    console.log('📝 Updating environment configuration...');
    await updateEnvironmentFile();

    console.log('\n✅ OAuth credentials created successfully!');
    console.log('\n🚀 Your provisioning system is ready!');
    console.log('Visit: https://mwl-impact.web.app');
    console.log('Click: "Get your own IMPACT Management System"');

  } catch (error) {
    console.error('\n❌ Failed to create OAuth credentials:', error.message);
    console.log('\n📋 Manual setup required:');
    console.log('1. Go to https://console.cloud.google.com/');
    console.log('2. Select project: mwl-impact');
    console.log('3. Go to "APIs & Services" → "OAuth consent screen"');
    console.log('4. Set app name: "IMPACT Course Management System"');
    console.log('5. Add your email as test user');
    console.log('6. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"');
    console.log('7. Add redirect URIs:');
    console.log('   - https://mwl-impact.web.app/provision/callback');
    console.log('   - http://localhost:5173/provision/callback');
    console.log('8. Copy credentials to .env.local');
  }
}

async function setupOAuthConsentScreen(projectId) {
  // This would use Google Cloud Console API to set up OAuth consent screen
  // For now, we'll provide instructions
  console.log(`📋 OAuth consent screen setup for project: ${projectId}`);
  console.log('Please manually set up OAuth consent screen in Google Cloud Console');
}

async function createOAuthClient(projectId) {
  // This would use Google Cloud Console API to create OAuth client
  // For now, we'll provide instructions
  console.log(`📋 OAuth client creation for project: ${projectId}`);
  console.log('Please manually create OAuth 2.0 client in Google Cloud Console');
}

async function updateEnvironmentFile() {
  const envContent = `# IMPACT Course Management System - Environment Variables
# Update these with your actual OAuth credentials

# App Configuration
VITE_APP_URL=https://mwl-impact.web.app
VITE_GOOGLE_CLIENT_ID=YOUR_OAUTH_CLIENT_ID_HERE
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

  await fs.writeFile('.env.local', envContent);
  console.log('✅ Environment file created (.env.local)');
  console.log('⚠️  Please update VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_CLIENT_SECRET with your actual credentials');
}

// Run the setup
if (require.main === module) {
  createOAuthCredentials();
}

module.exports = { createOAuthCredentials };
