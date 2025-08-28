import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { provisionApi } from '../utils/provisionApi';
import { Building2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ProvisionConfirm = () => {
  const navigate = useNavigate();
  const [siteSlug, setSiteSlug] = useState('');
  const [isProvisioning, setIsProvisioning] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate slug format
    const slugRegex = /^[a-z0-9-]{3,40}$/;
    if (!slugRegex.test(siteSlug)) {
      toast.error('Site name must be 3-40 characters, lowercase letters, numbers, and hyphens only');
      return;
    }

    setIsProvisioning(true);

    try {
      const accessToken = sessionStorage.getItem('provision_access_token');
      if (!accessToken) {
        throw new Error('No access token found. Please start over.');
      }

      const result = await provisionApi.provisionProject(siteSlug, accessToken);
      
      // Clear the access token
      sessionStorage.removeItem('provision_access_token');
      
      // Redirect to success page
      navigate(`/provision/done?url=${encodeURIComponent(result.url)}&projectId=${result.projectId}`);
      
    } catch (error) {
      console.error('Provisioning error:', error);
      toast.error(error.message || 'Failed to create your site. Please try again.');
      setIsProvisioning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nhs-blue/5 via-white to-nhs-green/5 flex items-center justify-center">
      <div className="max-w-md mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-nhs-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-nhs-dark-grey mb-2">
              Create your IMPACT site
            </h1>
            <p className="text-nhs-grey">
              Choose a short name for your site (letters, numbers, hyphens only)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="siteSlug" className="block text-sm font-medium text-nhs-dark-grey mb-2">
                Site Name
              </label>
              <input
                id="siteSlug"
                type="text"
                value={siteSlug}
                onChange={(e) => setSiteSlug(e.target.value.toLowerCase())}
                placeholder="your-hospital-impact"
                pattern="[a-z0-9-]{3,40}"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nhs-blue focus:border-transparent"
                disabled={isProvisioning}
                required
              />
              <p className="text-sm text-nhs-grey mt-1">
                Example: whiston-impact, liverpool-nhs, manchester-trust
              </p>
            </div>

            <div className="bg-nhs-pale-grey rounded-lg p-4">
              <h3 className="font-semibold text-nhs-dark-grey mb-2">What we'll create on YOUR Google account:</h3>
              <ul className="text-sm text-nhs-grey space-y-1">
                <li className="flex items-center">
                  <CheckCircle className="text-nhs-green mr-2" size={16} />
                  Firebase project with your site name
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-nhs-green mr-2" size={16} />
                  Firestore database for your data
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-nhs-green mr-2" size={16} />
                  Authentication system
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-nhs-green mr-2" size={16} />
                  Hosting for your website
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-nhs-green mr-2" size={16} />
                  Deploy your IMPACT system
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isProvisioning}
              className="w-full btn-primary flex items-center justify-center"
            >
              {isProvisioning ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Creating your site...
                </>
              ) : (
                'Create my site'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-nhs-blue hover:text-nhs-dark-blue text-sm"
              disabled={isProvisioning}
            >
              Cancel and go back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProvisionConfirm;
