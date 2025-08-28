
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
