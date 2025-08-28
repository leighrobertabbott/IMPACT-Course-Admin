#!/usr/bin/env node

const { exec } = require('child_process');

async function showVerificationGuide() {
  console.log('🔧 Google OAuth Verification Guide for Public Access\n');
  
  try {
    // Open the verification page
    const url = 'https://console.cloud.google.com/apis/credentials/consent?project=mwl-impact';
    await exec(`start ${url}`);
    console.log('✅ Opened OAuth consent screen');
    
    console.log('\n📋 To make your app publicly available:');
    console.log('');
    console.log('1. **Complete OAuth Consent Screen Setup:**');
    console.log('   - Fill in ALL required fields');
    console.log('   - Add privacy policy URL');
    console.log('   - Add terms of service URL');
    console.log('   - Add app logo');
    console.log('   - Complete all sections');
    console.log('');
    console.log('2. **Submit for Verification:**');
    console.log('   - Click "Submit for verification"');
    console.log('   - Google will review your app (2-6 weeks)');
    console.log('   - They may request additional information');
    console.log('');
    console.log('3. **Alternative: Use Internal App Type**');
    console.log('   - Change from "External" to "Internal"');
    console.log('   - Only works for Google Workspace domains');
    console.log('   - Requires domain verification');
    console.log('');
    console.log('⚠️  Note: Verification is the standard way to make OAuth apps public.');
    console.log('   Most major applications go through this process.');
    
  } catch (error) {
    console.log('⚠️  Could not open browser automatically');
    console.log('Please manually go to:');
    console.log('https://console.cloud.google.com/apis/credentials/consent?project=mwl-impact');
  }
}

showVerificationGuide();
