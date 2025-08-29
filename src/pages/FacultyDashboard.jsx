import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
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
  LogOut,
  Heart,
  MessageSquare,
  Star,
  Award,
  CheckCircle,
  AlertCircle
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
  
  // Mentor-specific state
  const [mentorAssignments, setMentorAssignments] = useState([]);
  const [assignedMentees, setAssignedMentees] = useState([]);
  const [showMentorPreferences, setShowMentorPreferences] = useState(false);
  const [mentorPreferences, setMentorPreferences] = useState({
    isMentor: false,
    preferredGroups: [],
    maxMentees: 8,
    specialties: [],
    availability: {
      day1: true,
      day2: true
    }
  });

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
      const loadData = async () => {
        try {
          await Promise.all([
            fetchFacultyProfile(),
            fetchAssignedSubjects(),
            fetchActiveCourses(),
            fetchMentorData()
          ]);
        } finally {
          setLoading(false);
        }
      };
      loadData();
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
        
        // Set mentor preferences if they exist
        if (facultyData.mentorPreferences) {
          setMentorPreferences(facultyData.mentorPreferences);
        }
      }
    } catch (error) {
      console.error('Error fetching faculty profile:', error);
      toast.error('Failed to load faculty profile');
    }
  };

  const fetchMentorData = async () => {
    try {
      // Fetch mentor assignments for this faculty member
      const coursesSnapshot = await getDocs(
        query(collection(db, 'courses'), where('archived', '==', false))
      );
      
      const mentorAssignments = [];
      const mentees = [];
      
      for (const courseDoc of coursesSnapshot.docs) {
        const courseData = courseDoc.data();
        if (courseData.mentorAssignments) {
          // Check if this faculty is assigned as a mentor for any group
          Object.entries(courseData.mentorAssignments).forEach(([group, assignment]) => {
            if (assignment.facultyId === facultyProfile?.id) {
              mentorAssignments.push({
                courseId: courseDoc.id,
                courseName: courseData.name,
                group: group,
                ...assignment
              });
              
              // Fetch mentees for this group
              fetchMenteesForGroup(courseDoc.id, group, mentees);
            }
          });
        }
      }
      
      setMentorAssignments(mentorAssignments);
      setAssignedMentees(mentees);
    } catch (error) {
      console.error('Error fetching mentor data:', error);
    }
  };

  const fetchMenteesForGroup = async (courseId, group, menteesArray) => {
    try {
      // Fetch candidates assigned to this group for this course
      const candidatesSnapshot = await getDocs(
        query(collection(db, 'candidates'), 
          where('courseId', '==', courseId),
          where('groupAssignment', '==', group)
        )
      );
      
      candidatesSnapshot.docs.forEach(doc => {
        menteesArray.push({
          id: doc.id,
          ...doc.data()
        });
      });
    } catch (error) {
      console.error('Error fetching mentees:', error);
    }
  };

  const updateMentorPreferences = async () => {
    try {
      if (!facultyProfile) return;
      
      await updateDoc(doc(db, 'faculty', facultyProfile.id), {
        mentorPreferences: mentorPreferences
      });
      
      toast.success('Mentor preferences updated successfully');
      setShowMentorPreferences(false);
    } catch (error) {
      console.error('Error updating mentor preferences:', error);
      toast.error('Failed to update mentor preferences');
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
            <div className="px-3 py-2 text-xs font-semibold text-nhs-grey uppercase tracking-wider">
              Faculty Tools
            </div>
            <div className="px-3 py-2 text-sm text-nhs-grey">
              <div className="flex items-center space-x-2">
                <User size={16} />
                <span>{facultyProfile?.name || 'Faculty Member'}</span>
              </div>
              <div className="text-xs mt-1">{facultyProfile?.email}</div>
            </div>
            
            {/* Mentor Status */}
            {mentorPreferences.isMentor && (
              <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 text-green-700">
                  <Heart size={16} />
                  <span className="text-xs font-medium">Mentor</span>
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {mentorAssignments.length > 0 ? 
                    `Assigned to ${mentorAssignments.length} group(s)` : 
                    'Available for assignment'
                  }
                </div>
              </div>
            )}
            
            <div className="border-t border-nhs-pale-grey my-2"></div>
            
            {/* Mentor Preferences Button */}
            <button
              onClick={() => setShowMentorPreferences(true)}
              className="sidebar-item w-full text-left"
            >
              <Heart size={20} />
              <span>Mentor Preferences</span>
            </button>
            
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
              <div className="flex-1">
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
              
              {/* Mentor Badge */}
              {mentorPreferences.isMentor && (
                <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  <Heart size={16} />
                  <span className="text-sm font-medium">Mentor</span>
                </div>
              )}
            </div>
          </div>

          {/* Mentor Section */}
          {mentorPreferences.isMentor && mentorAssignments.length > 0 && (
            <div className="card mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-nhs-dark-grey flex items-center space-x-2">
                  <Heart className="text-green-600" size={20} />
                  <span>Mentor Assignments</span>
                </h3>
                <span className="text-sm text-nhs-grey">
                  {assignedMentees.length} mentees assigned
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {mentorAssignments.map((assignment) => (
                  <div key={`${assignment.courseId}-${assignment.group}`} className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-nhs-dark-grey">
                        Group {assignment.group}
                      </h4>
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                        {assignment.courseName}
                      </span>
                    </div>
                    <p className="text-sm text-nhs-grey mb-3">
                      Course: {assignment.courseName}
                    </p>
                    
                    {/* Mentees in this group */}
                    <div>
                      <h5 className="text-sm font-medium text-nhs-dark-grey mb-2">Your Mentees:</h5>
                      {assignedMentees.filter(mentee => 
                        mentee.courseId === assignment.courseId && 
                        mentee.groupAssignment === assignment.group
                      ).map((mentee) => (
                        <div key={mentee.id} className="flex items-center space-x-2 text-sm text-nhs-grey mb-1">
                          <User size={14} />
                          <span>{mentee.firstName} {mentee.surname}</span>
                          <span className="text-xs">({mentee.grade})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

      {/* Mentor Preferences Modal */}
      {showMentorPreferences && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-nhs-dark-grey">Mentor Preferences</h3>
              <button
                onClick={() => setShowMentorPreferences(false)}
                className="text-nhs-grey hover:text-nhs-dark-grey"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={mentorPreferences.isMentor}
                    onChange={(e) => setMentorPreferences(prev => ({
                      ...prev,
                      isMentor: e.target.checked
                    }))}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-nhs-dark-grey">
                    I would like to be a mentor
                  </span>
                </label>
              </div>
              
              {mentorPreferences.isMentor && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                      Preferred Groups
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['A', 'B', 'C', 'D'].map((group) => (
                        <label key={group} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={mentorPreferences.preferredGroups.includes(group)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setMentorPreferences(prev => ({
                                  ...prev,
                                  preferredGroups: [...prev.preferredGroups, group]
                                }));
                              } else {
                                setMentorPreferences(prev => ({
                                  ...prev,
                                  preferredGroups: prev.preferredGroups.filter(g => g !== group)
                                }));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm text-nhs-grey">Group {group}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                      Maximum Number of Mentees
                    </label>
                    <select
                      value={mentorPreferences.maxMentees}
                      onChange={(e) => setMentorPreferences(prev => ({
                        ...prev,
                        maxMentees: parseInt(e.target.value)
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value={4}>4 mentees</option>
                      <option value={6}>6 mentees</option>
                      <option value={8}>8 mentees</option>
                      <option value={10}>10 mentees</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                      Availability
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={mentorPreferences.availability.day1}
                          onChange={(e) => setMentorPreferences(prev => ({
                            ...prev,
                            availability: {
                              ...prev.availability,
                              day1: e.target.checked
                            }
                          }))}
                          className="rounded"
                        />
                        <span className="text-sm text-nhs-grey">Day 1</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={mentorPreferences.availability.day2}
                          onChange={(e) => setMentorPreferences(prev => ({
                            ...prev,
                            availability: {
                              ...prev.availability,
                              day2: e.target.checked
                            }
                          }))}
                          className="rounded"
                        />
                        <span className="text-sm text-nhs-grey">Day 2</span>
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowMentorPreferences(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-nhs-grey hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={updateMentorPreferences}
                className="flex-1 px-4 py-2 bg-nhs-blue text-white rounded-md hover:bg-nhs-dark-blue"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
