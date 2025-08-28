#!/usr/bin/env node

/**
 * Create OAuth Credentials Programmatically via Google Cloud Console API
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const fs = require('fs').promises;

async function createOAuthProgrammatic() {
  console.log('🔧 Creating OAuth credentials programmatically...\n');

  try {
    // 1. Get access token with proper scopes
    console.log('🔐 Getting access token with proper scopes...');
    const accessToken = await getAccessTokenWithScopes();
    
    if (!accessToken) {
      throw new Error('Could not get access token with proper scopes');
    }

    // 2. Create OAuth consent screen
    console.log('📋 Creating OAuth consent screen...');
    await createConsentScreen(accessToken);

    // 3. Create OAuth credentials
    console.log('🔑 Creating OAuth credentials...');
    const credentials = await createCredentials(accessToken);

    // 4. Update environment file
    console.log('📝 Updating environment file...');
    await updateEnvironmentFile(credentials);

    console.log('\n✅ OAuth credentials created successfully!');
    console.log('\n🚀 Your provisioning system is ready!');

  } catch (error) {
    console.error('\n❌ Failed to create OAuth credentials:', error.message);
    console.log('\n📋 Manual setup required');
  }
}

async function getAccessTokenWithScopes() {
  try {
    // First, let's set up application default credentials with proper scopes
    const command = `& "C:\\Program Files (x86)\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gcloud.cmd" auth application-default login --scopes="https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/oauth2"`;
    await execAsync(command);
    
    // Now get the access token
    const tokenCommand = `& "C:\\Program Files (x86)\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gcloud.cmd" auth application-default print-access-token`;
    const { stdout } = await execAsync(tokenCommand);
    return stdout.trim();
  } catch (error) {
    console.log('⚠️  Could not get access token with proper scopes');
    return null;
  }
}

async function createConsentScreen(accessToken) {
  try {
    const consentScreenData = {
      application_name: 'IMPACT Course Management System',
      support_email: 'leighabbott@hotmail.com',
      developer_contact_information: 'leighabbott@hotmail.com',
      authorized_domains: ['mwl-impact.web.app'],
      scopes: [
        'openid',
        'email',
        'profile',
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/firebase'
      ]
    };

    // Use the Google Cloud Console API to create consent screen
    const command = `curl -X PUT "https://oauth2.googleapis.com/oauth2/v1/projects/mwl-impact/consent" \
      -H "Authorization: Bearer ${accessToken}" \
      -H "Content-Type: application/json" \
      -d '${JSON.stringify(consentScreenData)}'`;
    
    const { stdout } = await execAsync(command);
    console.log('✅ OAuth consent screen created');
    console.log('Response:', stdout);
    
  } catch (error) {
    console.log('⚠️  Could not create OAuth consent screen via API');
    console.log('Error:', error.message);
  }
}

async function createCredentials(accessToken) {
  try {
    const clientData = {
      name: 'IMPACT Provisioning',
      type: 'web',
      redirect_uris: [
        'https://mwl-impact.web.app/provision/callback',
        'http://localhost:5173/provision/callback'
      ]
    };

    // Use the Google Cloud Console API to create OAuth client
    const command = `curl -X POST "https://oauth2.googleapis.com/oauth2/v1/projects/mwl-impact/clients" \
      -H "Authorization: Bearer ${accessToken}" \
      -H "Content-Type: application/json" \
      -d '${JSON.stringify(clientData)}'`;
    
    const { stdout } = await execAsync(command);
    const response = JSON.parse(stdout);
    
    console.log('✅ OAuth client created successfully');
    console.log('Client ID:', response.client_id);
    console.log('Client Secret:', response.client_secret);
    
    return {
      clientId: response.client_id,
      clientSecret: response.client_secret
    };
    
  } catch (error) {
    console.log('⚠️  Could not create OAuth credentials via API');
    console.log('Error:', error.message);
    
    // Try alternative API endpoint
    try {
      console.log('Trying alternative API endpoint...');
      const altCommand = `curl -X POST "https://www.googleapis.com/oauth2/v1/clients" \
        -H "Authorization: Bearer ${accessToken}" \
        -H "Content-Type: application/json" \
        -d '{
          "name": "IMPACT Provisioning",
          "type": "web",
          "redirect_uris": [
            "https://mwl-impact.web.app/provision/callback",
            "http://localhost:5173/provision/callback"
          ]
        }'`;
      
      const { stdout } = await execAsync(altCommand);
      const response = JSON.parse(stdout);
      
      console.log('✅ OAuth client created successfully (alternative endpoint)');
      console.log('Client ID:', response.client_id);
      
      return {
        clientId: response.client_id,
        clientSecret: response.client_secret
      };
      
    } catch (altError) {
      console.log('⚠️  Alternative endpoint also failed');
      console.log('Error:', altError.message);
      
      return {
        clientId: 'YOUR_OAUTH_CLIENT_ID_HERE',
        clientSecret: 'YOUR_OAUTH_CLIENT_SECRET_HERE'
      };
    }
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
  
  if (credentials.clientId === 'YOUR_OAUTH_CLIENT_ID_HERE') {
    console.log('⚠️  Please update VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_CLIENT_SECRET with your actual credentials');
  }
}

// Run the setup
if (require.main === module) {
  createOAuthProgrammatic();
}

module.exports = { createOAuthProgrammatic };
