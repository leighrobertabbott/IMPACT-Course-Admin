import React, { useState } from 'react';
import { provisionApi } from '../utils/provisionApi';
import { ArrowRight, Building2, Shield, Zap } from 'lucide-react';

const ProvisionStart = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStartOAuth = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Store email for potential error handling
      localStorage.setItem('provision_email', email);
      
      // Proactively add user to test users list
      console.log('Adding user to test users list...');
      try {
        const result = await provisionApi.addTestUser(email);
        console.log('User added to test users successfully:', result);
      } catch (addUserError) {
        console.error('Failed to add user to test users:', addUserError);
        // Continue anyway - user might already be added
      }
      
      // Start OAuth flow
      await provisionApi.startOAuth();
    } catch (err) {
      console.error('OAuth start error:', err);
      setError('Failed to start authorization process. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nhs-blue/5 via-white to-nhs-green/5 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-nhs-dark-grey mb-6">
          Get Your Own IMPACT System
        </h1>
        
        <p className="text-nhs-grey mb-8">
          Enter your email address to start provisioning your own IMPACT Course Management System.
        </p>

        <form onSubmit={handleStartOAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-nhs-dark-grey mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nhs-blue focus:border-transparent"
              placeholder="your-email@hospital.com"
              required
            />
          </div>

          {error && (
            <div className="text-nhs-red text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-nhs-blue text-white py-3 px-6 rounded-md hover:bg-nhs-dark-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Setting up access...' : 'Get Started'}
          </button>
        </form>

        <p className="text-xs text-nhs-grey mt-6">
          By proceeding, you agree to create a Firebase project on your Google account.
        </p>
      </div>
    </div>
  );
};

export default ProvisionStart;
