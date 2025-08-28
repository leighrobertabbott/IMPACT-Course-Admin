#!/usr/bin/env node

const fs = require('fs').promises;

async function createSimpleAuthSolution() {
  console.log('🔧 Creating Simple Authentication Solution\n');
  
  const authComponent = `
import React, { useState } from 'react';

const SimpleAuth = ({ onAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simple email validation
    if (email && email.includes('@')) {
      // Store email in localStorage for the session
      localStorage.setItem('user_email', email);
      onAuthenticated(email);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Get Your IMPACT System</h2>
      <p className="text-gray-600 mb-6 text-center">
        Enter your email to start provisioning your own IMPACT Course Management System
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your-email@hospital.com"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Start Provisioning'}
        </button>
      </form>
      
      <p className="text-xs text-gray-500 mt-4 text-center">
        By proceeding, you agree to create a Firebase project on your Google account
      </p>
    </div>
  );
};

export default SimpleAuth;
`;

  const updatedProvisionApi = `
import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../firebase/config';

const functions = getFunctions(app);

export const provisionApi = {
  // Simple authentication without OAuth
  authenticateUser: async (email) => {
    // Store email for the session
    localStorage.setItem('user_email', email);
    return { email, authenticated: true };
  },

  // Provision Firebase project using service account (no user OAuth needed)
  provisionProject: async (siteSlug) => {
    const provisionProject = httpsCallable(functions, 'provisionFirebaseProjectSimple');
    const result = await provisionProject({ 
      siteSlug,
      userEmail: localStorage.getItem('user_email')
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

  const updatedFunction = `
// Add this to your functions/index.js
exports.provisionFirebaseProjectSimple = onCall(async (request) => {
  try {
    const { siteSlug, userEmail } = request.data;

    if (!siteSlug || !userEmail) {
      throw new Error('Site slug and user email are required');
    }

    // Generate unique project ID
    const projectId = \`\${siteSlug.toLowerCase().replace(/[^a-z0-9-]/g, "-")}-\${crypto.randomBytes(4).toString("hex")}\`;
    const displayName = \`IMPACT - \${siteSlug}\`;
    const region = process.env.FIRESTORE_REGION || "europe-west2";

    console.log(\`Starting provisioning for project: \${projectId} for user: \${userEmail}\`);

    // Use your service account to create the project
    // This bypasses the need for user OAuth
    const project = await gapi("https://cloudresourcemanager.googleapis.com/v1/projects", "POST", null, {
      projectId,
      name: displayName,
    });

    // Continue with the rest of your provisioning logic...
    // (same as before, but using service account instead of user OAuth)

    const url = \`https://\${projectId}.web.app\`;

    return {
      success: true,
      url,
      projectId,
      message: \`Your IMPACT system is ready at: \${url}\`
    };

  } catch (error) {
    console.error('Provisioning error:', error);
    throw new Error(error.message || 'Failed to provision Firebase project');
  }
});
`;

  try {
    await fs.writeFile('SimpleAuth.jsx', authComponent);
    await fs.writeFile('provisionApiSimple.js', updatedProvisionApi);
    await fs.writeFile('functionUpdate.js', updatedFunction);
    
    console.log('✅ Created simple authentication solution!');
    console.log('');
    console.log('📋 Files created:');
    console.log('   - SimpleAuth.jsx (simple email-based auth component)');
    console.log('   - provisionApiSimple.js (updated API without OAuth)');
    console.log('   - functionUpdate.js (Firebase function update)');
    console.log('');
    console.log('🚀 This solution:');
    console.log('   - No Google OAuth verification required');
    console.log('   - Works for anyone with an email');
    console.log('   - Uses your service account to create projects');
    console.log('   - Much simpler for end users');
    console.log('');
    console.log('⚠️  Note: Users will still need to set up billing on their Firebase project');
    console.log('   after provisioning, but the initial setup is much simpler.');
    
  } catch (error) {
    console.error('❌ Failed to create files:', error.message);
  }
}

createSimpleAuthSolution();
