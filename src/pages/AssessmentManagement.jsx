import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { cloudFunctions, downloadCSV, downloadJSON } from '../utils/cloudFunctions';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Award, 
  XCircle, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileText,
  Download,
  Mail,
  User,
  BookOpen,
  Target,
  Send,
  Eye,
  Edit,
  Save,
  Plus,
  Menu,
  X,
  Settings,
  LogOut
} from 'lucide-react';

const AssessmentManagement = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showUnsuccessfulModal, setShowUnsuccessfulModal] = useState(false);
  const [assessmentForm, setAssessmentForm] = useState({
    attendance: false,
    thoracocentesis: false,
    cvp: false,
    lumbarPuncture: false,
    testScenario: false,
    overallAssessment: 'pending',
    notes: '',
    assessorName: '',
    assessmentDate: new Date()
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchCandidates();
    fetchAssessments();
  }, []);

  const fetchCandidates = async () => {
    try {
      // Get all candidates and filter out rejected/unsuccessful ones
      const q = query(collection(db, 'candidates'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const candidatesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter out rejected candidates and only show active course candidates
      const activeCandidates = candidatesData.filter(candidate => 
        candidate.status !== 'Rejected' && 
        candidate.status !== 'Unsuccessful' &&
        candidate.courseStatus !== 'Fail' &&
        candidate.status !== 'Failed'
      );
      
      setCandidates(activeCandidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to fetch candidates');
    }
  };

  const fetchAssessments = async () => {
    try {
      const assessmentSnapshot = await getDocs(collection(db, 'assessments'));
      const assessmentData = assessmentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAssessments(assessmentData);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      toast.error('Failed to fetch assessments');
    } finally {
      setLoading(false);
    }
  };

  const openAssessmentModal = (candidate) => {
    setSelectedCandidate(candidate);
    setShowAssessmentModal(true);
  };

  const saveAssessment = async () => {
    try {
      const assessmentData = {
        candidateId: selectedCandidate.id,
        candidateName: `${selectedCandidate.firstName} ${selectedCandidate.surname}`,
        candidateEmail: selectedCandidate.email,
        ...assessmentForm,
        assessmentDate: new Date(),
        createdAt: new Date()
      };

      await addDoc(collection(db, 'assessments'), assessmentData);

      // Update candidate status
      await updateDoc(doc(db, 'candidates', selectedCandidate.id), {
        courseStatus: assessmentForm.overallAssessment,
        assessmentCompleted: true,
        assessmentDate: new Date()
      });

      toast.success('Assessment saved successfully');
      setShowAssessmentModal(false);
      fetchCandidates();
      fetchAssessments();
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error('Failed to save assessment');
    }
  };

  const handleUnsuccessfulCandidate = async (candidate) => {
    setSelectedCandidate(candidate);
    setShowUnsuccessfulModal(true);
  };

  const sendUnsuccessfulNotification = async (reason, supervisorContacted) => {
    try {
      await cloudFunctions.handleUnsuccessfulCandidate(selectedCandidate.id, reason, supervisorContacted);
      toast.success('Unsuccessful candidate processed successfully');
      setShowUnsuccessfulModal(false);
      fetchCandidates();
    } catch (error) {
      console.error('Error handling unsuccessful candidate:', error);
      toast.error('Failed to process unsuccessful candidate');
    }
  };

  const generateCertificates = async () => {
    try {
      const result = await cloudFunctions.generateCertificates('current');
      
      if (result.success) {
        const certificateData = {
          certificates: result.certificates,
          generatedAt: new Date().toISOString(),
          totalCertificates: result.certificates.length
        };

        const filename = `impact-certificates-${new Date().toISOString().split('T')[0]}.json`;
        downloadJSON(certificateData, filename);
        toast.success(`Generated ${result.certificates.length} certificates`);
      }
    } catch (error) {
      console.error('Error generating certificates:', error);
      toast.error('Failed to generate certificates');
    }
  };

  const exportAssessmentReport = async () => {
    try {
      const result = await cloudFunctions.exportCandidateData('all', 'json');
      
      if (result.success) {
        const report = {
          totalCandidates: candidates.length,
          successful: candidates.filter(c => c.courseStatus === 'Pass').length,
          unsuccessful: candidates.filter(c => c.courseStatus === 'Fail').length,
          pending: candidates.filter(c => !c.assessmentCompleted).length,
          assessments: assessments.map(a => ({
            candidate: a.candidateName,
            overallAssessment: a.overallAssessment,
            assessmentDate: a.assessmentDate.toLocaleDateString(),
            assessor: a.assessorName
          })),
          generatedAt: new Date().toISOString(),
          candidates: result.data
        };

        const filename = `impact-assessment-report-${new Date().toISOString().split('T')[0]}.json`;
        downloadJSON(report, filename);
        toast.success('Assessment report exported successfully');
      }
    } catch (error) {
      console.error('Error exporting assessment report:', error);
      toast.error('Failed to export assessment report');
    }
  };

  const getAssessmentStatus = (candidate) => {
    if (candidate.courseStatus === 'Pass') return 'successful';
    if (candidate.courseStatus === 'Fail') return 'unsuccessful';
    if (candidate.assessmentCompleted) return 'assessed';
    return 'pending';
  };

  const getAssessmentIcon = (status) => {
    switch (status) {
      case 'successful':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'unsuccessful':
        return <XCircle className="text-red-500" size={16} />;
      case 'assessed':
        return <Clock className="text-orange-500" size={16} />;
      default:
        return <AlertCircle className="text-gray-500" size={16} />;
    }
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-nhs-blue"></div>
      </div>
    );
  }

  const stats = {
    total: candidates.length,
    successful: candidates.filter(c => c.courseStatus === 'Pass').length,
    unsuccessful: candidates.filter(c => c.courseStatus === 'Fail').length,
    pending: candidates.filter(c => !c.assessmentCompleted).length
  };

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
          <h2 className="text-lg font-semibold text-nhs-blue">Assessment Management</h2>
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
              to="/candidate-management"
              className="sidebar-item"
              onClick={() => setSidebarOpen(false)}
            >
              <User size={20} />
              <span>Candidate Management</span>
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

          <div className="mb-8">
        <h1 className="text-3xl font-bold text-nhs-dark-grey mb-2">Assessment Management</h1>
        <p className="text-nhs-grey">Manage candidate assessments and certifications</p>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-nhs-blue rounded-lg flex items-center justify-center">
              <User className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-nhs-dark-grey">Total Candidates</h3>
              <p className="text-2xl font-bold text-nhs-blue">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-nhs-dark-grey">Successful</h3>
              <p className="text-2xl font-bold text-green-500">{stats.successful}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <XCircle className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-nhs-dark-grey">Unsuccessful</h3>
              <p className="text-2xl font-bold text-red-500">{stats.unsuccessful}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Clock className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-nhs-dark-grey">Pending</h3>
              <p className="text-2xl font-bold text-orange-500">{stats.pending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={generateCertificates}
          className="card hover:shadow-lg transition-shadow cursor-pointer text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-nhs-green rounded-lg flex items-center justify-center">
              <Award className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-nhs-dark-grey">Generate Certificates</h3>
              <p className="text-sm text-nhs-grey">For successful candidates</p>
            </div>
          </div>
        </button>

        <button
          onClick={exportAssessmentReport}
          className="card hover:shadow-lg transition-shadow cursor-pointer text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-nhs-blue rounded-lg flex items-center justify-center">
              <Download className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-nhs-dark-grey">Export Report</h3>
              <p className="text-sm text-nhs-grey">Assessment summary</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => window.open('#assessment-criteria', '_blank')}
          className="card hover:shadow-lg transition-shadow cursor-pointer text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-nhs-purple rounded-lg flex items-center justify-center">
              <FileText className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-nhs-dark-grey">Assessment Criteria</h3>
              <p className="text-sm text-nhs-grey">View requirements</p>
            </div>
          </div>
        </button>
      </div>

      {/* Assessment Criteria */}
      <div className="card mb-8">
        <h3 className="text-lg font-semibold text-nhs-dark-grey mb-4">Assessment Criteria</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-nhs-dark-grey mb-3">Practical Skills</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Target className="text-nhs-blue" size={16} />
                <span className="text-sm">Thoracocentesis</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="text-nhs-blue" size={16} />
                <span className="text-sm">Central Venous Pressure (CVP)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="text-nhs-blue" size={16} />
                <span className="text-sm">Lumbar Puncture</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-nhs-dark-grey mb-3">Assessment Components</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <BookOpen className="text-nhs-blue" size={16} />
                <span className="text-sm">Attendance (100% required)</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="text-nhs-blue" size={16} />
                <span className="text-sm">Test Scenario Performance</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="text-nhs-blue" size={16} />
                <span className="text-sm">Overall Assessment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Assessment Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-nhs-dark-grey mb-6">Candidate Assessments</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">Candidate</th>
                <th className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">E-Learning</th>
                <th className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">Assessment</th>
                <th className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => {
                const assessmentStatus = getAssessmentStatus(candidate);
                return (
                  <tr key={candidate.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{candidate.firstName} {candidate.surname}</div>
                        <div className="text-sm text-nhs-grey">{candidate.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getAssessmentIcon(assessmentStatus)}
                        <span className="text-sm capitalize">{assessmentStatus}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        candidate.eLearningStatus === 'Pass' ? 'bg-green-100 text-green-800' :
                        candidate.eLearningStatus === 'Fail' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {candidate.eLearningStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        candidate.courseStatus === 'Pass' ? 'bg-green-100 text-green-800' :
                        candidate.courseStatus === 'Fail' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {candidate.courseStatus || 'Not Assessed'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        {!candidate.assessmentCompleted && (
                          <button
                            onClick={() => openAssessmentModal(candidate)}
                            className="text-nhs-blue hover:text-nhs-dark-blue text-sm"
                          >
                            Assess
                          </button>
                        )}
                        {candidate.courseStatus === 'Fail' && (
                          <button
                            onClick={() => handleUnsuccessfulCandidate(candidate)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Process
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assessment Modal */}
      {showAssessmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Assessment for {selectedCandidate?.firstName} {selectedCandidate?.surname}
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-nhs-dark-grey mb-2">Practical Skills</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={assessmentForm.thoracocentesis}
                      onChange={(e) => setAssessmentForm(prev => ({ ...prev, thoracocentesis: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Thoracocentesis</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={assessmentForm.cvp}
                      onChange={(e) => setAssessmentForm(prev => ({ ...prev, cvp: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Central Venous Pressure (CVP)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={assessmentForm.lumbarPuncture}
                      onChange={(e) => setAssessmentForm(prev => ({ ...prev, lumbarPuncture: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Lumbar Puncture</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-nhs-dark-grey mb-2">Assessment Components</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={assessmentForm.attendance}
                      onChange={(e) => setAssessmentForm(prev => ({ ...prev, attendance: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Full Attendance</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={assessmentForm.testScenario}
                      onChange={(e) => setAssessmentForm(prev => ({ ...prev, testScenario: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Test Scenario Performance</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Overall Assessment
                </label>
                <select
                  value={assessmentForm.overallAssessment}
                  onChange={(e) => setAssessmentForm(prev => ({ ...prev, overallAssessment: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="pending">Pending</option>
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Assessor Name
                </label>
                <input
                  type="text"
                  value={assessmentForm.assessorName}
                  onChange={(e) => setAssessmentForm(prev => ({ ...prev, assessorName: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter assessor name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Notes
                </label>
                <textarea
                  value={assessmentForm.notes}
                  onChange={(e) => setAssessmentForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={saveAssessment}
                className="bg-nhs-blue text-white px-4 py-2 rounded-md hover:bg-nhs-dark-blue"
              >
                Save Assessment
              </button>
              <button
                onClick={() => setShowAssessmentModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsuccessful Candidate Modal */}
      {showUnsuccessfulModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Process Unsuccessful Candidate
            </h3>
            <p className="text-sm text-nhs-grey mb-4">
              {selectedCandidate?.firstName} {selectedCandidate?.surname}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Reason for Unsuccessful Outcome
                </label>
                <select
                  id="unsuccessfulReason"
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a reason</option>
                  <option value="Incomplete attendance">Incomplete attendance</option>
                  <option value="Failed practical skills">Failed practical skills</option>
                  <option value="Failed test scenario">Failed test scenario</option>
                  <option value="Incomplete e-learning">Incomplete e-learning</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="notifySupervisor"
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Notify educational supervisor</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  const reason = document.getElementById('unsuccessfulReason').value;
                  const notifySupervisor = document.getElementById('notifySupervisor').checked;
                  if (reason) {
                    sendUnsuccessfulNotification(reason, notifySupervisor);
                  } else {
                    toast.error('Please select a reason');
                  }
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Process Unsuccessful
              </button>
              <button
                onClick={() => setShowUnsuccessfulModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
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

export default AssessmentManagement;
