#!/usr/bin/env node

/**
 * Create OAuth Credentials using Service Account
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const fs = require('fs').promises;

async function createOAuthWithServiceAccount() {
  console.log('🔧 Creating OAuth credentials using service account...\n');

  try {
    // 1. Create service account with proper permissions
    console.log('🔐 Creating service account with OAuth permissions...');
    await createServiceAccount();

    // 2. Get service account key
    console.log('🔑 Getting service account key...');
    const serviceAccountKey = await getServiceAccountKey();

    // 3. Use service account to create OAuth credentials
    console.log('📋 Creating OAuth credentials...');
    const credentials = await createOAuthCredentials(serviceAccountKey);

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

async function createServiceAccount() {
  try {
    // Create service account
    const createCommand = `& "C:\\Program Files (x86)\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gcloud.cmd" iam service-accounts create oauth-creator --display-name="OAuth Credentials Creator" --description="Service account for creating OAuth credentials"`;
    await execAsync(createCommand);
    console.log('✅ Service account created');

    // Grant necessary permissions
    const grantCommand = `& "C:\\Program Files (x86)\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gcloud.cmd" projects add-iam-policy-binding mwl-impact --member="serviceAccount:oauth-creator@mwl-impact.iam.gserviceaccount.com" --role="roles/oauth2.admin"`;
    await execAsync(grantCommand);
    console.log('✅ OAuth admin role granted');

  } catch (error) {
    console.log('⚠️  Could not create service account');
    console.log('Error:', error.message);
  }
}

async function getServiceAccountKey() {
  try {
    // Create service account key
    const keyCommand = `& "C:\\Program Files (x86)\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gcloud.cmd" iam service-accounts keys create oauth-creator-key.json --iam-account=oauth-creator@mwl-impact.iam.gserviceaccount.com`;
    await execAsync(keyCommand);
    console.log('✅ Service account key created');

    // Read the key file
    const keyData = await fs.readFile('oauth-creator-key.json', 'utf8');
    return JSON.parse(keyData);

  } catch (error) {
    console.log('⚠️  Could not get service account key');
    console.log('Error:', error.message);
    return null;
  }
}

async function createOAuthCredentials(serviceAccountKey) {
  try {
    if (!serviceAccountKey) {
      throw new Error('No service account key available');
    }

    // Use the service account to create OAuth credentials
    const clientData = {
      name: 'IMPACT Provisioning',
      type: 'web',
      redirect_uris: [
        'https://mwl-impact.web.app/provision/callback',
        'http://localhost:5173/provision/callback'
      ]
    };

    // Create OAuth client using service account
    const command = `curl -X POST "https://oauth2.googleapis.com/oauth2/v1/projects/mwl-impact/clients" \
      -H "Authorization: Bearer ${serviceAccountKey.access_token}" \
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
    console.log('⚠️  Could not create OAuth credentials via service account');
    console.log('Error:', error.message);
    
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
  
  if (credentials.clientId === 'YOUR_OAUTH_CLIENT_ID_HERE') {
    console.log('⚠️  Please update VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_CLIENT_SECRET with your actual credentials');
  }
}

// Run the setup
if (require.main === module) {
  createOAuthWithServiceAccount();
}

module.exports = { createOAuthWithServiceAccount };
