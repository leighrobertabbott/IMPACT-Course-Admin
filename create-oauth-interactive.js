#!/usr/bin/env node

/**
 * Interactive OAuth Setup
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const fs = require('fs').promises;
const readline = require('readline');

async function createOAuthInteractive() {
  console.log('🔧 Interactive OAuth Setup...\n');

  try {
    // 1. Open browser to OAuth setup
    console.log('🌐 Opening browser to OAuth setup...');
    await openOAuthSetup();

    // 2. Wait for user input
    console.log('⏳ Waiting for you to complete OAuth setup...');
    const credentials = await waitForUserInput();

    // 3. Update environment file
    console.log('📝 Updating environment file...');
    await updateEnvironmentFile(credentials);

    console.log('\n✅ OAuth credentials saved successfully!');
    console.log('\n🚀 Your provisioning system is ready!');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
  }
}

async function openOAuthSetup() {
  try {
    // Open OAuth consent screen
    const consentUrl = 'https://console.cloud.google.com/apis/credentials/consent?project=mwl-impact';
    await execAsync(`start ${consentUrl}`);
    console.log('✅ Opened OAuth consent screen');

    // Open OAuth credentials page
    const credentialsUrl = 'https://console.cloud.google.com/apis/credentials?project=mwl-impact';
    await execAsync(`start ${credentialsUrl}`);
    console.log('✅ Opened OAuth credentials page');

  } catch (error) {
    console.log('⚠️  Could not open browser');
  }
}

async function waitForUserInput() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('\n📋 Please complete the OAuth setup in the browser:');
    console.log('1. In the OAuth Consent Screen tab:');
    console.log('   - Set App name: "IMPACT Course Management System"');
    console.log('   - Set User support email: leighabbott@hotmail.com');
    console.log('   - Set Developer contact information: leighabbott@hotmail.com');
    console.log('   - Add your email as test user');
    console.log('   - Click "Save and Continue"');
    console.log('');
    console.log('2. In the OAuth Credentials tab:');
    console.log('   - Click "Create Credentials" → "OAuth 2.0 Client IDs"');
    console.log('   - Choose "Web application"');
    console.log('   - Set name: "IMPACT Provisioning"');
    console.log('   - Add Authorized redirect URIs:');
    console.log('     * https://mwl-impact.web.app/provision/callback');
    console.log('     * http://localhost:5173/provision/callback');
    console.log('   - Click "Create"');
    console.log('   - Copy the Client ID and Client Secret');
    console.log('');

    rl.question('Enter your OAuth Client ID: ', (clientId) => {
      rl.question('Enter your OAuth Client Secret: ', (clientSecret) => {
        rl.close();
        resolve({
          clientId: clientId.trim(),
          clientSecret: clientSecret.trim()
        });
      });
    });
  });
}

async function updateEnvironmentFile(credentials) {
  const envContent = `# IMPACT Course Management System - Environment Variables
# Update these with your actual OAuth credentials

# App Configuration
VITE_APP_URL=https://mwl-impact.web.app
VITE_GOOGLE_CLIENT_ID=${credentials.clientId}
VITE_GOOGLE_CLIENT_SECRET=${credentials.clientSecret}

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
  console.log('✅ Environment file updated (.env.local)');
}

// Run the setup
if (require.main === module) {
  createOAuthInteractive();
}

module.exports = { createOAuthInteractive };
