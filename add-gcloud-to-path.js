#!/usr/bin/env node

/**
 * Add Google Cloud SDK to PATH
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function addGCloudToPath() {
  console.log('🔧 Adding Google Cloud SDK to PATH...\n');

  const gcloudPath = 'C:\\Program Files (x86)\\Google\\Cloud SDK\\google-cloud-sdk\\bin';
  
  try {
    // Get current PATH
    const { stdout: currentPath } = await execAsync('echo $env:PATH');
    console.log('Current PATH:', currentPath);
    
    // Check if gcloud is already in PATH
    if (currentPath.includes(gcloudPath)) {
      console.log('✅ Google Cloud SDK is already in PATH');
      return;
    }
    
    // Add to PATH for current session
    console.log('Adding to PATH for current session...');
    process.env.PATH = `${gcloudPath};${process.env.PATH}`;
    
    // Test gcloud
    const { stdout: gcloudVersion } = await execAsync('gcloud --version');
    console.log('✅ gcloud is now available:');
    console.log(gcloudVersion);
    
    console.log('\n📋 To make this permanent:');
    console.log('1. Open System Properties (Win + Pause/Break)');
    console.log('2. Click "Environment Variables"');
    console.log('3. Under "System Variables", find "Path" and click "Edit"');
    console.log('4. Click "New" and add:');
    console.log(`   ${gcloudPath}`);
    console.log('5. Click "OK" on all dialogs');
    console.log('6. Restart your terminal');
    
  } catch (error) {
    console.error('❌ Failed to add gcloud to PATH:', error.message);
  }
}

// Run the setup
if (require.main === module) {
  addGCloudToPath();
}

module.exports = { addGCloudToPath };
