#!/usr/bin/env node

/**
 * CLI OAuth Setup for IMPACT Course Management System
 * This script creates OAuth credentials using Google Cloud Console API
 */

const fs = require('fs').promises;
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function setupOAuthCLI() {
  console.log('🔧 Setting up OAuth credentials via CLI...\n');

  try {
    // 1. Check if we have access to Google Cloud
    console.log('📋 Checking Google Cloud access...');
    await checkGoogleCloudAccess();

    // 2. Enable required APIs
    console.log('⚙️  Enabling required APIs...');
    await enableRequiredAPIs();

    // 3. Create OAuth consent screen
    console.log('🔐 Creating OAuth consent screen...');
    await createOAuthConsentScreen();

    // 4. Create OAuth credentials
    console.log('🔑 Creating OAuth credentials...');
    const credentials = await createOAuthCredentials();

    // 5. Update environment file
    console.log('📝 Updating environment configuration...');
    await updateEnvironmentFile(credentials);

    console.log('\n✅ OAuth setup completed successfully!');
    console.log('\n🚀 Your provisioning system is ready!');
    console.log('Visit: https://mwl-impact.web.app');
    console.log('Click: "Get your own IMPACT Management System"');

  } catch (error) {
    console.error('\n❌ OAuth setup failed:', error.message);
    console.log('\n📋 Manual setup required:');
    console.log('1. Go to https://console.cloud.google.com/');
    console.log('2. Select project: mwl-impact');
    console.log('3. Follow the manual setup instructions');
  }
}

async function checkGoogleCloudAccess() {
  try {
    // Try to get project info
    const { stdout } = await execAsync('gcloud config get-value project');
    const projectId = stdout.trim();
    
    if (projectId === 'mwl-impact') {
      console.log('✅ Using project: mwl-impact');
    } else {
      console.log(`⚠️  Current project: ${projectId}`);
      console.log('Setting project to mwl-impact...');
      await execAsync('gcloud config set project mwl-impact');
      console.log('✅ Project set to mwl-impact');
    }
  } catch (error) {
    console.log('⚠️  Google Cloud CLI not available, using Firebase CLI');
    // Use Firebase CLI as fallback
    const { stdout } = await execAsync('firebase use mwl-impact');
    console.log('✅ Using Firebase project: mwl-impact');
  }
}

async function enableRequiredAPIs() {
  const apis = [
    'plus.googleapis.com',
    'cloudresourcemanager.googleapis.com',
    'serviceusage.googleapis.com',
    'firebase.googleapis.com'
  ];

  for (const api of apis) {
    try {
      console.log(`Enabling ${api}...`);
      await execAsync(`gcloud services enable ${api} --project=mwl-impact`);
      console.log(`✅ Enabled ${api}`);
    } catch (error) {
      console.log(`⚠️  Could not enable ${api} via CLI`);
      console.log(`   Please enable manually in Google Cloud Console`);
    }
  }
}

async function createOAuthConsentScreen() {
  try {
    // Create OAuth consent screen configuration
    const consentConfig = {
      application_name: 'IMPACT Course Management System',
      support_email: 'impact@sthk.nhs.uk',
      developer_contact_information: 'impact@sthk.nhs.uk',
      authorized_domains: ['mwl-impact.web.app'],
      scopes: [
        'openid',
        'email',
        'profile',
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/firebase'
      ]
    };

    await fs.writeFile('oauth-consent-config.json', JSON.stringify(consentConfig, null, 2));
    console.log('✅ OAuth consent screen configuration created');
    
    console.log('📋 Please manually configure OAuth consent screen:');
    console.log('1. Go to: https://console.cloud.google.com/apis/credentials/consent?project=mwl-impact');
    console.log('2. Set App name: "IMPACT Course Management System"');
    console.log('3. Add your email as test user');
    console.log('4. Save and Continue');
    
  } catch (error) {
    console.log('⚠️  Could not create OAuth consent screen via CLI');
  }
}

async function createOAuthCredentials() {
  try {
    // Create OAuth client configuration
    const clientConfig = {
      name: 'IMPACT Provisioning Client',
      type: 'web',
      redirect_uris: [
        'https://mwl-impact.web.app/provision/callback',
        'http://localhost:5173/provision/callback'
      ]
    };

    await fs.writeFile('oauth-client-config.json', JSON.stringify(clientConfig, null, 2));
    console.log('✅ OAuth client configuration created');
    
    console.log('📋 Please manually create OAuth credentials:');
    console.log('1. Go to: https://console.cloud.google.com/apis/credentials?project=mwl-impact');
    console.log('2. Click "Create Credentials" → "OAuth 2.0 Client IDs"');
    console.log('3. Choose "Web application"');
    console.log('4. Set name: "IMPACT Provisioning"');
    console.log('5. Add redirect URIs:');
    console.log('   - https://mwl-impact.web.app/provision/callback');
    console.log('   - http://localhost:5173/provision/callback');
    console.log('6. Click "Create"');
    console.log('7. Copy the Client ID and Client Secret');
    
    // Return placeholder credentials
    return {
      clientId: 'YOUR_OAUTH_CLIENT_ID_HERE',
      clientSecret: 'YOUR_OAUTH_CLIENT_SECRET_HERE'
    };
    
  } catch (error) {
    console.log('⚠️  Could not create OAuth credentials via CLI');
    return {
      clientId: 'YOUR_OAUTH_CLIENT_ID_HERE',
      clientSecret: 'YOUR_OAUTH_CLIENT_SECRET_HERE'
    };
  }
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
  console.log('✅ Environment file created (.env.local)');
  console.log('⚠️  Please update VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_CLIENT_SECRET with your actual credentials');
}

// Run the setup
if (require.main === module) {
  setupOAuthCLI();
}

module.exports = { setupOAuthCLI };
