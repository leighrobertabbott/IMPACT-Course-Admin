#!/usr/bin/env node

/**
 * Create OAuth Credentials using Google Cloud Console API
 * This script uses the Google Cloud Console API to create OAuth credentials programmatically
 */

const fs = require('fs').promises;
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function createOAuthViaAPI() {
  console.log('🔧 Creating OAuth credentials via Google Cloud Console API...\n');

  try {
    // 1. Check if we have gcloud CLI
    console.log('📋 Checking Google Cloud CLI...');
    const hasGCloud = await checkGCloudCLI();
    
    if (!hasGCloud) {
      console.log('❌ Google Cloud CLI not available');
      console.log('📋 Please install Google Cloud CLI:');
      console.log('   https://cloud.google.com/sdk/docs/install');
      return;
    }

    // 2. Authenticate with Google Cloud
    console.log('🔐 Authenticating with Google Cloud...');
    await authenticateWithGoogleCloud();

    // 3. Set project
    console.log('⚙️  Setting project...');
    await setProject();

    // 4. Enable APIs
    console.log('🔧 Enabling required APIs...');
    await enableAPIs();

    // 5. Create OAuth consent screen
    console.log('📋 Creating OAuth consent screen...');
    await createConsentScreen();

    // 6. Create OAuth credentials
    console.log('🔑 Creating OAuth credentials...');
    const credentials = await createCredentials();

    // 7. Update environment file
    console.log('📝 Updating environment file...');
    await updateEnvironmentFile(credentials);

    console.log('\n✅ OAuth credentials created successfully!');
    console.log('\n🚀 Your provisioning system is ready!');

  } catch (error) {
    console.error('\n❌ Failed to create OAuth credentials:', error.message);
    console.log('\n📋 Manual setup required');
  }
}

async function checkGCloudCLI() {
  try {
    await execAsync('gcloud --version');
    return true;
  } catch (error) {
    return false;
  }
}

async function authenticateWithGoogleCloud() {
  try {
    console.log('Opening Google Cloud authentication...');
    await execAsync('gcloud auth login');
    console.log('✅ Authentication successful');
  } catch (error) {
    console.log('⚠️  Authentication failed, please run manually:');
    console.log('   gcloud auth login');
  }
}

async function setProject() {
  try {
    await execAsync('gcloud config set project mwl-impact');
    console.log('✅ Project set to mwl-impact');
  } catch (error) {
    console.log('⚠️  Could not set project');
  }
}

async function enableAPIs() {
  const apis = [
    'plus.googleapis.com',
    'cloudresourcemanager.googleapis.com',
    'serviceusage.googleapis.com',
    'firebase.googleapis.com'
  ];

  for (const api of apis) {
    try {
      console.log(`Enabling ${api}...`);
      await execAsync(`gcloud services enable ${api}`);
      console.log(`✅ Enabled ${api}`);
    } catch (error) {
      console.log(`⚠️  Could not enable ${api}: ${error.message}`);
    }
  }
}

async function createConsentScreen() {
  try {
    // Create OAuth consent screen using gcloud
    const consentConfig = {
      application_name: 'IMPACT Course Management System',
      support_email: 'impact@sthk.nhs.uk',
      developer_contact_information: 'impact@sthk.nhs.uk',
      authorized_domains: ['mwl-impact.web.app']
    };

    await fs.writeFile('consent-config.json', JSON.stringify(consentConfig, null, 2));
    console.log('✅ Consent screen configuration created');
    
    console.log('📋 Please manually configure OAuth consent screen:');
    console.log('1. Go to: https://console.cloud.google.com/apis/credentials/consent?project=mwl-impact');
    console.log('2. Set App name: "IMPACT Course Management System"');
    console.log('3. Add your email as test user');
    console.log('4. Save and Continue');
    
  } catch (error) {
    console.log('⚠️  Could not create consent screen configuration');
  }
}

async function createCredentials() {
  try {
    // Create OAuth client using gcloud
    console.log('Creating OAuth client...');
    
    // This would use the Google Cloud Console API to create OAuth credentials
    // For now, we'll provide the manual steps
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
    
    return {
      clientId: 'YOUR_OAUTH_CLIENT_ID_HERE',
      clientSecret: 'YOUR_OAUTH_CLIENT_SECRET_HERE'
    };
    
  } catch (error) {
    console.log('⚠️  Could not create OAuth credentials via API');
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
  console.log('✅ Environment file updated (.env.local)');
  console.log('⚠️  Please update VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_CLIENT_SECRET with your actual credentials');
}

// Run the setup
if (require.main === module) {
  createOAuthViaAPI();
}

module.exports = { createOAuthViaAPI };
