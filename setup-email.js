#!/usr/bin/env node

/**
 * Email Setup Script for IMPACT Course System
 * 
 * This script helps you set up the email configuration for the IMPACT Course system.
 * It will guide you through setting up Resend.com and configuring Firebase environment variables.
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🚀 IMPACT Course System - Email Setup\n');
  console.log('This script will help you set up email functionality using Resend.com\n');

  console.log('📋 Prerequisites:');
  console.log('1. Firebase CLI installed and logged in');
  console.log('2. Resend.com account created');
  console.log('3. Resend API key obtained\n');

  const hasFirebaseCLI = await question('Do you have Firebase CLI installed and are you logged in? (y/n): ');
  if (hasFirebaseCLI.toLowerCase() !== 'y') {
    console.log('\n❌ Please install Firebase CLI and log in first:');
    console.log('npm install -g firebase-tools');
    console.log('firebase login');
    process.exit(1);
  }

  const hasResendAccount = await question('Do you have a Resend.com account? (y/n): ');
  if (hasResendAccount.toLowerCase() !== 'y') {
    console.log('\n📝 Please create a Resend account first:');
    console.log('1. Go to https://resend.com');
    console.log('2. Click "Sign Up" and create a free account');
    console.log('3. Verify your email address');
    console.log('4. Get your API key from the dashboard');
    console.log('\nRun this script again after creating your account.');
    process.exit(1);
  }

  const apiKey = await question('Enter your Resend API key (starts with re_): ');
  if (!apiKey.startsWith('re_')) {
    console.log('\n❌ Invalid API key format. Resend API keys start with "re_"');
    process.exit(1);
  }

  const fromEmail = await question('Enter the from email address (default: IMPACT Course <noreply@mwl-impact.web.app>): ');
  const finalFromEmail = fromEmail || 'IMPACT Course <noreply@mwl-impact.web.app>';

  console.log('\n🔧 Setting up Firebase environment variables...');

  try {
    // Set the Resend API key
    execSync(`firebase functions:config:set resend.api_key="${apiKey}"`, { stdio: 'inherit' });
    console.log('✅ Resend API key configured');

    // Set the from email
    execSync(`firebase functions:config:set email.from="${finalFromEmail}"`, { stdio: 'inherit' });
    console.log('✅ From email configured');

    console.log('\n🚀 Deploying updated functions...');
    execSync('firebase deploy --only functions', { stdio: 'inherit' });

    console.log('\n🎉 Email setup complete!');
    console.log('\n📧 Your email configuration:');
    console.log(`- Provider: Resend.com`);
    console.log(`- From Email: ${finalFromEmail}`);
    console.log(`- API Key: ${apiKey.substring(0, 10)}...`);

    console.log('\n🧪 To test the email setup:');
    console.log('1. Go to the Admin Panel');
    console.log('2. Navigate to "Communications"');
    console.log('3. Select "Welcome Email" from the dropdown');
    console.log('4. Select a candidate');
    console.log('5. Click "Send Email to Selected Candidates"');

    console.log('\n📊 Monitor your email delivery at: https://resend.com/dashboard');

  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    console.log('\nPlease check:');
    console.log('1. You are logged into Firebase CLI');
    console.log('2. You have the correct project selected');
    console.log('3. Your Resend API key is valid');
  }

  rl.close();
}

main().catch(console.error);
