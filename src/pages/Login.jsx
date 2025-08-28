import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, X } from 'lucide-react';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore'; // Added missing import for getDoc

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const userCredential = await login(data.email, data.password);
      toast.success('Login successful!');
      
      // Fetch user profile to get role
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;
        
        // Redirect based on role
        switch (role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'general-office':
            navigate('/general-office/tutorial');
            break;
          case 'faculty':
            navigate('/faculty');
            break;
          case 'candidate':
          default:
            navigate('/dashboard');
            break;
        }
      } else {
        // Fallback to dashboard if no profile found
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setResetLoading(true);
    try {
      await resetPassword(resetEmail);
      toast.success('Password reset email sent! Check your inbox.');
      setShowPasswordReset(false);
      setResetEmail('');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Failed to send password reset email. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-nhs-light-grey py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-nhs-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-nhs-dark-grey mb-2">
            Welcome Back
          </h1>
          <p className="text-nhs-grey">
            Sign in to your IMPACT Course account
          </p>
        </div>

        {/* Login Form */}
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-nhs-mid-grey" />
                </div>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  className="input-field pl-10"
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && (
                <p className="text-nhs-red text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-nhs-mid-grey" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-nhs-mid-grey" />
                  ) : (
                    <Eye className="h-5 w-5 text-nhs-mid-grey" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-nhs-red text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowPasswordReset(true)}
              className="text-nhs-blue hover:text-nhs-dark-blue text-sm font-medium transition-colors"
            >
              Forgot your password?
            </button>
          </div>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-nhs-grey">
              Don't have an account?{' '}
              <Link to="/apply" className="text-nhs-blue hover:underline font-medium">
                Apply for the course
              </Link>
            </p>
          </div>

          {/* Information Box */}
          <div className="mt-6 p-4 bg-nhs-pale-grey rounded-lg border-l-4 border-nhs-blue">
            <h3 className="text-sm font-semibold text-nhs-blue mb-2">
              Access Information
            </h3>
            <p className="text-xs text-nhs-grey">
              If you have completed your application and payment has been confirmed, 
              you will receive login credentials via email. If you haven't received 
              your credentials, please contact the course administrator.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-nhs-mid-grey">
            © 2024 IMPACT Course - Whiston Hospital
          </p>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showPasswordReset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-nhs-dark-grey">Reset Password</h2>
              <button
                onClick={() => setShowPasswordReset(false)}
                className="text-nhs-mid-grey hover:text-nhs-dark-grey"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="input-field"
                  placeholder="Enter your email address"
                  required
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordReset(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Email'}
                </button>
              </div>
            </form>
            
            <p className="text-xs text-nhs-grey mt-4">
              We'll send you an email with a link to reset your password.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
