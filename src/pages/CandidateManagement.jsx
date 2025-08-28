import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { cloudFunctions, downloadCSV, downloadJSON } from '../utils/cloudFunctions';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, RefreshCw, CheckCircle, Clock, AlertCircle, Download, Eye, Menu, X, Settings, LogOut, User } from 'lucide-react';

const CandidateManagement = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [allCandidates, setAllCandidates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [applicantTypeFilter, setApplicantTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('applicationDate');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchCandidates();
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCandidates();
  }, [allCandidates, selectedCourse, searchTerm, statusFilter, applicantTypeFilter]);

  const fetchCandidates = async () => {
    try {
      const candidatesRef = collection(db, 'candidates');
      const q = query(candidatesRef, orderBy('applicationDate', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const candidatesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        applicationDate: doc.data().applicationDate?.toDate() || new Date()
      }));
      
      setAllCandidates(candidatesData);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const coursesRef = collection(db, 'courses');
      const querySnapshot = await getDocs(coursesRef);
      
      const coursesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const filterCandidates = () => {
    let filtered = [...allCandidates];

    // Filter by course
    if (selectedCourse) {
      filtered = filtered.filter(candidate => 
        candidate.courseId === selectedCourse.id
      );
    } else {
      // If no course is selected, show all candidates except rejected ones
      filtered = filtered.filter(candidate => 
        candidate.status !== 'Rejected' && candidate.status !== 'Unsuccessful'
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(candidate => 
        candidate.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.gmcNumber?.includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.status === statusFilter);
    }

    // Filter by applicant type
    if (applicantTypeFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.applicantType === applicantTypeFilter);
    }

    // Sort candidates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'applicationDate':
          return b.applicationDate - a.applicationDate;
        case 'name':
          return (a.firstName + ' ' + a.surname).localeCompare(b.firstName + ' ' + b.surname);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setCandidates(filtered);
  };

  const updatePaymentStatus = async (candidateId, newStatus) => {
    try {
      // If marking as paid, automatically activate the candidate
      if (newStatus === 'Paid in Full') {
        // Call the activateCandidate cloud function
        await cloudFunctions.activateCandidate(candidateId);
        toast.success('Payment confirmed and candidate activated successfully');
      } else {
        // For other status updates, just update the status
        const candidateRef = doc(db, 'candidates', candidateId);
        await updateDoc(candidateRef, {
          status: newStatus,
          paymentUpdatedAt: new Date(),
          paymentUpdatedBy: 'Admin'
        });

        // Update local state
        setAllCandidates(prev => prev.map(candidate => 
          candidate.id === candidateId 
            ? { ...candidate, status: newStatus, paymentUpdatedAt: new Date() }
            : candidate
        ));

        toast.success(`Payment status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const exportCandidates = async (format = 'json') => {
    try {
      const result = await cloudFunctions.exportCandidateData('all', format);
      
      if (result.success) {
        if (format === 'csv') {
          downloadCSV(result.data, `candidates-${new Date().toISOString().split('T')[0]}.csv`);
        } else {
          downloadJSON(result.data, `candidates-${new Date().toISOString().split('T')[0]}.json`);
        }
        toast.success(`Candidates exported successfully as ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error('Error exporting candidates:', error);
      toast.error('Failed to export candidates');
    }
  };

  const openDetailsModal = (candidate) => {
    setSelectedCandidate(candidate);
    setShowDetailsModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Live Candidate':
        return <CheckCircle className="w-5 h-5 text-nhs-green" />;
      case 'Paid':
        return <CheckCircle className="w-5 h-5 text-nhs-blue" />;
      case 'Pending Payment':
        return <Clock className="w-5 h-5 text-nhs-orange" />;
      case 'Rejected':
        return <AlertCircle className="w-5 h-5 text-nhs-red" />;
      default:
        return <AlertCircle className="w-5 h-5 text-nhs-grey" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case 'Live Candidate':
        return `${baseClasses} bg-nhs-green text-white`;
      case 'Paid':
        return `${baseClasses} bg-nhs-blue text-white`;
      case 'Pending Payment':
        return `${baseClasses} bg-nhs-orange text-white`;
      case 'Rejected':
        return `${baseClasses} bg-nhs-red text-white`;
      default:
        return `${baseClasses} bg-nhs-grey text-white`;
    }
  };

  const sortedCandidates = [...candidates].sort((a, b) => {
    switch (sortBy) {
      case 'applicationDate':
        return new Date(b.applicationDate) - new Date(a.applicationDate);
      case 'name':
        return `${a.firstName} ${a.surname}`.localeCompare(`${b.firstName} ${b.surname}`);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

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
      <div className="min-h-screen bg-nhs-light-grey p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nhs-blue"></div>
          </div>
        </div>
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
          <h2 className="text-lg font-semibold text-nhs-blue">Candidate Management</h2>
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
              to="/admin"
              className="sidebar-item"
              onClick={() => setSidebarOpen(false)}
            >
              <User size={20} />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/course-management"
              className="sidebar-item"
              onClick={() => setSidebarOpen(false)}
            >
              <User size={20} />
              <span>Course Management</span>
            </Link>
            <Link
              to="/assessment-management"
              className="sidebar-item"
              onClick={() => setSidebarOpen(false)}
            >
              <User size={20} />
              <span>Assessment Management</span>
            </Link>
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

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-nhs-black">Candidate Management</h1>
                <p className="text-nhs-grey mt-2">Manage all IMPACT Course candidates</p>
              </div>
              <button
                onClick={fetchCandidates}
                className="btn-primary flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Course Selection */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-nhs-dark-grey">Course Filter</h3>
                <p className="text-sm text-nhs-grey">Select a course to filter candidates</p>
              </div>
              <select
                value={selectedCourse?.id || ''}
                onChange={(e) => {
                  const course = courses.find(c => c.id === e.target.value);
                  setSelectedCourse(course);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name} {course.archived ? '(Archived)' : ''}
                  </option>
                ))}
              </select>
            </div>
            {selectedCourse && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Course:</span>
                    <p className="text-gray-600">{selectedCourse.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Start Date:</span>
                    <p className="text-gray-600">{selectedCourse.startDate}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Venue:</span>
                    <p className="text-gray-600">{selectedCourse.venue}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <p className={`text-gray-600 ${selectedCourse.archived ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedCourse.archived ? 'Archived' : 'Active'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-nhs-grey w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or GMC number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Applicant Type Filter
                </label>
                <select
                  value={applicantTypeFilter}
                  onChange={(e) => setApplicantTypeFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Types</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Advanced Nurse Practitioner">Advanced Nurse Practitioner</option>
                  <option value="Nurse Observer">Nurse Observer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Status Filter
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending Payment">Pending Payment</option>
                  <option value="Paid">Paid</option>
                  <option value="Live Candidate">Live Candidate</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field"
                >
                  <option value="applicationDate">Application Date</option>
                  <option value="name">Name</option>
                  <option value="status">Status</option>
                </select>
              </div>

              <div className="flex items-end space-x-2">
                <button
                  onClick={() => exportCandidates('json')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Download size={20} />
                  <span>Export JSON</span>
                </button>
                <button
                  onClick={() => exportCandidates('csv')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Download size={20} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="card text-center">
              <h3 className="text-2xl font-bold text-nhs-blue">{candidates.length}</h3>
              <p className="text-nhs-grey">
                {selectedCourse ? `${selectedCourse.name} Candidates` : 'Total Candidates'}
              </p>
            </div>
            <div className="card text-center">
              <h3 className="text-2xl font-bold text-nhs-orange">
                {candidates.filter(c => c.status === 'Pending Payment').length}
              </h3>
              <p className="text-nhs-grey">Pending Payment</p>
            </div>
            <div className="card text-center">
              <h3 className="text-2xl font-bold text-nhs-green">
                {candidates.filter(c => c.status === 'Paid').length}
              </h3>
              <p className="text-nhs-grey">Paid</p>
            </div>
            <div className="card text-center">
              <h3 className="text-2xl font-bold text-nhs-blue">
                {candidates.filter(c => c.status === 'Live Candidate').length}
              </h3>
              <p className="text-nhs-grey">Live Candidates</p>
            </div>
          </div>

          {/* Candidates Table */}
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-nhs-mid-grey">
                <thead className="bg-nhs-pale-grey">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-nhs-dark-grey uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-nhs-dark-grey uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-nhs-dark-grey uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-nhs-dark-grey uppercase tracking-wider">
                      Professional Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-nhs-dark-grey uppercase tracking-wider">
                      Application Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-nhs-dark-grey uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-nhs-dark-grey uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-nhs-mid-grey">
                  {sortedCandidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-nhs-light-grey">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-nhs-dark-grey">
                            {candidate.firstName} {candidate.surname}
                            {candidate.candidateNumber && (
                              <span className="ml-2 px-2 py-1 bg-nhs-blue text-white rounded text-xs font-medium">
                                #{candidate.candidateNumber}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-nhs-grey">
                            {candidate.grade || candidate.position} - {candidate.specialty}
                          </div>
                          <div className="text-sm text-nhs-grey">
                            {candidate.placeOfWork}
                          </div>
                          {candidate.assignedGroup && (
                            <div className="text-sm text-nhs-purple font-medium">
                              Group {candidate.assignedGroup}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          candidate.applicantType === 'Doctor' ? 'bg-blue-100 text-blue-800' :
                          candidate.applicantType === 'Advanced Nurse Practitioner' ? 'bg-purple-100 text-purple-800' :
                          candidate.applicantType === 'Nurse Observer' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {candidate.applicantType || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-nhs-dark-grey">
                          {candidate.email}
                        </div>
                        <div className="text-sm text-nhs-grey">
                          {candidate.mobileTelephone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-nhs-dark-grey">
                          GMC: {candidate.gmcNumber}
                        </div>
                        <div className="text-sm text-nhs-grey">
                          PID: {candidate.pidCode}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-nhs-grey">
                        {candidate.applicationDate.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(candidate.status)}>
                          {candidate.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openDetailsModal(candidate)}
                            className="text-nhs-blue hover:text-nhs-dark-blue"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {candidate.status === 'Pending Payment' && (
                            <select
                              onChange={(e) => updatePaymentStatus(candidate.id, e.target.value)}
                              className="text-sm border border-nhs-mid-grey rounded px-2 py-1"
                              defaultValue=""
                            >
                              <option value="" disabled>Update Status</option>
                              <option value="Paid">Mark as Paid</option>
                              <option value="Rejected">Reject</option>
                            </select>
                          )}
                          {candidate.status === 'Paid' && (
                            <button
                              onClick={() => updatePaymentStatus(candidate.id, 'Live Candidate')}
                              className="text-nhs-green hover:text-nhs-dark-green text-sm"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sortedCandidates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-nhs-grey">No candidates found matching your criteria.</p>
              </div>
            )}
          </div>

          {/* Candidate Details Modal */}
          {showDetailsModal && selectedCandidate && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-nhs-dark-grey">
                    Candidate Details
                  </h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-nhs-grey hover:text-nhs-dark-grey"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-nhs-dark-grey mb-2">Personal Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Name:</span> {selectedCandidate.firstName} {selectedCandidate.surname}</div>
                        <div><span className="font-medium">Email:</span> {selectedCandidate.email}</div>
                        <div><span className="font-medium">Mobile:</span> {selectedCandidate.mobileTelephone}</div>
                        <div><span className="font-medium">Home:</span> {selectedCandidate.homeTelephone || 'N/A'}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-nhs-dark-grey mb-2">Professional Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Applicant Type:</span> {selectedCandidate.applicantType || 'N/A'}</div>
                        <div><span className="font-medium">Grade:</span> {selectedCandidate.grade || selectedCandidate.position}</div>
                        <div><span className="font-medium">Specialty:</span> {selectedCandidate.specialty}</div>
                        <div><span className="font-medium">Place of Work:</span> {selectedCandidate.placeOfWork}</div>
                        <div><span className="font-medium">GMC Number:</span> {selectedCandidate.gmcNumber || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-nhs-dark-grey mb-2">Educational Supervisor</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Name:</span> {selectedCandidate.supervisorName || selectedCandidate.educationalSupervisor}</div>
                      <div><span className="font-medium">Email:</span> {selectedCandidate.supervisorEmail}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-nhs-dark-grey mb-2">Course Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Course:</span> {selectedCandidate.courseName || 'IMPACT Course'}</div>
                      <div><span className="font-medium">Course Date:</span> {selectedCandidate.courseDate || 'TBD'}</div>
                      <div><span className="font-medium">PID Code:</span> {selectedCandidate.pidCode}</div>
                      <div><span className="font-medium">Application Date:</span> {selectedCandidate.applicationDate.toLocaleDateString()}</div>
                      {selectedCandidate.candidateNumber && (
                        <div><span className="font-medium">Candidate Number:</span> #{selectedCandidate.candidateNumber}</div>
                      )}
                      {selectedCandidate.assignedGroup && (
                        <div><span className="font-medium">Assigned Group:</span> Group {selectedCandidate.assignedGroup}</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-nhs-dark-grey mb-2">Status Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Current Status:</span> <span className={getStatusBadge(selectedCandidate.status)}>{selectedCandidate.status}</span></div>
                      <div><span className="font-medium">E-Learning Status:</span> {selectedCandidate.eLearningStatus || 'Pending'}</div>
                      <div><span className="font-medium">Course Status:</span> {selectedCandidate.courseStatus || 'Pending'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateManagement;
