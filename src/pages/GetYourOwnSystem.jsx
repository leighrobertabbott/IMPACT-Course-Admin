import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight,
  Mail,
  Phone,
  CheckCircle,
  Star,
  Building2,
  Users,
  Award,
  Shield,
  Clock
} from 'lucide-react';

const GetYourOwnSystem = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-nhs-blue/5 via-white to-nhs-green/5">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-nhs-blue to-nhs-dark-blue text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                Get Your Own IMPACT System
              </h1>
              <p className="text-xl md:text-2xl font-light">
                Run IMPACT courses at your hospital with your own management system
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
                <div className="flex items-center space-x-2">
                  <Building2 size={24} />
                  <span className="text-lg">Your Hospital</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users size={24} />
                  <span className="text-lg">Complete Management System</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/" 
                className="bg-white text-nhs-blue px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Back to Home</span>
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Setup Options Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-nhs-dark-grey mb-4">
                Choose Your Setup Option
              </h2>
              <p className="text-lg text-nhs-grey">
                Select the option that works best for your hospital and technical comfort level
              </p>
            </div>

            {/* Option 1: We'll Set It Up For You */}
            <div className="bg-gradient-to-r from-nhs-green/10 to-nhs-blue/10 rounded-lg p-8 mb-8 border-2 border-nhs-green/20">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-nhs-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-nhs-dark-grey mb-2">We'll Set It Up For You</h3>
                <p className="text-nhs-grey text-lg">Recommended for non-technical users</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h4 className="text-xl font-semibold text-nhs-dark-grey mb-4">How It Works</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-nhs-green rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">1</span>
                      </div>
                      <span className="text-nhs-grey">Email us at setup@impact-course.com</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-nhs-green rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">2</span>
                      </div>
                      <span className="text-nhs-grey">Tell us your hospital name and contact details</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-nhs-green rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">3</span>
                      </div>
                      <span className="text-nhs-grey">We'll create your IMPACT system and send you login details</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-nhs-green rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">4</span>
                      </div>
                      <span className="text-nhs-grey">You'll get a live website like: https://your-hospital-impact.web.app</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <h4 className="text-xl font-semibold text-nhs-dark-grey mb-4">What We Do For You</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="text-nhs-green" size={20} />
                      <span className="text-nhs-grey">Create your Firebase project with your hospital name</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="text-nhs-green" size={20} />
                      <span className="text-nhs-grey">Set up your database for course data</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="text-nhs-green" size={20} />
                      <span className="text-nhs-grey">Deploy your website with all features</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="text-nhs-green" size={20} />
                      <span className="text-nhs-grey">Create your admin account ready to use</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="text-nhs-green" size={20} />
                      <span className="text-nhs-grey">Send you login details and instructions</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <a 
                        href="mailto:setup@impact-course.com?subject=IMPACT System Setup Request&body=Hi,%0D%0A%0D%0AI would like to set up an IMPACT Course Management System for our hospital.%0D%0A%0D%0AHospital Name:%0D%0AContact Name:%0D%0AEmail:%0D%0APhone:%0D%0A%0D%0AThank you!"
                        className="bg-nhs-green hover:bg-nhs-dark-green text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl mx-auto"
                      >
                        <Mail size={20} />
                        <span>Email Us to Get Started</span>
                      </a>
                      <p className="text-nhs-grey text-sm mt-2">Free setup service • No technical knowledge required</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

                         {/* Technical Options */}
             <div className="text-center mb-8">
               <h3 className="text-2xl font-bold text-nhs-dark-grey mb-4">Technical Deployment Options</h3>
               <p className="text-nhs-grey">For users comfortable with web platforms and development tools</p>
             </div>
             
             {/* Vercel Setup Instructions */}
             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
               <h4 className="font-semibold text-yellow-800 mb-2">Vercel Setup Instructions:</h4>
               <ol className="text-yellow-700 text-sm space-y-1">
                 <li>1. Click "Deploy to Vercel" below</li>
                 <li>2. Choose your Git provider (GitHub, GitLab, Bitbucket)</li>
                 <li>3. Import the repository: <code className="bg-yellow-100 px-1 rounded">leighrobertabbott/IMPACT-Course-Admin</code></li>
                 <li>4. Configure your project settings</li>
                 <li>5. Deploy!</li>
               </ol>
             </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Render Option */}
              <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">R</span>
                  </div>
                  <h4 className="text-lg font-semibold text-nhs-dark-grey">Render Deployment</h4>
                  <p className="text-nhs-grey text-sm">Best for users comfortable with web platforms</p>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="text-nhs-green" size={16} />
                    <span className="text-nhs-grey text-sm">Web wizard interface</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="text-nhs-green" size={16} />
                    <span className="text-nhs-grey text-sm">Free hosting included</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="text-nhs-green" size={16} />
                    <span className="text-nhs-grey text-sm">Automatic HTTPS</span>
                  </div>
                </div>
                <a 
                  href="https://render.com/deploy?repo=https://github.com/leighrobertabbott/IMPACT-Course-Admin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Deploy to Render</span>
                  <ArrowRight size={16} />
                </a>
              </div>

              {/* Vercel Option */}
              <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">V</span>
                  </div>
                  <h4 className="text-lg font-semibold text-nhs-dark-grey">Vercel Deployment</h4>
                                     <p className="text-nhs-grey text-sm">Best for users familiar with development platforms</p>
                 </div>
                 <div className="space-y-3 mb-6">
                   <div className="flex items-center space-x-2">
                     <CheckCircle className="text-nhs-green" size={16} />
                     <span className="text-nhs-grey text-sm">Vercel platform</span>
                   </div>
                   <div className="flex items-center space-x-2">
                     <CheckCircle className="text-nhs-green" size={16} />
                     <span className="text-nhs-grey text-sm">Fast deployment</span>
                   </div>
                   <div className="flex items-center space-x-2">
                     <CheckCircle className="text-nhs-green" size={16} />
                     <span className="text-nhs-grey text-sm">Global CDN</span>
                   </div>
                   <div className="flex items-center space-x-2">
                     <Shield className="text-nhs-orange" size={16} />
                     <span className="text-nhs-grey text-sm">Requires Git repository</span>
                   </div>
                 </div>
                                 <a 
                   href="https://vercel.com/new"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-full bg-black hover:bg-gray-800 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                 >
                   <span>Deploy to Vercel</span>
                   <ArrowRight size={16} />
                 </a>
              </div>

              {/* Cloud Shell Option */}
              <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-nhs-blue rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">C</span>
                  </div>
                                     <h4 className="text-lg font-semibold text-nhs-dark-grey">Cloud Shell</h4>
                   <p className="text-nhs-grey text-sm">Best for technical users who want their own Firebase project</p>
                                       <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                      <p className="text-blue-800 text-xs">
                        <strong>How it works:</strong> Click to open Cloud Shell, then run these commands:
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className="text-blue-700 text-xs"><code className="bg-blue-100 px-1 rounded">chmod +x setup-impact.sh</code></p>
                        <p className="text-blue-700 text-xs"><code className="bg-blue-100 px-1 rounded">./setup-impact.sh</code></p>
                      </div>
                    </div>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="text-nhs-green" size={16} />
                    <span className="text-nhs-grey text-sm">Own Firebase project</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="text-nhs-green" size={16} />
                    <span className="text-nhs-grey text-sm">Full control</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="text-nhs-orange" size={16} />
                    <span className="text-nhs-grey text-sm">Requires technical knowledge</span>
                  </div>
                </div>
                                 <a 
                   href="https://shell.cloud.google.com/cloudshell/open?cloudshell_git_repo=https://github.com/leighrobertabbott/IMPACT-Course-Admin&cloudshell_working_dir=/&force_new_clone=true"
                   target="__blank"
                   rel="noopener noreferrer"
                   className="w-full bg-nhs-blue hover:bg-nhs-dark-blue text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                 >
                   <span>Open Cloud Shell</span>
                   <ArrowRight size={16} />
                 </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-16 bg-nhs-pale-grey">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-nhs-dark-grey mb-8">Need Help?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <Mail className="text-nhs-blue mx-auto mb-4" size={32} />
                <h3 className="font-semibold text-nhs-dark-grey mb-2">Email Support</h3>
                <p className="text-nhs-grey mb-4">Get help with setup and technical questions</p>
                <a 
                  href="mailto:setup@impact-course.com"
                  className="text-nhs-blue hover:text-nhs-dark-blue font-medium"
                >
                  setup@impact-course.com
                </a>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <Phone className="text-nhs-blue mx-auto mb-4" size={32} />
                <h3 className="font-semibold text-nhs-dark-grey mb-2">Phone Support</h3>
                <p className="text-nhs-grey mb-4">Call us for immediate assistance</p>
                <a 
                  href="tel:01517057428"
                  className="text-nhs-blue hover:text-nhs-dark-blue font-medium"
                >
                  0151 705 7428
                </a>
              </div>
            </div>
            <div className="mt-8">
              <p className="text-nhs-grey">
                <Clock className="inline mr-2" size={16} />
                Support Hours: Monday-Friday, 9am-5pm
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GetYourOwnSystem;
