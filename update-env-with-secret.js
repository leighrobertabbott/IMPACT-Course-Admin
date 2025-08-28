#!/usr/bin/env node

const fs = require('fs').promises;

async function updateEnvironmentFileWithSecret() {
  try {
    // Read the current .env.local file
    const currentEnv = await fs.readFile('.env.local', 'utf8');
    
    // Replace the placeholder with the actual client secret
    const updatedEnv = currentEnv.replace(
      'YOUR_OAUTH_CLIENT_SECRET_HERE',
      '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'
    );
    
    // Write the updated content back
    await fs.writeFile('.env.local', updatedEnv);
    
    console.log('✅ Environment file updated with your OAuth Client Secret!');
    console.log('🚀 Your provisioning system is now ready!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Deploy your Firebase Functions: firebase deploy --only functions');
    console.log('2. Deploy your main app: firebase deploy --only hosting');
    console.log('3. Test the "Get your own IMPACT Management System" button on your landing page');
    
  } catch (error) {
    console.error('❌ Failed to update environment file:', error.message);
  }
}

updateEnvironmentFileWithSecret();
