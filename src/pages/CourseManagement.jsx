import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, query, orderBy, where, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Link } from 'react-router-dom';
import { db, storage } from '../firebase/config';
import { cloudFunctions, downloadCSV, downloadJSON } from '../utils/cloudFunctions';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  Users, 
  FileText, 
  Mail, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  Plus,
  Settings,
  BookOpen,
  Award,
  MapPin,
  Phone,
  UserCheck,
  FileCheck,
  Send,
  RefreshCw,
  Upload,
  X,
  Edit,
  Trash2,
  Archive,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Users2,
  Save,
  Activity,
  Menu,
  Home,
  BarChart3,
  MessageSquare,
  FolderOpen,
  CreditCard,
  Building2
} from 'lucide-react';
import ProgrammeBuilderModal from '../components/ProgrammeBuilderModal';
import FacultyManagementModal from '../components/FacultyManagementModal';
import ProspectusGenerator from '../components/ProspectusGenerator';

const CourseManagement = () => {
  // Navigation state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [courseData, setCourseData] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeline, setTimeline] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [emailType, setEmailType] = useState('welcome');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailLog, setEmailLog] = useState([]);
  
  // New state for faculty and materials
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const [showUploadMaterialsModal, setShowUploadMaterialsModal] = useState(false);
  const [showProspectusGenerator, setShowProspectusGenerator] = useState(false);
  const [materialsForm, setMaterialsForm] = useState({
    title: '',
    description: '',
    file: null
  });
  const [courseMaterials, setCourseMaterials] = useState([]);

  // Predefined workshop subjects for rotation
  const predefinedWorkshopSubjects = [
    'Triage and Resource Management',
    'Airway Management',
    'Cardiac Arrest Management',
    'Trauma Assessment',
    'Medical Emergencies',
    'Paediatric Emergencies',
    'Obstetric Emergencies',
    'Mental Health Crisis',
    'Communication Skills',
    'Team Leadership'
  ];

  // Predefined practical subjects for practical sessions
  const predefinedPracticalSubjects = [
    'Central Venous Cannulation',
    'Thoracocentesis',
    'Lumbar Puncture',
    'Arterial Line Insertion',
    'Chest Drain Insertion',
    'Endotracheal Intubation',
    'Supraglottic Airway Insertion',
    'Needle Cricothyroidotomy',
    'Pleural Aspiration',
    'Abdominal Paracentesis',
    'Joint Aspiration',
    'Pericardiocentesis',
    'Nasogastric Tube Insertion',
    'Urinary Catheterisation',
    'Peripheral IV Cannulation',
    'Blood Gas Sampling'
  ];

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

  // New state for programme building
  const [programmeSubjects, setProgrammeSubjects] = useState([]);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showAssignFacultyModal, setShowAssignFacultyModal] = useState(false);
  const [showAssignMaterialsModal, setShowAssignMaterialsModal] = useState(false);
  const [showAssignStationFacultyModal, setShowAssignStationFacultyModal] = useState(false);
  const [showAssignConcurrentFacultyModal, setShowAssignConcurrentFacultyModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedStationIndex, setSelectedStationIndex] = useState(null);
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    type: 'session', // session, workshop, practical, assessment, break, lunch, assessment, practical-session
    duration: 30,
    description: '',
    day: 1,
    startTime: '09:00',
    endTime: '09:30',
    // Workshop rotation fields
    isWorkshopRotation: false,
    numberOfWorkshops: 4,
    workshopDuration: 30,
    numberOfRotations: 4,
    selectedWorkshopSubjects: [],
    // Scenario practice and practical session fields
    numberOfStations: 4,
    numberOfTimeSlots: 4,
    timeSlotDuration: 30,
    stationNames: [],
    // Concurrent activity fields for scenario practice
    concurrentActivityName: '',
    scenarioCandidatesFirst: '',
    concurrentCandidatesFirst: '',
    scenarioCandidatesSecond: '',
    concurrentCandidatesSecond: ''
  });



  // New state for course management
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showCourseSettingsModal, setShowCourseSettingsModal] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newCourseForm, setNewCourseForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    venue: '',
    maxCandidates: 20,
    courseCost: '',
    eLearningUrl: '',
    description: ''
  });
  const [courseSettings, setCourseSettings] = useState({
    startDate: '',
    endDate: '',
    venue: '',
    maxCandidates: 20,
    courseCost: '',
    eLearningUrl: '',
    description: ''
  });

  // New state for programme templates
  const [programmeTemplates, setProgrammeTemplates] = useState([]);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [showProgrammeTemplateModal, setShowProgrammeTemplateModal] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    subjects: []
  });

  useEffect(() => {
    fetchAllCourses();
    fetchCourseData();
    fetchCandidates();
    fetchFaculty();
    fetchCourseMaterials();
    fetchProgrammeSubjects();
    fetchProgrammeTemplates();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      generateTimeline();
      fetchCandidates(); // Refresh candidates when course changes
      fetchProgrammeSubjects(); // Refresh programme subjects when course changes
    }
  }, [selectedCourse]);

  const fetchAllCourses = async () => {
    try {
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllCourses(coursesData);
      
      // Set the most recent active course as selected
      const activeCourse = coursesData.find(c => !c.archived) || coursesData[0];
      setSelectedCourse(activeCourse);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchCourseData = async () => {
    try {
      const courseSnapshot = await getDocs(collection(db, 'courses'));
      if (!courseSnapshot.empty) {
        const courseDoc = courseSnapshot.docs[0];
        setCourseData({ id: courseDoc.id, ...courseDoc.data() });
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast.error('Failed to fetch course data');
    }
  };

  const fetchCandidates = async () => {
    try {
      const q = query(collection(db, 'candidates'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const candidatesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter out rejected candidates from active course statistics
      const activeCandidates = candidatesData.filter(candidate => 
        candidate.status !== 'Rejected' && 
        candidate.status !== 'Unsuccessful' &&
        (!candidate.courseId || candidate.courseId === selectedCourse?.id)
      );
      
      setCandidates(activeCandidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to fetch candidates');
    }
  };

  const fetchFaculty = async () => {
    try {
      const facultySnapshot = await getDocs(collection(db, 'faculty'));
      const facultyData = facultySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Filter out deleted faculty members
      const activeFaculty = facultyData.filter(f => !f.deleted);
      setFaculty(activeFaculty);
    } catch (error) {
      console.error('Error fetching faculty:', error);
      // Don't show error toast for permission issues during initial load
      if (error.code !== 'permission-denied') {
        toast.error('Failed to fetch faculty data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseMaterials = async () => {
    try {
      const materialsSnapshot = await getDocs(collection(db, 'courseMaterials'));
      const materialsData = materialsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCourseMaterials(materialsData);
    } catch (error) {
      console.error('Error fetching course materials:', error);
      // Don't show error toast for permission issues during initial load
      if (error.code !== 'permission-denied') {
        toast.error('Failed to fetch course materials');
      }
    }
  };

  const createNewCourse = async () => {
    try {
      if (!newCourseForm.name || !newCourseForm.startDate || !newCourseForm.venue) {
        toast.error('Please fill in all required fields');
        return;
      }

      const courseData = {
        ...newCourseForm,
        status: 'active',
        archived: false,
        createdAt: new Date(),
        candidateCount: 0
      };

      await addDoc(collection(db, 'courses'), courseData);

      toast.success('New course created successfully');
      setShowNewCourseModal(false);
      setNewCourseForm({
        name: '',
        startDate: '',
        endDate: '',
        venue: '',
        maxCandidates: 20,
        courseCost: '',
        eLearningUrl: '',
        description: ''
      });
      fetchAllCourses();
    } catch (error) {
      console.error('Error creating new course:', error);
      toast.error('Failed to create new course');
    }
  };

  const archiveCurrentCourse = async () => {
    try {
      if (!selectedCourse) {
        toast.error('No course selected');
        return;
      }

      await updateDoc(doc(db, 'courses', selectedCourse.id), {
        archived: true,
        archivedAt: new Date(),
        status: 'completed'
      });

      toast.success('Course archived successfully');
      setShowArchiveModal(false);
      fetchAllCourses();
    } catch (error) {
      console.error('Error archiving course:', error);
      toast.error('Failed to archive course');
    }
  };

  const updateCourseSettings = async () => {
    try {
      if (!selectedCourse) {
        toast.error('No course selected');
        return;
      }

      // Filter out undefined, null, and empty string values to prevent Firestore errors
      const cleanSettings = {};
      Object.entries(courseSettings).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Handle numeric fields
          if (key === 'maxCandidates') {
            const numValue = parseInt(value);
            if (!isNaN(numValue) && numValue > 0) {
              cleanSettings[key] = numValue;
            }
          } else {
            cleanSettings[key] = value;
          }
        }
      });

      // Only update if there are valid settings to update
      if (Object.keys(cleanSettings).length === 0) {
        toast.error('No valid settings to update');
        return;
      }

      // Add debugging to see what we're trying to update
      console.log('Updating course settings:', cleanSettings);

      await updateDoc(doc(db, 'courses', selectedCourse.id), {
        ...cleanSettings,
        updatedAt: new Date()
      });

      toast.success('Course settings updated successfully');
      setShowCourseSettingsModal(false);
      fetchAllCourses();
    } catch (error) {
      console.error('Error updating course settings:', error);
      console.error('Course settings that caused the error:', courseSettings);
      console.error('Clean settings that were attempted:', cleanSettings);
      toast.error('Failed to update course settings');
    }
  };

  const switchCourse = (course) => {
    setSelectedCourse(course);
    setCourseData(course);
  };

  const generateTimeline = () => {
    if (!selectedCourse) return;
    
    const startDate = new Date(selectedCourse.startDate);
    const timeline = [
      { date: 'T-30 days', task: 'Course announcement and applications open', status: 'completed' },
      { date: 'T-21 days', task: 'Payment deadline for early registration', status: 'completed' },
      { date: 'T-14 days', task: 'E-learning access provided to confirmed candidates', status: 'pending' },
      { date: 'T-7 days', task: 'Final course reminders and logistics', status: 'pending' },
      { date: 'T-3 days', task: 'Faculty briefing and materials preparation', status: 'pending' },
      { date: 'T-1 day', task: 'Final venue setup and candidate check-in', status: 'pending' },
      { date: 'Course Day 1', task: 'IMPACT Course Day 1', status: 'pending' },
      { date: 'Course Day 2', task: 'IMPACT Course Day 2', status: 'pending' },
      { date: 'T+7 days', task: 'Assessment completion and certificate generation', status: 'pending' }
    ];
    setTimeline(timeline);
  };

  const handleFacultyUpdate = () => {
    fetchFaculty();
  };

  const deleteFacultyMember = async (facultyId) => {
    try {
      await updateDoc(doc(db, 'faculty', facultyId), {
        deleted: true,
        deletedAt: new Date()
      });

      toast.success('Faculty member removed successfully');
      fetchFaculty();
    } catch (error) {
      console.error('Error removing faculty member:', error);
      toast.error('Failed to remove faculty member');
    }
  };

  const uploadCourseMaterial = async () => {
    try {
      if (!materialsForm.title || !materialsForm.file) {
        toast.error('Please provide a title and select a file');
        return;
      }

      const file = materialsForm.file;
      const storageRef = ref(storage, `course-materials/${Date.now()}-${file.name}`);
      
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      await addDoc(collection(db, 'courseMaterials'), {
        title: materialsForm.title,
        description: materialsForm.description,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        downloadURL,
        uploadedAt: new Date()
      });

      toast.success('Course material uploaded successfully');
      setShowUploadMaterialsModal(false);
      setMaterialsForm({ title: '', description: '', file: null });
      fetchCourseMaterials();
    } catch (error) {
      console.error('Error uploading course material:', error);
      toast.error('Failed to upload course material');
    }
  };

  const deleteCourseMaterial = async (materialId) => {
    try {
      await updateDoc(doc(db, 'courseMaterials', materialId), {
        deleted: true,
        deletedAt: new Date()
      });

      toast.success('Course material removed successfully');
      fetchCourseMaterials();
    } catch (error) {
      console.error('Error removing course material:', error);
      toast.error('Failed to remove course material');
    }
  };

  const sendAutomatedEmails = async (emailType) => {
    try {
      const eligibleCandidates = candidates.filter(c => {
        // Exclude rejected and unsuccessful candidates from all email communications
        if (c.status === 'Rejected' || c.status === 'Unsuccessful') {
          return false;
        }
        
        switch (emailType) {
          case 'welcome':
            return c.status === 'Live Candidate';
          case 'payment-reminder':
            return c.status === 'Pending Payment';
          case 'e-learning-reminder':
            return c.status === 'Paid in Full' || c.status === 'Live Candidate';
          case 'course-reminder':
            return c.status === 'Live Candidate';
          default:
            return false;
        }
      });

      if (eligibleCandidates.length === 0) {
        toast.error('No eligible candidates found for this email type');
        return;
      }

      const candidateIds = eligibleCandidates.map(c => c.id);
      const result = await cloudFunctions.sendBulkEmails(emailType, candidateIds);
      
      if (result && result.success) {
        const logEntry = {
          timestamp: new Date(),
          emailType,
          recipients: result.results ? result.results.length : candidateIds.length,
          success: result.results ? result.results.filter(r => r.success).length : candidateIds.length,
          failed: result.results ? result.results.filter(r => !r.success).length : 0
        };
        
        setEmailLog(prev => [logEntry, ...prev]);
        toast.success(`Emails sent to ${candidateIds.length} candidates`);
      } else {
        toast.error('Failed to send emails');
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      toast.error('Failed to send emails');
    }
  };

  const generateCourseReport = async () => {
    try {
      const result = await cloudFunctions.exportCandidateData('all', 'json');
      
      if (result.success) {
        const report = {
          activeCandidates: candidates.length,
          pendingPayment: candidates.filter(c => c.status === 'Pending Payment').length,
          paidInFull: candidates.filter(c => c.status === 'Paid in Full').length,
          liveCandidates: candidates.filter(c => c.status === 'Live Candidate').length,
          facultyCount: faculty.length,
          courseDate: courseData?.startDate,
          venue: courseData?.venue,
          generatedAt: new Date().toISOString(),
          candidates: result.data,
          note: 'This report excludes rejected and unsuccessful candidates'
        };

        const filename = `impact-course-report-${new Date().toISOString().split('T')[0]}.json`;
        downloadJSON(report, filename);
        toast.success('Course report generated successfully');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate course report');
    }
  };

  const checkElearningProgress = async () => {
    try {
      const liveCandidates = candidates.filter(c => 
        c.status === 'Live Candidate' && 
        c.status !== 'Rejected' && 
        c.status !== 'Unsuccessful'
      );
      const incompleteElearning = liveCandidates.filter(c => c.eLearningStatus !== 'Pass');
      
      if (incompleteElearning.length > 0) {
        toast.warning(`${incompleteElearning.length} candidates have not completed e-learning`);
        // Send reminder emails to incomplete candidates
        const candidateIds = incompleteElearning.map(c => c.id);
        await cloudFunctions.sendBulkEmails('e-learning-reminder', candidateIds);
        toast.success('E-learning reminders sent');
      } else {
        toast.success('All live candidates have completed e-learning');
      }
    } catch (error) {
      console.error('Error checking e-learning progress:', error);
      toast.error('Failed to check e-learning progress');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'pending':
        return <Clock className="text-orange-500" size={16} />;
      case 'overdue':
        return <AlertCircle className="text-red-500" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  const handleCandidateSelection = (candidate) => {
    setSelectedCandidates(prev => {
      const isSelected = prev.find(c => c.id === candidate.id);
      if (isSelected) {
        return prev.filter(c => c.id !== candidate.id);
      } else {
        return [...prev, candidate];
      }
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMaterialsForm(prev => ({ ...prev, file }));
    }
  };



  const rejectCandidate = async (candidateId, reason) => {
    try {
      const candidate = candidates.find(c => c.id === candidateId);
      if (!candidate) {
        toast.error('Candidate not found');
        return;
      }

      // Move candidate to unsuccessful candidates collection
      await addDoc(collection(db, 'unsuccessfulCandidates'), {
        ...candidate,
        rejectionReason: reason,
        rejectedAt: new Date(),
        originalCourseId: selectedCourse?.id,
        originalCourseName: selectedCourse?.name
      });

      // Update candidate status to rejected
      await updateDoc(doc(db, 'candidates', candidateId), {
        status: 'Rejected',
        rejectedAt: new Date(),
        rejectionReason: reason
      });

      toast.success('Candidate rejected and moved to historical records');
      fetchCandidates(); // Refresh the candidates list
    } catch (error) {
      console.error('Error rejecting candidate:', error);
      toast.error('Failed to reject candidate');
    }
  };

  // Programme Building Functions
  const fetchProgrammeSubjects = async () => {
    try {
      if (!selectedCourse) return;
      
      const subjectsSnapshot = await getDocs(collection(db, 'programmeSubjects'));
      const subjectsData = subjectsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(subject => subject.courseId === selectedCourse.id && !subject.deleted);
      
      setProgrammeSubjects(subjectsData);
    } catch (error) {
      console.error('Error fetching programme subjects:', error);
    }
  };

  const addProgrammeSubject = async () => {
    try {
      if (!selectedCourse) {
        toast.error('No course selected');
        return;
      }

      if (!subjectForm.name || !subjectForm.type) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Handle workshop rotation
      if (subjectForm.type === 'workshop' && subjectForm.isWorkshopRotation) {
        if (subjectForm.selectedWorkshopSubjects.filter(s => s.trim() !== '').length !== subjectForm.numberOfWorkshops) {
          toast.error('Please select all workshop subjects');
          return;
        }

        // Get all existing workshop rotation subjects for this course
        const existingWorkshopSubjects = programmeSubjects.filter(s => s.isWorkshopRotation && s.courseId === selectedCourse.id);
        
        // Track which groups have completed which workshops
        const groupProgress = {
          'A': new Set(),
          'B': new Set(),
          'C': new Set(),
          'D': new Set()
        };

        // Build group progress from existing workshop subjects
        // Track by workshop name only - groups shouldn't do the same workshop twice regardless of time
        existingWorkshopSubjects.forEach(subject => {
          if (subject.rotationSchedule) {
            subject.rotationSchedule.forEach(schedule => {
              // Handle both individual groups and combined groups
              if (schedule.groups) {
                // New format with groups array
                schedule.groups.forEach(group => {
                  groupProgress[group].add(subject.name);
                });
              } else {
                // Legacy format - check if it's a combined group
                if (schedule.group.includes('+')) {
                  // Combined group format (e.g., "A+B")
                  schedule.group.split('+').forEach(group => {
                    groupProgress[group].add(subject.name);
                  });
                } else {
                  // Single group
                  groupProgress[schedule.group].add(subject.name);
                }
              }
            });
          }
        });

        // Allow the same workshop names to be added multiple times for different time slots
        // Instead of checking for existing names, we'll create new workshop subjects for all selected workshops
        const newWorkshopNames = subjectForm.selectedWorkshopSubjects.filter(name => name.trim() !== '');
        
        if (newWorkshopNames.length === 0) {
          toast.error('Please select at least one workshop subject');
          return;
        }

        // Create workshop subjects (one for each new workshop type)
        const groups = ['A', 'B', 'C', 'D'];
        let rotationSequence = 1;

        // Find the highest rotation sequence in existing subjects
        if (existingWorkshopSubjects.length > 0) {
          const maxRotation = Math.max(...existingWorkshopSubjects.map(s => s.rotationSequence || 0));
          rotationSequence = maxRotation + 1;
        }

        // Create one subject for each new workshop type
        for (let workshopIndex = 0; workshopIndex < newWorkshopNames.length; workshopIndex++) {
          const workshopName = newWorkshopNames[workshopIndex];
          
          // Find groups that haven't done this workshop yet (regardless of time)
          const availableGroups = groups.filter(group => !groupProgress[group].has(workshopName));
          
          if (availableGroups.length === 0) {
            toast.error(`All groups have already completed workshop: ${workshopName}`);
            continue;
          }

          // Create rotation schedule for this workshop
          const rotationSchedule = [];
          
          // If we have fewer workshops than groups, combine groups
          const shouldCombineGroups = newWorkshopNames.length < groups.length;
          
          if (shouldCombineGroups) {
            // Calculate how many groups should be combined
            const groupsPerWorkshop = Math.ceil(groups.length / newWorkshopNames.length);
            
            for (let rotationIndex = 0; rotationIndex < subjectForm.numberOfRotations; rotationIndex++) {
              const startGroupIndex = (rotationIndex * groupsPerWorkshop) % availableGroups.length;
              const endGroupIndex = Math.min(startGroupIndex + groupsPerWorkshop, availableGroups.length);
              const combinedGroups = availableGroups.slice(startGroupIndex, endGroupIndex);
              
              rotationSchedule.push({
                rotation: rotationIndex + 1,
                group: combinedGroups.join('+'), // Combine groups with '+'
                groups: combinedGroups, // Store individual groups for reference
                timeSlot: `${subjectForm.startTime} + ${rotationIndex * subjectForm.workshopDuration} minutes`
              });
            }
          } else {
            // Standard rotation - one group per rotation
            for (let rotationIndex = 0; rotationIndex < subjectForm.numberOfRotations; rotationIndex++) {
              const groupIndex = rotationIndex % availableGroups.length;
              const group = availableGroups[groupIndex];
              
              rotationSchedule.push({
                rotation: rotationIndex + 1,
                group: group,
                groups: [group], // Store as array for consistency
                timeSlot: `${subjectForm.startTime} + ${rotationIndex * subjectForm.workshopDuration} minutes`
              });
            }
          }

          const workshopSubjectData = {
            name: workshopName,
            type: 'workshop',
            duration: subjectForm.workshopDuration,
            description: `Workshop: ${workshopName} - Groups rotate through this workshop`,
            day: subjectForm.day,
            startTime: subjectForm.startTime,
            endTime: subjectForm.endTime,
            courseId: selectedCourse.id,
            courseName: selectedCourse.name,
            createdAt: new Date(),
            assignedFaculty: [],
            assignedMaterials: [],
            isWorkshopRotation: true,
            rotationSequence: rotationSequence,
            workshopIndex: existingWorkshopSubjects.length + workshopIndex + 1,
            totalWorkshops: existingWorkshopSubjects.length + newWorkshopNames.length,
            totalRotations: subjectForm.numberOfRotations,
            rotationSchedule: rotationSchedule,
            // Track which groups have completed this workshop
            completedGroups: rotationSchedule.map(schedule => schedule.groups || [schedule.group]).flat()
          };

          await addDoc(collection(db, 'programmeSubjects'), workshopSubjectData);
        }

        toast.success(`${newWorkshopNames.length} new workshop subjects created with group rotation schedule`);
      } else if (subjectForm.type === 'assessment') {
        // Handle assessment session
        const assessmentSessionData = {
          name: subjectForm.name,
          type: 'assessment',
          duration: subjectForm.timeSlotDuration * subjectForm.numberOfTimeSlots,
          description: `Assessment: ${subjectForm.numberOfStations} stations, ${subjectForm.numberOfTimeSlots} time slots`,
          day: subjectForm.day,
          startTime: subjectForm.startTime,
          endTime: subjectForm.endTime,
          courseId: selectedCourse.id,
          courseName: selectedCourse.name,
          createdAt: new Date(),
          assignedFaculty: [],
          assignedMaterials: [],
          isAssessment: true,
          numberOfStations: subjectForm.numberOfStations,
          numberOfTimeSlots: subjectForm.numberOfTimeSlots,
          timeSlotDuration: subjectForm.timeSlotDuration,
          // Concurrent activity information
          concurrentActivityName: subjectForm.concurrentActivityName || null,
          scenarioCandidatesFirst: subjectForm.scenarioCandidatesFirst || null,
          concurrentCandidatesFirst: subjectForm.concurrentCandidatesFirst || null,
          scenarioCandidatesSecond: subjectForm.scenarioCandidatesSecond || null,
          concurrentCandidatesSecond: subjectForm.concurrentCandidatesSecond || null
        };

        await addDoc(collection(db, 'programmeSubjects'), assessmentSessionData);
        toast.success('Assessment session added to programme successfully');

      } else if (subjectForm.type === 'scenario-practice') {
        // Handle scenario practice session
        const scenarioPracticeData = {
          name: subjectForm.name,
          type: 'scenario-practice',
          duration: subjectForm.timeSlotDuration * subjectForm.numberOfTimeSlots,
          description: `Scenario Practice: ${subjectForm.numberOfStations} stations, ${subjectForm.numberOfTimeSlots} time slots`,
          day: subjectForm.day,
          startTime: subjectForm.startTime,
          endTime: subjectForm.endTime,
          courseId: selectedCourse.id,
          courseName: selectedCourse.name,
          createdAt: new Date(),
          assignedFaculty: [],
          assignedMaterials: [],
          isScenarioPractice: true,
          numberOfStations: subjectForm.numberOfStations,
          numberOfTimeSlots: subjectForm.numberOfTimeSlots,
          timeSlotDuration: subjectForm.timeSlotDuration,
          stationFaculty: subjectForm.stationFaculty || [],
          stationRooms: subjectForm.stationRooms || []
        };

        await addDoc(collection(db, 'programmeSubjects'), scenarioPracticeData);
        toast.success('Scenario Practice session added to programme successfully');
      } else if (subjectForm.type === 'practical-session') {
        // Handle practical session
        const practicalSessionData = {
          name: subjectForm.name,
          type: 'practical-session',
          duration: subjectForm.timeSlotDuration * subjectForm.numberOfTimeSlots,
          description: `Practical Skills: ${subjectForm.numberOfStations} stations, ${subjectForm.numberOfTimeSlots} time slots`,
          day: subjectForm.day,
          startTime: subjectForm.startTime,
          endTime: subjectForm.endTime,
          courseId: selectedCourse.id,
          courseName: selectedCourse.name,
          createdAt: new Date(),
          assignedFaculty: [],
          assignedMaterials: [],
          isPracticalSession: true,
          numberOfStations: subjectForm.numberOfStations,
          numberOfTimeSlots: subjectForm.numberOfTimeSlots,
          timeSlotDuration: subjectForm.timeSlotDuration,
          stationNames: subjectForm.stationNames
        };

        await addDoc(collection(db, 'programmeSubjects'), practicalSessionData);
        toast.success('Practical session added to programme successfully');
      } else {
        // Regular subject
        const subjectData = {
          ...subjectForm,
          courseId: selectedCourse.id,
          courseName: selectedCourse.name,
          createdAt: new Date(),
          assignedFaculty: [],
          assignedMaterials: []
        };

        await addDoc(collection(db, 'programmeSubjects'), subjectData);
        toast.success('Subject added to programme successfully');
      }

      setShowAddSubjectModal(false);
      setSubjectForm({
        name: '',
        type: 'session',
        duration: 30,
        description: '',
        day: 1,
        startTime: '09:00',
        endTime: '09:30',
        isWorkshopRotation: false,
        numberOfWorkshops: 4,
        workshopDuration: 30,
        numberOfRotations: 4,
        selectedWorkshopSubjects: [],
        numberOfStations: 4,
        numberOfTimeSlots: 4,
        timeSlotDuration: 30,
        stationNames: [],
        // Concurrent activity fields for scenario practice
        concurrentActivityName: '',
        scenarioCandidatesFirst: '',
        concurrentCandidatesFirst: '',
        scenarioCandidatesSecond: '',
        concurrentCandidatesSecond: ''
      });
      fetchProgrammeSubjects();
    } catch (error) {
      console.error('Error adding programme subject:', error);
      toast.error('Failed to add subject to programme');
    }
  };

  // Enhanced workshop rotation functions


  const assignFacultyToSubject = async (subjectId, facultyId) => {
    try {
      const subject = programmeSubjects.find(s => s.id === subjectId);
      const facultyMember = faculty.find(f => f.id === facultyId);
      
      if (!subject || !facultyMember) {
        toast.error('Subject or faculty member not found');
        return;
      }

      const updatedFaculty = subject.assignedFaculty || [];
      const isAlreadyAssigned = updatedFaculty.find(f => f.id === facultyId);
      
      if (isAlreadyAssigned) {
        toast.error('Faculty member already assigned to this subject');
        return;
      }

      await updateDoc(doc(db, 'programmeSubjects', subjectId), {
        assignedFaculty: [...updatedFaculty, {
          id: facultyMember.id,
          name: facultyMember.name,
          role: facultyMember.role,
          email: facultyMember.email
        }]
      });

      toast.success('Faculty member assigned successfully');
      fetchProgrammeSubjects();
    } catch (error) {
      console.error('Error assigning faculty:', error);
      toast.error('Failed to assign faculty member');
    }
  };

  const removeFacultyFromSubject = async (subjectId, facultyId) => {
    try {
      const subject = programmeSubjects.find(s => s.id === subjectId);
      if (!subject) {
        toast.error('Subject not found');
        return;
      }

      const updatedFaculty = (subject.assignedFaculty || []).filter(f => f.id !== facultyId);

      await updateDoc(doc(db, 'programmeSubjects', subjectId), {
        assignedFaculty: updatedFaculty
      });

      toast.success('Faculty member removed from subject');
      fetchProgrammeSubjects();
    } catch (error) {
      console.error('Error removing faculty:', error);
      toast.error('Failed to remove faculty member');
    }
  };

  const assignMaterialToSubject = async (subjectId, materialId) => {
    try {
      const subject = programmeSubjects.find(s => s.id === subjectId);
      const material = courseMaterials.find(m => m.id === materialId);
      
      if (!subject || !material) {
        toast.error('Subject or material not found');
        return;
      }

      const updatedMaterials = subject.assignedMaterials || [];
      const isAlreadyAssigned = updatedMaterials.find(m => m.id === materialId);
      
      if (isAlreadyAssigned) {
        toast.error('Material already assigned to this subject');
        return;
      }

      await updateDoc(doc(db, 'programmeSubjects', subjectId), {
        assignedMaterials: [...updatedMaterials, {
          id: material.id,
          title: material.title,
          fileName: material.fileName,
          downloadURL: material.downloadURL
        }]
      });

      toast.success('Material assigned to subject successfully');
      fetchProgrammeSubjects();
    } catch (error) {
      console.error('Error assigning material:', error);
      toast.error('Failed to assign material');
    }
  };

  const removeMaterialFromSubject = async (subjectId, materialId) => {
    try {
      const subject = programmeSubjects.find(s => s.id === subjectId);
      if (!subject) {
        toast.error('Subject not found');
        return;
      }

      const updatedMaterials = (subject.assignedMaterials || []).filter(m => m.id !== materialId);

      await updateDoc(doc(db, 'programmeSubjects', subjectId), {
        assignedMaterials: updatedMaterials
      });

      toast.success('Material removed from subject');
      fetchProgrammeSubjects();
    } catch (error) {
      console.error('Error removing material:', error);
      toast.error('Failed to remove material');
    }
  };

  const deleteProgrammeSubject = async (subjectId) => {
    const confirmed = window.confirm(
      'This will remove the subject from the programme. This change will be reflected in both Course Management and Admin Panel. Continue?'
    );
    
    if (!confirmed) return;
    
    try {
      await updateDoc(doc(db, 'programmeSubjects', subjectId), {
        deleted: true,
        deletedAt: new Date()
      });

      toast.success('Subject removed from programme');
      fetchProgrammeSubjects();
    } catch (error) {
      console.error('Error deleting programme subject:', error);
      toast.error('Failed to remove subject from programme');
    }
  };

  // Manual cleanup function for admin use
  const performCleanup = async () => {
    const confirmed = window.confirm(
      'This will permanently delete all subjects that were soft-deleted more than 30 days ago. This action cannot be undone. Continue?'
    );
    
    if (confirmed) {
      try {
        toast.loading('Cleaning up old deleted subjects...');
        const result = await cloudFunctions.cleanupDeletedSubjects(30);
        
        if (result.success) {
          toast.success(`Cleanup completed! Permanently deleted ${result.summary.subjectsDeleted} subjects.`);
          fetchProgrammeSubjects(); // Refresh the list
        } else {
          toast.error(`Cleanup failed: ${result.error}`);
        }
      } catch (error) {
        toast.error('Cleanup failed');
        console.error('Cleanup error:', error);
      }
    }
  };

  const fetchProgrammeTemplates = async () => {
    try {
      const templatesSnapshot = await getDocs(collection(db, 'programmeTemplates'));
      const templatesData = templatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProgrammeTemplates(templatesData);
    } catch (error) {
      console.error('Error fetching programme templates:', error);
    }
  };

  const loadProgrammeTemplate = async (templateId) => {
    try {
      const templateDoc = await getDocs(doc(db, 'programmeTemplates', templateId));
      if (templateDoc.exists()) {
        const template = templateDoc.data();
        
        // Clear existing subjects
        const existingSubjects = programmeSubjects.filter(s => !s.deleted);
        for (const subject of existingSubjects) {
          await updateDoc(doc(db, 'programmeSubjects', subject.id), {
            deleted: true,
            deletedAt: new Date()
          });
        }
        
        // Create new subjects from template
        for (const templateSubject of template.subjects) {
          const subjectData = {
            ...templateSubject,
            courseId: selectedCourse.id,
            courseName: selectedCourse.name,
            createdAt: new Date(),
            assignedFaculty: [],
            assignedMaterials: [],
            // Preserve workshop rotation data if it exists
            isWorkshopRotation: templateSubject.isWorkshopRotation || false,
            rotationSequence: templateSubject.rotationSequence || null,
            workshopIndex: templateSubject.workshopIndex || null,
            totalWorkshops: templateSubject.totalWorkshops || null,
            totalRotations: templateSubject.totalRotations || null,
            assignedGroup: templateSubject.assignedGroup || null
          };
          await addDoc(collection(db, 'programmeSubjects'), subjectData);
        }
        
        toast.success('Programme template loaded successfully');
        fetchProgrammeSubjects();
      }
    } catch (error) {
      console.error('Error loading programme template:', error);
      toast.error('Failed to load programme template');
    }
  };

  const saveProgrammeAsTemplate = async () => {
    try {
      if (!templateForm.name) {
        toast.error('Please provide a template name');
        return;
      }

      const activeSubjects = programmeSubjects.filter(s => !s.deleted);
      if (activeSubjects.length === 0) {
        toast.error('No subjects to save as template');
        return;
      }

      const templateData = {
        name: templateForm.name,
        description: templateForm.description,
        subjects: activeSubjects.map(subject => ({
          name: subject.name || '',
          type: subject.type || '',
          duration: subject.duration || 0,
          description: subject.description || '',
          day: subject.day || 1,
          startTime: subject.startTime || '',
          endTime: subject.endTime || '',
          category: subject.category || '',
          // Include workshop rotation data
          isWorkshopRotation: subject.isWorkshopRotation || false,
          rotationSequence: subject.rotationSequence || null,
          workshopIndex: subject.workshopIndex || null,
          totalWorkshops: subject.totalWorkshops || null,
          totalRotations: subject.totalRotations || null,
          assignedGroup: subject.assignedGroup || null
        })),
        createdAt: new Date(),
        createdBy: 'Admin'
      };

      await addDoc(collection(db, 'programmeTemplates'), templateData);
      
      toast.success('Programme saved as template successfully');
      setShowSaveTemplateModal(false);
      setTemplateForm({ name: '', description: '', subjects: [] });
      fetchProgrammeTemplates();
    } catch (error) {
      console.error('Error saving programme template:', error);
      toast.error('Failed to save programme template');
    }
  };

  const deleteProgrammeTemplate = async (templateId) => {
    try {
      await updateDoc(doc(db, 'programmeTemplates', templateId), {
        deleted: true,
        deletedAt: new Date()
      });
      
      toast.success('Programme template deleted successfully');
      fetchProgrammeTemplates();
    } catch (error) {
      console.error('Error deleting programme template:', error);
      toast.error('Failed to delete programme template');
    }
  };

  const resendFacultyCredentials = async (facultyMember) => {
    try {
      // Generate a new temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      
      // Update the faculty member's password in Firebase Auth
      try {
        const { getAuth, updatePassword } = await import('firebase/auth');
        const { query, where, getDocs } = await import('firebase/firestore');
        const { auth } = await import('../firebase/config');
        
        // Find the user account for this faculty member
        const userQuery = query(collection(db, 'users'), where('email', '==', facultyMember.email));
        const userSnapshot = await getDocs(userQuery);
        
        if (!userSnapshot.empty) {
          // For now, we'll just send the new password via email
          // In a production system, you'd want to implement proper password reset
          toast.success(`New credentials sent to ${facultyMember.email}`);
          
          // Send email with new credentials
          try {
            const { sendFacultyCredentials } = cloudFunctions;
            await sendFacultyCredentials({
              email: facultyMember.email,
              name: facultyMember.name,
              password: tempPassword
            });
          } catch (emailError) {
            console.error('Error sending faculty credentials email:', emailError);
            toast.error('Failed to send credentials email');
          }
        } else {
          toast.error('User account not found for this faculty member');
        }
      } catch (authError) {
        console.error('Error updating faculty credentials:', authError);
        toast.error('Failed to update faculty credentials');
      }
    } catch (error) {
      console.error('Error resending faculty credentials:', error);
      toast.error('Failed to resend credentials');
    }
  };

  const clearTestData = async () => {
    try {
      // Get all faculty members
      const facultySnapshot = await getDocs(collection(db, 'faculty'));
      
      // Delete all faculty documents (this will clear any test data)
      const deletePromises = facultySnapshot.docs.map(doc => 
        deleteDoc(doc(db, 'faculty', doc.id))
      );
      
      await Promise.all(deletePromises);
      toast.success('Test data cleared successfully');
      fetchFaculty(); // Refresh the faculty list
    } catch (error) {
      console.error('Error clearing test data:', error);
      toast.error('Failed to clear test data');
    }
  };

  // Station-specific faculty assignment functions for Assessment and Scenario Practice
  const assignFacultyToStation = async (subjectId, stationIndex, facultyId) => {
    try {
      const subject = programmeSubjects.find(s => s.id === subjectId);
      const facultyMember = faculty.find(f => f.id === facultyId);
      
      if (!subject || !facultyMember) {
        toast.error('Subject or faculty member not found');
        return;
      }

      // Initialize stationFaculty if it doesn't exist
      const currentStationFaculty = subject.stationFaculty || [];
      const updatedStationFaculty = [...currentStationFaculty];
      
      // Ensure the station array exists
      if (!updatedStationFaculty[stationIndex]) {
        updatedStationFaculty[stationIndex] = [];
      }

      // Check if faculty is already assigned to this station
      const isAlreadyAssigned = updatedStationFaculty[stationIndex].find(f => f.id === facultyId);
      if (isAlreadyAssigned) {
        toast.error('Faculty member already assigned to this station');
        return;
      }

      // Add faculty to the station
      updatedStationFaculty[stationIndex].push({
        id: facultyMember.id,
        name: facultyMember.name,
        role: facultyMember.role,
        email: facultyMember.email
      });

      await updateDoc(doc(db, 'programmeSubjects', subjectId), {
        stationFaculty: updatedStationFaculty
      });

      toast.success('Faculty member assigned to station successfully');
      fetchProgrammeSubjects();
    } catch (error) {
      console.error('Error assigning faculty to station:', error);
      toast.error('Failed to assign faculty member to station');
    }
  };

  const removeFacultyFromStation = async (subjectId, stationIndex, facultyId) => {
    try {
      const subject = programmeSubjects.find(s => s.id === subjectId);
      if (!subject) {
        toast.error('Subject not found');
        return;
      }

      const currentStationFaculty = subject.stationFaculty || [];
      if (!currentStationFaculty[stationIndex]) {
        toast.error('Station not found');
        return;
      }

      const updatedStationFaculty = [...currentStationFaculty];
      updatedStationFaculty[stationIndex] = updatedStationFaculty[stationIndex].filter(f => f.id !== facultyId);

      await updateDoc(doc(db, 'programmeSubjects', subjectId), {
        stationFaculty: updatedStationFaculty
      });

      toast.success('Faculty member removed from station');
      fetchProgrammeSubjects();
    } catch (error) {
      console.error('Error removing faculty from station:', error);
      toast.error('Failed to remove faculty member from station');
    }
  };

  const assignFacultyToConcurrentActivity = async (subjectId, facultyId) => {
    try {
      const subject = programmeSubjects.find(s => s.id === subjectId);
      const facultyMember = faculty.find(f => f.id === facultyId);
      
      if (!subject || !facultyMember) {
        toast.error('Subject or faculty member not found');
        return;
      }

      const currentConcurrentFaculty = subject.concurrentActivityFaculty || [];
      const isAlreadyAssigned = currentConcurrentFaculty.find(f => f.id === facultyId);
      
      if (isAlreadyAssigned) {
        toast.error('Faculty member already assigned to concurrent activity');
        return;
      }

      await updateDoc(doc(db, 'programmeSubjects', subjectId), {
        concurrentActivityFaculty: [...currentConcurrentFaculty, {
          id: facultyMember.id,
          name: facultyMember.name,
          role: facultyMember.role,
          email: facultyMember.email
        }]
      });

      toast.success('Faculty member assigned to concurrent activity successfully');
      fetchProgrammeSubjects();
    } catch (error) {
      console.error('Error assigning faculty to concurrent activity:', error);
      toast.error('Failed to assign faculty member to concurrent activity');
    }
  };

  const removeFacultyFromConcurrentActivity = async (subjectId, facultyId) => {
    try {
      const subject = programmeSubjects.find(s => s.id === subjectId);
      if (!subject) {
        toast.error('Subject not found');
        return;
      }

      const updatedConcurrentFaculty = (subject.concurrentActivityFaculty || []).filter(f => f.id !== facultyId);

      await updateDoc(doc(db, 'programmeSubjects', subjectId), {
        concurrentActivityFaculty: updatedConcurrentFaculty
      });

      toast.success('Faculty member removed from concurrent activity');
      fetchProgrammeSubjects();
    } catch (error) {
      console.error('Error removing faculty from concurrent activity:', error);
      toast.error('Failed to remove faculty member from concurrent activity');
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
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="mt-4 px-2">
          <div className="space-y-1">
            <Link
              to="/admin"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
            >
              <Home size={16} className="mr-3" />
              Dashboard
            </Link>
            <Link
              to="/admin/candidates"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
            >
              <Users size={16} className="mr-3" />
              Candidate Management
            </Link>
            <Link
              to="/admin/course-management"
              className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md"
            >
              <Calendar size={16} className="mr-3" />
              Course Management
            </Link>
            <Link
              to="/admin/assessment"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
            >
              <BarChart3 size={16} className="mr-3" />
              Assessment Management
            </Link>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-3"
              >
                <Menu size={20} />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Course Management</h1>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
      {/* Course Selection Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-nhs-dark-grey">Course Management</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowNewCourseModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <CalendarPlus size={16} />
              <span>New Course</span>
            </button>
            {selectedCourse && !selectedCourse.archived && (
              <button
                onClick={() => setShowArchiveModal(true)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Archive size={16} />
                <span>Archive Course</span>
              </button>
            )}
          </div>
        </div>

        {/* Course Selector */}
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="font-semibold text-nhs-dark-grey">Active Course:</h3>
              <select
                value={selectedCourse?.id || ''}
                onChange={(e) => {
                  const course = allCourses.find(c => c.id === e.target.value);
                  switchCourse(course);
                }}
                className="p-2 border border-gray-300 rounded-md"
              >
                {allCourses.map((course) => (
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
                                 <button
                   onClick={() => {
                     setCourseSettings({
                       name: selectedCourse.name || '',
                       startDate: selectedCourse.startDate || '',
                       endDate: selectedCourse.endDate || '',
                       venue: selectedCourse.venue || '',
                       maxCandidates: selectedCourse.maxCandidates || 20,
                       courseCost: selectedCourse.courseCost || '',
                       eLearningUrl: selectedCourse.eLearningUrl || '',
                       description: selectedCourse.description || ''
                     });
                     setShowCourseSettingsModal(true);
                   }}
                   className="text-nhs-blue hover:text-nhs-dark-blue"
                 >
                   <Settings size={16} />
                 </button>
              </div>
            )}
          </div>
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
                 <h3 className="font-semibold text-nhs-dark-grey">Active Candidates</h3>
                 <p className="text-nhs-grey">{candidates.length} / {selectedCourse.maxCandidates}</p>
               </div>
             </div>
           </div>

          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Award className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-nhs-dark-grey">Status</h3>
                <p className="text-nhs-grey">{selectedCourse.archived ? 'Archived' : 'Active'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
                     <nav className="-mb-px flex space-x-8">
             {['overview', 'timeline', 'programme', 'faculty', 'candidates', 'materials', 'communications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-nhs-blue text-nhs-blue'
                    : 'border-transparent text-nhs-grey hover:text-nhs-dark-grey hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-nhs-dark-grey mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => sendAutomatedEmails('course-reminder')}
                  className="w-full flex items-center space-x-3 p-3 bg-nhs-blue text-white rounded-lg hover:bg-nhs-dark-blue transition-colors"
                >
                  <Mail size={20} />
                  <span>Send Course Reminders</span>
                </button>
                <button
                  onClick={checkElearningProgress}
                  className="w-full flex items-center space-x-3 p-3 bg-nhs-green text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FileCheck size={20} />
                  <span>Check E-Learning Progress</span>
                </button>
                <button
                  onClick={generateCourseReport}
                  className="w-full flex items-center space-x-3 p-3 bg-nhs-purple text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Download size={20} />
                  <span>Generate Course Report</span>
                </button>
              </div>
            </div>

                                                   <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-nhs-dark-grey">Course Statistics</h3>
                  <button
                    onClick={() => {
                      fetchCandidates();
                      fetchFaculty();
                      fetchCourseMaterials();
                    }}
                    className="text-nhs-blue hover:text-nhs-dark-blue"
                    title="Refresh statistics"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-nhs-grey">Active Applications:</span>
                    <span className="font-semibold">{candidates.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-nhs-grey">Pending Payment:</span>
                    <span className="font-semibold text-orange-500">
                      {candidates.filter(c => c.status === 'Pending Payment').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-nhs-grey">Paid in Full:</span>
                    <span className="font-semibold text-blue-500">
                      {candidates.filter(c => c.status === 'Paid in Full').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-nhs-grey">Live Candidates:</span>
                    <span className="font-semibold text-green-500">
                      {candidates.filter(c => c.status === 'Live Candidate').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-nhs-grey">Faculty Members:</span>
                    <span className="font-semibold">{faculty.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-nhs-grey">Course Capacity:</span>
                    <span className="font-semibold text-nhs-blue">
                      {candidates.length} / {selectedCourse?.maxCandidates || 20}
                    </span>
                  </div>
                </div>
              </div>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-nhs-dark-grey mb-6">Course Timeline</h3>
          <div className="space-y-4">
            {timeline.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                {getStatusIcon(item.status)}
                <div className="flex-1">
                  <h4 className="font-medium text-nhs-dark-grey">{item.task}</h4>
                  <p className="text-sm text-nhs-grey">{item.date}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.status === 'completed' ? 'bg-green-100 text-green-800' :
                  item.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
             )}

       {activeTab === 'programme' && (
         <div className="space-y-6">
           <div className="card">
             <div className="flex justify-between items-center mb-6">
               <div>
                 <h3 className="text-lg font-semibold text-nhs-dark-grey">Programme Builder</h3>
                 <p className="text-sm text-nhs-grey mt-1">
                   Programme changes are shared between Course Management and Admin Panel for this course
                 </p>
               </div>
               <div className="flex space-x-3">
                 <button 
                   onClick={() => setShowProgrammeTemplateModal(true)}
                   className="btn-secondary flex items-center space-x-2"
                 >
                   <BookOpen size={16} />
                   <span>Load Template</span>
                 </button>
                 <button 
                   onClick={() => setShowSaveTemplateModal(true)}
                   className="btn-secondary flex items-center space-x-2"
                 >
                   <Save size={16} />
                   <span>Save as Template</span>
                 </button>
                 <button 
                   onClick={performCleanup}
                   className="btn-secondary flex items-center space-x-2"
                   title="Clean up old deleted subjects (30+ days old)"
                 >
                   <Trash2 size={16} />
                   <span>Cleanup</span>
                 </button>
                 <button 
                   onClick={() => setShowAddSubjectModal(true)}
                   className="btn-primary flex items-center space-x-2"
                 >
                   <Plus size={16} />
                   <span>Add Subject</span>
                 </button>
               
               </div>
             </div>
             
             {programmeSubjects.filter(s => !s.deleted).length === 0 ? (
               <div className="text-center py-8">
                 <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                 <h3 className="text-lg font-medium text-nhs-dark-grey mb-2">No subjects added yet</h3>
                 <p className="text-nhs-grey mb-4">Start building your course programme by adding subjects and sessions.</p>
                 <button 
                   onClick={() => setShowAddSubjectModal(true)}
                   className="btn-primary"
                 >
                   Add First Subject
                 </button>
               </div>
             ) : (
               <div className="space-y-4">
                 {programmeSubjects.filter(s => !s.deleted).map((subject) => (
                   <div key={subject.id} className="border border-gray-200 rounded-lg p-4">
                     <div className="flex justify-between items-start mb-3">
                       <div className="flex-1">
                         <div className="flex items-center space-x-3 mb-2">
                           <h4 className="text-lg font-medium text-nhs-dark-grey">{subject.name}</h4>
                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                             subject.type === 'session' ? 'bg-blue-100 text-blue-800' :
                             subject.type === 'workshop' ? 'bg-green-100 text-green-800' :
                             subject.type === 'practical' ? 'bg-purple-100 text-purple-800' :
                             subject.type === 'break' ? 'bg-yellow-100 text-yellow-800' :
                             subject.type === 'lunch' ? 'bg-orange-100 text-orange-800' :
                             subject.type === 'assessment' ? 'bg-purple-500 text-white' :
                             subject.type === 'scenario-practice' ? 'bg-blue-500 text-white' :
                             subject.type === 'practical-session' ? 'bg-indigo-500 text-white' :
                             'bg-orange-100 text-orange-800'
                           }`}>
                             {subject.type === 'assessment' ? 'Assessment' :
                              subject.type === 'scenario-practice' ? 'Scenario Practice' :
                              subject.type === 'practical-session' ? 'Practical Session' :
                              subject.type.charAt(0).toUpperCase() + subject.type.slice(1)}
                           </span>
                           {subject.isWorkshopRotation && (
                             <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                               Group {getWorkshopGroups(subject)}
                             </span>
                           )}
                           {subject.isAssessment && (
                             <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                               {subject.numberOfStations} Stations, {subject.numberOfTimeSlots} Slots
                             </span>
                           )}
                           {subject.isScenarioPractice && (
                             <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                               {subject.numberOfStations} Stations, {subject.numberOfTimeSlots} Slots
                             </span>
                           )}
                           {subject.concurrentActivityName && (
                             <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                               Concurrent: {subject.concurrentActivityName}
                             </span>
                           )}
                           {subject.isPracticalSession && (
                             <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                               {subject.numberOfStations} Stations, {subject.numberOfTimeSlots} Slots
                             </span>
                           )}
                         </div>
                         <p className="text-sm text-nhs-grey mb-2">{subject.description}</p>
                         {subject.concurrentActivityName && (
                           <div className="text-sm text-nhs-grey mb-2 p-2 bg-orange-50 border border-orange-200 rounded">
                             <strong>Concurrent Activity:</strong> {subject.concurrentActivityName}
                             <br />
                             <strong>First Session:</strong> Candidates {subject.scenarioCandidatesFirst || '1-8'} do scenarios, Candidates {subject.concurrentCandidatesFirst || '9-16'} attend {subject.concurrentActivityName}
                             <br />
                             <strong>Second Session:</strong> Candidates {subject.scenarioCandidatesSecond || '9-16'} do scenarios, Candidates {subject.concurrentCandidatesSecond || '1-8'} attend {subject.concurrentActivityName}
                           </div>
                         )}
                         <div className="flex items-center space-x-4 text-sm text-nhs-grey">
                           <span>Day {subject.day}</span>
                           <span>{subject.startTime} - {subject.endTime}</span>
                           <span>{subject.duration} minutes</span>
                         </div>
                         
                         {/* Detailed Schedule for Assessment and Practical Sessions */}
                         {(subject.isAssessment || subject.isPracticalSession) && subject.timeSlots && (
                           <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                             <h6 className="font-medium text-nhs-dark-grey mb-2">Detailed Schedule:</h6>
                             
                             {/* Station Faculty Assignments for Assessment */}
                             {subject.isAssessment && (
                               <div className="mb-3">
                                 <div className="flex justify-between items-center mb-2">
                                   <h7 className="font-medium text-nhs-dark-grey">Station Faculty Assignments:</h7>
                                   <button
                                     onClick={() => {
                                       setSelectedSubject(subject);
                                       setShowAssignStationFacultyModal(true);
                                     }}
                                     className="text-nhs-blue hover:text-nhs-dark-blue text-xs"
                                   >
                                     Assign Station Faculty
                                   </button>
                                 </div>
                                 <div className="grid grid-cols-2 gap-2 mb-3">
                                   {Array.from({ length: subject.numberOfStations || 4 }, (_, index) => {
                                     const stationFaculty = subject.stationFaculty?.[index] || [];
                                     return (
                                       <div key={index} className="bg-white p-2 rounded border text-xs">
                                         <div className="font-medium">Station {index + 1}</div>
                                         <div className="text-nhs-grey">
                                           {stationFaculty.length > 0 ? (
                                             stationFaculty.map((faculty, fIndex) => (
                                               <div key={fIndex} className="flex items-center justify-between">
                                                 <span>{faculty.name}</span>
                                                 <button
                                                   onClick={() => removeFacultyFromStation(subject.id, index, faculty.id)}
                                                   className="text-red-500 hover:text-red-700 ml-1"
                                                 >
                                                   <X size={10} />
                                                 </button>
                                               </div>
                                             ))
                                           ) : (
                                             <span>No faculty assigned</span>
                                           )}
                                         </div>
                                       </div>
                                     );
                                   })}
                                 </div>
                               </div>
                             )}
                             
                             {/* Concurrent Activity Faculty for Assessment */}
                             {subject.isAssessment && subject.concurrentActivityName && (
                               <div className="mb-3">
                                 <div className="flex justify-between items-center mb-2">
                                   <h7 className="font-medium text-nhs-dark-grey">Concurrent Activity Faculty:</h7>
                                   <button
                                     onClick={() => {
                                       setSelectedSubject(subject);
                                       setShowAssignConcurrentFacultyModal(true);
                                     }}
                                     className="text-nhs-blue hover:text-nhs-dark-blue text-xs"
                                   >
                                     Assign Concurrent Faculty
                                   </button>
                                 </div>
                                 <div className="bg-white p-2 rounded border text-xs">
                                   {subject.concurrentActivityFaculty && subject.concurrentActivityFaculty.length > 0 ? (
                                     subject.concurrentActivityFaculty.map((faculty, index) => (
                                       <div key={index} className="flex items-center justify-between">
                                         <span>{faculty.name}</span>
                                         <button
                                           onClick={() => removeFacultyFromConcurrentActivity(subject.id, faculty.id)}
                                           className="text-red-500 hover:text-red-700 ml-1"
                                         >
                                           <X size={10} />
                                         </button>
                                       </div>
                                     ))
                                   ) : (
                                     <span className="text-nhs-grey">No faculty assigned</span>
                                   )}
                                 </div>
                               </div>
                             )}
                             
                             <div className="space-y-2">
                               {subject.timeSlots.map((slot, index) => (
                                 <div key={index} className="text-sm">
                                   <div className="font-medium text-nhs-dark-grey">
                                     {slot.startTime} - {slot.endTime} ({slot.duration} min)
                                   </div>
                                   <div className="grid grid-cols-2 gap-2 mt-1">
                                     {slot.activities?.map((activity, actIndex) => (
                                       <div key={actIndex} className="bg-white p-2 rounded border text-xs">
                                         <div className="font-medium">Station {activity.station}</div>
                                         {activity.lead && activity.assist && (
                                           <div>
                                             <div>Lead: {activity.lead.firstName} {activity.lead.surname}</div>
                                             <div>Assist: {activity.assist.firstName} {activity.assist.surname}</div>
                                           </div>
                                         )}
                                         {activity.assessed && activity.observe && (
                                           <div>
                                             <div>Assessed: {activity.assessed.firstName} {activity.assessed.surname}</div>
                                             <div>Observe: {activity.observe.firstName} {activity.observe.surname}</div>
                                           </div>
                                         )}
                                         {activity.groups && (
                                           <div>
                                             <div>{activity.groupLabel}</div>
                                             <div>{activity.groups.length} participants</div>
                                           </div>
                                         )}
                                       </div>
                                     ))}
                                   </div>
                                 </div>
                               ))}
                             </div>
                           </div>
                         )}
                         
                                                   {/* Detailed Schedule for Scenario Practice Sessions */}
                          {subject.isScenarioPractice && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <h6 className="font-medium text-nhs-dark-grey mb-2">Scenario Practice Schedule:</h6>
                              <div className="space-y-3">
                                                                 {/* Faculty Assignments */}
                                 <div>
                                   <div className="flex justify-between items-center mb-2">
                                     <h7 className="font-medium text-nhs-dark-grey">Station Faculty Assignments:</h7>
                                     <button
                                       onClick={() => {
                                         setSelectedSubject(subject);
                                         setShowAssignStationFacultyModal(true);
                                       }}
                                       className="text-nhs-blue hover:text-nhs-dark-blue text-xs"
                                     >
                                       Assign Station Faculty
                                     </button>
                                   </div>
                                   <div className="grid grid-cols-2 gap-2 mt-1">
                                     {Array.from({ length: subject.numberOfStations || 4 }, (_, index) => {
                                       const stationFaculty = subject.stationFaculty?.[index] || [];
                                       return (
                                         <div key={index} className="bg-white p-2 rounded border text-xs">
                                           <div className="font-medium">Station {index + 1}</div>
                                           <div className="text-nhs-grey">
                                             {stationFaculty.length > 0 ? (
                                               stationFaculty.map((faculty, fIndex) => (
                                                 <div key={fIndex} className="flex items-center justify-between">
                                                   <span>{faculty.name}</span>
                                                   <button
                                                     onClick={() => removeFacultyFromStation(subject.id, index, faculty.id)}
                                                     className="text-red-500 hover:text-red-700 ml-1"
                                                   >
                                                     <X size={10} />
                                                   </button>
                                                 </div>
                                               ))
                                             ) : (
                                               <span>No faculty assigned</span>
                                             )}
                                           </div>
                                         </div>
                                       );
                                     })}
                                   </div>
                                 </div>
                                
                                {/* Room Assignments */}
                                <div>
                                  <h7 className="font-medium text-nhs-dark-grey">Room Assignments:</h7>
                                  <div className="grid grid-cols-2 gap-2 mt-1">
                                    {subject.stationRooms?.map((room, index) => (
                                      <div key={index} className="bg-white p-2 rounded border text-xs">
                                        <div className="font-medium">Station {index + 1}</div>
                                        <div className="text-nhs-grey">Room: {room || 'To Be Directed'}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                {/* Group Rotation Schedule */}
                                <div>
                                  <h7 className="font-medium text-nhs-dark-grey">Group Rotation Schedule:</h7>
                                  <div className="space-y-2">
                                    {Array.from({ length: subject.numberOfTimeSlots || 4 }, (_, timeSlotIndex) => (
                                      <div key={timeSlotIndex} className="bg-white p-2 rounded border text-xs">
                                        <div className="font-medium text-nhs-dark-grey">
                                          Time Slot {timeSlotIndex + 1} ({subject.timeSlotDuration || 20} min)
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-1">
                                          {Array.from({ length: subject.numberOfStations || 4 }, (_, stationIndex) => {
                                            const groups = ['A', 'B', 'C', 'D'];
                                            const groupIndex = (stationIndex + timeSlotIndex) % groups.length;
                                            return (
                                              <div key={stationIndex} className="text-xs">
                                                <div>Station {stationIndex + 1}: Group {groups[groupIndex]}</div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                       </div>
                       <button
                         onClick={() => deleteProgrammeSubject(subject.id)}
                         className="text-red-500 hover:text-red-700 ml-2"
                       >
                         <Trash2 size={16} />
                       </button>
                     </div>

                     {/* Faculty Assignment - Only show for non-break/lunch items */}
                     {subject.type !== 'break' && subject.type !== 'lunch' && (
                       <div className="mb-3">
                         <div className="flex justify-between items-center mb-2">
                           <h5 className="font-medium text-nhs-dark-grey">Assigned Faculty</h5>
                           <button
                             onClick={() => {
                               setSelectedSubject(subject);
                               setShowAssignFacultyModal(true);
                             }}
                             className="text-nhs-blue hover:text-nhs-dark-blue text-sm"
                           >
                             Assign Faculty
                           </button>
                         </div>
                         <div className="flex flex-wrap gap-2">
                           {subject.assignedFaculty && subject.assignedFaculty.length > 0 ? (
                             subject.assignedFaculty.map((facultyMember) => (
                               <div key={facultyMember.id} className="flex items-center space-x-2 bg-gray-100 px-2 py-1 rounded text-sm">
                                 <span>{facultyMember.name}</span>
                                 <button
                                   onClick={() => removeFacultyFromSubject(subject.id, facultyMember.id)}
                                   className="text-red-500 hover:text-red-700"
                                 >
                                   <X size={12} />
                                 </button>
                               </div>
                             ))
                           ) : (
                             <span className="text-sm text-nhs-grey">No faculty assigned</span>
                           )}
                         </div>
                       </div>
                     )}

                     {/* Materials Assignment - Only show for non-break/lunch items */}
                     {subject.type !== 'break' && subject.type !== 'lunch' && (
                       <div className="mb-3">
                         <div className="flex justify-between items-center mb-2">
                           <h5 className="font-medium text-nhs-dark-grey">Assigned Materials</h5>
                           <button
                             onClick={() => {
                               setSelectedSubject(subject);
                               setShowAssignMaterialsModal(true);
                             }}
                             className="text-nhs-blue hover:text-nhs-dark-blue text-sm"
                           >
                             Assign Materials
                           </button>
                         </div>
                         <div className="flex flex-wrap gap-2">
                           {subject.assignedMaterials && subject.assignedMaterials.length > 0 ? (
                             subject.assignedMaterials.map((material) => (
                               <div key={material.id} className="flex items-center space-x-2 bg-gray-100 px-2 py-1 rounded text-sm">
                                 <span>{material.title}</span>
                                 <button
                                   onClick={() => removeMaterialFromSubject(subject.id, material.id)}
                                   className="text-red-500 hover:text-red-700"
                                 >
                                   <X size={12} />
                                 </button>
                               </div>
                             ))
                           ) : (
                             <span className="text-sm text-nhs-grey">No materials assigned</span>
                           )}
                         </div>
                       </div>
                     )}

                     {/* Group Rotation Information - Only show for workshop rotation sessions */}
                     {subject.isWorkshopRotation && (
                       <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                         <div className="flex items-center space-x-2 mb-2">
                           <Users2 size={16} className="text-blue-600" />
                           <h5 className="font-medium text-nhs-dark-grey">Workshop Rotation Schedule</h5>
                         </div>
                         <div className="text-sm text-nhs-grey space-y-1">
                           <p><strong>Workshop:</strong> {subject.name}</p>
                           <p><strong>Workshop Position:</strong> {subject.workshopIndex} of {subject.totalWorkshops}</p>
                           <p><strong>Duration:</strong> {subject.duration} minutes per rotation</p>
                           <p><strong>Total Rotations:</strong> {subject.totalRotations}</p>
                         </div>
                         
                         {/* Rotation Schedule */}
                         <div className="mt-3">
                           <h6 className="font-medium text-nhs-dark-grey mb-2">Group Rotation Schedule:</h6>
                           <div className="grid grid-cols-1 gap-2">
                             {subject.rotationSchedule?.map((schedule, index) => (
                               <div key={index} className="bg-white p-2 rounded border text-xs">
                                 <div className="font-medium text-nhs-dark-grey">
                                   Rotation {schedule.rotation}: Group {schedule.group}
                                 </div>
                                 <div className="text-nhs-grey">
                                   {schedule.timeSlot}
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>
                       </div>
                     )}
                   </div>
                 ))}
               </div>
             )}
           </div>
         </div>
       )}

       {activeTab === 'faculty' && (
                 <div className="card">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-semibold text-nhs-dark-grey">Faculty Management</h3>
             <div className="flex space-x-3">
               <button 
                 onClick={clearTestData}
                 className="btn-secondary flex items-center space-x-2"
                 title="Clear any test data"
               >
                 <Trash2 size={16} />
                 <span>Clear Test Data</span>
               </button>
               <button 
                 onClick={() => setShowAddFacultyModal(true)}
                 className="btn-primary flex items-center space-x-2"
               >
                 <Plus size={16} />
                 <span>Add Faculty</span>
               </button>
             </div>
           </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {faculty.filter(f => !f.deleted).map((member) => (
              <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-nhs-dark-grey">{member.name}</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => resendFacultyCredentials(member)}
                      className="text-nhs-blue hover:text-nhs-dark-blue"
                      title="Resend login credentials"
                    >
                      <Mail size={16} />
                    </button>
                    <button
                      onClick={() => deleteFacultyMember(member.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-nhs-grey">{member.role}</p>
                <p className="text-sm text-nhs-grey">{member.email}</p>
                {member.phone && <p className="text-sm text-nhs-grey">{member.phone}</p>}
                {member.specialty && <p className="text-sm text-nhs-grey">{member.specialty}</p>}
              </div>
            ))}
            {faculty.filter(f => !f.deleted).length === 0 && (
              <p className="text-nhs-grey text-center py-8 col-span-full">No faculty members added yet</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'candidates' && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-nhs-dark-grey">Candidate Management</h3>
            <button
              onClick={() => setShowEmailModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Mail size={16} />
              <span>Send Emails</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
                             <thead>
                 <tr className="border-b border-gray-200">
                   <th className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">Select</th>
                   <th className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">Name</th>
                   <th className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">Status</th>
                   <th className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">E-Learning</th>
                   <th className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">Grade</th>
                   <th className="text-left py-3 px-4 font-semibold text-nhs-dark-grey">Actions</th>
                 </tr>
               </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.find(c => c.id === candidate.id) !== undefined}
                        onChange={() => handleCandidateSelection(candidate)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{candidate.firstName} {candidate.surname}</div>
                        <div className="text-sm text-nhs-grey">{candidate.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        candidate.status === 'Live Candidate' ? 'bg-green-100 text-green-800' :
                        candidate.status === 'Paid in Full' ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {candidate.status}
                      </span>
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
                                         <td className="py-3 px-4 text-nhs-grey">{candidate.grade || 'N/A'}</td>
                     <td className="py-3 px-4">
                       <button
                         onClick={() => {
                           const reason = prompt('Please provide a reason for rejection:');
                           if (reason) {
                             rejectCandidate(candidate.id, reason);
                           }
                         }}
                         className="text-red-500 hover:text-red-700 text-sm font-medium"
                         title="Reject candidate"
                       >
                         Reject
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'materials' && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-nhs-dark-grey">Course Materials</h3>
            <button 
              onClick={() => setShowUploadMaterialsModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Upload size={16} />
              <span>Upload Materials</span>
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-nhs-dark-grey mb-2">E-Learning Materials</h4>
              <p className="text-sm text-nhs-grey mb-3">Access URL: {courseData?.eLearningUrl || 'Not set'}</p>
              <button className="btn-secondary text-sm">Update Materials</button>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-nhs-dark-grey mb-2">Uploaded Materials</h4>
              <div className="space-y-2">
                {courseMaterials.filter(m => !m.deleted).map((material) => (
                  <div key={material.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium">{material.title}</p>
                      <p className="text-xs text-nhs-grey">{material.fileName}</p>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={material.downloadURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-nhs-blue hover:text-nhs-dark-blue text-sm"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => deleteCourseMaterial(material.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {courseMaterials.filter(m => !m.deleted).length === 0 && (
                  <p className="text-nhs-grey text-sm">No materials uploaded yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'communications' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-nhs-dark-grey mb-4">Automated Communications</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => sendAutomatedEmails('welcome')}
                className="flex items-center space-x-3 p-3 bg-nhs-blue text-white rounded-lg hover:bg-nhs-dark-blue transition-colors"
              >
                <Mail size={20} />
                <span>Send Welcome Emails</span>
              </button>
              <button
                onClick={() => sendAutomatedEmails('payment-reminder')}
                className="flex items-center space-x-3 p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Mail size={20} />
                <span>Send Payment Reminders</span>
              </button>
              <button
                onClick={() => sendAutomatedEmails('e-learning-reminder')}
                className="flex items-center space-x-3 p-3 bg-nhs-green text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Mail size={20} />
                <span>Send E-Learning Reminders</span>
              </button>
              <button
                onClick={() => sendAutomatedEmails('course-reminder')}
                className="flex items-center space-x-3 p-3 bg-nhs-purple text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Mail size={20} />
                <span>Send Course Reminders</span>
              </button>
              <button
                onClick={() => setShowProspectusGenerator(true)}
                className="flex items-center space-x-3 p-3 bg-nhs-dark-grey text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FileText size={20} />
                <span>Generate Course Prospectus</span>
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-nhs-dark-grey mb-4">Email Log</h3>
            <div className="space-y-3">
              {emailLog.map((log, index) => (
                <div key={index} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div>
                    <span className="font-medium text-nhs-dark-grey">{log.emailType}</span>
                    <span className="text-sm text-nhs-grey ml-2">
                      {log.recipients} recipients ({log.success} successful, {log.failed} failed)
                    </span>
                  </div>
                  <span className="text-sm text-nhs-grey">
                    {log.timestamp.toLocaleString()}
                  </span>
                </div>
              ))}
              {emailLog.length === 0 && (
                <p className="text-nhs-grey text-center py-4">No emails sent yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Send Emails</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                Email Type
              </label>
              <select
                value={emailType}
                onChange={(e) => setEmailType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="welcome">Welcome Email</option>
                <option value="payment-reminder">Payment Reminder</option>
                <option value="e-learning-reminder">E-Learning Reminder</option>
                <option value="course-reminder">Course Reminder</option>
              </select>
            </div>
            <div className="mb-4">
              <p className="text-sm text-nhs-grey">
                Selected: {selectedCandidates.length} candidates
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  if (selectedCandidates.length > 0) {
                    const candidateIds = selectedCandidates.map(c => c.id);
                    cloudFunctions.sendBulkEmails(emailType, candidateIds);
                  } else {
                    sendAutomatedEmails(emailType);
                  }
                  setShowEmailModal(false);
                }}
                className="bg-nhs-blue text-white px-4 py-2 rounded-md hover:bg-nhs-dark-blue"
              >
                Send Emails
              </button>
              <button
                onClick={() => setShowEmailModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Faculty Management Modal */}
      <FacultyManagementModal
        isOpen={showAddFacultyModal}
        onClose={() => setShowAddFacultyModal(false)}
        faculty={faculty}
        onFacultyUpdate={handleFacultyUpdate}
        mode="add"
      />

      {/* Prospectus Generator Modal */}
      {showProspectusGenerator && (
        <ProspectusGenerator
          selectedCourse={courseData}
          onClose={() => setShowProspectusGenerator(false)}
        />
      )}

      {/* Upload Materials Modal */}
      {showUploadMaterialsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upload Course Material</h3>
              <button
                onClick={() => setShowUploadMaterialsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={materialsForm.title}
                  onChange={(e) => setMaterialsForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Material title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Description
                </label>
                <textarea
                  value={materialsForm.description}
                  onChange={(e) => setMaterialsForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Brief description of the material"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  File *
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                />
                <p className="text-xs text-nhs-grey mt-1">
                  Supported formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT
                </p>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={uploadCourseMaterial}
                className="bg-nhs-blue text-white px-4 py-2 rounded-md hover:bg-nhs-dark-blue"
              >
                Upload Material
              </button>
              <button
                onClick={() => setShowUploadMaterialsModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Course Modal */}
      {showNewCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Course</h3>
              <button
                onClick={() => setShowNewCourseModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Course Name *
                </label>
                <input
                  type="text"
                  value={newCourseForm.name}
                  onChange={(e) => setNewCourseForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., IMPACT Course March 2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={newCourseForm.startDate}
                  onChange={(e) => setNewCourseForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={newCourseForm.endDate}
                  onChange={(e) => setNewCourseForm(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Venue *
                </label>
                <input
                  type="text"
                  value={newCourseForm.venue}
                  onChange={(e) => setNewCourseForm(prev => ({ ...prev, venue: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Course venue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Max Candidates
                </label>
                <input
                  type="number"
                  value={newCourseForm.maxCandidates}
                  onChange={(e) => setNewCourseForm(prev => ({ ...prev, maxCandidates: parseInt(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Course Cost
                </label>
                <input
                  type="text"
                  value={newCourseForm.courseCost}
                  onChange={(e) => setNewCourseForm(prev => ({ ...prev, courseCost: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., £500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  E-Learning URL
                </label>
                <input
                  type="url"
                  value={newCourseForm.eLearningUrl}
                  onChange={(e) => setNewCourseForm(prev => ({ ...prev, eLearningUrl: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="https://..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Description
                </label>
                <textarea
                  value={newCourseForm.description}
                  onChange={(e) => setNewCourseForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Course description..."
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={createNewCourse}
                className="bg-nhs-blue text-white px-4 py-2 rounded-md hover:bg-nhs-dark-blue"
              >
                Create Course
              </button>
              <button
                onClick={() => setShowNewCourseModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Course Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Archive Course</h3>
            <p className="text-sm text-nhs-grey mb-4">
              Are you sure you want to archive "{selectedCourse?.name}"? This will mark the course as completed and move it to the archive.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={archiveCurrentCourse}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Archive Course
              </button>
              <button
                onClick={() => setShowArchiveModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Settings Modal */}
      {showCourseSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Course Settings</h3>
              <button
                onClick={() => setShowCourseSettingsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={courseSettings.startDate}
                  onChange={(e) => setCourseSettings(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={courseSettings.endDate}
                  onChange={(e) => setCourseSettings(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Venue
                </label>
                <input
                  type="text"
                  value={courseSettings.venue}
                  onChange={(e) => setCourseSettings(prev => ({ ...prev, venue: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Max Candidates
                </label>
                <input
                  type="number"
                  value={courseSettings.maxCandidates}
                  onChange={(e) => setCourseSettings(prev => ({ ...prev, maxCandidates: parseInt(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Course Cost
                </label>
                <input
                  type="text"
                  value={courseSettings.courseCost}
                  onChange={(e) => setCourseSettings(prev => ({ ...prev, courseCost: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  E-Learning URL
                </label>
                <input
                  type="url"
                  value={courseSettings.eLearningUrl}
                  onChange={(e) => setCourseSettings(prev => ({ ...prev, eLearningUrl: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Description
                </label>
                <textarea
                  value={courseSettings.description}
                  onChange={(e) => setCourseSettings(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={updateCourseSettings}
                className="bg-nhs-blue text-white px-4 py-2 rounded-md hover:bg-nhs-dark-blue"
              >
                Update Settings
              </button>
              <button
                onClick={() => setShowCourseSettingsModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
                 </div>
       )}

       {/* Add Subject Modal */}
       <ProgrammeBuilderModal
         isOpen={showAddSubjectModal}
         onClose={() => setShowAddSubjectModal(false)}
         subjectForm={subjectForm}
         setSubjectForm={setSubjectForm}
         onAddSubject={addProgrammeSubject}
         predefinedWorkshopSubjects={predefinedWorkshopSubjects}
         predefinedPracticalSubjects={predefinedPracticalSubjects}
       />



       {/* Assign Faculty Modal */}
       {showAssignFacultyModal && selectedSubject && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-semibold">Assign Faculty to "{selectedSubject.name}"</h3>
               <button
                 onClick={() => setShowAssignFacultyModal(false)}
                 className="text-gray-500 hover:text-gray-700"
               >
                 <X size={20} />
               </button>
             </div>
             <div className="space-y-3">
               {faculty.filter(f => !f.deleted).map((facultyMember) => {
                 const isAssigned = selectedSubject.assignedFaculty && 
                   selectedSubject.assignedFaculty.find(f => f.id === facultyMember.id);
                 
                 return (
                   <div key={facultyMember.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                     <div>
                       <h4 className="font-medium text-nhs-dark-grey">{facultyMember.name}</h4>
                       <p className="text-sm text-nhs-grey">{facultyMember.role}</p>
                     </div>
                     <button
                       onClick={() => {
                         if (isAssigned) {
                           removeFacultyFromSubject(selectedSubject.id, facultyMember.id);
                         } else {
                           assignFacultyToSubject(selectedSubject.id, facultyMember.id);
                         }
                       }}
                       className={`px-3 py-1 rounded text-sm font-medium ${
                         isAssigned 
                           ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                           : 'bg-nhs-blue text-white hover:bg-nhs-dark-blue'
                       }`}
                     >
                       {isAssigned ? 'Remove' : 'Assign'}
                     </button>
                   </div>
                 );
               })}
               {faculty.filter(f => !f.deleted).length === 0 && (
                 <p className="text-nhs-grey text-center py-4">No faculty members available</p>
               )}
             </div>
             <div className="flex justify-end mt-6">
               <button
                 onClick={() => setShowAssignFacultyModal(false)}
                 className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
               >
                 Close
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Assign Materials Modal */}
       {showAssignMaterialsModal && selectedSubject && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-semibold">Assign Materials to "{selectedSubject.name}"</h3>
               <button
                 onClick={() => setShowAssignMaterialsModal(false)}
                 className="text-gray-500 hover:text-gray-700"
               >
                 <X size={20} />
               </button>
             </div>
             <div className="space-y-3">
               {courseMaterials.filter(m => !m.deleted).map((material) => {
                 const isAssigned = selectedSubject.assignedMaterials && 
                   selectedSubject.assignedMaterials.find(m => m.id === material.id);
                 
                 return (
                   <div key={material.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                     <div className="flex-1">
                       <h4 className="font-medium text-nhs-dark-grey">{material.title}</h4>
                       <p className="text-sm text-nhs-grey">{material.fileName}</p>
                     </div>
                     <button
                       onClick={() => {
                         if (isAssigned) {
                           removeMaterialFromSubject(selectedSubject.id, material.id);
                         } else {
                           assignMaterialToSubject(selectedSubject.id, material.id);
                         }
                       }}
                       className={`px-3 py-1 rounded text-sm font-medium ml-3 ${
                         isAssigned 
                           ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                           : 'bg-nhs-blue text-white hover:bg-nhs-dark-blue'
                       }`}
                     >
                       {isAssigned ? 'Remove' : 'Assign'}
                     </button>
                   </div>
                 );
               })}
               {courseMaterials.filter(m => !m.deleted).length === 0 && (
                 <p className="text-nhs-grey text-center py-4">No materials available</p>
               )}
             </div>
             <div className="flex justify-end mt-6">
               <button
                 onClick={() => setShowAssignMaterialsModal(false)}
                 className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
               >
                 Close
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Assign Station Faculty Modal */}
       {showAssignStationFacultyModal && selectedSubject && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-semibold">Assign Faculty to Stations - "{selectedSubject.name}"</h3>
               <button
                 onClick={() => setShowAssignStationFacultyModal(false)}
                 className="text-gray-500 hover:text-gray-700"
               >
                 <X size={20} />
               </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {Array.from({ length: selectedSubject.numberOfStations || 4 }, (_, stationIndex) => {
                 const stationFaculty = selectedSubject.stationFaculty?.[stationIndex] || [];
                 return (
                   <div key={stationIndex} className="border border-gray-200 rounded-lg p-4">
                     <h4 className="font-medium text-nhs-dark-grey mb-3">Station {stationIndex + 1}</h4>
                     
                     {/* Current Faculty for this Station */}
                     <div className="mb-3">
                       <h5 className="text-sm font-medium text-nhs-dark-grey mb-2">Assigned Faculty:</h5>
                       {stationFaculty.length > 0 ? (
                         <div className="space-y-2">
                           {stationFaculty.map((faculty) => (
                             <div key={faculty.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                               <div>
                                 <span className="text-sm font-medium">{faculty.name}</span>
                                 <p className="text-xs text-nhs-grey">{faculty.role}</p>
                               </div>
                               <button
                                 onClick={() => removeFacultyFromStation(selectedSubject.id, stationIndex, faculty.id)}
                                 className="text-red-500 hover:text-red-700"
                               >
                                 <X size={14} />
                               </button>
                             </div>
                           ))}
                         </div>
                       ) : (
                         <p className="text-sm text-nhs-grey">No faculty assigned</p>
                       )}
                     </div>
                     
                     {/* Available Faculty to Assign */}
                     <div>
                       <h5 className="text-sm font-medium text-nhs-dark-grey mb-2">Available Faculty:</h5>
                       <div className="space-y-2 max-h-40 overflow-y-auto">
                         {faculty.filter(f => !f.deleted && !stationFaculty.find(sf => sf.id === f.id)).map((facultyMember) => (
                           <div key={facultyMember.id} className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50">
                             <div>
                               <span className="text-sm font-medium">{facultyMember.name}</span>
                               <p className="text-xs text-nhs-grey">{facultyMember.role}</p>
                             </div>
                             <button
                               onClick={() => assignFacultyToStation(selectedSubject.id, stationIndex, facultyMember.id)}
                               className="bg-nhs-blue text-white px-2 py-1 rounded text-xs hover:bg-nhs-dark-blue"
                             >
                               Assign
                             </button>
                           </div>
                         ))}
                         {faculty.filter(f => !f.deleted && !stationFaculty.find(sf => sf.id === f.id)).length === 0 && (
                           <p className="text-sm text-nhs-grey">All faculty already assigned to this station</p>
                         )}
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
             
             <div className="flex justify-end mt-6">
               <button
                 onClick={() => setShowAssignStationFacultyModal(false)}
                 className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
               >
                 Close
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Assign Concurrent Activity Faculty Modal */}
       {showAssignConcurrentFacultyModal && selectedSubject && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-semibold">Assign Faculty to Concurrent Activity - "{selectedSubject.name}"</h3>
               <button
                 onClick={() => setShowAssignConcurrentFacultyModal(false)}
                 className="text-gray-500 hover:text-gray-700"
               >
                 <X size={20} />
               </button>
             </div>
             
             <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
               <p className="text-sm text-orange-800">
                 <strong>Concurrent Activity:</strong> {selectedSubject.concurrentActivityName}
               </p>
             </div>
             
             <div className="space-y-3">
               {faculty.filter(f => !f.deleted).map((facultyMember) => {
                 const isAssigned = selectedSubject.concurrentActivityFaculty && 
                   selectedSubject.concurrentActivityFaculty.find(f => f.id === facultyMember.id);
                 
                 return (
                   <div key={facultyMember.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                     <div>
                       <h4 className="font-medium text-nhs-dark-grey">{facultyMember.name}</h4>
                       <p className="text-sm text-nhs-grey">{facultyMember.role}</p>
                     </div>
                     <button
                       onClick={() => {
                         if (isAssigned) {
                           removeFacultyFromConcurrentActivity(selectedSubject.id, facultyMember.id);
                         } else {
                           assignFacultyToConcurrentActivity(selectedSubject.id, facultyMember.id);
                         }
                       }}
                       className={`px-3 py-1 rounded text-sm font-medium ${
                         isAssigned 
                           ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                           : 'bg-nhs-blue text-white hover:bg-nhs-dark-blue'
                       }`}
                     >
                       {isAssigned ? 'Remove' : 'Assign'}
                     </button>
                   </div>
                 );
               })}
               {faculty.filter(f => !f.deleted).length === 0 && (
                 <p className="text-nhs-grey text-center py-4">No faculty members available</p>
               )}
             </div>
             
             <div className="flex justify-end mt-6">
               <button
                 onClick={() => setShowAssignConcurrentFacultyModal(false)}
                 className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
               >
                 Close
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Save Programme Template Modal */}
       {showSaveTemplateModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 w-full max-w-md">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-semibold text-nhs-dark-grey">Save Programme as Template</h3>
               <button
                 onClick={() => setShowSaveTemplateModal(false)}
                 className="text-gray-500 hover:text-gray-700"
               >
                 <X size={20} />
               </button>
             </div>
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                   Template Name *
                 </label>
                 <input
                   type="text"
                   value={templateForm.name}
                   onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                   className="w-full p-2 border border-gray-300 rounded-md"
                   placeholder="e.g., Standard IMPACT Programme"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                   Description
                 </label>
                 <textarea
                   value={templateForm.description}
                   onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                   className="w-full p-2 border border-gray-300 rounded-md"
                   rows={3}
                   placeholder="Brief description of this programme template"
                 />
               </div>
               <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                 <p className="text-sm text-blue-800">
                   <strong>Note:</strong> This will save the current programme structure as a template. 
                   When loaded into other courses, each course will have independent faculty assignments and materials.
                 </p>
               </div>
             </div>
             <div className="flex space-x-3 mt-6">
               <button
                 onClick={saveProgrammeAsTemplate}
                 className="bg-nhs-blue text-white px-4 py-2 rounded-md hover:bg-nhs-dark-blue"
               >
                 Save Template
               </button>
               <button
                 onClick={() => setShowSaveTemplateModal(false)}
                 className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
               >
                 Cancel
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Load Programme Template Modal */}
       {showProgrammeTemplateModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-semibold text-nhs-dark-grey">Load Programme Template</h3>
               <button
                 onClick={() => setShowProgrammeTemplateModal(false)}
                 className="text-gray-500 hover:text-gray-700"
               >
                 <X size={20} />
               </button>
             </div>
             
             {programmeTemplates.filter(t => !t.deleted).length === 0 ? (
               <div className="text-center py-8">
                 <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                 <h3 className="text-lg font-medium text-nhs-dark-grey mb-2">No templates available</h3>
                 <p className="text-nhs-grey">Create a programme template first by saving your current programme.</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {programmeTemplates.filter(t => !t.deleted).map((template) => (
                   <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                     <div className="flex justify-between items-start">
                       <div className="flex-1">
                         <h4 className="font-medium text-nhs-dark-grey mb-2">{template.name}</h4>
                         <p className="text-sm text-nhs-grey mb-3">{template.description}</p>
                         <div className="text-sm text-nhs-grey">
                           <p><strong>Subjects:</strong> {template.subjects?.length || 0}</p>
                           <p><strong>Created:</strong> {template.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}</p>
                         </div>
                       </div>
                       <div className="flex space-x-2 ml-4">
                         <button
                           onClick={() => deleteProgrammeTemplate(template.id)}
                           className="text-red-500 hover:text-red-700"
                           title="Delete template"
                         >
                           <Trash2 size={16} />
                         </button>
                         <button
                           onClick={() => loadProgrammeTemplate(template.id)}
                           className="bg-nhs-blue text-white px-3 py-1 rounded text-sm hover:bg-nhs-dark-blue"
                         >
                           Load Template
                         </button>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
             
             <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
               <p className="text-sm text-blue-800">
                 <strong>Template Independence:</strong> When you load a template, it creates an independent copy for this course. 
                 You can modify faculty assignments, materials, and programme details without affecting other courses or the original template.
               </p>
             </div>
           </div>
         </div>
       )}
           </div>
         </div>
       </div>
     </div>
   );
 };

export default CourseManagement;
