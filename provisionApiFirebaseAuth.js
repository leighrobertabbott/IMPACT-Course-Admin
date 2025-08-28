
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
