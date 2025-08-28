#!/usr/bin/env node

const fs = require('fs').promises;

async function createAlternativeSolution() {
  console.log('🔧 Creating Alternative Solution - No OAuth Required\n');
  
  const solution = `
## ALTERNATIVE SOLUTION: Use Firebase's Built-in Auth

Instead of Google OAuth (which requires verification), use Firebase's built-in authentication:

### How it works:
1. User clicks "Get your own IMPACT System"
2. They enter their email and create a password
3. Firebase creates their account automatically
4. Your system provisions their Firebase project
5. They get their own isolated instance

### Benefits:
✅ No Google OAuth verification required
✅ Works for anyone, anywhere
✅ No test users needed
✅ Truly public access
✅ Simple email/password registration

### Implementation:
1. Replace OAuth flow with Firebase Auth
2. Use Firebase's built-in user management
3. Provision projects using your service account
4. Each user gets their own Firebase project

### User Experience:
- Click "Get Started"
- Enter email and password
- Click "Create Account"
- System automatically provisions their instance
- They get their own URL immediately

This approach uses Firebase's own authentication system, which doesn't have the same verification requirements as Google OAuth.
`;

  const firebaseAuthComponent = `
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { provisionApi } from '../utils/provisionApi';

const FirebaseAuthSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [siteSlug, setSiteSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create Firebase user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Provision their Firebase project
      const result = await provisionApi.provisionProject(siteSlug, userCredential.user.uid);
      
      setSuccess(\`Your IMPACT system is ready at: \${result.url}\`);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Get Your IMPACT System</h2>
      
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hospital Name (for URL)
          </label>
          <input
            type="text"
            value={siteSlug}
            onChange={(e) => setSiteSlug(e.target.value)}
            placeholder="st-marys-hospital"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Creating Your System...' : 'Create My IMPACT System'}
        </button>
      </form>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
    </div>
  );
};

export default FirebaseAuthSignup;
`;

  const updatedProvisionApi = `
import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../firebase/config';

const functions = getFunctions(app);

export const provisionApi = {
  // Provision Firebase project using Firebase Auth user ID
  provisionProject: async (siteSlug, userId) => {
    const provisionProject = httpsCallable(functions, 'provisionFirebaseProjectForUser');
    const result = await provisionProject({ 
      siteSlug, 
      userId 
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

  try {
    await fs.writeFile('ALTERNATIVE_SOLUTION.md', solution);
    await fs.writeFile('FirebaseAuthSignup.jsx', firebaseAuthComponent);
    await fs.writeFile('provisionApiFirebaseAuth.js', updatedProvisionApi);
    
    console.log('✅ Created alternative solution!');
    console.log('');
    console.log('📋 Files created:');
    console.log('   - ALTERNATIVE_SOLUTION.md (explanation)');
    console.log('   - FirebaseAuthSignup.jsx (Firebase Auth component)');
    console.log('   - provisionApiFirebaseAuth.js (updated API)');
    console.log('');
    console.log('🚀 This solution:');
    console.log('   - Uses Firebase\'s built-in authentication');
    console.log('   - No Google OAuth verification required');
    console.log('   - Works for anyone, anywhere');
    console.log('   - Truly public access');
    console.log('   - Simple email/password registration');
    console.log('');
    console.log('💡 This is the way to make it truly public without Google verification!');
    
  } catch (error) {
    console.error('❌ Failed to create files:', error.message);
  }
}

createAlternativeSolution();
