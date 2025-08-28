import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, AlertCircle, Bell, RefreshCw, Calendar, MapPin, Users, Menu, X, Settings, LogOut, User } from 'lucide-react';

const GeneralOfficeView = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchCandidates();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const q = query(
        collection(db, 'courses'),
        where('archived', '==', false)
      );
      const querySnapshot = await getDocs(q);
      const courses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAvailableCourses(courses);
      
      // Auto-select the first available course
      if (courses.length > 0) {
        setSelectedCourse(courses[0]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
    }
  };

  const fetchCandidates = async () => {
    if (!selectedCourse) return;
    
    try {
      setLoading(true);
      const q = query(
        collection(db, 'candidates'),
        where('courseId', '==', selectedCourse.id),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const candidatesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter out nurse observers - they don't appear in general office view
      // ANPs are handled the same as Doctors for payment purposes
      const filteredCandidates = candidatesData.filter(candidate => candidate.applicantType !== 'Nurse Observer');
      setCandidates(filteredCandidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('type', '==', 'new_application'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const notificationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notificationsData);
      setUnreadNotifications(notificationsData.filter(n => n.status === 'unread').length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        status: 'read',
        readAt: new Date()
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => n.status === 'unread');
      const updatePromises = unreadNotifications.map(notification =>
        updateDoc(doc(db, 'notifications', notification.id), {
          status: 'read',
          readAt: new Date()
        })
      );
      await Promise.all(updatePromises);
      fetchNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const updatePaymentStatus = async (candidateId, newStatus) => {
    try {
      // If marking as paid, automatically activate the candidate
      if (newStatus === 'Paid in Full') {
        // Call the activateCandidate cloud function
        const { cloudFunctions } = await import('../utils/cloudFunctions');
        await cloudFunctions.activateCandidate(candidateId);
        toast.success('Payment confirmed and candidate activated successfully');
      } else {
        // For other status updates, just update the status
        await updateDoc(doc(db, 'candidates', candidateId), {
          status: newStatus,
          paymentUpdatedAt: new Date()
        });
        toast.success('Payment status updated successfully');
      }
      
      fetchCandidates(); // Refresh the list
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const handleMarkAsPaid = (candidate) => {
    // Check if course is full
    if (isCourseFull) {
      toast.error('Course is full. Cannot accept more payments.');
      return;
    }
    setSelectedCandidate(candidate);
    setReceiptNumber('');
    setShowReceiptModal(true);
  };

  const confirmPaymentWithReceipt = async () => {
    if (!receiptNumber.trim()) {
      toast.error('Please enter a receipt number');
      return;
    }

    try {
      // Update candidate with receipt number and status
      await updateDoc(doc(db, 'candidates', selectedCandidate.id), {
        status: 'Paid in Full',
        receiptNumber: receiptNumber.trim(),
        paymentUpdatedAt: new Date()
      });

      // Call the activateCandidate cloud function
      const { cloudFunctions } = await import('../utils/cloudFunctions');
      await cloudFunctions.activateCandidate(selectedCandidate.id);
      
      toast.success('Payment confirmed and candidate activated successfully');
      setShowReceiptModal(false);
      setSelectedCandidate(null);
      setReceiptNumber('');
      fetchCandidates(); // Refresh the list
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to confirm payment');
    }
  };

  const handleWithdrawCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setShowWithdrawalModal(true);
  };

  const confirmWithdrawal = async () => {
    try {
      // Update candidate status to withdrawn
      await updateDoc(doc(db, 'candidates', selectedCandidate.id), {
        status: 'Withdrawn',
        withdrawnAt: new Date(),
        withdrawnBy: 'General Office'
      });
      
      toast.success('Candidate withdrawn successfully');
      setShowWithdrawalModal(false);
      setSelectedCandidate(null);
      fetchCandidates(); // Refresh the list
    } catch (error) {
      console.error('Error withdrawing candidate:', error);
      toast.error('Failed to withdraw candidate');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid in Full':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'Pending Payment':
        return <Clock className="text-orange-500" size={16} />;
      case 'Live Candidate':
        return <CheckCircle className="text-blue-500" size={16} />;
      case 'Withdrawn':
        return <AlertCircle className="text-red-500" size={16} />;
      default:
        return <AlertCircle className="text-gray-500" size={16} />;
    }
  };

  const stats = {
    totalApplicants: candidates.length,
    totalCandidates: candidates.filter(c => c.status === 'Live Candidate' || c.status === 'Paid in Full').length,
    pendingPayment: candidates.filter(c => c.status === 'Pending Payment').length,
    paidInFull: candidates.filter(c => c.status === 'Paid in Full').length,
    liveCandidates: candidates.filter(c => c.status === 'Live Candidate').length,
    withdrawn: candidates.filter(c => c.status === 'Withdrawn').length,
    doctorCount: candidates.filter(c => (c.status === 'Live Candidate' || c.status === 'Paid in Full') && (c.applicantType === 'Doctor' || c.applicantType === 'Advanced Nurse Practitioner')).length
  };

  const isCourseFull = stats.doctorCount >= 16; // Course is full when doctors and ANPs reach capacity
  const availableSpaces = 16 - stats.doctorCount; // Doctors and ANPs share the same capacity
  const availableDoctorSpaces = 16 - stats.doctorCount;

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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-nhs-blue"></div>
      </div>
    );
  }

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
          <h2 className="text-lg font-semibold text-nhs-blue">General Office</h2>
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

          <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-nhs-dark-grey mb-2">General Office - Payment Management</h1>
            <p className="text-nhs-grey">Update payment status for course candidates</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-nhs-grey hover:text-nhs-dark-grey"
              >
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-nhs-dark-grey">Notifications</h3>
                      {unreadNotifications > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-sm text-nhs-blue hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                            notification.status === 'unread' ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-nhs-dark-grey">
                                {notification.candidateName}
                              </p>
                              <p className="text-xs text-nhs-grey">
                                {notification.courseName} - {notification.courseDate}
                              </p>
                              <p className="text-xs text-nhs-grey mt-1">
                                {notification.createdAt.toDate().toLocaleString()}
                              </p>
                            </div>
                            {notification.status === 'unread' && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-nhs-grey">
                        No notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => {
                fetchCandidates();
                fetchNotifications();
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

             {/* Course Capacity Warning */}
       {isCourseFull && (
         <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
           <div className="flex items-center">
             <AlertCircle className="text-red-500 mr-3" size={20} />
             <div>
               <h3 className="text-red-800 font-semibold">Course is Full</h3>
               <p className="text-red-700 text-sm">
                 This course has reached its maximum capacity of {selectedCourse?.maxCandidates || 16} live candidates. 
                 No more payments can be accepted until a space becomes available.
               </p>
             </div>
           </div>
         </div>
       )}

       {/* Course Selection */}
       <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="font-semibold text-nhs-dark-grey">Active Course:</h3>
            <select
              value={selectedCourse?.id || ''}
              onChange={(e) => {
                const course = availableCourses.find(c => c.id === e.target.value);
                setSelectedCourse(course);
              }}
              className="p-2 border border-gray-300 rounded-md"
            >
              {availableCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} - {course.startDate} {course.archived ? '(Archived)' : ''}
                </option>
              ))}
            </select>
          </div>
          {selectedCourse && (
            <div className="flex items-center space-x-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedCourse.archived ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
              }`}>
                {selectedCourse.archived ? 'Archived' : 'Active'}
              </span>
              <div className="text-sm text-nhs-grey">
                {selectedCourse.venue} • {selectedCourse.startDate}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Course Overview */}
      {selectedCourse && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-nhs-blue rounded-lg flex items-center justify-center">
                <Calendar className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-nhs-dark-grey">Course Date</h3>
                <p className="text-nhs-grey">{selectedCourse.startDate}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-nhs-green rounded-lg flex items-center justify-center">
                <MapPin className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-nhs-dark-grey">Venue</h3>
                <p className="text-nhs-grey">{selectedCourse.venue}</p>
              </div>
            </div>
          </div>

                     <div className="card">
             <div className="flex items-center space-x-3">
               <div className="w-10 h-10 bg-nhs-purple rounded-lg flex items-center justify-center">
                 <Users className="text-white" size={20} />
               </div>
               <div>
                                     <h3 className="font-semibold text-nhs-dark-grey">Total Candidates</h3>
                    <p className="text-nhs-grey">{stats.totalCandidates} / 16</p>
                    <p className="text-xs text-nhs-grey">Doctors & ANPs: {stats.doctorCount}/16</p>
                 {isCourseFull && (
                   <span className="text-xs text-red-600 font-medium">COURSE FULL</span>
                 )}
               </div>
             </div>
           </div>

           <div className="card">
             <div className="flex items-center space-x-3">
               <div className="w-10 h-10 bg-nhs-grey rounded-lg flex items-center justify-center">
                 <Users className="text-white" size={20} />
               </div>
               <div>
                 <h3 className="font-semibold text-nhs-dark-grey">Total Applicants</h3>
                 <p className="text-nhs-grey">{stats.totalApplicants}</p>
               </div>
             </div>
           </div>
         </div>
       )}

      {/* Payment Status Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Clock className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-nhs-dark-grey">Pending Payment</h3>
              <p className="text-2xl font-bold text-orange-500">{stats.pendingPayment}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-nhs-dark-grey">Paid in Full</h3>
              <p className="text-2xl font-bold text-blue-500">{stats.paidInFull}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-nhs-dark-grey">Live Candidates</h3>
              <p className="text-2xl font-bold text-green-500">{stats.liveCandidates}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-nhs-dark-grey">Withdrawn</h3>
              <p className="text-2xl font-bold text-red-500">{stats.withdrawn}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-nhs-dark-grey mb-6">Candidate Payment Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">Candidate</th>
                <th className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">Course</th>
                <th className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">Grade</th>
                <th className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">Receipt Number</th>
                <th className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">{candidate.firstName} {candidate.surname}</div>
                      <div className="text-sm text-nhs-grey">{candidate.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <div className="font-medium">{candidate.courseName}</div>
                      <div className="text-nhs-grey">{candidate.courseDate}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      candidate.applicantType === 'Doctor' 
                        ? 'bg-blue-100 text-blue-800' 
                        : candidate.applicantType === 'Advanced Nurse Practitioner'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {candidate.applicantType || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-nhs-grey">{candidate.grade || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(candidate.status)}
                      <span className="text-sm capitalize">{candidate.status}</span>
                    </div>
                  </td>
                                     <td className="py-3 px-4">
                     {candidate.receiptNumber ? (
                       <span className="text-sm font-mono text-nhs-dark-grey bg-gray-100 px-2 py-1 rounded">
                         {candidate.receiptNumber}
                       </span>
                     ) : (
                       <span className="text-sm text-nhs-grey">-</span>
                     )}
                   </td>
                   <td className="py-3 px-4">
                     {candidate.status === 'Pending Payment' && (
                       <button
                         onClick={() => handleMarkAsPaid(candidate)}
                         className="text-nhs-blue hover:text-nhs-dark-blue text-sm font-medium"
                         disabled={isCourseFull}
                       >
                         {isCourseFull ? 'Course Full' : 'Mark as Paid'}
                       </button>
                     )}
                     {candidate.status === 'Paid in Full' && (
                       <span className="text-green-600 text-sm">Ready for Activation</span>
                     )}
                     {candidate.status === 'Live Candidate' && (
                       <div className="space-y-1">
                         <span className="text-green-600 text-sm block">Activated</span>
                         <button
                           onClick={() => handleWithdrawCandidate(candidate)}
                           className="text-red-600 hover:text-red-800 text-xs font-medium"
                         >
                           Withdraw
                         </button>
                       </div>
                     )}
                     {candidate.status === 'Withdrawn' && (
                       <span className="text-red-600 text-sm">Withdrawn</span>
                     )}
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
          {candidates.length === 0 && (
            <div className="text-center py-8">
              <p className="text-nhs-grey">No candidates found for this course.</p>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Number Modal */}
      {showReceiptModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-nhs-dark-grey mb-4">
              Confirm Payment for {selectedCandidate.firstName} {selectedCandidate.surname}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                Receipt Number *
              </label>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                placeholder="Enter receipt number"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-nhs-blue focus:border-transparent"
                autoFocus
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setSelectedCandidate(null);
                  setReceiptNumber('');
                }}
                className="px-4 py-2 text-nhs-grey hover:text-nhs-dark-grey transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmPaymentWithReceipt}
                className="btn-primary px-4 py-2"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Confirmation Modal */}
      {showWithdrawalModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-nhs-dark-grey mb-4">
              Confirm Withdrawal
            </h3>
            
            <div className="mb-6">
              <p className="text-nhs-grey mb-4">
                Are you sure you want to withdraw <strong>{selectedCandidate.firstName} {selectedCandidate.surname}</strong> from the course?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>Note:</strong> This action will:
                </p>
                <ul className="text-sm text-red-700 mt-2 space-y-1">
                  <li>• Remove their access to course materials</li>
                  <li>• Free up a space for another candidate</li>
                  <li>• Mark them as withdrawn in the system</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowWithdrawalModal(false);
                  setSelectedCandidate(null);
                }}
                className="px-4 py-2 text-nhs-grey hover:text-nhs-dark-grey transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmWithdrawal}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default GeneralOfficeView;
