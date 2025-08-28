#!/usr/bin/env node

/**
 * Setup OAuth via Browser with Step-by-Step Instructions
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const fs = require('fs').promises;

async function setupOAuthBrowser() {
  console.log('🔧 Setting up OAuth via Browser...\n');

  try {
    // 1. Open OAuth consent screen
    console.log('📋 Opening OAuth consent screen...');
    await openOAuthConsentScreen();

    // 2. Open OAuth credentials page
    console.log('🔑 Opening OAuth credentials page...');
    await openOAuthCredentials();

    // 3. Provide step-by-step instructions
    console.log('📝 Providing step-by-step instructions...');
    await provideInstructions();

    // 4. Create environment template
    console.log('⚙️  Creating environment template...');
    await createEnvironmentTemplate();

    console.log('\n✅ OAuth setup instructions provided!');
    console.log('\n🚀 Follow the browser tabs and instructions above');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
  }
}

async function openOAuthConsentScreen() {
  try {
    const url = 'https://console.cloud.google.com/apis/credentials/consent?project=mwl-impact';
    await execAsync(`start ${url}`);
    console.log('✅ Opened OAuth consent screen');
  } catch (error) {
    console.log('⚠️  Could not open browser');
  }
}

async function openOAuthCredentials() {
  try {
    const url = 'https://console.cloud.google.com/apis/credentials?project=mwl-impact';
    await execAsync(`start ${url}`);
    console.log('✅ Opened OAuth credentials page');
  } catch (error) {
    console.log('⚠️  Could not open browser');
  }
}

async function provideInstructions() {
  console.log('\n📋 STEP-BY-STEP OAuth Setup Instructions:');
  console.log('\n🔐 STEP 1: OAuth Consent Screen (First Browser Tab)');
  console.log('1. Set App name: "IMPACT Course Management System"');
  console.log('2. Set User support email: leighabbott@hotmail.com');
  console.log('3. Set Developer contact information: leighabbott@hotmail.com');
  console.log('4. Add your email as test user');
  console.log('5. Click "Save and Continue"');
  console.log('6. Click "Save and Continue" on all remaining screens');
  
  console.log('\n🔑 STEP 2: OAuth Credentials (Second Browser Tab)');
  console.log('1. Click "Create Credentials" → "OAuth 2.0 Client IDs"');
  console.log('2. Choose "Web application"');
  console.log('3. Set name: "IMPACT Provisioning"');
  console.log('4. Add Authorized redirect URIs:');
  console.log('   - https://mwl-impact.web.app/provision/callback');
  console.log('   - http://localhost:5173/provision/callback');
  console.log('5. Click "Create"');
  console.log('6. COPY the Client ID and Client Secret');
  
  console.log('\n📝 STEP 3: Update Environment File');
  console.log('1. Open .env.local in your project');
  console.log('2. Replace YOUR_OAUTH_CLIENT_ID_HERE with your Client ID');
  console.log('3. Replace YOUR_OAUTH_CLIENT_SECRET_HERE with your Client Secret');
  
  console.log('\n🚀 STEP 4: Deploy');
  console.log('1. npm run build');
  console.log('2. firebase deploy --only hosting');
  
  console.log('\n✅ STEP 5: Test');
  console.log('1. Visit: https://mwl-impact.web.app');
  console.log('2. Click: "Get your own IMPACT Management System"');
}

async function createEnvironmentTemplate() {
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
  console.log('✅ Environment template created (.env.local)');
}

// Run the setup
if (require.main === module) {
  setupOAuthBrowser();
}

module.exports = { setupOAuthBrowser };
