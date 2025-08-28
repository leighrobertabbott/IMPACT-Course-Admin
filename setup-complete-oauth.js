#!/usr/bin/env node

/**
 * Complete OAuth Setup for IMPACT Course Management System
 * This script handles the entire OAuth setup process via CLI
 */

const fs = require('fs').promises;
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function setupCompleteOAuth() {
  console.log('🔧 Complete OAuth Setup for IMPACT Course Management System\n');

  try {
    // 1. Check and install Google Cloud CLI if needed
    console.log('📋 Checking Google Cloud CLI...');
    const hasGCloud = await checkAndInstallGCloud();
    
    if (!hasGCloud) {
      console.log('❌ Google Cloud CLI installation failed');
      console.log('📋 Please install manually: https://cloud.google.com/sdk/docs/install');
      console.log('📋 Then run this script again');
      return;
    }

    // 2. Authenticate with Google Cloud
    console.log('🔐 Authenticating with Google Cloud...');
    await authenticateWithGoogleCloud();

    // 3. Set project and enable APIs
    console.log('⚙️  Configuring project and APIs...');
    await configureProjectAndAPIs();

    // 4. Create OAuth configuration files
    console.log('📋 Creating OAuth configuration...');
    await createOAuthConfiguration();

    // 5. Provide final instructions
    console.log('📝 Providing final setup instructions...');
    await provideFinalInstructions();

    console.log('\n✅ OAuth setup configuration completed!');
    console.log('\n🚀 Next steps:');
    console.log('1. Follow the manual setup instructions above');
    console.log('2. Update .env.local with your OAuth credentials');
    console.log('3. Deploy: npm run build && firebase deploy --only hosting');
    console.log('4. Test: Visit https://mwl-impact.web.app');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n📋 Manual setup required');
  }
}

async function checkAndInstallGCloud() {
  try {
    await execAsync('gcloud --version');
    console.log('✅ Google Cloud CLI is already installed');
    return true;
  } catch (error) {
    console.log('⚠️  Google Cloud CLI not found');
    console.log('📋 Attempting to install Google Cloud CLI...');
    
    try {
      // Try to install via winget
      console.log('Installing via winget...');
      await execAsync('winget install Google.CloudSDK --accept-source-agreements --accept-package-agreements');
      console.log('✅ Google Cloud CLI installed via winget');
      return true;
    } catch (wingetError) {
      console.log('⚠️  Winget installation failed');
      
      try {
        // Try to install via Chocolatey
        console.log('Installing via Chocolatey...');
        await execAsync('choco install gcloudsdk -y');
        console.log('✅ Google Cloud CLI installed via Chocolatey');
        return true;
      } catch (chocoError) {
        console.log('⚠️  Chocolatey installation failed');
        console.log('📋 Please install Google Cloud CLI manually:');
        console.log('   https://cloud.google.com/sdk/docs/install');
        return false;
      }
    }
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

async function configureProjectAndAPIs() {
  try {
    // Set project
    await execAsync('gcloud config set project mwl-impact');
    console.log('✅ Project set to mwl-impact');

    // Enable required APIs
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
  } catch (error) {
    console.log('⚠️  Could not configure project and APIs');
  }
}

async function createOAuthConfiguration() {
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

    // Create environment template
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

  } catch (error) {
    console.log('⚠️  Could not create OAuth configuration files');
  }
}

async function provideFinalInstructions() {
  console.log('\n📋 Manual Setup Instructions:');
  console.log('\n1. OAuth Consent Screen Setup:');
  console.log('   - Go to: https://console.cloud.google.com/apis/credentials/consent?project=mwl-impact');
  console.log('   - Set App name: "IMPACT Course Management System"');
  console.log('   - Set User support email: your email');
  console.log('   - Set Developer contact information: your email');
  console.log('   - Add your email as test user');
  console.log('   - Save and Continue');
  
  console.log('\n2. OAuth Credentials Setup:');
  console.log('   - Go to: https://console.cloud.google.com/apis/credentials?project=mwl-impact');
  console.log('   - Click "Create Credentials" → "OAuth 2.0 Client IDs"');
  console.log('   - Choose "Web application"');
  console.log('   - Set name: "IMPACT Provisioning"');
  console.log('   - Add Authorized redirect URIs:');
  console.log('     * https://mwl-impact.web.app/provision/callback');
  console.log('     * http://localhost:5173/provision/callback');
  console.log('   - Click "Create"');
  console.log('   - Copy the Client ID and Client Secret');
  
  console.log('\n3. Update Environment File:');
  console.log('   - Open .env.local');
  console.log('   - Replace YOUR_OAUTH_CLIENT_ID_HERE with your actual Client ID');
  console.log('   - Replace YOUR_OAUTH_CLIENT_SECRET_HERE with your actual Client Secret');
  
  console.log('\n4. Deploy:');
  console.log('   - npm run build');
  console.log('   - firebase deploy --only hosting');
  
  console.log('\n5. Test:');
  console.log('   - Visit: https://mwl-impact.web.app');
  console.log('   - Click: "Get your own IMPACT Management System"');
}

// Run the setup
if (require.main === module) {
  setupCompleteOAuth();
}

module.exports = { setupCompleteOAuth };
