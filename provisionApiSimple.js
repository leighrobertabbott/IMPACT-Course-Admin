
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
