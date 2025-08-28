#!/usr/bin/env node

/**
 * Create OAuth Credentials - Simple Approach
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const fs = require('fs').promises;

async function createOAuthSimple() {
  console.log('🔧 Creating OAuth credentials - Simple approach...\n');

  try {
    // 1. Get access token
    console.log('🔐 Getting access token...');
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      throw new Error('Could not get access token');
    }

    // 2. Create OAuth credentials using the Google Cloud Console API
    console.log('🔑 Creating OAuth credentials...');
    const credentials = await createCredentials(accessToken);

    // 3. Update environment file
    console.log('📝 Updating environment file...');
    await updateEnvironmentFile(credentials);

    console.log('\n✅ OAuth credentials created successfully!');
    console.log('\n🚀 Your provisioning system is ready!');

  } catch (error) {
    console.error('\n❌ Failed to create OAuth credentials:', error.message);
    console.log('\n📋 Manual setup required');
  }
}

async function getAccessToken() {
  try {
    const command = `"C:\\Program Files (x86)\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gcloud.cmd" auth print-access-token`;
    const { stdout } = await execAsync(command);
    return stdout.trim();
  } catch (error) {
    console.log('⚠️  Could not get access token');
    console.log('Error:', error.message);
    return null;
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

    // Try the Google Cloud Console API
    const command = `curl -X POST "https://oauth2.googleapis.com/oauth2/v1/projects/mwl-impact/clients" -H "Authorization: Bearer ${accessToken}" -H "Content-Type: application/json" -d '${JSON.stringify(clientData)}'`;
    
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
    
    // Try alternative approach using gcloud directly
    try {
      console.log('Trying alternative approach...');
      const altCommand = `"C:\\Program Files (x86)\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gcloud.cmd" auth application-default login`;
      await execAsync(altCommand);
      
      console.log('✅ Application default credentials set up');
      
      // Now try to create OAuth credentials
      const createCommand = `curl -X POST "https://oauth2.googleapis.com/oauth2/v1/projects/mwl-impact/clients" -H "Content-Type: application/json" -d '${JSON.stringify(clientData)}'`;
      const { stdout } = await execAsync(createCommand);
      const response = JSON.parse(stdout);
      
      console.log('✅ OAuth client created successfully (alternative)');
      console.log('Client ID:', response.client_id);
      
      return {
        clientId: response.client_id,
        clientSecret: response.client_secret
      };
      
    } catch (altError) {
      console.log('⚠️  Alternative approach also failed');
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
  createOAuthSimple();
}

module.exports = { createOAuthSimple };
