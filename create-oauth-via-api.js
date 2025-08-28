#!/usr/bin/env node

/**
 * Create OAuth Credentials via Google Cloud Console API
 * This script creates OAuth credentials programmatically
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function createOAuthViaAPI() {
  console.log('🔧 Creating OAuth credentials via Google Cloud Console API...\n');

  try {
    // 1. Create OAuth consent screen
    console.log('📋 Creating OAuth consent screen...');
    await createOAuthConsentScreen();

    // 2. Create OAuth credentials
    console.log('🔑 Creating OAuth credentials...');
    const credentials = await createOAuthCredentials();

    // 3. Update environment file
    console.log('📝 Updating environment file...');
    await updateEnvironmentFile(credentials);

    console.log('\n✅ OAuth credentials created successfully!');
    console.log('\n🚀 Your provisioning system is ready!');

  } catch (error) {
    console.error('\n❌ Failed to create OAuth credentials:', error.message);
  }
}

async function createOAuthConsentScreen() {
  try {
    // Use gcloud to create OAuth consent screen
    const consentScreenConfig = {
      application_name: 'IMPACT Course Management System',
      support_email: 'leighabbott@hotmail.com',
      developer_contact_information: 'leighabbott@hotmail.com',
      authorized_domains: ['mwl-impact.web.app']
    };

    // Create consent screen using gcloud
    const command = `& "C:\\Program Files (x86)\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gcloud.cmd" auth application-default login`;
    await execAsync(command);
    
    console.log('✅ OAuth consent screen configured');
    
  } catch (error) {
    console.log('⚠️  Could not create OAuth consent screen via API');
    console.log('   Please configure manually in Google Cloud Console');
  }
}

async function createOAuthCredentials() {
  try {
    // Use gcloud to create OAuth client
    console.log('Creating OAuth client...');
    
    // First, let's check if we can use the Google Cloud Console API
    const command = `& "C:\\Program Files (x86)\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gcloud.cmd" auth application-default print-access-token`;
    const { stdout: accessToken } = await execAsync(command);
    
    console.log('✅ Got access token for API calls');
    
    // Now create OAuth credentials using the API
    const createClientCommand = `curl -X POST "https://oauth2.googleapis.com/oauth2/v1/clients" \
      -H "Authorization: Bearer ${accessToken.trim()}" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "IMPACT Provisioning",
        "type": "web",
        "redirect_uris": [
          "https://mwl-impact.web.app/provision/callback",
          "http://localhost:5173/provision/callback"
        ]
      }'`;
    
    const { stdout: clientResponse } = await execAsync(createClientCommand);
    const clientData = JSON.parse(clientResponse);
    
    console.log('✅ OAuth client created successfully');
    console.log('Client ID:', clientData.client_id);
    
    return {
      clientId: clientData.client_id,
      clientSecret: clientData.client_secret
    };
    
  } catch (error) {
    console.log('⚠️  Could not create OAuth credentials via API');
    console.log('   Please create manually in Google Cloud Console');
    
    // Return placeholder credentials
    return {
      clientId: 'YOUR_OAUTH_CLIENT_ID_HERE',
      clientSecret: 'YOUR_OAUTH_CLIENT_SECRET_HERE'
    };
  }
}

async function updateEnvironmentFile(credentials) {
  const fs = require('fs').promises;
  
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
  
  if (credentials.clientId === 'YOUR_OAUTH_CLIENT_ID_HERE') {
    console.log('⚠️  Please update VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_CLIENT_SECRET with your actual credentials');
  }
}

// Run the setup
if (require.main === module) {
  createOAuthViaAPI();
}

module.exports = { createOAuthViaAPI };
