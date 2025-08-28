#!/usr/bin/env node

const { exec } = require('child_process');

async function addTestUsers() {
  console.log('🔧 Adding Test Users to OAuth Consent Screen...\n');
  
  try {
    // Open the OAuth consent screen test users section
    const url = 'https://console.cloud.google.com/apis/credentials/consent?project=mwl-impact';
    await exec(`start ${url}`);
    console.log('✅ Opened OAuth consent screen');
    
    console.log('\n📋 Instructions to add test users:');
    console.log('1. In the OAuth Consent Screen tab:');
    console.log('   - Scroll down to "Test users" section');
    console.log('   - Click "ADD USERS"');
    console.log('   - Add these email addresses:');
    console.log('     * senninha@gmail.com');
    console.log('     * leighabbott@hotmail.com (your email)');
    console.log('     * Any other Google accounts you want to test with');
    console.log('   - Click "SAVE"');
    console.log('');
    console.log('2. After adding test users, try the provisioning flow again');
    console.log('3. Only the emails you add as test users will be able to use the system');
    console.log('');
    console.log('⚠️  Note: This is required because your app is "External" and unverified.');
    console.log('   Google requires you to explicitly add test users for security.');
    
  } catch (error) {
    console.log('⚠️  Could not open browser automatically');
    console.log('Please manually go to:');
    console.log('https://console.cloud.google.com/apis/credentials/consent?project=mwl-impact');
  }
}

addTestUsers();
