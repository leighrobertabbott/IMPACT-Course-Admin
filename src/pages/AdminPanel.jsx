import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy, where, addDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Link } from 'react-router-dom';
import { db, storage } from '../firebase/config';
import { cloudFunctions, downloadCSV, downloadJSON } from '../utils/cloudFunctions';
import toast from 'react-hot-toast';
import { 
  Eye, 
  Mail, 
  Download, 
  Settings, 
  Users, 
  Calendar,
  Award,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Home,
  BarChart3,
  MessageSquare,
  FolderOpen,
  UserCheck,
  CreditCard,
  Archive,
  ChevronRight,
  Menu,
  X,
  Upload,
  BookOpen,
  MapPin,
  Phone,
  Star,
  Send,
  RefreshCw,
  Save,
  Users2,
  RotateCcw,
  Building2,
  Heart
} from 'lucide-react';
import EmailTemplateManager from '../components/EmailTemplateManager';
import ProgrammeBuilderWrapper from '../components/ProgrammeBuilderWrapper';
import FacultyManagementModal from '../components/FacultyManagementModal';
import MentorAssignmentModal from '../components/MentorAssignmentModal';
import ProspectusGenerator from '../components/ProspectusGenerator';
import ProgrammeGenerator from '../components/ProgrammeGenerator';
import LocationManagementModal from '../components/LocationManagementModal';
import { useProgrammeBuilder } from '../hooks/useProgrammeBuilder';

const AdminPanel = () => {
  // Core state
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Course management
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseSettings, setCourseSettings] = useState({
    name: '',
    startDate: '',
    endDate: '',
    venue: '',
    locationId: '',
    maxCandidates: 20,
    courseCost: '',
    eLearningUrl: '',
    description: ''
  });
  const [showCourseSettingsModal, setShowCourseSettingsModal] = useState(false);
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newCourseForm, setNewCourseForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    venue: '',
    locationId: '',
    maxCandidates: 20,
    courseCost: '',
    eLearningUrl: '',
    description: ''
  });
  
  // Candidate management
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  // Faculty management
  const [faculty, setFaculty] = useState([]);
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const [showMentorAssignmentModal, setShowMentorAssignmentModal] = useState(false);
  const [showProspectusGenerator, setShowProspectusGenerator] = useState(false);
  const [showProgrammeGenerator, setShowProgrammeGenerator] = useState(false);
  
  // Location management
  const [locations, setLocations] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // Materials management
  const [courseMaterials, setCourseMaterials] = useState([]);
  const [showUploadMaterialsModal, setShowUploadMaterialsModal] = useState(false);
  const [materialsForm, setMaterialsForm] = useState({
    title: '',
    description: '',
    file: null
  });

  // Programme management
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showAssignFacultyModal, setShowAssignFacultyModal] = useState(false);
  const [showAssignMaterialsModal, setShowAssignMaterialsModal] = useState(false);
  const [showAssignStationFacultyModal, setShowAssignStationFacultyModal] = useState(false);
  const [showAssignConcurrentFacultyModal, setShowAssignConcurrentFacultyModal] = useState(false);
  const [selectedStationIndex, setSelectedStationIndex] = useState(null);
  
  // Assessment management
  const [assessments, setAssessments] = useState([]);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  
  // Communications
  const [emailTemplates, setEmailTemplates] = useState({});
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showEmailTemplateManager, setShowEmailTemplateManager] = useState(false);
  const [emailType, setEmailType] = useState('welcome');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    body: '',
    variables: []
  });
  
  // Hook integration - keeping existing code for now
  const {
    programmeSubjects: hookProgrammeSubjects,
    showAddSubjectModal: hookShowAddSubjectModal,
    setShowAddSubjectModal: hookSetShowAddSubjectModal,
    subjectForm: hookSubjectForm,
    setSubjectForm: hookSetSubjectForm,
    predefinedWorkshopSubjects: hookPredefinedWorkshopSubjects,
    fetchProgrammeSubjects: hookFetchProgrammeSubjects,
    addProgrammeSubject: hookAddProgrammeSubject,
    deleteProgrammeSubject: hookDeleteProgrammeSubject,
    editProgrammeSubject: hookEditProgrammeSubject,
    updateProgrammeSubject: hookUpdateProgrammeSubject,
    getWorkshopGroups: hookGetWorkshopGroups,
    getPracticalSessionGroups: hookGetPracticalSessionGroups
  } = useProgrammeBuilder(selectedCourse);
  
  // Programme management - using hook values
  const programmeSubjects = hookProgrammeSubjects;
  const showAddSubjectModal = hookShowAddSubjectModal;
  const setShowAddSubjectModal = hookSetShowAddSubjectModal;
  const subjectForm = hookSubjectForm;
  const setSubjectForm = hookSetSubjectForm;

  const [showEditSubjectModal, setShowEditSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: ''
  });

  // Programme templates
  const [programmeTemplates, setProgrammeTemplates] = useState([]);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [showProgrammeTemplateModal, setShowProgrammeTemplateModal] = useState(false);
  const [programmeTemplateForm, setProgrammeTemplateForm] = useState({
    name: '',
    description: '',
    subjects: []
  });

  // Workshop rotation (integrated into programme builder)
  const [showWorkshopRotationModal, setShowWorkshopRotationModal] = useState(false);

  useEffect(() => {
    fetchAllCourses();
    fetchCandidates();
    fetchFaculty();
    fetchCourseMaterials();
    fetchAssessments();
    fetchEmailTemplates();
    fetchProgrammeTemplates();
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchCandidates();
      fetchProgrammeSubjects();
    }
  }, [selectedCourse]);



  // Update selected workshop subjects when number of workshops changes
  useEffect(() => {
    if (subjectForm.isWorkshopRotation) {
      const currentSelected = subjectForm.selectedWorkshopSubjects;
      const newSelected = Array(subjectForm.numberOfWorkshops).fill('').map((_, index) => 
        currentSelected[index] || hookPredefinedWorkshopSubjects[index] || `Workshop ${index + 1}`
      );
      setSubjectForm(prev => ({ ...prev, selectedWorkshopSubjects: newSelected }));
    }
  }, [subjectForm.numberOfWorkshops, subjectForm.isWorkshopRotation, hookPredefinedWorkshopSubjects]);

  // Generate rotation schedule for preview
  const generateRotationSchedule = () => {
    if (!subjectForm.isWorkshopRotation) return [];
    
    const numWorkshops = subjectForm.numberOfWorkshops;
    const numRotations = subjectForm.numberOfRotations;
    const groups = ['A', 'B', 'C', 'D'];
    const newWorkshopNames = subjectForm.selectedWorkshopSubjects.filter(name => name.trim() !== '');
    
    // If we have fewer workshops than groups, combine groups
    const shouldCombineGroups = newWorkshopNames.length < groups.length;
    
    const schedule = [];
    for (let rotation = 0; rotation < numRotations; rotation++) {
      const rotationSchedule = [];
      
      if (shouldCombineGroups) {
        // Calculate how many groups should be combined
        const groupsPerWorkshop = Math.ceil(groups.length / newWorkshopNames.length);
        
        for (let workshop = 0; workshop < newWorkshopNames.length; workshop++) {
          const startGroupIndex = (rotation * groupsPerWorkshop) % groups.length;
          const endGroupIndex = Math.min(startGroupIndex + groupsPerWorkshop, groups.length);
          const combinedGroups = groups.slice(startGroupIndex, endGroupIndex);
          
          rotationSchedule.push({
            workshop: newWorkshopNames[workshop] || `Workshop ${workshop + 1}`,
            group: combinedGroups.join('+') // Combine groups with '+'
          });
        }
      } else {
        // Standard rotation - one group per rotation
        for (let workshop = 0; workshop < newWorkshopNames.length; workshop++) {
          const groupIndex = (workshop + rotation) % groups.length;
          rotationSchedule.push({
            workshop: newWorkshopNames[workshop] || `Workshop ${workshop + 1}`,
            group: groups[groupIndex]
          });
        }
      }
      
      schedule.push({
        rotation: rotation + 1,
        sessions: rotationSchedule
      });
    }
    return schedule;
  };

  // Function to get workshop groups for display - using hook function
  const getWorkshopGroups = hookGetWorkshopGroups;
  const getPracticalSessionGroups = hookGetPracticalSessionGroups;

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

  const fetchCandidates = async () => {
    try {
      const q = query(collection(db, 'candidates'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const candidatesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter candidates by selected course and exclude rejected ones
      const filteredCandidates = candidatesData.filter(candidate => {
        // Always exclude rejected and unsuccessful candidates
        if (candidate.status === 'Rejected' || candidate.status === 'Unsuccessful') {
          return false;
        }
        
        // If no course is selected, show all non-rejected candidates
        if (!selectedCourse) {
          return true;
        }
        
        // If candidate has a courseId, it must match the selected course
        if (candidate.courseId) {
          return candidate.courseId === selectedCourse.id;
        }
        
        // If candidate has no courseId, only include them if no course is selected
        // This prevents showing legacy candidates when a specific course is selected
        return false;
      });
      
      setCandidates(filteredCandidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculty = async () => {
    try {
      const facultySnapshot = await getDocs(collection(db, 'faculty'));
      const facultyData = facultySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      const activeFaculty = facultyData.filter(f => !f.deleted);
      setFaculty(activeFaculty);
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const fetchCourseMaterials = async () => {
    try {
      const materialsSnapshot = await getDocs(collection(db, 'courseMaterials'));
      const materialsData = materialsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(material => !material.deleted); // Filter out deleted materials
      setCourseMaterials(materialsData);
    } catch (error) {
      console.error('Error fetching course materials:', error);
    }
  };

  const fetchAssessments = async () => {
    try {
      const assessmentsSnapshot = await getDocs(collection(db, 'assessments'));
      const assessmentsData = assessmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAssessments(assessmentsData);
    } catch (error) {
      console.error('Error fetching assessments:', error);
    }
  };

  const fetchProgrammeSubjects = hookFetchProgrammeSubjects;

  const fetchEmailTemplates = async () => {
    try {
      const result = await cloudFunctions.getEmailTemplates();
      if (result && result.success) {
        setEmailTemplates(result.templates || {});
      } else {
        setEmailTemplates({});
      }
    } catch (error) {
      console.error('Error fetching email templates:', error);
      // Set empty templates on error instead of leaving undefined
      setEmailTemplates({});
    }
  };

  // Course Management Functions
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

  const updateCourseSettings = async () => {
    try {
      if (!selectedCourse) {
        toast.error('No course selected');
        return;
      }

      const cleanSettings = {};
      Object.entries(courseSettings).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
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

      if (Object.keys(cleanSettings).length === 0) {
        toast.error('No valid settings to update');
        return;
      }

      await updateDoc(doc(db, 'courses', selectedCourse.id), {
        ...cleanSettings,
        updatedAt: new Date()
      });

      toast.success('Course settings updated successfully');
      setShowSettingsModal(false);
      fetchAllCourses();
    } catch (error) {
      console.error('Error updating course settings:', error);
      toast.error('Failed to update course settings');
    }
  };

  // Faculty Management Functions
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

  const handleFacultyUpdate = () => {
    fetchFaculty();
  };

  // Materials Management Functions
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

  // Programme Building Functions - using hook functions
  const addProgrammeSubject = hookAddProgrammeSubject;
  const deleteProgrammeSubject = hookDeleteProgrammeSubject;
  const editProgrammeSubject = hookEditProgrammeSubject;
  const updateProgrammeSubject = hookUpdateProgrammeSubject;

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
      console.error('Error removing faculty from subject:', error);
      toast.error('Failed to remove faculty member from subject');
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

  const removeMaterialFromSubject = async (subjectId, materialId) => {
    try {
      const subjectRef = doc(db, 'programmeSubjects', subjectId);
      const subject = programmeSubjects.find(s => s.id === subjectId);
      
      if (subject && subject.assignedMaterials) {
        const updatedMaterials = subject.assignedMaterials.filter(m => m.id !== materialId);
        await updateDoc(subjectRef, { assignedMaterials: updatedMaterials });
        toast.success('Material removed from subject');
        fetchProgrammeSubjects();
      }
    } catch (error) {
      console.error('Error removing material from subject:', error);
      toast.error('Failed to remove material from subject');
    }
  };

  // Programme Template Functions
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

  const fetchLocations = async () => {
    try {
      const locationsSnapshot = await getDocs(collection(db, 'locations'));
      const locationsData = locationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLocations(locationsData);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };



  const loadProgrammeTemplate = async (templateId) => {
    try {
      const templateDoc = await getDoc(doc(db, 'programmeTemplates', templateId));
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
            assignedMaterials: []
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
      if (!programmeTemplateForm.name) {
        toast.error('Please provide a template name');
        return;
      }

      const activeSubjects = programmeSubjects.filter(s => !s.deleted);
      if (activeSubjects.length === 0) {
        toast.error('No subjects to save as template');
        return;
      }

      const templateData = {
        name: programmeTemplateForm.name,
        description: programmeTemplateForm.description,
        subjects: activeSubjects.map(subject => ({
          name: subject.name || '',
          type: subject.type || '',
          duration: subject.duration || 0,
          description: subject.description || '',
          day: subject.day || 1,
          startTime: subject.startTime || '',
          endTime: subject.endTime || '',
          category: subject.category || ''
        })),
        createdAt: new Date(),
        createdBy: 'Admin'
      };

      await addDoc(collection(db, 'programmeTemplates'), templateData);
      
      toast.success('Programme saved as template successfully');
      setShowSaveTemplateModal(false);
      setProgrammeTemplateForm({ name: '', description: '', subjects: [] });
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

  // Communications Functions
  const sendAutomatedEmails = async (emailType) => {
    try {
      const eligibleCandidates = candidates.filter(c => {
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
        toast.success(`Emails sent to ${candidateIds.length} candidates`);
      } else {
        toast.error('Failed to send emails');
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      toast.error('Failed to send emails');
    }
  };

  // Export Functions
  const exportCandidateData = async (format) => {
    try {
      const result = await cloudFunctions.exportCandidateData('all', format);
      
      if (result.success) {
        if (format === 'csv') {
          downloadCSV(result.data, `impact-candidates-${new Date().toISOString().split('T')[0]}.csv`);
        } else {
          downloadJSON(result.data, `impact-candidates-${new Date().toISOString().split('T')[0]}.json`);
        }
        toast.success(`Candidate data exported as ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  // Material Functions
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

  // Utility Functions
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMaterialsForm(prev => ({ ...prev, file }));
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

  const handlePurgeAllCandidates = async () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: This will permanently delete ALL candidates and candidate user accounts!\n\n' +
      'This action cannot be undone. Are you sure you want to continue?\n\n' +
      'This will delete:\n' +
      '• All candidate applications\n' +
      '• All candidate user accounts\n' +
      '• All candidate-related notifications\n' +
      '• All candidate user profiles'
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      const result = await cloudFunctions.purgeAllCandidates();
      
      if (result.success) {
        toast.success(`Purge completed successfully! Deleted ${result.summary.candidatesDeleted} candidates, ${result.summary.usersDeleted} users, and ${result.summary.notificationsDeleted} notifications.`);
        // Refresh the data
        fetchCandidates();
        fetchAllCourses();
      } else {
        toast.error(result.error || 'Failed to purge candidates');
      }
    } catch (error) {
      console.error('Error purging candidates:', error);
      toast.error('Failed to purge candidates');
    } finally {
      setLoading(false);
    }
  };

  const handlePurgeAllFaculty = async () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: This will permanently delete ALL faculty accounts!\n\n' +
      'This action cannot be undone. Are you sure you want to continue?\n\n' +
      'This will delete:\n' +
      '• All faculty user accounts (Firebase Auth)\n' +
      '• All faculty user profiles (Firestore)\n' +
      '• All faculty member records (Firestore)'
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      const result = await cloudFunctions.purgeAllFaculty();
      
      if (result.success) {
        toast.success(`Faculty purge completed successfully! Deleted ${result.deletedCount} faculty accounts.`);
        if (result.errors) {
          console.warn('Some errors occurred during purge:', result.errors);
        }
        // Refresh the data
        fetchFaculty();
      } else {
        toast.error(result.error || 'Failed to purge faculty accounts');
      }
    } catch (error) {
      console.error('Error purging faculty accounts:', error);
      toast.error('Failed to purge faculty accounts');
    } finally {
      setLoading(false);
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

  const openTemplateEditor = (templateId = null) => {
    if (templateId && emailTemplates[templateId]) {
      const template = emailTemplates[templateId];
      setSelectedTemplate(templateId);
      setTemplateForm({
        name: templateId,
        subject: template.subject || '',
        body: template.body || '',
        variables: template.variables || []
      });
    } else {
      setSelectedTemplate(null);
      setTemplateForm({
        name: '',
        subject: '',
        body: '',
        variables: []
      });
    }
    setShowTemplateModal(true);
  };

  const initializeStandardTemplates = async () => {
    try {
      const standardTemplates = {
        welcome: {
          subject: 'Welcome to IMPACT Course - Your Account is Ready',
          body: `Dear {{firstName}} {{surname}},

Welcome to the IMPACT Course! Your payment has been confirmed and your account is now active.

Your login credentials:
Username: {{email}}
Password: {{generatedPassword}}

Please log in at: https://mwl-impact.web.app/login

Don't forget to upload your profile photo and complete your profile information.

Best regards,
IMPACT Course Team`,
          variables: ['firstName', 'surname', 'email', 'generatedPassword'],
          updatedAt: new Date(),
          updatedBy: 'Admin'
        },
        paymentReminder: {
          subject: 'IMPACT Course - Payment Reminder',
          body: `Dear {{firstName}} {{surname}},

We noticed that your payment for the IMPACT course is still pending. To secure your place, please complete your payment as soon as possible.

Course Details:
- Date: {{courseDate}}
- Venue: {{venue}}
- Cost: {{courseCost}}

Please contact our general office team to arrange payment.

Best regards,
IMPACT Course Team`,
          variables: ['firstName', 'surname', 'courseDate', 'venue', 'courseCost'],
          updatedAt: new Date(),
          updatedBy: 'Admin'
        },
        eLearningReminder: {
          subject: 'IMPACT Course - E-Learning Reminder',
          body: `Dear {{firstName}} {{surname}},

Please ensure you have completed the required e-learning modules before attending the IMPACT course.

You can access the e-learning materials at: {{eLearningUrl}}

Best regards,
IMPACT Course Team`,
          variables: ['firstName', 'surname', 'eLearningUrl'],
          updatedAt: new Date(),
          updatedBy: 'Admin'
        },
        courseReminder: {
          subject: 'IMPACT Course - Final Reminder',
          body: `Dear {{firstName}} {{surname}},

This is a final reminder that the IMPACT course is approaching.

Course Details:
- Date: {{courseDate}}
- Venue: {{venue}}
- Start Time: 09:00 AM

Please ensure you have completed all pre-course requirements.

Best regards,
IMPACT Course Team`,
          variables: ['firstName', 'surname', 'courseDate', 'venue'],
          updatedAt: new Date(),
          updatedBy: 'Admin'
        },
        applicationConfirmation: {
          subject: 'IMPACT Course Application Confirmation - Payment Instructions',
          body: `Dear {{firstName}} {{surname}},

Thank you for your application to the IMPACT Course. Your application has been received and is currently pending payment confirmation.

**Payment Instructions**
Please see below for details on how to contact our general office to make payment for the IMPACT Course:

**Payment Contact:** General Office
**Phone:** 0151 705 7428
**Important:** Please quote "IMPACT" when making your payment.
**Fee:** £500 for both days (food will be provided)
**Note:** Please do not share this information with anyone outside of this email list.

**What happens next:**
- General office will provide you with a receipt number
- They will need your name and contact number
- Internal staff can alternatively go to general office and pay there

**Important Course Information**
**Course Criteria:**
- The IMPACT Course is aimed at CT1 and CT2 level doctors in acute medical specialties including Acute Medicine, Acute Care Common Stem (ACCS) and General Internal Medicine.
- The course is also open to FY2 level doctors who are able to demonstrate a particular interest in pursuing a career in the medical specialties noted above.
- FY2 doctors must have completed at least eight months practice in acute medical specialties in their FY2 year before they can attend the course.

**Before Making Payment**
Please ensure you have read the following very carefully before you attempt to make a payment:
- You need to ensure that you have the study leave available before making a payment. Please do not make a payment if this is not available.
- Check that you meet the course criteria.
- Complete your registration form, and I will then provide you with details of how to contact our General Office to make your payment and confirm your place.
- Once you have made payment, I will contact you to confirm your place on the course and provide details on how to register for your pre-course e-learning package.

**Refund Policy**
Notice of Cancellation prior to the course:
- 3 months: Full Refund
- 1 – 3 months: 50% Refund
- 1 month: 25% Refund
- 2 weeks or less: No Refund

**Contact Information**
If you have any issues please send it to the generic email: impact@sthk.nhs.uk

Thank you
Kind regards,
IMPACT @ Whiston Hospital`,
          variables: ['firstName', 'surname', 'email', 'courseName', 'courseDate', 'applicantType'],
          updatedAt: new Date(),
          updatedBy: 'Admin'
        }
      };
      for (const [templateId, templateData] of Object.entries(standardTemplates)) {
        await cloudFunctions.updateEmailTemplate(templateId, templateData);
      }
      toast.success('Standard email templates initialized successfully');
      fetchEmailTemplates();
    } catch (error) {
      console.error('Error initializing templates:', error);
      toast.error('Failed to initialize templates');
    }
  };

  const saveEmailTemplate = async () => {
    try {
      if (!templateForm.name || !templateForm.subject || !templateForm.body) {
        toast.error('Please fill in all required fields');
        return;
      }

      const templateData = {
        subject: templateForm.subject,
        body: templateForm.body,
        variables: templateForm.variables,
        updatedAt: new Date(),
        updatedBy: 'Admin'
      };

      await cloudFunctions.updateEmailTemplate(templateForm.name, templateData);
      toast.success('Email template saved successfully');
      setShowTemplateModal(false);
      fetchEmailTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  const addVariable = () => {
    const variableName = prompt('Enter variable name (e.g., firstName):');
    if (variableName && !templateForm.variables.includes(variableName)) {
      setTemplateForm(prev => ({
        ...prev,
        variables: [...prev.variables, variableName]
      }));
    }
  };

  const removeVariable = (variable) => {
    setTemplateForm(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v !== variable)
    }));
  };

  const insertVariable = (variable) => {
    const textarea = document.getElementById('template-body');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = templateForm.body;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + `{{${variable}}}` + after;
    
    setTemplateForm(prev => ({ ...prev, body: newText }));
    
    // Set cursor position after inserted variable
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
    }, 0);
  };



  const sendBulkEmails = async () => {
    if (selectedCandidates.length === 0) {
      toast.error('Please select at least one candidate');
      return;
    }

    try {
      const candidateIds = selectedCandidates.map(c => c.id);
      await cloudFunctions.sendBulkEmails(emailType, candidateIds);
      toast.success(`Email sent to ${selectedCandidates.length} candidates`);
      setShowEmailModal(false);
      setSelectedCandidates([]);
    } catch (error) {
      console.error('Error sending emails:', error);
      toast.error('Failed to send emails');
    }
  };

  const stats = {
    total: candidates.length,
    prospective: candidates.filter(c => c.status === 'Prospective').length,
    pendingPayment: candidates.filter(c => c.status === 'Pending Payment').length,
    paidInFull: candidates.filter(c => c.status === 'Paid in Full').length,
    liveCandidates: candidates.filter(c => c.status === 'Live Candidate').length
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-nhs-blue' },
    { id: 'candidates', label: 'Candidates', icon: Users, color: 'text-nhs-green' },
    { id: 'nurse-observers', label: 'Nurse Observers', icon: Users2, color: 'text-nhs-cyan' },
    { id: 'course-management', label: 'Course Management', icon: Calendar, color: 'text-nhs-purple' },
    { id: 'faculty', label: 'Faculty', icon: UserCheck, color: 'text-nhs-orange' },
    { id: 'materials', label: 'Materials', icon: FileText, color: 'text-nhs-red' },
    { id: 'programme', label: 'Programme', icon: BookOpen, color: 'text-nhs-indigo' },
    { id: 'assessments', label: 'Assessments', icon: Award, color: 'text-nhs-pink' },
    { id: 'communications', label: 'Communications', icon: MessageSquare, color: 'text-nhs-teal' },
    { id: 'email-templates', label: 'Email Templates', icon: FileText, color: 'text-nhs-cyan' },
    { id: 'locations', label: 'Location Management', icon: MapPin, color: 'text-nhs-brown' },
    { id: 'reports', label: 'Reports & Export', icon: BarChart3, color: 'text-nhs-gray' }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Course Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Current Course</h3>
            <p className="text-sm text-gray-600">Select a course to filter candidates and data</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedCourse?.id || ''}
              onChange={(e) => {
                const course = allCourses.find(c => c.id === e.target.value);
                setSelectedCourse(course);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Courses</option>
              {allCourses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name} {course.archived ? '(Archived)' : ''}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowNewCourseModal(true)}
              className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              New Course
            </button>
          </div>
        </div>
        {selectedCourse && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
              <div>
                <span className="font-medium text-gray-700">Max Candidates:</span>
                <p className="text-gray-600">{selectedCourse.maxCandidates}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Candidates</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prospective</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.prospective}</p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="text-yellow-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payment</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingPayment}</p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <CreditCard className="text-orange-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid in Full</p>
              <p className="text-2xl font-bold text-blue-600">{stats.paidInFull}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-blue-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Live Candidates</p>
              <p className="text-2xl font-bold text-green-600">{stats.liveCandidates}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="text-green-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            to="/admin/candidates" 
            className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors h-full"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <Eye className="text-blue-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">View Candidates</p>
              <p className="text-sm text-gray-500">Manage applications</p>
            </div>
          </Link>

          <Link 
            to="/admin/course-management" 
            className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors h-full"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <Calendar className="text-purple-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Course Management</p>
              <p className="text-sm text-gray-500">Administer courses</p>
            </div>
          </Link>

          <Link 
            to="/admin/assessment" 
            className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors h-full"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <Award className="text-orange-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Assessment</p>
              <p className="text-sm text-gray-500">Manage assessments</p>
            </div>
          </Link>

          <button 
            onClick={() => setShowEmailModal(true)}
            className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left w-full h-full"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <Mail className="text-green-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Send Emails</p>
              <p className="text-sm text-gray-500">Email candidates</p>
            </div>
          </button>

                    <button
            onClick={() => setShowProspectusGenerator(true)}
            className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left w-full h-full"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <FileText className="text-blue-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Generate Prospectus</p>
              <p className="text-sm text-gray-500">Create course prospectus</p>
            </div>
          </button>
          <button
            onClick={() => setShowProgrammeGenerator(true)}
            className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left w-full h-full"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <Calendar className="text-green-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Generate Programme</p>
              <p className="text-sm text-gray-500">Create course programme</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Candidates */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Candidates</h3>
          <Link to="/admin/candidates" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Grade</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.slice(0, 5).map((candidate) => (
                <tr key={candidate.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.find(c => c.id === candidate.id) !== undefined}
                        onChange={() => handleCandidateSelection(candidate)}
                        className="rounded border-gray-300"
                      />
                      <span className="font-medium">{candidate.firstName} {candidate.surname}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{candidate.email}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(candidate.status)}
                      <span className="text-sm">{candidate.status}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{candidate.grade || 'N/A'}</td>
                  <td className="py-3 px-4">
                    {candidate.status === 'Paid in Full' && (
                      <span className="text-green-600 text-sm font-medium">
                        Ready for Activation
                      </span>
                    )}
                    {candidate.status === 'Live Candidate' && (
                      <span className="text-blue-600 text-sm font-medium">
                        Activated
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCommunications = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Bulk Emails</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Type</label>
            <select
              value={emailType}
              onChange={(e) => setEmailType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="welcome">Welcome Email</option>
              <option value="paymentReminder">Payment Reminder</option>
              <option value="eLearningReminder">E-Learning Reminder</option>
              <option value="courseReminder">Course Reminder</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Selected Candidates ({selectedCandidates.length})</label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
              {selectedCandidates.length === 0 ? (
                <p className="text-gray-500 text-sm">No candidates selected</p>
              ) : (
                selectedCandidates.map(candidate => (
                  <div key={candidate.id} className="flex items-center justify-between py-1">
                    <span className="text-sm">{candidate.firstName} {candidate.surname} ({candidate.email})</span>
                    <button
                      onClick={() => handleCandidateSelection(candidate)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => setShowEmailModal(true)}
            disabled={selectedCandidates.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send Email to Selected Candidates
          </button>
        </div>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Email Templates</h3>
          <div className="flex space-x-2">
            <button
              onClick={initializeStandardTemplates}
              className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm"
            >
              Initialize Templates
            </button>
            <button
              onClick={() => openTemplateEditor()}
              className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              Create New
            </button>
          </div>
        </div>
        
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Building2 className="text-blue-600" size={16} />
            <span className="font-medium text-blue-900">Global Templates</span>
          </div>
          <p className="text-blue-800 text-sm">
            Email templates are global and can be used across all courses. Changes to templates will affect all courses that use them.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(emailTemplates).map(([templateId, template]) => (
            <div key={templateId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900 capitalize">{templateId.replace(/([A-Z])/g, ' $1').trim()}</h4>
                <button
                  onClick={() => openTemplateEditor(templateId)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Edit
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
              <div className="text-xs text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {template.variables?.length || 0} variables
                </span>
                {template.updatedAt && (
                  <span className="ml-2">
                    Updated: {template.updatedAt.toDate?.() ? template.updatedAt.toDate().toLocaleDateString() : 'Recently'}
                  </span>
                )}
              </div>
            </div>
          ))}
          {Object.keys(emailTemplates).length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No email templates found. Click "Initialize Templates" to set up standard templates.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <button 
            onClick={() => exportCandidateData('json')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <Download className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="font-medium text-gray-900">Export JSON</p>
              <p className="text-sm text-gray-500">Download as JSON format</p>
            </div>
          </button>

          <button 
            onClick={() => exportCandidateData('csv')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <FileText className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="font-medium text-gray-900">Export CSV</p>
              <p className="text-sm text-gray-500">Download as CSV format</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Settings</h3>
        <button 
          onClick={() => setShowSettingsModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Configure Course Settings
        </button>
      </div>
    </div>
  );

  const renderFaculty = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Faculty Management</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowMentorAssignmentModal(true)}
              className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm flex items-center space-x-2"
              disabled={!selectedCourse}
              title={!selectedCourse ? "Please select a course first" : "Manage mentor assignments for this course"}
            >
              <Heart size={16} />
              <span>Mentor Assignments</span>
            </button>
            <button
              onClick={() => setShowAddFacultyModal(true)}
              className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              Add Faculty Member
            </button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {faculty.map((member) => (
            <div key={member.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{member.name}</h4>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{member.role}</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{member.email}</p>
              <p className="text-sm text-gray-600 mb-2">{member.specialty}</p>
              <div className="flex space-x-2">
                <button className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200">
                  Edit
                </button>
                <button 
                  onClick={() => deleteFacultyMember(member.id)}
                  className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {faculty.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No faculty members found. Click "Add Faculty Member" to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCandidateManagement = () => (
    <div className="space-y-6">
      {/* Candidate Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Candidate Overview</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowEmailModal(true)}
              className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm"
            >
              Send Bulk Emails
            </button>
            <Link 
              to="/admin/candidates" 
              className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              Full Management
            </Link>
            <button
              onClick={handlePurgeAllCandidates}
              className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 text-sm"
              title="DEBUG: Delete all candidates and candidate user accounts"
            >
              🗑️ Purge All (DEBUG)
            </button>
            <button
              onClick={handlePurgeAllFaculty}
              className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 text-sm"
              title="DEBUG: Delete all faculty accounts"
            >
              🗑️ Purge Faculty (DEBUG)
            </button>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-blue-700">Total Candidates</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.prospective}</p>
            <p className="text-sm text-yellow-700">Prospective</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.pendingPayment}</p>
            <p className="text-sm text-orange-700">Pending Payment</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.paidInFull}</p>
            <p className="text-sm text-blue-700">Paid in Full</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.liveCandidates}</p>
            <p className="text-sm text-green-700">Live Candidates</p>
          </div>
        </div>

        {/* Recent Candidates Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Grade</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Group</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.slice(0, 10).map((candidate) => (
                <tr key={candidate.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.find(c => c.id === candidate.id) !== undefined}
                        onChange={() => handleCandidateSelection(candidate)}
                        className="rounded border-gray-300"
                      />
                      <span className="font-medium">{candidate.firstName} {candidate.surname}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{candidate.email}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(candidate.status)}
                      <span className="text-sm">{candidate.status}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{candidate.grade || 'N/A'}</td>
                  <td className="py-3 px-4">
                    {candidate.assignedGroup ? (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                        Group {candidate.assignedGroup}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Not assigned</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      {candidate.status === 'Paid in Full' && (
                        <span className="text-green-600 text-sm font-medium">
                          Ready for Activation
                        </span>
                      )}
                      {candidate.status === 'Live Candidate' && (
                        <span className="text-blue-600 text-sm font-medium">
                          Activated
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setSelectedCandidate(candidate);
                          setShowCandidateModal(true);
                        }}
                        className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {candidates.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No candidates found for the selected course.</p>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedCandidates.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Actions ({selectedCandidates.length} selected)</h3>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowEmailModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Send Email
            </button>
            <button
              onClick={() => setSelectedCandidates([])}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderNurseObserverManagement = () => {
    // Filter candidates to only show nurse observers
    const nurseObservers = candidates.filter(c => c.applicantType === 'Nurse Observer');
    const pendingNurseObservers = nurseObservers.filter(c => c.status === 'Pending Payment');
    const confirmedNurseObservers = nurseObservers.filter(c => c.status === 'Live Candidate' || c.status === 'Paid in Full');
    const withdrawnNurseObservers = nurseObservers.filter(c => c.status === 'Withdrawn');

    const confirmNurseObserver = async (candidateId) => {
      try {
        // Use the activateCandidate function to properly assign groups and create user account
        await cloudFunctions.activateCandidate(candidateId);
        toast.success('Nurse observer confirmed and group assigned successfully');
        fetchCandidates();
      } catch (error) {
        console.error('Error confirming nurse observer:', error);
        toast.error('Failed to confirm nurse observer');
      }
    };

    return (
      <div className="space-y-6">
        {/* Nurse Observer Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Nurse Observer Management</h3>
            <div className="text-sm text-gray-600">
              Max: 4 observers per course
            </div>
          </div>
          
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{nurseObservers.length}</p>
              <p className="text-sm text-blue-700">Total Observers</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{pendingNurseObservers.length}</p>
              <p className="text-sm text-yellow-700">Pending Confirmation</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{confirmedNurseObservers.length}</p>
              <p className="text-sm text-green-700">Confirmed</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{withdrawnNurseObservers.length}</p>
              <p className="text-sm text-red-700">Withdrawn</p>
            </div>
          </div>

          {/* Nurse Observers Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Group</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Applied Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {nurseObservers.map((observer) => (
                  <tr key={observer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium">{observer.firstName} {observer.surname}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{observer.email}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(observer.status)}
                        <span className="text-sm">{observer.status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {observer.assignedGroup ? (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          Group {observer.assignedGroup}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Not assigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {observer.createdAt?.toDate?.() ? observer.createdAt.toDate().toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        {observer.status === 'Pending Payment' && (
                          <button
                            onClick={() => confirmNurseObserver(observer.id)}
                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                          >
                            Confirm
                          </button>
                        )}
                        {observer.status === 'Live Candidate' && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Confirmed
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setSelectedCandidate(observer);
                            setShowCandidateModal(true);
                          }}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {nurseObservers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No nurse observers found for the selected course.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCourseManagement = () => (
    <div className="space-y-6">
      {/* Course Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Course Overview</h3>
          <button
            onClick={() => setShowNewCourseModal(true)}
            className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            Create New Course
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allCourses.map((course) => (
            <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{course.name}</h4>
                <span className={`text-xs px-2 py-1 rounded ${
                  course.archived ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {course.archived ? 'Archived' : 'Active'}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600 mb-3">
                <p><span className="font-medium">Start Date:</span> {course.startDate}</p>
                <p><span className="font-medium">Venue:</span> {course.venue}</p>
                <p><span className="font-medium">Max Candidates:</span> {course.maxCandidates}</p>
                {course.courseCost && <p><span className="font-medium">Cost:</span> {course.courseCost}</p>}
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setSelectedCourse(course);
                    setCourseSettings({
                      name: course.name || '',
                      startDate: course.startDate || '',
                      endDate: course.endDate || '',
                      venue: course.venue || '',
                      maxCandidates: course.maxCandidates || 20,
                      courseCost: course.courseCost || '',
                      eLearningUrl: course.eLearningUrl || '',
                      description: course.description || ''
                    });
                    setShowSettingsModal(true);
                  }}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                >
                  Edit Settings
                </button>
                <button 
                  onClick={() => {
                    setSelectedCourse(course);
                    setActiveSection('dashboard');
                  }}
                  className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                >
                  Select Course
                </button>
              </div>
            </div>
          ))}
          {allCourses.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No courses found. Click "Create New Course" to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Current Course Details */}
      {selectedCourse && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Course: {selectedCourse.name}</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Course Details</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Start Date:</span> {selectedCourse.startDate}</p>
                <p><span className="font-medium">Venue:</span> {selectedCourse.venue}</p>
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-1 ${selectedCourse.archived ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedCourse.archived ? 'Archived' : 'Active'}
                  </span>
                </p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Capacity</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Max Candidates:</span> {selectedCourse.maxCandidates}</p>
                <p><span className="font-medium">Current:</span> {candidates.filter(c => c.status === 'Live Candidate' || c.status === 'Paid in Full').length}</p>
                <p><span className="font-medium">Available:</span> {selectedCourse.maxCandidates - candidates.filter(c => c.status === 'Live Candidate' || c.status === 'Paid in Full').length}</p>
                <p><span className="font-medium">Doctors & ANPs:</span> {candidates.filter(c => (c.status === 'Live Candidate' || c.status === 'Paid in Full') && (c.applicantType === 'Doctor' || c.applicantType === 'Advanced Nurse Practitioner')).length}/16</p>
                <p><span className="font-medium">Nurse Observers:</span> {candidates.filter(c => (c.status === 'Live Candidate' || c.status === 'Paid in Full') && c.applicantType === 'Nurse Observer').length}/4</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Programme</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Subjects:</span> {programmeSubjects.length}</p>
                <p><span className="font-medium">Faculty:</span> {faculty.length}</p>
                <p><span className="font-medium">Materials:</span> {courseMaterials.length}</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => setShowSettingsModal(true)}
                  className="w-full text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                >
                  Edit Settings
                </button>
                <button 
                  onClick={() => setActiveSection('faculty')}
                  className="w-full text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                >
                  Manage Faculty
                </button>
                <button 
                  onClick={() => setActiveSection('materials')}
                  className="w-full text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200"
                >
                  Manage Materials
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMaterials = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Course Materials</h3>
          <button
            onClick={() => setShowUploadMaterialsModal(true)}
            className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            Upload Material
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courseMaterials.map((material) => (
            <div key={material.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{material.title}</h4>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  {material.fileType?.split('/')[1]?.toUpperCase() || 'FILE'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{material.description}</p>
              <div className="flex space-x-2">
                <a
                  href={material.downloadURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                >
                  Download
                </a>
                <button 
                  onClick={() => deleteCourseMaterial(material.id)}
                  className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {courseMaterials.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No course materials found. Click "Upload Material" to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderProgramme = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-nhs-dark-grey">Programme Builder</h3>
            <p className="text-sm text-nhs-grey mt-1">
              Programme changes are shared between Course Management and Admin Panel for this course
            </p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowProgrammeTemplateModal(true)}
              className="bg-nhs-green hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center space-x-2"
            >
              <FolderOpen size={16} />
              <span>Load Template</span>
            </button>
            <button 
              onClick={() => setShowSaveTemplateModal(true)}
              className="bg-nhs-purple hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Save as Template</span>
            </button>
          </div>
        </div>
        
        <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Building2 className="text-purple-600" size={16} />
            <span className="font-medium text-purple-900">Global Programme Templates</span>
          </div>
          <p className="text-purple-800 text-sm">
            Programme templates are global and can be used across all courses. You can save the current programme structure as a template or load existing templates.
          </p>
        </div>
        
        <div className="flex space-x-2 mb-4">
          <button 
            onClick={performCleanup}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex items-center space-x-2"
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
            {programmeSubjects
              .filter(s => !s.deleted)
              .sort((a, b) => {
                // First sort by day
                if (a.day !== b.day) return a.day - b.day;
                // Then sort by start time
                return a.startTime.localeCompare(b.startTime);
              })
              .map((subject) => (
              <div key={subject.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-nhs-dark-grey">{subject.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        subject.type === 'session' ? 'bg-blue-100 text-blue-800' :
                        subject.type === 'workshop' ? 'bg-green-100 text-green-800' :
                        subject.type === 'practical' ? 'bg-purple-100 text-purple-800' :
                        subject.type === 'assessment' ? 'bg-orange-100 text-orange-800' :
                        subject.type === 'break' ? 'bg-yellow-100 text-yellow-800' :
                        subject.type === 'lunch' ? 'bg-orange-100 text-orange-800' :
                        subject.type === 'assessment' ? 'bg-purple-500 text-white' :
                        subject.type === 'scenario-practice' ? 'bg-blue-500 text-white' :
                        subject.type === 'practical-session' ? 'bg-indigo-500 text-white' :

                        'bg-gray-100 text-gray-800'
                      }`}>
                                                 {subject.type === 'assessment' ? 'Assessment' :
                         subject.type === 'scenario-practice' ? 'Scenario Practice' :
                         subject.type === 'practical-session' ? 'Practical Session' :

                         subject.type.charAt(0).toUpperCase() + subject.type.slice(1)}
                      </span>
                      
                      {/* Group Assignment Badges */}
                      {subject.isWorkshopRotation ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          Group {getWorkshopGroups(subject)}
                        </span>
                      ) : subject.isPracticalSession ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          Group {getPracticalSessionGroups(subject)}
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          All Groups
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
                                                 {subject.type === 'assessment' && (
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
                      {subject.type === 'practical-session' && (
                        <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                          {subject.numberOfStations} Stations, {subject.numberOfTimeSlots} Slots
                        </span>
                      )}
                    </div>
                    
                    {/* Detailed Schedule for Assessment and Practical Sessions */}
                    {(subject.type === 'assessment' || subject.type === 'practical-session') && subject.timeSlots && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <h6 className="font-medium text-nhs-dark-grey mb-2">Detailed Schedule:</h6>
                        
                        {/* Station Faculty Assignments for Assessment */}
                        {subject.type === 'assessment' && (
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
                        {subject.type === 'assessment' && subject.concurrentActivityName && (
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
                         onClick={() => editProgrammeSubject(subject)}
                         className="text-nhs-blue hover:text-nhs-dark-blue ml-2"
                         title="Edit subject name and description"
                       >
                         <Edit size={16} />
                       </button>
                       <button
                         onClick={() => deleteProgrammeSubject(subject.id)}
                         className="text-red-500 hover:text-red-700 ml-2"
                         title="Delete subject"
                       >
                         <Trash2 size={16} />
                       </button>
                </div>

                {/* Faculty Assignment - Only show for non-break/lunch items */}
                {subject.type !== 'break' && subject.type !== 'lunch' && (
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium text-nhs-dark-grey">Assigned Faculty</h5>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedSubject(subject);
                            setShowAssignFacultyModal(true);
                          }}
                          className="text-nhs-blue hover:text-nhs-dark-blue text-sm"
                        >
                          Assign Faculty
                        </button>
                        {/* Show station faculty assignment button for practical sessions */}
                        {subject.isPracticalSession && (
                          <button
                            onClick={() => {
                              setSelectedSubject(subject);
                              setShowAssignStationFacultyModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 text-sm"
                          >
                            Assign Station Faculty
                          </button>
                        )}
                      </div>
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
                    
                    {/* Show station faculty assignments for practical sessions */}
                    {subject.isPracticalSession && subject.stationFaculty && (
                      <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                        <h6 className="font-medium text-nhs-dark-grey mb-2">Station Faculty Assignments:</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {subject.stationFaculty.map((stationFaculty, stationIndex) => (
                            <div key={stationIndex} className="bg-white p-2 rounded border">
                              <div className="font-medium text-nhs-dark-grey">
                                Station {stationIndex + 1}: {subject.stationNames?.[stationIndex] || `Station ${stationIndex + 1}`}
                              </div>
                              <div className="text-nhs-grey">
                                {stationFaculty.length > 0 ? (
                                  stationFaculty.map(faculty => faculty.name).join(', ')
                                ) : (
                                  'No faculty assigned'
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
  );

  const renderAssessments = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Assessment Management</h3>
          <button
            onClick={() => setShowAssessmentModal(true)}
            className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            Add Assessment
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assessments.map((assessment) => (
            <div key={assessment.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{assessment.title}</h4>
                <span className={`text-xs px-2 py-1 rounded ${
                  assessment.status === 'completed' ? 'bg-green-100 text-green-800' :
                  assessment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {assessment.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{assessment.description}</p>
              <div className="text-xs text-gray-500">
                <p>Type: {assessment.type}</p>
                <p>Due: {assessment.dueDate}</p>
              </div>
              <div className="flex space-x-2 mt-2">
                <button className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200">
                  View
                </button>
                <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                  Grade
                </button>
              </div>
            </div>
          ))}
          {assessments.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No assessments found. Click "Add Assessment" to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );



  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'candidates':
        return renderCandidateManagement();
      case 'nurse-observers':
        return renderNurseObserverManagement();
      case 'course-management':
        return renderCourseManagement();
      case 'faculty':
        return renderFaculty();
      case 'materials':
        return renderMaterials();
      case 'programme':
        return renderProgramme();
      case 'assessments':
        return renderAssessments();
      case 'communications':
        return renderCommunications();
      case 'email-templates':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Email Template Management</h3>
              <button
                onClick={() => setShowEmailTemplateManager(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
              >
                Manage Templates
              </button>
            </div>
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Building2 className="text-blue-600" size={16} />
                <span className="font-medium text-blue-900">Global Templates</span>
              </div>
              <p className="text-blue-800 text-sm">
                Email templates are global and can be used across all courses. Changes to templates will affect all courses that use them.
              </p>
            </div>
            <p className="text-gray-600 mb-4">Create, edit, and manage email templates for automated communications with candidates and faculty.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(emailTemplates).map(([templateId, template]) => (
                <div key={templateId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 capitalize">{templateId.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {template.variables?.length || 0} variables
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                  {template.updatedAt && (
                    <p className="text-xs text-gray-500">
                      Updated: {template.updatedAt.toDate?.() ? template.updatedAt.toDate().toLocaleDateString() : 'Recently'}
                    </p>
                  )}
                </div>
              ))}
              {Object.keys(emailTemplates).length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No email templates found. Click "Manage Templates" to create templates.</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'locations':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Location Management</h3>
              <button
                onClick={() => {
                  setSelectedLocation(null);
                  setShowLocationModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add Location</span>
              </button>
            </div>
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="text-blue-600" size={16} />
                <span className="font-medium text-blue-900">Venue Information</span>
              </div>
              <p className="text-blue-800 text-sm">
                Manage venue details, contact information, directions, and photos for course prospectuses. This information will be used in generated prospectuses.
              </p>
            </div>
            <p className="text-gray-600 mb-4">Create and manage venue locations with detailed information including directions, parking, facilities, and photos.</p>
            
            {locations.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locations.map((location) => (
                  <div key={location.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{location.name}</h4>
                      <button
                        onClick={() => {
                          setSelectedLocation(location);
                          setShowLocationModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{location.address.street}, {location.address.city}</p>
                    <div className="space-y-1 text-xs text-gray-500">
                      <div>📞 {location.contact.phone || 'No phone'}</div>
                      <div>📧 {location.contact.email || 'No email'}</div>
                      <div>🚗 {location.parking.available ? 'Parking available' : 'No parking'}</div>
                      <div>📶 {location.facilities.wifi ? 'WiFi' : 'No WiFi'}</div>
                    </div>
                    {location.photos && location.photos.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">📷 {location.photos.length} photo(s)</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 mb-4">No locations found. Add your first venue location to get started.</p>
                <button
                  onClick={() => {
                    setSelectedLocation(null);
                    setShowLocationModal(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Add First Location
                </button>
              </div>
            )}
          </div>
        );
      case 'templates':
        return renderTemplates();
      case 'reports':
        return renderReports();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

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
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className={`mr-3 ${item.color}`} size={20} />
                    {item.label}
                  </div>
                  {activeSection === item.id && (
                    <ChevronRight className="text-blue-600" size={16} />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-0 flex-1">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu size={20} />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                {navigationItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
              </h2>
            </div>
            
            {/* Course Selector - Always visible */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Calendar className="text-gray-500" size={16} />
                <span className="text-sm font-medium text-gray-700">Course:</span>
              </div>
              <select
                value={selectedCourse?.id || ''}
                onChange={(e) => {
                  const course = allCourses.find(c => c.id === e.target.value);
                  setSelectedCourse(course);
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="">Select Course</option>
                {allCourses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name} {course.archived ? '(Archived)' : ''}
                  </option>
                ))}
              </select>
              {selectedCourse && (
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <span className={`px-2 py-1 rounded-full ${
                    selectedCourse.archived ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {selectedCourse.archived ? 'Archived' : 'Active'}
                  </span>
                  <span>{selectedCourse.startDate}</span>
                </div>
              )}
              <button
                onClick={() => setShowNewCourseModal(true)}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-sm"
              >
                New Course
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Send Email</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Type</label>
                <select
                  value={emailType}
                  onChange={(e) => setEmailType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="welcome">Welcome Email</option>
                  <option value="paymentReminder">Payment Reminder</option>
                  <option value="eLearningReminder">E-Learning Reminder</option>
                  <option value="courseReminder">Course Reminder</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={sendBulkEmails}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Send
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
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Course Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={courseSettings.startDate}
                  onChange={(e) => setCourseSettings(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Venue</label>
                <input
                  type="text"
                  value={courseSettings.venue}
                  onChange={(e) => setCourseSettings(prev => ({ ...prev, venue: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Candidates</label>
                <input
                  type="number"
                  value={courseSettings.maxCandidates}
                  onChange={(e) => setCourseSettings(prev => ({ ...prev, maxCandidates: parseInt(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Course Cost</label>
                <input
                  type="text"
                  value={courseSettings.courseCost}
                  onChange={(e) => setCourseSettings(prev => ({ ...prev, courseCost: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">E-Learning URL</label>
                <input
                  type="url"
                  value={courseSettings.eLearningUrl}
                  onChange={(e) => setCourseSettings(prev => ({ ...prev, eLearningUrl: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={updateCourseSettings}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
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
          selectedCourse={selectedCourse}
          onClose={() => setShowProspectusGenerator(false)}
        />
      )}

      {/* Programme Generator Modal */}
      {showProgrammeGenerator && (
        <ProgrammeGenerator
          selectedCourse={selectedCourse}
          onClose={() => setShowProgrammeGenerator(false)}
        />
      )}

      {/* Materials Upload Modal */}
      {showUploadMaterialsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Upload Course Material</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={materialsForm.title}
                  onChange={(e) => setMaterialsForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Material title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={materialsForm.description}
                  onChange={(e) => setMaterialsForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Brief description of the material"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">File *</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4,.mp3"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={uploadCourseMaterial}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
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
        </div>
      )}

      {/* Programme Subject Modal */}
      <ProgrammeBuilderWrapper
        courseId={selectedCourse}
        isOpen={showAddSubjectModal}
        onClose={() => setShowAddSubjectModal(false)}
        subjectForm={subjectForm}
        setSubjectForm={setSubjectForm}
        onAddSubject={addProgrammeSubject}
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
                      onClick={async () => {
                        try {
                          const subjectRef = doc(db, 'programmeSubjects', selectedSubject.id);
                          const currentFaculty = selectedSubject.assignedFaculty || [];
                          
                          if (isAssigned) {
                            const updatedFaculty = currentFaculty.filter(f => f.id !== facultyMember.id);
                            await updateDoc(subjectRef, { assignedFaculty: updatedFaculty });
                            toast.success('Faculty removed from subject');
                          } else {
                            const updatedFaculty = [...currentFaculty, {
                              id: facultyMember.id,
                              name: facultyMember.name,
                              role: facultyMember.role
                            }];
                            await updateDoc(subjectRef, { assignedFaculty: updatedFaculty });
                            toast.success('Faculty assigned to subject');
                          }
                          fetchProgrammeSubjects();
                          setShowAssignFacultyModal(false);
                        } catch (error) {
                          console.error('Error assigning faculty:', error);
                          toast.error('Failed to assign faculty');
                        }
                      }}
                      className={`px-3 py-1 rounded text-sm ${
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
                    <div>
                      <h4 className="font-medium text-nhs-dark-grey">{material.title}</h4>
                      <p className="text-sm text-nhs-grey">{material.description}</p>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const subjectRef = doc(db, 'programmeSubjects', selectedSubject.id);
                          const currentMaterials = selectedSubject.assignedMaterials || [];
                          
                          if (isAssigned) {
                            const updatedMaterials = currentMaterials.filter(m => m.id !== material.id);
                            await updateDoc(subjectRef, { assignedMaterials: updatedMaterials });
                            toast.success('Material removed from subject');
                          } else {
                            const updatedMaterials = [...currentMaterials, {
                              id: material.id,
                              title: material.title,
                              description: material.description
                            }];
                            await updateDoc(subjectRef, { assignedMaterials: updatedMaterials });
                            toast.success('Material assigned to subject');
                          }
                          fetchProgrammeSubjects();
                          setShowAssignMaterialsModal(false);
                        } catch (error) {
                          console.error('Error assigning material:', error);
                          toast.error('Failed to assign material');
                        }
                      }}
                      className={`px-3 py-1 rounded text-sm ${
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
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                {selectedTemplate ? 'Edit Email Template' : 'Create Email Template'}
              </h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Template Form */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., welcome, payment-reminder"
                    disabled={selectedTemplate !== null}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Email subject line"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Body *
                  </label>
                  <textarea
                    id="template-body"
                    value={templateForm.body}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, body: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={12}
                    placeholder="Enter your email content here. Use {{variableName}} for dynamic content."
                  />
                </div>
              </div>

              {/* Variables Panel */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Available Variables</h4>
                  <div className="space-y-2">
                    {templateForm.variables.map((variable) => (
                      <div key={variable} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-mono">{'{{' + variable + '}}'}</span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => insertVariable(variable)}
                            className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                          >
                            Insert
                          </button>
                          <button
                            onClick={() => removeVariable(variable)}
                            className="text-xs bg-red-500 text-white px-2 py-1 rounded"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addVariable}
                    className="mt-2 w-full text-sm bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300"
                  >
                    + Add Variable
                  </button>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Common Variables</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><code className="bg-gray-100 px-1 rounded">{'{{firstName}}'}</code> - Candidate's first name</p>
                    <p><code className="bg-gray-100 px-1 rounded">{'{{surname}}'}</code> - Candidate's surname</p>
                    <p><code className="bg-gray-100 px-1 rounded">{'{{email}}'}</code> - Candidate's email</p>
                    <p><code className="bg-gray-100 px-1 rounded">{'{{courseName}}'}</code> - Course name</p>
                    <p><code className="bg-gray-100 px-1 rounded">{'{{courseDate}}'}</code> - Course date</p>
                    <p><code className="bg-gray-100 px-1 rounded">{'{{venue}}'}</code> - Course venue</p>
                    <p><code className="bg-gray-100 px-1 rounded">{'{{courseCost}}'}</code> - Course cost</p>
                    <p><code className="bg-gray-100 px-1 rounded">{'{{generatedPassword}}'}</code> - Generated password</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={saveEmailTemplate}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Save Template
              </button>
              <button
                onClick={() => setShowTemplateModal(false)}
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Course</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Course Name *</label>
                <input
                  type="text"
                  value={newCourseForm.name}
                  onChange={(e) => setNewCourseForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., IMPACT Course 2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Start Date *</label>
                <input
                  type="date"
                  value={newCourseForm.startDate}
                  onChange={(e) => setNewCourseForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={newCourseForm.endDate}
                  onChange={(e) => setNewCourseForm(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Venue *</label>
                <input
                  type="text"
                  value={newCourseForm.venue}
                  onChange={(e) => setNewCourseForm(prev => ({ ...prev, venue: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Medical Education Centre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Candidates</label>
                <input
                  type="number"
                  value={newCourseForm.maxCandidates}
                  onChange={(e) => setNewCourseForm(prev => ({ ...prev, maxCandidates: parseInt(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  min="1"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Course Cost</label>
                <input
                  type="text"
                  value={newCourseForm.courseCost}
                  onChange={(e) => setNewCourseForm(prev => ({ ...prev, courseCost: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., £500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">E-Learning URL</label>
                <input
                  type="url"
                  value={newCourseForm.eLearningUrl}
                  onChange={(e) => setNewCourseForm(prev => ({ ...prev, eLearningUrl: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newCourseForm.description}
                  onChange={(e) => setNewCourseForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Brief description of the course"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={createNewCourse}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
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
        </div>
      )}

      {/* Programme Template Modals */}
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
                  value={programmeTemplateForm.name}
                  onChange={(e) => setProgrammeTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Standard IMPACT Programme"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Description
                </label>
                <textarea
                  value={programmeTemplateForm.description}
                  onChange={(e) => setProgrammeTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Brief description of this programme template"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={saveProgrammeAsTemplate}
                  className="bg-nhs-purple hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  Save Template
                </button>
                <button
                  onClick={() => setShowSaveTemplateModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProgrammeTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-nhs-dark-grey">Load Programme Template</h3>
              <button
                onClick={() => setShowProgrammeTemplateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              {programmeTemplates.filter(t => !t.deleted).length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-nhs-dark-grey mb-2">No templates available</h3>
                  <p className="text-nhs-grey">Create a programme template first by saving your current programme.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {programmeTemplates.filter(t => !t.deleted).map((template) => (
                    <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-nhs-dark-grey">{template.name}</h4>
                          <p className="text-sm text-nhs-grey mt-1">{template.description}</p>
                          <p className="text-xs text-nhs-grey mt-2">
                            {template.subjects?.length || 0} subjects • Created {template.createdAt ? new Date(template.createdAt.toDate()).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteProgrammeTemplate(template.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                          title="Delete Template"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {template.subjects?.slice(0, 3).map((subject, index) => (
                          <div key={index} className="text-xs text-nhs-grey bg-gray-50 px-2 py-1 rounded">
                            {subject.name} ({subject.type})
                          </div>
                        ))}
                        {template.subjects?.length > 3 && (
                          <div className="text-xs text-nhs-grey bg-gray-50 px-2 py-1 rounded">
                            +{template.subjects.length - 3} more subjects
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => loadProgrammeTemplate(template.id)}
                        className="w-full mt-3 bg-nhs-green hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        Load Template
                      </button>
                    </div>
                  ))}
                </div>
              )}
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

      {/* Email Template Manager Modal */}
      <EmailTemplateManager 
        isOpen={showEmailTemplateManager} 
        onClose={() => setShowEmailTemplateManager(false)} 
      />

      {/* Location Management Modal */}
      {showLocationModal && (
        <LocationManagementModal
          onClose={() => {
            setShowLocationModal(false);
            setSelectedLocation(null);
            fetchLocations();
          }}
          selectedLocation={selectedLocation}
        />
      )}

      {/* Mentor Assignment Modal */}
      <MentorAssignmentModal
        isOpen={showMentorAssignmentModal}
        onClose={() => setShowMentorAssignmentModal(false)}
        selectedCourse={selectedCourse}
        onMentorUpdate={() => {
          fetchAllCourses(); // Refresh course data to get updated mentor assignments
        }}
      />

      {/* Edit Subject Modal */}
      {showEditSubjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-nhs-dark-grey">Edit Subject</h3>
              <button
                onClick={() => setShowEditSubjectModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Subject Name *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nhs-blue focus:border-transparent"
                  placeholder="Enter subject name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nhs-blue focus:border-transparent"
                  placeholder="Enter subject description"
                  rows={3}
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You can only edit the subject name and description. 
                  Other fields like timing, type, and workshop rotations cannot be modified to maintain data integrity.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={updateProgrammeSubject}
                className="bg-nhs-blue text-white px-4 py-2 rounded-md hover:bg-nhs-dark-blue"
              >
                Update Subject
              </button>
              <button
                onClick={() => setShowEditSubjectModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
