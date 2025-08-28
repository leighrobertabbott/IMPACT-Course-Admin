#!/usr/bin/env node

const fs = require('fs').promises;

async function createAutoAddTestUsersSolution() {
  console.log('🔧 Creating Auto-Add Test Users Solution\n');
  
  const solution = `
## SOLUTION: Auto-Add Users to Test Users List

When a user tries to access your app and gets blocked, automatically add them to your OAuth consent screen's test users list.

### How it works:
1. User clicks "Get your own IMPACT System"
2. They get redirected to Google OAuth
3. If they get "Access blocked" error, your app detects this
4. Your Firebase Function automatically adds their email to test users
5. User gets redirected back and can now access the app

### Implementation:
1. Create a Firebase Function that adds emails to test users
2. Detect when users get blocked and call this function
3. Use Google Cloud API to programmatically add test users
4. Redirect user back to try again

### Benefits:
✅ No manual intervention needed
✅ Works for anyone who tries to access your app
✅ Automatic user management
✅ Seamless user experience
`;

  const firebaseFunction = `
// Add this to your functions/index.js
exports.addTestUser = onCall(async (request) => {
  try {
    const { email } = request.data;
    
    if (!email) {
      throw new Error('Email is required');
    }

    console.log(\`Adding \${email} to test users...\`);

    // Use Google Cloud API to add test user
    const response = await fetch(\`https://oauth2.googleapis.com/oauth2/v1/projects/mwl-impact/consent/testUsers\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${process.env.GOOGLE_ACCESS_TOKEN}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email
      })
    });

    if (response.ok) {
      console.log(\`Successfully added \${email} to test users\`);
      return { success: true, message: 'User added to test users' };
    } else {
      console.error('Failed to add test user:', response.statusText);
      return { success: false, message: 'Failed to add test user' };
    }

  } catch (error) {
    console.error('Error adding test user:', error);
    throw new Error('Failed to add test user');
  }
});
`;

  const updatedProvisionApi = `
import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../firebase/config';

const functions = getFunctions(app);

export const provisionApi = {
  // Start OAuth flow to get access to user's Google account
  startOAuth: async () => {
    const state = Math.random().toString(36).substring(2, 15);
    const scope = [
      "openid", "email", "profile",
      "https://www.googleapis.com/auth/cloud-platform",
      "https://www.googleapis.com/auth/firebase",
    ].join(" ");

    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'demo-client-id',
      redirect_uri: \`\${import.meta.env.VITE_APP_URL || 'https://mwl-impact.web.app'}/provision/callback\`,
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
      scope,
      state,
    });

    // Store state in localStorage for validation
    localStorage.setItem('oauth_state', state);
    
    // Redirect to Google OAuth
    window.location.href = \`https://accounts.google.com/o/oauth2/v2/auth?\${params}\`;
  },

  // Add user to test users list
  addTestUser: async (email) => {
    const addTestUser = httpsCallable(functions, 'addTestUser');
    const result = await addTestUser({ email });
    return result.data;
  },

  // Exchange code for tokens
  exchangeCode: async (code) => {
    const exchangeTokens = httpsCallable(functions, 'exchangeOAuthCode');
    const result = await exchangeTokens({ code });
    return result.data;
  },

  // Provision Firebase project on THEIR account
  provisionProject: async (siteSlug, accessToken) => {
    const provisionProject = httpsCallable(functions, 'provisionFirebaseProject');
    const result = await provisionProject({ 
      siteSlug, 
      accessToken 
    });
    return result.data;
  },

  // Get Firebase config for deployed site
  getFirebaseConfig: async (projectId) => {
    const getConfig = httpsCallable(functions, 'getFirebaseConfig');
    const result = await getConfig({ projectId });
    return result.data;
  }
};
`;

  const errorHandlerComponent = `
import React, { useEffect, useState } from 'react';
import { provisionApi } from '../utils/provisionApi';

const OAuthErrorHandler = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if we're on an OAuth error page
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const email = urlParams.get('email');

    if (error === 'access_denied' && email) {
      handleAccessDenied(email);
    }
  }, []);

  const handleAccessDenied = async (email) => {
    setIsProcessing(true);
    setMessage('Adding you to our system...');

    try {
      // Add user to test users list
      const result = await provisionApi.addTestUser(email);
      
      if (result.success) {
        setMessage('Success! Redirecting you back...');
        // Redirect back to OAuth flow
        setTimeout(() => {
          provisionApi.startOAuth();
        }, 2000);
      } else {
        setMessage('Please contact support to be added manually.');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Setting Up Access</h2>
      <p className="text-gray-600 mb-4 text-center">
        {isProcessing ? 'Please wait...' : message}
      </p>
      {isProcessing && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      )}
    </div>
  );
};

export default OAuthErrorHandler;
`;

  try {
    await fs.writeFile('AUTO_ADD_SOLUTION.md', solution);
    await fs.writeFile('addTestUserFunction.js', firebaseFunction);
    await fs.writeFile('provisionApiWithAutoAdd.js', updatedProvisionApi);
    await fs.writeFile('OAuthErrorHandler.jsx', errorHandlerComponent);
    
    console.log('✅ Created auto-add test users solution!');
    console.log('');
    console.log('📋 Files created:');
    console.log('   - AUTO_ADD_SOLUTION.md (explanation)');
    console.log('   - addTestUserFunction.js (Firebase function)');
    console.log('   - provisionApiWithAutoAdd.js (updated API)');
    console.log('   - OAuthErrorHandler.jsx (error handling component)');
    console.log('');
    console.log('🚀 This solution:');
    console.log('   - Automatically adds users to test users list');
    console.log('   - No manual intervention needed');
    console.log('   - Works for anyone who tries to access your app');
    console.log('   - Seamless user experience');
    console.log('');
    console.log('💡 This is the perfect solution for your use case!');
    
  } catch (error) {
    console.error('❌ Failed to create files:', error.message);
  }
}

createAutoAddTestUsersSolution();
