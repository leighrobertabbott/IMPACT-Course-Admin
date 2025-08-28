import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  FileText, 
  Calendar, 
  Users, 
  Download, 
  Clock, 
  MapPin,
  User,
  Mail,
  Phone,
  Users2,
  Menu,
  X,
  Settings,
  LogOut
} from 'lucide-react';

const FacultyDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [facultyProfile, setFacultyProfile] = useState(null);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [assignedMaterials, setAssignedMaterials] = useState([]);
  const [activeCourses, setActiveCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Function to get workshop groups for display
  const getWorkshopGroups = (subject) => {
    if (!subject.isWorkshopRotation || !subject.rotationSequence || !subject.workshopIndex) {
      return null;
    }

    const groups = ['A', 'B', 'C', 'D'];
    const rotation = subject.rotationSequence - 1; // Convert to 0-based index
    const workshopIndex = subject.workshopIndex - 1; // Convert to 0-based index

    // Calculate which group attends this workshop in this rotation
    const groupIndex = (workshopIndex + rotation) % groups.length;
    return groups[groupIndex];
  };

  useEffect(() => {
    if (currentUser) {
      fetchFacultyProfile();
      fetchAssignedSubjects();
      fetchActiveCourses();
    }
  }, [currentUser]);

  useEffect(() => {
    if (assignedSubjects.length > 0) {
      fetchAllAssignedMaterials();
    }
  }, [assignedSubjects]);

  const fetchFacultyProfile = async () => {
    try {
      const facultySnapshot = await getDocs(
        query(collection(db, 'faculty'), where('email', '==', currentUser.email))
      );
      
      if (!facultySnapshot.empty) {
        const facultyData = facultySnapshot.docs[0].data();
        setFacultyProfile({
          id: facultySnapshot.docs[0].id,
          ...facultyData
        });
      }
    } catch (error) {
      console.error('Error fetching faculty profile:', error);
      toast.error('Failed to load faculty profile');
    }
  };

  const fetchAssignedSubjects = async () => {
    try {
      const subjectsSnapshot = await getDocs(collection(db, 'programmeSubjects'));
      const allSubjects = subjectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter subjects where this faculty member is assigned
      const assigned = allSubjects.filter(subject => 
        subject.assignedFaculty && 
        subject.assignedFaculty.some(faculty => faculty.email === currentUser.email) &&
        !subject.deleted
      );

      setAssignedSubjects(assigned);
    } catch (error) {
      console.error('Error fetching assigned subjects:', error);
      toast.error('Failed to load assigned subjects');
    }
  };

  const fetchActiveCourses = async () => {
    try {
      const coursesSnapshot = await getDocs(
        query(collection(db, 'courses'), where('archived', '==', false))
      );
      const courses = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActiveCourses(courses);
      
      if (courses.length > 0) {
        setSelectedCourse(courses[0]);
      }
    } catch (error) {
      console.error('Error fetching active courses:', error);
      toast.error('Failed to load active courses');
    }
  };

  const fetchAllAssignedMaterials = async () => {
    try {
      // Get all materials for all assigned subjects
      const allMaterials = [];
      
      for (const subject of assignedSubjects) {
        if (subject.assignedMaterials && subject.assignedMaterials.length > 0) {
          allMaterials.push(...subject.assignedMaterials);
        }
      }
      
      // Remove duplicates based on material ID
      const uniqueMaterials = allMaterials.filter((material, index, self) => 
        index === self.findIndex(m => m.id === material.id)
      );
      
      setAssignedMaterials(uniqueMaterials);
    } catch (error) {
      console.error('Error fetching all assigned materials:', error);
    }
  };

  const fetchMaterialsForSubject = async (subjectId) => {
    try {
      const subject = assignedSubjects.find(s => s.id === subjectId);
      if (subject && subject.assignedMaterials) {
        setAssignedMaterials(subject.assignedMaterials);
      }
    } catch (error) {
      console.error('Error fetching materials for subject:', error);
    }
  };

  const downloadMaterial = (material) => {
    const link = document.createElement('a');
    link.href = material.downloadURL;
    link.download = material.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  if (!facultyProfile) {
    return (
      <div className="min-h-screen bg-nhs-light-grey p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-nhs-dark-grey mb-4">Faculty Access</h1>
            <p className="text-nhs-grey">Your faculty profile is being set up. Please contact the course administrator.</p>
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
          <h2 className="text-lg font-semibold text-nhs-blue">Faculty Dashboard</h2>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-nhs-dark-grey mb-2">Faculty Dashboard</h1>
          <p className="text-nhs-grey">Access your assigned subjects and materials</p>
        </div>

        {/* Faculty Profile */}
        <div className="card mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-nhs-blue rounded-full flex items-center justify-center">
              <User className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-nhs-dark-grey">
                {facultyProfile.name}
              </h2>
              <p className="text-nhs-grey">{facultyProfile.role}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-nhs-grey">
                <div className="flex items-center space-x-1">
                  <Mail size={14} />
                  <span>{facultyProfile.email}</span>
                </div>
                {facultyProfile.phone && (
                  <div className="flex items-center space-x-1">
                    <Phone size={14} />
                    <span>{facultyProfile.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Course Selection */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-nhs-dark-grey">Active Course</h3>
            <select
              value={selectedCourse?.id || ''}
              onChange={(e) => {
                const course = activeCourses.find(c => c.id === e.target.value);
                setSelectedCourse(course);
              }}
              className="p-2 border border-gray-300 rounded-md"
            >
              {activeCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} - {course.startDate}
                </option>
              ))}
            </select>
          </div>
          
          {selectedCourse && (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="text-nhs-blue" size={16} />
                <span className="text-sm text-nhs-grey">
                  {selectedCourse.startDate} - {selectedCourse.endDate}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="text-nhs-blue" size={16} />
                <span className="text-sm text-nhs-grey">{selectedCourse.venue}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="text-nhs-blue" size={16} />
                <span className="text-sm text-nhs-grey">
                  {selectedCourse.maxCandidates} candidates
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Assigned Subjects */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-nhs-dark-grey mb-4">Your Assigned Subjects</h3>
          
          {assignedSubjects.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {assignedSubjects
                .filter(subject => !selectedCourse || subject.courseId === selectedCourse.id)
                .map((subject) => (
                  <div key={subject.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-nhs-dark-grey">{subject.name}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            subject.type === 'session' ? 'bg-blue-100 text-blue-800' :
                            subject.type === 'workshop' ? 'bg-green-100 text-green-800' :
                            subject.type === 'practical' ? 'bg-purple-100 text-purple-800' :
                            subject.type === 'break' ? 'bg-yellow-100 text-yellow-800' :
                            subject.type === 'lunch' ? 'bg-orange-100 text-orange-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {subject.type.charAt(0).toUpperCase() + subject.type.slice(1)}
                          </span>
                          {subject.isWorkshopRotation && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              Group {getWorkshopGroups(subject)}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs bg-nhs-blue text-white px-2 py-1 rounded">
                        Day {subject.day}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-nhs-grey">
                        <Clock size={14} />
                        <span>{subject.startTime} - {subject.endTime} ({subject.duration} min)</span>
                      </div>
                      <p className="text-sm text-nhs-grey">{subject.description}</p>
                    </div>

                    {/* Group Rotation Information - Only show for workshop rotation sessions */}
                    {subject.isWorkshopRotation && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Users size={16} className="text-blue-600" />
                          <h5 className="font-medium text-nhs-dark-grey">Group Rotation</h5>
                        </div>
                        <div className="text-sm text-nhs-grey space-y-1">
                          <p><strong>Rotation Sequence:</strong> {subject.rotationSequence}</p>
                          <p><strong>Workshop Position:</strong> {subject.workshopIndex} of {subject.totalWorkshops}</p>
                          <p><strong>Total Rotations:</strong> {subject.totalRotations}</p>
                          <p><strong>Assigned Group:</strong> <span className="font-medium text-blue-600">Group {getWorkshopGroups(subject)}</span></p>
                        </div>
                      </div>
                    )}

                    {/* Materials for this subject */}
                    <div>
                      <h5 className="font-medium text-nhs-dark-grey mb-2">Assigned Materials</h5>
                      {subject.assignedMaterials && subject.assignedMaterials.length > 0 ? (
                        <div className="space-y-2">
                          {subject.assignedMaterials.map((material) => (
                            <div key={material.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-nhs-dark-grey">{material.title}</p>
                                <p className="text-xs text-nhs-grey">{material.fileName}</p>
                              </div>
                              <button
                                onClick={() => downloadMaterial(material)}
                                className="text-nhs-blue hover:text-nhs-dark-blue"
                                title="Download material"
                              >
                                <Download size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-nhs-grey">No materials assigned to this subject</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-nhs-dark-grey mb-2">No Assigned Subjects</h3>
              <p className="text-nhs-grey">You haven't been assigned to any subjects yet.</p>
            </div>
          )}
        </div>

        {/* All Available Materials */}
        <div className="card">
          <h3 className="text-lg font-semibold text-nhs-dark-grey mb-4">All Course Materials</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {assignedMaterials.map((material) => (
              <div key={material.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-nhs-dark-grey">{material.title}</h4>
                    <p className="text-sm text-nhs-grey">{material.fileName}</p>
                  </div>
                  <button
                    onClick={() => downloadMaterial(material)}
                    className="text-nhs-blue hover:text-nhs-dark-blue ml-2"
                    title="Download material"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {assignedMaterials.length === 0 && (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-nhs-grey">No materials available for your assigned subjects.</p>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
