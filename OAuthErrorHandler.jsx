
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
