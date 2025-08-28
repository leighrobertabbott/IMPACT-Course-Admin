#!/usr/bin/env node

/**
 * Final OAuth Setup for IMPACT Course Management System
 * This script provides direct OAuth setup instructions
 */

const fs = require('fs').promises;

async function setupOAuthFinal() {
  console.log('🔧 Final OAuth Setup for IMPACT Course Management System\n');

  try {
    // Create OAuth configuration files
    console.log('📋 Creating OAuth configuration files...');
    await createOAuthConfiguration();

    // Provide setup instructions
    console.log('📝 Providing setup instructions...');
    await provideSetupInstructions();

    console.log('\n✅ OAuth setup configuration completed!');
    console.log('\n🚀 Next steps:');
    console.log('1. Follow the manual setup instructions above');
    console.log('2. Update .env.local with your OAuth credentials');
    console.log('3. Deploy: npm run build && firebase deploy --only hosting');
    console.log('4. Test: Visit https://mwl-impact.web.app');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
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

async function provideSetupInstructions() {
  console.log('\n📋 OAuth Setup Instructions:');
  console.log('\n1. Open a new terminal/command prompt (to refresh PATH)');
  console.log('2. Navigate to your project directory');
  console.log('3. Run these commands:');
  console.log('   gcloud auth login');
  console.log('   gcloud config set project mwl-impact');
  console.log('   gcloud services enable plus.googleapis.com');
  console.log('   gcloud services enable cloudresourcemanager.googleapis.com');
  console.log('   gcloud services enable serviceusage.googleapis.com');
  console.log('   gcloud services enable firebase.googleapis.com');
  
  console.log('\n4. OAuth Consent Screen Setup:');
  console.log('   - Go to: https://console.cloud.google.com/apis/credentials/consent?project=mwl-impact');
  console.log('   - Set App name: "IMPACT Course Management System"');
  console.log('   - Set User support email: your email');
  console.log('   - Set Developer contact information: your email');
  console.log('   - Add your email as test user');
  console.log('   - Save and Continue');
  
  console.log('\n5. OAuth Credentials Setup:');
  console.log('   - Go to: https://console.cloud.google.com/apis/credentials?project=mwl-impact');
  console.log('   - Click "Create Credentials" → "OAuth 2.0 Client IDs"');
  console.log('   - Choose "Web application"');
  console.log('   - Set name: "IMPACT Provisioning"');
  console.log('   - Add Authorized redirect URIs:');
  console.log('     * https://mwl-impact.web.app/provision/callback');
  console.log('     * http://localhost:5173/provision/callback');
  console.log('   - Click "Create"');
  console.log('   - Copy the Client ID and Client Secret');
  
  console.log('\n6. Update Environment File:');
  console.log('   - Open .env.local');
  console.log('   - Replace YOUR_OAUTH_CLIENT_ID_HERE with your actual Client ID');
  console.log('   - Replace YOUR_OAUTH_CLIENT_SECRET_HERE with your actual Client Secret');
  
  console.log('\n7. Deploy:');
  console.log('   - npm run build');
  console.log('   - firebase deploy --only hosting');
  
  console.log('\n8. Test:');
  console.log('   - Visit: https://mwl-impact.web.app');
  console.log('   - Click: "Get your own IMPACT Management System"');
}

// Run the setup
if (require.main === module) {
  setupOAuthFinal();
}

module.exports = { setupOAuthFinal };
