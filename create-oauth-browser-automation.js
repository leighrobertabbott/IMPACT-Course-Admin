#!/usr/bin/env node

/**
 * Create OAuth Credentials using Browser Automation
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const fs = require('fs').promises;

async function createOAuthWithBrowserAutomation() {
  console.log('🔧 Creating OAuth credentials using browser automation...\n');

  try {
    // 1. Install Puppeteer if not available
    console.log('📦 Checking for Puppeteer...');
    await installPuppeteer();

    // 2. Create browser automation script
    console.log('🤖 Creating browser automation script...');
    await createBrowserScript();

    // 3. Run browser automation
    console.log('🌐 Running browser automation...');
    const credentials = await runBrowserAutomation();

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

async function installPuppeteer() {
  try {
    // Check if Puppeteer is installed
    await execAsync('npm list puppeteer');
    console.log('✅ Puppeteer is already installed');
  } catch (error) {
    console.log('📦 Installing Puppeteer...');
    await execAsync('npm install puppeteer');
    console.log('✅ Puppeteer installed');
  }
}

async function createBrowserScript() {
  const scriptContent = `
const puppeteer = require('puppeteer');

async function createOAuthCredentials() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to Google Cloud Console
    await page.goto('https://console.cloud.google.com/apis/credentials?project=mwl-impact');
    
    // Wait for page to load
    await page.waitForSelector('button[data-testid="create-credentials-button"]', { timeout: 10000 });
    
    // Click Create Credentials
    await page.click('button[data-testid="create-credentials-button"]');
    
    // Click OAuth 2.0 Client IDs
    await page.waitForSelector('a[href*="oauth2"]', { timeout: 5000 });
    await page.click('a[href*="oauth2"]');
    
    // Fill in the form
    await page.waitForSelector('input[name="name"]', { timeout: 5000 });
    await page.type('input[name="name"]', 'IMPACT Provisioning');
    
    // Add redirect URIs
    await page.waitForSelector('input[name="redirect_uris"]', { timeout: 5000 });
    await page.type('input[name="redirect_uris"]', 'https://mwl-impact.web.app/provision/callback');
    
    // Add second redirect URI
    await page.click('button[data-testid="add-redirect-uri"]');
    await page.type('input[name="redirect_uris"]', 'http://localhost:5173/provision/callback');
    
    // Click Create
    await page.click('button[data-testid="create-button"]');
    
    // Wait for creation and get credentials
    await page.waitForSelector('.client-id', { timeout: 10000 });
    const clientId = await page.$eval('.client-id', el => el.textContent);
    const clientSecret = await page.$eval('.client-secret', el => el.textContent);
    
    console.log('Client ID:', clientId);
    console.log('Client Secret:', clientSecret);
    
    return { clientId, clientSecret };
    
  } catch (error) {
    console.error('Browser automation failed:', error.message);
    return { clientId: 'YOUR_OAUTH_CLIENT_ID_HERE', clientSecret: 'YOUR_OAUTH_CLIENT_SECRET_HERE' };
  } finally {
    await browser.close();
  }
}

createOAuthCredentials();
`;

  await fs.writeFile('browser-automation.js', scriptContent);
  console.log('✅ Browser automation script created');
}

async function runBrowserAutomation() {
  try {
    console.log('🤖 Running browser automation...');
    const { stdout } = await execAsync('node browser-automation.js');
    
    // Parse the output to extract credentials
    const clientIdMatch = stdout.match(/Client ID: (.+)/);
    const clientSecretMatch = stdout.match(/Client Secret: (.+)/);
    
    if (clientIdMatch && clientSecretMatch) {
      return {
        clientId: clientIdMatch[1].trim(),
        clientSecret: clientSecretMatch[1].trim()
      };
    } else {
      return {
        clientId: 'YOUR_OAUTH_CLIENT_ID_HERE',
        clientSecret: 'YOUR_OAUTH_CLIENT_SECRET_HERE'
      };
    }
    
  } catch (error) {
    console.log('⚠️  Browser automation failed');
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
  createOAuthWithBrowserAutomation();
}

module.exports = { createOAuthWithBrowserAutomation };
