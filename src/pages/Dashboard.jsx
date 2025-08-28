import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { User, Calendar, BookOpen, CheckCircle, Clock, AlertCircle, Users, Clock3, Hash, Menu, X, Settings, LogOut } from 'lucide-react';
import EnhancedProgrammeDisplay from '../components/EnhancedProgrammeDisplay';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [candidateData, setCandidateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchCandidateData();
    }
  }, [currentUser]);

  const fetchCandidateData = async () => {
    try {
      const q = query(
        collection(db, 'candidates'),
        where('email', '==', currentUser.email)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        setCandidateData({
          id: querySnapshot.docs[0].id,
          ...data,
          applicationDate: data.applicationDate?.toDate() || new Date()
        });
        
        // Fetch course data if candidate has a courseId
        if (data.courseId) {
          const courseDoc = await getDoc(doc(db, 'courses', data.courseId));
          if (courseDoc.exists()) {
            const courseData = courseDoc.data();
            setCourseData(courseData);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching candidate data:', error);
    } finally {
      setLoading(false);
    }
  };



  const getStatusInfo = (status) => {
    const statusConfig = {
      'Pending Payment': {
        color: 'text-nhs-orange',
        bgColor: 'bg-nhs-orange',
        icon: Clock,
        message: 'Your application has been received. Please complete payment to proceed.',
        action: 'Contact the course administrator for payment instructions.'
      },
      'Paid in Full': {
        color: 'text-nhs-green',
        bgColor: 'bg-nhs-green',
        icon: CheckCircle,
        message: 'Payment received. Your account will be activated shortly.',
        action: 'You will receive login credentials via email soon.'
      },
      'Live Candidate': {
        color: 'text-nhs-blue',
        bgColor: 'bg-nhs-blue',
        icon: CheckCircle,
        message: 'Welcome! You are now an active candidate for the IMPACT course.',
        action: 'Complete your profile and upload your photo.'
      },
      'Withdrawn': {
        color: 'text-nhs-red',
        bgColor: 'bg-nhs-red',
        icon: AlertCircle,
        message: 'You have been withdrawn from the IMPACT course.',
        action: 'You no longer have access to course materials. Contact the course administrator if you believe this is an error.'
      },
      'Rejected': {
        color: 'text-nhs-red',
        bgColor: 'bg-nhs-red',
        icon: AlertCircle,
        message: 'Your application has been reviewed and was not accepted.',
        action: 'Please contact the course administrator for more information.'
      }
    };

    return statusConfig[status] || statusConfig['Pending Payment'];
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nhs-blue mx-auto"></div>
          <p className="mt-4 text-nhs-grey">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!candidateData) {
    return (
      <div className="min-h-screen bg-nhs-light-grey py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="card">
              <div className="w-16 h-16 bg-nhs-red rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-white" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-nhs-dark-grey mb-4">
                Application Not Found
              </h2>
              <p className="text-nhs-grey mb-6">
                We couldn't find an application associated with your email address. 
                Please ensure you have submitted an application for the IMPACT course.
              </p>
              <a href="/apply" className="btn-primary">
                Apply Now
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(candidateData.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-nhs-light-grey flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-nhs-pale-grey">
          <h2 className="text-lg font-semibold text-nhs-blue">Dashboard</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-nhs-pale-grey rounded"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="mt-6 px-3">
          <div className="space-y-2">
            <Link
              to="/profile"
              className="sidebar-item"
              onClick={() => setSidebarOpen(false)}
            >
              <User size={20} />
              <span>Profile</span>
            </Link>
            <Link
              to="/profile"
              className="sidebar-item"
              onClick={() => setSidebarOpen(false)}
            >
              <Settings size={20} />
              <span>Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="sidebar-item w-full text-left"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        <div className="max-w-7xl mx-auto p-6">
          {/* Mobile menu button */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center space-x-2 p-2 bg-white rounded-lg shadow-sm"
            >
              <Menu size={20} />
              <span>Menu</span>
            </button>
          </div>
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-nhs-dark-grey mb-2">
            Welcome, {candidateData.firstName}!
          </h1>
          <p className="text-lg text-nhs-grey">
            Your IMPACT Course Dashboard
          </p>
        </div>

        {/* Status Card */}
        <div className="card mb-8">
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 ${statusInfo.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
              <StatusIcon className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-nhs-dark-grey mb-2">
                Application Status: {candidateData.status}
              </h2>
              <p className="text-nhs-grey mb-3">
                {statusInfo.message}
              </p>
              <div className="bg-nhs-pale-grey p-3 rounded-lg">
                <p className="text-sm text-nhs-dark-grey">
                  <strong>Next Step:</strong> {statusInfo.action}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Information */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <h3 className="text-xl font-semibold text-nhs-blue mb-4 flex items-center">
              <BookOpen className="mr-2" size={20} />
              Course Details
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-nhs-grey">Course Name:</span>
                <p className="text-nhs-dark-grey">IMPACT Course</p>
              </div>
              <div>
                <span className="text-sm font-medium text-nhs-grey">Location:</span>
                <p className="text-nhs-dark-grey">Whiston Hospital</p>
              </div>
              <div>
                <span className="text-sm font-medium text-nhs-grey">Trust:</span>
                <p className="text-nhs-dark-grey">Mersey and West Lancashire NHS Trust</p>
              </div>
              <div>
                <span className="text-sm font-medium text-nhs-grey">Application Date:</span>
                <p className="text-nhs-dark-grey">
                  {candidateData.applicationDate.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-nhs-blue mb-4 flex items-center">
              <User className="mr-2" size={20} />
              Your Information
            </h3>
            {candidateData.status === 'Live Candidate' && candidateData.assignedGroup && (
              <div className="mb-4 p-3 bg-nhs-pale-grey rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="text-nhs-purple" size={16} />
                  <span className="text-sm font-medium text-nhs-dark-grey">Assigned Group:</span>
                  <span className="px-2 py-1 bg-nhs-purple text-white rounded text-xs font-medium">
                    Group {candidateData.assignedGroup}
                  </span>
                </div>
                {candidateData.candidateNumber && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Hash className="text-nhs-blue" size={16} />
                    <span className="text-sm font-medium text-nhs-dark-grey">Candidate Number:</span>
                    <span className="px-2 py-1 bg-nhs-blue text-white rounded text-xs font-medium">
                      #{candidateData.candidateNumber}
                    </span>
                  </div>
                )}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-nhs-grey">Name:</span>
                <p className="text-nhs-dark-grey">
                  {candidateData.firstName} {candidateData.surname}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-nhs-grey">Applicant Type:</span>
                <p className="text-nhs-dark-grey">{candidateData.applicantType || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-nhs-grey">Position:</span>
                <p className="text-nhs-dark-grey">{candidateData.position || candidateData.grade}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-nhs-grey">Specialty:</span>
                <p className="text-nhs-dark-grey">{candidateData.specialty}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-nhs-grey">GMC Number:</span>
                <p className="text-nhs-dark-grey">{candidateData.gmcNumber}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Programme Display */}
        {candidateData.status === 'Live Candidate' && candidateData.courseId && (
          <div className="card mb-8">
            <EnhancedProgrammeDisplay 
              courseId={candidateData.courseId} 
              candidateData={candidateData}
            />
          </div>
        )}

        {/* Action Cards */}
        {candidateData.status === 'Live Candidate' && (
          <div className="grid md:grid-cols-1 gap-8">
            <div className="card border-l-4 border-nhs-blue">
              <h3 className="text-lg font-semibold text-nhs-blue mb-3">
                Complete Your Profile
              </h3>
              <p className="text-nhs-grey mb-4">
                Update your personal information and upload a professional photo for your course materials.
              </p>
              <a href="/profile" className="btn-primary">
                Update Profile
              </a>
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="card mt-8">
          <h3 className="text-xl font-semibold text-nhs-blue mb-4">
            Need Help?
          </h3>
          <p className="text-nhs-grey mb-4">
            If you have any questions about your application or the course, please contact the course administrator:
          </p>
          <div className="bg-nhs-pale-grey p-4 rounded-lg">
            <p className="text-nhs-dark-grey">
              <strong>Email:</strong> impact.course@whiston.nhs.uk
            </p>
            <p className="text-nhs-dark-grey">
              <strong>Phone:</strong> 0151 430 1234 (ext. 5678)
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
