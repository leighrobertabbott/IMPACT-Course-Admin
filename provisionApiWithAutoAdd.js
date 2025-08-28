
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
      redirect_uri: `${import.meta.env.VITE_APP_URL || 'https://mwl-impact.web.app'}/provision/callback`,
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
      scope,
      state,
    });

    // Store state in localStorage for validation
    localStorage.setItem('oauth_state', state);
    
    // Redirect to Google OAuth
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
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
