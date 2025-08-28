import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, ExternalLink, Settings, Users } from 'lucide-react';

const ProvisionDone = () => {
  const [searchParams] = useSearchParams();
  const url = searchParams.get('url');
  const projectId = searchParams.get('projectId');

  const handleOpenSite = () => {
    window.open(url, '_blank');
  };

  const handleSetupAdmin = () => {
    window.open(`${url}/setup`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nhs-blue/5 via-white to-nhs-green/5 flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-nhs-green rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-nhs-dark-grey mb-4">
              Your IMPACT site is ready! 🎉
            </h1>
            <p className="text-lg text-nhs-grey">
              Your site has been created and deployed successfully.
            </p>
          </div>

          <div className="bg-nhs-pale-grey rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-nhs-dark-grey mb-4">
              Your live site
            </h2>
            <div className="flex items-center justify-between bg-white rounded-lg p-4 border">
              <div className="flex items-center space-x-3">
                <ExternalLink className="text-nhs-blue" size={20} />
                <span className="font-mono text-nhs-dark-grey">{url}</span>
              </div>
              <button
                onClick={handleOpenSite}
                className="btn-primary flex items-center space-x-2"
              >
                <span>Open Site</span>
                <ExternalLink size={16} />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Settings className="text-nhs-blue" size={24} />
                <h3 className="text-lg font-semibold text-nhs-dark-grey">
                  Complete Setup
                </h3>
              </div>
              <p className="text-nhs-grey mb-4">
                Set up your admin account and configure your hospital details.
              </p>
              <button
                onClick={handleSetupAdmin}
                className="btn-outline w-full"
              >
                Go to Setup
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="text-nhs-blue" size={24} />
                <h3 className="text-lg font-semibold text-nhs-dark-grey">
                  Invite Team
                </h3>
              </div>
              <p className="text-nhs-grey mb-4">
                Add faculty members and staff to your IMPACT system.
              </p>
              <button
                onClick={handleOpenSite}
                className="btn-outline w-full"
              >
                Manage Users
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-nhs-dark-grey mb-3">
              What's next?
            </h3>
            <ol className="text-nhs-grey space-y-2">
              <li className="flex items-start space-x-3">
                <span className="bg-nhs-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">1</span>
                <span>Complete the admin setup to create your first user account</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="bg-nhs-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">2</span>
                <span>Add your hospital details and contact information</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="bg-nhs-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">3</span>
                <span>Create your first IMPACT course and add faculty members</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="bg-nhs-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">4</span>
                <span>Start accepting candidate applications</span>
              </li>
            </ol>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-nhs-grey mb-4">
              Need help? Contact us at{' '}
              <a href="mailto:support@impact-course.com" className="text-nhs-blue hover:underline">
                support@impact-course.com
              </a>
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="text-nhs-blue hover:text-nhs-dark-blue font-medium"
            >
              ← Back to main site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProvisionDone;
