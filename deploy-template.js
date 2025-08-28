#!/usr/bin/env node

/**
 * IMPACT Course Management System - Deployment Template
 * 
 * This script helps set up the provisioning system for creating exact replicas
 * of the IMPACT system for other hospitals.
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function setupProvisioningSystem() {
  console.log('🚀 Setting up IMPACT Course Management System Provisioning...\n');

  try {
    // 1. Check prerequisites
    console.log('📋 Checking prerequisites...');
    await checkPrerequisites();

    // 2. Create deployment configuration
    console.log('⚙️  Creating deployment configuration...');
    await createDeploymentConfig();

    // 3. Set up environment variables
    console.log('🔧 Setting up environment variables...');
    await setupEnvironmentVariables();

    // 4. Deploy Firebase Functions
    console.log('🔥 Deploying Firebase Functions...');
    await deployFirebaseFunctions();

    // 5. Test the system
    console.log('🧪 Testing the provisioning system...');
    await testProvisioningSystem();

    console.log('\n✅ IMPACT Course Management System Provisioning setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Visit your landing page');
    console.log('2. Click "Get your own IMPACT Management System"');
    console.log('3. Test the complete provisioning flow');
    console.log('4. Each hospital will get their own isolated IMPACT instance');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

async function checkPrerequisites() {
  // Check if Firebase CLI is installed
  try {
    await execAsync('firebase --version');
  } catch (error) {
    throw new Error('Firebase CLI not found. Please install it: npm install -g firebase-tools');
  }

  // Check if git is available
  try {
    await execAsync('git --version');
  } catch (error) {
    throw new Error('Git not found. Please install Git.');
  }

  // Check if Node.js version is sufficient
  const { stdout } = await execAsync('node --version');
  const nodeVersion = stdout.trim();
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 16) {
    throw new Error(`Node.js version ${nodeVersion} is too old. Please use Node.js 16 or higher.`);
  }

  console.log('✅ All prerequisites met');
}

async function createDeploymentConfig() {
  const config = {
    repository: {
      url: 'https://github.com/leighrobertabbott/IMPACT-Course-Admin.git',
      branch: 'main'
    },
    firebase: {
      region: 'europe-west2',
      hosting: {
        public: 'dist',
        ignore: ['firebase.json', '**/.*', '**/node_modules/**']
      }
    },
    build: {
      command: 'npm run build',
      output: 'dist'
    },
    security: {
      firestoreRules: 'firestore.rules',
      storageRules: 'storage.rules'
    }
  };

  await fs.writeFile('deployment-config.json', JSON.stringify(config, null, 2));
  console.log('✅ Deployment configuration created');
}

async function setupEnvironmentVariables() {
  const envTemplate = `# IMPACT Course Management System - Environment Variables
# Copy this to .env.local and fill in your values

# App Configuration
VITE_APP_URL=https://your-domain.example
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# Firebase Configuration (for your main site)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Build Configuration
VITE_BUILD_DIR=dist
VITE_FIRESTORE_REGION=europe-west2

# Email Configuration (for your main site)
VITE_RESEND_API_KEY=your-resend-api-key

# Provisioning Configuration
VITE_GITHUB_REPO_URL=https://github.com/leighrobertabbott/IMPACT-Course-Admin.git
VITE_PROVISIONING_ENABLED=true
`;

  await fs.writeFile('.env.template', envTemplate);
  console.log('✅ Environment template created (.env.template)');
  console.log('⚠️  Please copy .env.template to .env.local and fill in your values');
}

async function deployFirebaseFunctions() {
  try {
    console.log('Installing function dependencies...');
    await execAsync('npm install', { cwd: 'functions' });

    console.log('Deploying Firebase Functions...');
    await execAsync('firebase deploy --only functions');
    
    console.log('✅ Firebase Functions deployed successfully');
  } catch (error) {
    throw new Error(`Failed to deploy Firebase Functions: ${error.message}`);
  }
}

async function testProvisioningSystem() {
  console.log('Testing provisioning system components...');
  
  // Test GitHub repository access
  try {
    await execAsync('git ls-remote https://github.com/leighrobertabbott/IMPACT-Course-Admin.git');
    console.log('✅ GitHub repository accessible');
  } catch (error) {
    console.warn('⚠️  Warning: Cannot access GitHub repository. Make sure it\'s public or you have proper access.');
  }

  // Test Firebase project access
  try {
    await execAsync('firebase projects:list');
    console.log('✅ Firebase project access confirmed');
  } catch (error) {
    console.warn('⚠️  Warning: Firebase project access issues. Make sure you\'re logged in.');
  }

  console.log('✅ Provisioning system test completed');
}

// Run the setup
if (require.main === module) {
  setupProvisioningSystem();
}

module.exports = { setupProvisioningSystem };
