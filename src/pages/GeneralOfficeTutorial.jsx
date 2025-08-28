import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Phone, 
  CreditCard, 
  UserCheck, 
  Mail, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Calendar,
  ArrowRight,
  Play,
  BookOpen,
  Shield
} from 'lucide-react';

const GeneralOfficeTutorial = () => {
  const navigate = useNavigate();

  const handleStartWork = () => {
    navigate('/general-office');
  };

  return (
    <div className="min-h-screen bg-nhs-light-grey py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-nhs-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="text-white" size={40} />
            </div>
            <h1 className="text-4xl font-bold text-nhs-dark-grey mb-4">
              General Office Admin Guide
            </h1>
            <p className="text-lg text-nhs-grey max-w-3xl mx-auto">
              Welcome to the IMPACT Course administration system. This guide will help you understand how to handle candidate payments and manage applications effectively.
            </p>
          </div>

          {/* Quick Start Section */}
          <div className="card mb-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-nhs-blue mb-4">Ready to Start?</h2>
              <button
                onClick={handleStartWork}
                className="btn-primary text-lg px-8 py-4 flex items-center space-x-2 mx-auto"
              >
                <Play size={24} />
                <span>Go to General Office Dashboard</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Payment Process */}
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-2xl font-semibold text-nhs-blue mb-6 flex items-center">
                  <Phone className="mr-3" size={28} />
                  Payment Process Guide
                </h2>
                
                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-nhs-blue text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-nhs-dark-grey mb-2">Candidate Calls for Payment</h3>
                      <p className="text-nhs-grey mb-3">
                        When a candidate calls <strong>0151 705 7428</strong> to make payment:
                      </p>
                      <ul className="list-disc list-inside text-sm text-nhs-grey space-y-1 ml-4">
                        <li>They should quote "IMPACT" when calling</li>
                        <li>Ask for their name and contact number</li>
                        <li>Confirm the course fee: <strong>£500</strong></li>
                        <li>Process payment via phone or direct visit</li>
                      </ul>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-nhs-blue text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-nhs-dark-grey mb-2">Provide Receipt Number</h3>
                      <p className="text-nhs-grey mb-3">
                        After successful payment:
                      </p>
                      <ul className="list-disc list-inside text-sm text-nhs-grey space-y-1 ml-4">
                        <li>Generate and provide a receipt number</li>
                        <li>Record the payment in your system</li>
                        <li>Note the candidate's name and contact details</li>
                        <li>Inform them they'll receive login credentials via email</li>
                      </ul>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-nhs-blue text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-nhs-dark-grey mb-2">Update System Status</h3>
                      <p className="text-nhs-grey mb-3">
                        Use the admin dashboard to:
                      </p>
                      <ul className="list-disc list-inside text-sm text-nhs-grey space-y-1 ml-4">
                        <li>Find the candidate in the system</li>
                        <li>Change their status from "Pending Payment" to "Paid"</li>
                        <li>Add the receipt number to their record</li>
                        <li>Activate their account (this sends welcome email)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="card border-l-4 border-nhs-orange">
                <h3 className="text-lg font-semibold text-nhs-orange mb-4 flex items-center">
                  <AlertCircle className="mr-2" size={20} />
                  Important Notes
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="text-nhs-green mt-0.5 flex-shrink-0" size={16} />
                    <p><strong>Course Fee:</strong> £500 for both days (food included)</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="text-nhs-green mt-0.5 flex-shrink-0" size={16} />
                    <p><strong>Payment Methods:</strong> Phone payment or direct visit to general office</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="text-nhs-green mt-0.5 flex-shrink-0" size={16} />
                    <p><strong>Internal Staff:</strong> Can pay directly at general office</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="text-nhs-green mt-0.5 flex-shrink-0" size={16} />
                    <p><strong>Contact:</strong> For issues, email impact@sthk.nhs.uk</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Dashboard Features */}
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-2xl font-semibold text-nhs-blue mb-6 flex items-center">
                  <Shield className="mr-3" size={28} />
                  Dashboard Features
                </h2>
                
                <div className="space-y-4">
                  {/* Candidate Management */}
                  <div className="border border-nhs-pale-grey rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-nhs-dark-grey mb-3 flex items-center">
                      <Users className="mr-2" size={20} />
                      Candidate Management
                    </h3>
                    <ul className="text-sm text-nhs-grey space-y-2">
                      <li>• View all candidate applications for selected course</li>
                      <li>• See candidate details (name, email, grade, status)</li>
                      <li>• Filter candidates by payment status</li>
                      <li>• View course information and venue details</li>
                    </ul>
                  </div>

                  {/* Payment Processing */}
                  <div className="border border-nhs-pale-grey rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-nhs-dark-grey mb-3 flex items-center">
                      <CreditCard className="mr-2" size={20} />
                      Payment Processing
                    </h3>
                    <ul className="text-sm text-nhs-grey space-y-2">
                      <li>• Mark candidates as "Paid in Full" after payment</li>
                      <li>• Add receipt numbers to candidate records</li>
                      <li>• Automatically activate candidate accounts (sends welcome email)</li>
                      <li>• Track payment status changes</li>
                    </ul>
                  </div>

                  {/* Notifications */}
                  <div className="border border-nhs-pale-grey rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-nhs-dark-grey mb-3 flex items-center">
                      <Mail className="mr-2" size={20} />
                      Notifications
                    </h3>
                    <ul className="text-sm text-nhs-grey space-y-2">
                      <li>• Receive notifications for new applications</li>
                      <li>• View unread notification count</li>
                      <li>• Mark individual notifications as read</li>
                      <li>• Mark all notifications as read at once</li>
                    </ul>
                  </div>

                  {/* Course Overview */}
                  <div className="border border-nhs-pale-grey rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-nhs-dark-grey mb-3 flex items-center">
                      <Calendar className="mr-2" size={20} />
                      Course Overview
                    </h3>
                    <ul className="text-sm text-nhs-grey space-y-2">
                      <li>• Select active courses from dropdown</li>
                      <li>• View course date, venue, and status</li>
                      <li>• See total candidates vs maximum capacity</li>
                      <li>• View payment status statistics</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Common Scenarios */}
              <div className="card">
                <h3 className="text-xl font-semibold text-nhs-blue mb-4">Common Scenarios</h3>
                <div className="space-y-4">
                  <div className="bg-nhs-pale-grey p-3 rounded-lg">
                    <h4 className="font-semibold text-nhs-dark-grey mb-2">Candidate calls to pay</h4>
                    <p className="text-sm text-nhs-grey">Process payment, provide receipt, update their status to "Paid" in the system</p>
                  </div>
                  <div className="bg-nhs-pale-grey p-3 rounded-lg">
                    <h4 className="font-semibold text-nhs-dark-grey mb-2">Candidate asks about course details</h4>
                    <p className="text-sm text-nhs-grey">Direct them to the course information or contact impact@sthk.nhs.uk</p>
                  </div>
                  <div className="bg-nhs-pale-grey p-3 rounded-lg">
                    <h4 className="font-semibold text-nhs-dark-grey mb-2">Payment issues or refunds</h4>
                    <p className="text-sm text-nhs-grey">Refer to refund policy and contact impact@sthk.nhs.uk for assistance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <div className="bg-nhs-blue/10 border border-nhs-blue/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-nhs-blue mb-3">Need Help?</h3>
              <p className="text-nhs-grey mb-4">
                If you encounter any issues or have questions about the system, please contact:
              </p>
              <div className="space-y-2">
                <p className="text-nhs-dark-grey">
                  <strong>Email:</strong> impact@sthk.nhs.uk
                </p>
                <p className="text-nhs-dark-grey">
                  <strong>Phone:</strong> 0151 705 7428
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralOfficeTutorial;
