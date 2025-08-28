#!/usr/bin/env node

/**
 * Open Google Cloud Console OAuth Setup
 * This script opens the browser to the correct Google Cloud Console pages
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function openOAuthSetup() {
  console.log('🔧 Opening Google Cloud Console for OAuth setup...\n');

  const projectId = 'mwl-impact';
  
  console.log(`📋 Using project: ${projectId}`);
  console.log('🌐 Opening browser tabs...\n');

  // Open OAuth consent screen
  const consentScreenUrl = `https://console.cloud.google.com/apis/credentials/consent?project=${projectId}`;
  console.log('1. OAuth Consent Screen:');
  console.log(consentScreenUrl);
  
  // Open OAuth credentials
  const credentialsUrl = `https://console.cloud.google.com/apis/credentials?project=${projectId}`;
  console.log('\n2. OAuth Credentials:');
  console.log(credentialsUrl);

  // Open APIs
  const apisUrl = `https://console.cloud.google.com/apis/library?project=${projectId}`;
  console.log('\n3. APIs Library:');
  console.log(apisUrl);

  try {
    // Open browser tabs
    await execAsync(`start ${consentScreenUrl}`);
    await execAsync(`start ${credentialsUrl}`);
    await execAsync(`start ${apisUrl}`);
    
    console.log('\n✅ Browser tabs opened!');
    console.log('\n📋 Setup Instructions:');
    console.log('1. In the OAuth Consent Screen tab:');
    console.log('   - Set App name: "IMPACT Course Management System"');
    console.log('   - Set User support email: your email');
    console.log('   - Set Developer contact information: your email');
    console.log('   - Add your email as test user');
    console.log('   - Save and Continue');
    
    console.log('\n2. In the APIs Library tab, enable these APIs:');
    console.log('   - Search for "Google+ API" and enable');
    console.log('   - Search for "Cloud Resource Manager API" and enable');
    console.log('   - Search for "Service Usage API" and enable');
    console.log('   - Search for "Firebase Management API" and enable');
    
    console.log('\n3. In the OAuth Credentials tab:');
    console.log('   - Click "Create Credentials" → "OAuth 2.0 Client IDs"');
    console.log('   - Choose "Web application"');
    console.log('   - Set name: "IMPACT Provisioning"');
    console.log('   - Add Authorized redirect URIs:');
    console.log('     * https://mwl-impact.web.app/provision/callback');
    console.log('     * http://localhost:5173/provision/callback');
    console.log('   - Click "Create"');
    console.log('   - Copy the Client ID and Client Secret');
    
    console.log('\n4. Update your .env.local file with the credentials');
    console.log('5. Deploy: npm run build && firebase deploy --only hosting');
    
  } catch (error) {
    console.error('Failed to open browser:', error.message);
    console.log('\n📋 Manual navigation:');
    console.log('1. Go to: https://console.cloud.google.com/');
    console.log('2. Select project: mwl-impact');
    console.log('3. Follow the setup instructions above');
  }
}

// Run the setup
if (require.main === module) {
  openOAuthSetup();
}

module.exports = { openOAuthSetup };
