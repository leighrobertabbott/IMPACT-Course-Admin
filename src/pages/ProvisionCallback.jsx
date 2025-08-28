import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { provisionApi } from '../utils/provisionApi';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const ProvisionCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        
                 // Check for OAuth errors
         if (error) {
           if (error === 'access_denied') {
             // Redirect to error handler for automatic user addition
             const emailFromUrl = searchParams.get('email');
             const emailFromStorage = localStorage.getItem('provision_email');
             const email = emailFromUrl || emailFromStorage || 'unknown@example.com';
             navigate(`/provision/error?error=${error}&email=${email}`);
             return;
           } else {
             setStatus('error');
             setError('Authorization was denied. Please try again.');
             return;
           }
         }

        // Validate state parameter
        const storedState = localStorage.getItem('oauth_state');
        if (!state || !storedState || state !== storedState) {
          setStatus('error');
          setError('Invalid authorization state. Please try again.');
          return;
        }

        // Clear stored state
        localStorage.removeItem('oauth_state');

        if (!code) {
          setStatus('error');
          setError('No authorization code received. Please try again.');
          return;
        }

        // Exchange code for tokens
        setStatus('exchanging');
        const tokens = await provisionApi.exchangeCode(code);
        
        // Store access token temporarily
        sessionStorage.setItem('provision_access_token', tokens.access_token);
        
        // Redirect to confirmation page
        navigate('/provision/confirm');
        
      } catch (err) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setError('Failed to complete authorization. Please try again.');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nhs-blue/5 via-white to-nhs-green/5 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <Loader2 className="animate-spin text-nhs-blue mx-auto mb-4" size={48} />
          <h1 className="text-xl font-semibold text-nhs-dark-grey mb-2">
            Processing authorization...
          </h1>
          <p className="text-nhs-grey">
            Please wait while we complete the setup.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'exchanging') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nhs-blue/5 via-white to-nhs-green/5 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <Loader2 className="animate-spin text-nhs-blue mx-auto mb-4" size={48} />
          <h1 className="text-xl font-semibold text-nhs-dark-grey mb-2">
            Setting up your account...
          </h1>
          <p className="text-nhs-grey">
            We're configuring your Google Cloud access.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nhs-blue/5 via-white to-nhs-green/5 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <AlertCircle className="text-nhs-red mx-auto mb-4" size={48} />
          <h1 className="text-xl font-semibold text-nhs-dark-grey mb-2">
            Setup failed
          </h1>
          <p className="text-nhs-grey mb-6">
            {error}
          </p>
          <button
            onClick={() => navigate('/provision/start')}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default ProvisionCallback;
