import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { CheckCircle, AlertCircle, Loader2, Building2, User, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const Setup = () => {
  const [isConfigured, setIsConfigured] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    hospitalName: '',
    contactEmail: '',
    adminEmail: '',
    adminPassword: '',
    adminName: ''
  });

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      // Try to load Firebase config from the deployed config file
      const response = await fetch('/web-config/firebaseConfig.json');
      if (!response.ok) {
        throw new Error('Firebase config not found');
      }
      
      const firebaseConfig = await response.json();
      
      // Initialize Firebase with the deployed config
      const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
      const db = getFirestore(app);
      
      // Check if already configured
      const configDoc = await getDoc(doc(db, 'meta', 'boot'));
      setIsConfigured(configDoc.exists());
      
    } catch (error) {
      console.error('Setup check error:', error);
      setIsConfigured(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Load Firebase config
      const response = await fetch('/web-config/firebaseConfig.json');
      const firebaseConfig = await response.json();
      
      const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
      const db = getFirestore(app);
      const auth = getAuth(app);

      // Validate form
      if (!form.hospitalName || !form.contactEmail || !form.adminEmail || !form.adminPassword || !form.adminName) {
        throw new Error('Please fill in all fields');
      }

      if (form.adminPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Create admin user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.adminEmail,
        form.adminPassword
      );

      // Create hospital document
      await setDoc(doc(db, 'hospital', 'default'), {
        name: form.hospitalName,
        contactEmail: form.contactEmail,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Create admin user profile
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: form.adminEmail,
        name: form.adminName,
        role: 'admin',
        hospitalId: 'default',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Mark as configured
      await setDoc(doc(db, 'meta', 'boot'), {
        configured: true,
        configuredAt: new Date(),
        configuredBy: form.adminEmail,
        hospitalName: form.hospitalName
      });

      toast.success('Setup completed successfully!');
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);

    } catch (error) {
      console.error('Setup error:', error);
      toast.error(error.message || 'Failed to complete setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isConfigured === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nhs-blue/5 via-white to-nhs-green/5 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <Loader2 className="animate-spin text-nhs-blue mx-auto mb-4" size={48} />
          <h1 className="text-xl font-semibold text-nhs-dark-grey mb-2">
            Checking configuration...
          </h1>
          <p className="text-nhs-grey">
            Please wait while we verify your setup.
          </p>
        </div>
      </div>
    );
  }

  if (isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nhs-blue/5 via-white to-nhs-green/5 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <CheckCircle className="text-nhs-green mx-auto mb-4" size={48} />
          <h1 className="text-xl font-semibold text-nhs-dark-grey mb-2">
            Already configured
          </h1>
          <p className="text-nhs-grey mb-6">
            This IMPACT site has already been set up. You can access the dashboard.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-nhs-blue/5 via-white to-nhs-green/5 flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-nhs-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-nhs-dark-grey mb-2">
              Set up your IMPACT site
            </h1>
            <p className="text-nhs-grey">
              Configure your hospital details and create your admin account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="hospitalName" className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  <Building2 className="inline mr-2" size={16} />
                  Hospital/Trust Name
                </label>
                <input
                  id="hospitalName"
                  type="text"
                  value={form.hospitalName}
                  onChange={(e) => setForm({ ...form, hospitalName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nhs-blue focus:border-transparent"
                  placeholder="Whiston Hospital"
                  required
                />
              </div>

              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Contact Email
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nhs-blue focus:border-transparent"
                  placeholder="impact@hospital.nhs.uk"
                  required
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-nhs-dark-grey mb-4">
                Admin Account
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="adminName" className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    <User className="inline mr-2" size={16} />
                    Admin Name
                  </label>
                  <input
                    id="adminName"
                    type="text"
                    value={form.adminName}
                    onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nhs-blue focus:border-transparent"
                    placeholder="John Smith"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="adminEmail" className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    Admin Email (Login)
                  </label>
                  <input
                    id="adminEmail"
                    type="email"
                    value={form.adminEmail}
                    onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nhs-blue focus:border-transparent"
                    placeholder="admin@hospital.nhs.uk"
                    required
                  />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="adminPassword" className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Admin Password
                </label>
                <input
                  id="adminPassword"
                  type="password"
                  value={form.adminPassword}
                  onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nhs-blue focus:border-transparent"
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required
                />
                <p className="text-sm text-nhs-grey mt-1">
                  Choose a strong password (minimum 8 characters)
                </p>
              </div>
            </div>

            <div className="bg-nhs-pale-grey rounded-lg p-4">
              <h4 className="font-semibold text-nhs-dark-grey mb-2">What you'll be able to do:</h4>
              <ul className="text-sm text-nhs-grey space-y-1">
                <li className="flex items-center">
                  <CheckCircle className="text-nhs-green mr-2" size={16} />
                  Create and manage IMPACT courses
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-nhs-green mr-2" size={16} />
                  Add faculty members and staff
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-nhs-green mr-2" size={16} />
                  Manage candidate applications
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-nhs-green mr-2" size={16} />
                  Generate course prospectuses
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-nhs-green mr-2" size={16} />
                  Track assessments and results
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Setting up your site...
                </>
              ) : (
                'Complete Setup'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Setup;
