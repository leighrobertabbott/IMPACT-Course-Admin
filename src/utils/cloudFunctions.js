import { httpsCallable } from 'firebase/functions';
import { functions, auth } from '../firebase/config';
import toast from 'react-hot-toast';

// Cloud Function wrappers with error handling
export const cloudFunctions = {
  // Candidate activation
  activateCandidate: async (candidateId) => {
    try {
      const activateCandidateFunction = httpsCallable(functions, 'activateCandidate');
      const result = await activateCandidateFunction({ candidateId });
      return result.data;
    } catch (error) {
      console.error('Error activating candidate:', error);
      toast.error('Failed to activate candidate');
      throw error;
    }
  },

  // Send bulk emails
  sendBulkEmails: async (emailType, candidateIds) => {
    try {
      const sendBulkEmailsFunction = httpsCallable(functions, 'sendBulkEmails');
      const result = await sendBulkEmailsFunction({ emailType, candidateIds });
      return result.data;
    } catch (error) {
      console.error('Error sending bulk emails:', error);
      toast.error('Failed to send emails');
      throw error;
    }
  },

  // Export candidate data
  exportCandidateData: async (status = 'all', format = 'json') => {
    try {
      const exportDataFunction = httpsCallable(functions, 'exportCandidateData');
      const result = await exportDataFunction({ status, format });
      return result.data;
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
      throw error;
    }
  },

  // Update course settings
  updateCourseSettings: async (courseId, settings) => {
    try {
      const updateSettingsFunction = httpsCallable(functions, 'updateCourseSettings');
      const result = await updateSettingsFunction({ courseId, settings });
      return result.data;
    } catch (error) {
      console.error('Error updating course settings:', error);
      toast.error('Failed to update course settings');
      throw error;
    }
  },

  // Handle unsuccessful candidates
  handleUnsuccessfulCandidate: async (candidateId, reason, notifySupervisor) => {
    try {
      const handleUnsuccessfulFunction = httpsCallable(functions, 'handleUnsuccessfulCandidate');
      const result = await handleUnsuccessfulFunction({ candidateId, reason, notifySupervisor });
      return result.data;
    } catch (error) {
      console.error('Error handling unsuccessful candidate:', error);
      toast.error('Failed to process unsuccessful candidate');
      throw error;
    }
  },

  // Generate certificates
  generateCertificates: async (courseId) => {
    try {
      const generateCertificatesFunction = httpsCallable(functions, 'generateCertificates');
      const result = await generateCertificatesFunction({ courseId });
      return result.data;
    } catch (error) {
      console.error('Error generating certificates:', error);
      toast.error('Failed to generate certificates');
      throw error;
    }
  },

  // Update email templates
  updateEmailTemplate: async (templateId, template) => {
    try {
      const updateTemplateFunction = httpsCallable(functions, 'updateEmailTemplate');
      const result = await updateTemplateFunction({ templateId, template });
      return result.data;
    } catch (error) {
      console.error('Error updating email template:', error);
      toast.error('Failed to update email template');
      throw error;
    }
  },

  // Get email templates
  getEmailTemplates: async () => {
    try {
      const getTemplatesFunction = httpsCallable(functions, 'getEmailTemplates');
      const result = await getTemplatesFunction();
      return result.data;
    } catch (error) {
      console.error('Error getting email templates:', error);
      toast.error('Failed to get email templates');
      throw error;
    }
  },

  // Initialize email templates
  initializeEmailTemplates: async () => {
    try {
      const initializeTemplatesFunction = httpsCallable(functions, 'initializeEmailTemplates');
      const result = await initializeTemplatesFunction();
      return result.data;
    } catch (error) {
      console.error('Error initializing email templates:', error);
      toast.error('Failed to initialize email templates');
      throw error;
    }
  },

  // Send faculty login credentials
  sendFacultyCredentials: async (facultyData) => {
    try {
      const sendFacultyCredentialsFunction = httpsCallable(functions, 'sendFacultyCredentials');
      const result = await sendFacultyCredentialsFunction(facultyData);
      return result.data;
    } catch (error) {
      console.error('Error sending faculty credentials:', error);
      toast.error('Failed to send faculty credentials');
      throw error;
    }
  },

  // Purge all candidates and candidate user accounts (DEBUG ONLY)
  purgeAllCandidates: async () => {
    try {
      const purgeFunction = httpsCallable(functions, 'purgeAllCandidates');
      const result = await purgeFunction({});
      return result.data;
    } catch (error) {
      console.error('Error purging candidates:', error);
      toast.error('Failed to purge candidates');
      throw error;
    }
  },

  // Check course capacity
  checkCourseCapacity: async (data) => {
    try {
      const checkCapacityFunction = httpsCallable(functions, 'checkCourseCapacity');
      const result = await checkCapacityFunction(data);
      return result.data;
    } catch (error) {
      console.error('Error checking course capacity:', error);
      toast.error('Failed to check course capacity');
      throw error;
    }
  },

  // Cleanup deleted programme subjects
  cleanupDeletedSubjects: async (retentionDays = 30) => {
    try {
      const cleanupFunction = httpsCallable(functions, 'cleanupDeletedSubjects');
      const result = await cleanupFunction({ retentionDays });
      return result.data;
    } catch (error) {
      console.error('Error cleaning up deleted subjects:', error);
      toast.error('Failed to cleanup deleted subjects');
      throw error;
    }
  },

  // Create faculty account using Admin SDK
  createFacultyAccount: async (facultyData) => {
    try {
      const createFacultyAccountFunction = httpsCallable(functions, 'createFacultyAccount');
      const result = await createFacultyAccountFunction(facultyData);
      return result.data;
    } catch (error) {
      console.error('Error creating faculty account:', error);
      toast.error('Failed to create faculty account');
      throw error;
    }
  },

  // Purge all faculty accounts (DEBUG ONLY)
  purgeAllFaculty: async () => {
    try {
      const purgeAllFacultyFunction = httpsCallable(functions, 'purgeAllFaculty');
      const result = await purgeAllFacultyFunction();
      return result.data;
    } catch (error) {
      console.error('Error purging faculty accounts:', error);
      toast.error('Failed to purge faculty accounts');
      throw error;
    }
  }
};

// Helper function to download CSV data
export const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper function to download JSON data
export const downloadJSON = (jsonData, filename) => {
  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
