#!/usr/bin/env node

const { exec } = require('child_process');

async function addBlockedUser() {
  console.log('🔧 Adding Blocked User to OAuth Test Users\n');
  
  try {
    // Open the OAuth consent screen test users section
    const url = 'https://console.cloud.google.com/apis/credentials/consent?project=mwl-impact';
    await exec(`start ${url}`);
    console.log('✅ Opened OAuth consent screen');
    
    console.log('\n📋 Quick Fix Instructions:');
    console.log('1. In the OAuth Consent Screen tab:');
    console.log('   - Scroll down to "Test users" section');
    console.log('   - Click "ADD USERS"');
    console.log('   - Add this email: senninha@gmail.com');
    console.log('   - Click "SAVE"');
    console.log('');
    console.log('2. That\'s it! The user should now be able to access your app.');
    console.log('');
    console.log('⚠️  For future users, you\'ll need to add their emails as test users');
    console.log('   until you complete Google\'s verification process.');
    
  } catch (error) {
    console.log('⚠️  Could not open browser automatically');
    console.log('Please manually go to:');
    console.log('https://console.cloud.google.com/apis/credentials/consent?project=mwl-impact');
  }
}

addBlockedUser();
