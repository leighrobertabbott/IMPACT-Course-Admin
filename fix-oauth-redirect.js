#!/usr/bin/env node

const { exec } = require('child_process');

async function openOAuthClientConfig() {
  console.log('🔧 Opening OAuth Client Configuration...\n');
  
  try {
    // Open the OAuth client configuration page
    const url = 'https://console.cloud.google.com/apis/credentials/consent?project=mwl-impact';
    await exec(`start ${url}`);
    console.log('✅ Opened OAuth consent screen');
    
    // Open the credentials page
    const credentialsUrl = 'https://console.cloud.google.com/apis/credentials?project=mwl-impact';
    await exec(`start ${credentialsUrl}`);
    console.log('✅ Opened OAuth credentials page');
    
    console.log('\n📋 Instructions to fix the redirect URI:');
    console.log('1. In the OAuth Credentials tab:');
    console.log('   - Click on your OAuth 2.0 Client ID (IMPACT Provisioning)');
    console.log('   - Scroll down to "Authorized redirect URIs"');
    console.log('   - Make sure you have these EXACT URIs:');
    console.log('     * https://mwl-impact.web.app/provision/callback');
    console.log('     * http://localhost:5173/provision/callback');
    console.log('   - Click "Save"');
    console.log('');
    console.log('2. The redirect URIs CAN have paths (unlike JavaScript origins)');
    console.log('3. After saving, try the provisioning flow again');
    
  } catch (error) {
    console.log('⚠️  Could not open browser automatically');
    console.log('Please manually go to:');
    console.log('https://console.cloud.google.com/apis/credentials?project=mwl-impact');
  }
}

openOAuthClientConfig();
