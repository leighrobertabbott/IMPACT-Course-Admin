import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

export const useProgrammeBuilder = (selectedCourse) => {
  // State
  const [programmeSubjects, setProgrammeSubjects] = useState([]);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
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
    workshopDuration: 40,
    numberOfRotations: 4,
    selectedWorkshopSubjects: [], // Array to store selected predefined workshop subjects
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

  // Predefined workshop subjects for rotation
  const predefinedWorkshopSubjects = [
    'Fluids and Transfusion',
    'Lumbar Puncture and CSF Analysis',
    'Advanced Arrhythmia Management',
    'Imaging and Radiology'
  ];

  // Predefined session subjects for regular sessions
  const predefinedSessionSubjects = [
    'Registration / Meeting for Faculty',
    'Welcome and Introductions – Why IMPACT?',
    'Faculty Demonstration followed by Initial Assessment',
    'Triage and Resource Management',
    'The Breathless Patient',
    'Shock',
    'Respiratory Support',
    'Chest Pain',
    'Acute Kidney Injury',
    'Neurological Emergencies',
    'Gastrointestinal Emergencies',
    'Sugar & Salt',
    'Retests / Mentor Feedback',
    'Summary and Close',
    'Break',
    'Lunch'
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
    const totalWorkshops = subject.totalWorkshops || 4;
    const totalRotations = subject.totalRotations || 4;

    // Calculate which groups attend this specific workshop
    const workshopGroups = [];

    for (let rotation = 1; rotation <= totalRotations; rotation++) {
      const rotationSessions = subject.rotationSchedule?.find(r => r.rotation === rotation)?.sessions || [];

      rotationSessions.forEach(session => {
        if (session.workshop === subject.name) {
          // Handle both individual groups and combined groups
          if (session.groups) {
            // New format with groups array
            session.groups.forEach(group => {
              if (!workshopGroups.includes(group)) {
                workshopGroups.push(group);
              }
            });
          } else {
            // Legacy format - check if it's a combined group
            if (session.group.includes('+')) {
              // Combined group format (e.g., "A+B")
              session.group.split('+').forEach(group => {
                if (!workshopGroups.includes(group)) {
                  workshopGroups.push(group);
                }
              });
            } else {
              // Single group
              if (!workshopGroups.includes(session.group)) {
                workshopGroups.push(session.group);
              }
            }
          }
        }
      });
    }

    return workshopGroups.sort().join(', ');
  };

  // Fetch programme subjects
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

  // Add programme subject
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
        const totalWorkshops = subjectForm.numberOfWorkshops;
        const totalRotations = subjectForm.numberOfRotations;

        // Generate rotation schedule
        const rotationSchedule = [];
        const shouldCombineGroups = newWorkshopNames.length < groups.length;

        for (let rotation = 1; rotation <= totalRotations; rotation++) {
          const rotationSessions = [];

          if (shouldCombineGroups) {
            // Calculate how many groups should be combined
            const groupsPerWorkshop = Math.ceil(groups.length / newWorkshopNames.length);

            newWorkshopNames.forEach((workshop, workshopIndex) => {
              if (workshop.trim() !== '') {
                const startGroupIndex = ((rotation - 1) * groupsPerWorkshop) % groups.length;
                const endGroupIndex = Math.min(startGroupIndex + groupsPerWorkshop, groups.length);
                const combinedGroups = groups.slice(startGroupIndex, endGroupIndex);

                rotationSessions.push({
                  workshop,
                  groups: combinedGroups // New format with groups array
                });
              }
            });
          } else {
            // Standard rotation - one group per rotation
            newWorkshopNames.forEach((workshop, workshopIndex) => {
              if (workshop.trim() !== '') {
                const groupIndex = (workshopIndex + (rotation - 1)) % groups.length;
                rotationSessions.push({
                  workshop,
                  groups: [groups[groupIndex]] // New format with groups array
                });
              }
            });
          }

          rotationSchedule.push({
            rotation,
            sessions: rotationSessions
          });
        }

        // Create a separate subject for each workshop
        for (let workshopIndex = 0; workshopIndex < newWorkshopNames.length; workshopIndex++) {
          const workshopName = newWorkshopNames[workshopIndex];

          const subjectData = {
            name: workshopName,
            type: 'workshop',
            duration: subjectForm.workshopDuration,
            description: `Workshop: ${workshopName}`,
            day: subjectForm.day,
            startTime: subjectForm.startTime,
            endTime: subjectForm.endTime,
            courseId: selectedCourse.id,
            isWorkshopRotation: true,
            workshopIndex: workshopIndex + 1,
            totalWorkshops: newWorkshopNames.length,
            totalRotations: totalRotations,
            rotationSchedule: rotationSchedule,
            completedGroups: [],
            isAssessment: false,
            isScenarioPractice: false,
            isPracticalSession: false,
            numberOfStations: 4,
            numberOfTimeSlots: 4,
            timeSlotDuration: 30,
            stationNames: [],
            concurrentActivityName: '',
            scenarioCandidatesFirst: '',
            concurrentCandidatesFirst: '',
            scenarioCandidatesSecond: '',
            concurrentCandidatesSecond: ''
          };

          await addDoc(collection(db, 'programmeSubjects'), subjectData);
        }

        toast.success('Workshop rotation subjects added successfully');
      } else {
        // Handle regular subjects (non-workshop rotation)
        const subjectData = {
          ...subjectForm,
          courseId: selectedCourse.id,
          isWorkshopRotation: false,
          rotationSequence: null,
          workshopIndex: null,
          totalWorkshops: null,
          totalRotations: null,
          rotationSchedule: null,
          completedGroups: [],
          isAssessment: subjectForm.type === 'assessment',
          isScenarioPractice: subjectForm.type === 'scenario-practice',
          isPracticalSession: subjectForm.type === 'practical-session',
          numberOfStations: 4,
          numberOfTimeSlots: 4,
          timeSlotDuration: 30,
          stationNames: [],
          concurrentActivityName: '',
          scenarioCandidatesFirst: '',
          concurrentCandidatesFirst: '',
          scenarioCandidatesSecond: '',
          concurrentCandidatesSecond: ''
        };

        await addDoc(collection(db, 'programmeSubjects'), subjectData);
        toast.success('Subject added to programme successfully');
      }

      // Reset form
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
        workshopDuration: 40,
        numberOfRotations: 4,
        selectedWorkshopSubjects: [],
        numberOfStations: 4,
        numberOfTimeSlots: 4,
        timeSlotDuration: 30,
        stationNames: [],
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

  // Delete programme subject
  const deleteProgrammeSubject = async (subjectId) => {
    const confirmed = window.confirm(
      'This will remove the subject from the programme. This change will be reflected in both Course Management and Admin Panel. Continue?'
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'programmeSubjects', subjectId));
      toast.success('Subject removed from programme');
      fetchProgrammeSubjects();
    } catch (error) {
      console.error('Error deleting programme subject:', error);
      toast.error('Failed to remove subject from programme');
    }
  };

  // Edit programme subject
  const editProgrammeSubject = (subject) => {
    setSubjectForm({
      name: subject.name,
      type: subject.type,
      duration: subject.duration,
      description: subject.description,
      day: subject.day,
      startTime: subject.startTime,
      endTime: subject.endTime,
      isWorkshopRotation: subject.isWorkshopRotation || false,
      numberOfWorkshops: subject.numberOfWorkshops || 4,
      workshopDuration: subject.workshopDuration || 40,
      numberOfRotations: subject.numberOfRotations || 4,
      selectedWorkshopSubjects: subject.selectedWorkshopSubjects || [],
      numberOfStations: subject.numberOfStations || 4,
      numberOfTimeSlots: subject.numberOfTimeSlots || 4,
      timeSlotDuration: subject.timeSlotDuration || 30,
      stationNames: subject.stationNames || [],
      concurrentActivityName: subject.concurrentActivityName || '',
      scenarioCandidatesFirst: subject.scenarioCandidatesFirst || '',
      concurrentCandidatesFirst: subject.concurrentCandidatesFirst || '',
      scenarioCandidatesSecond: subject.scenarioCandidatesSecond || '',
      concurrentCandidatesSecond: subject.concurrentCandidatesSecond || ''
    });
  };

  // Update programme subject
  const updateProgrammeSubject = async (subjectId) => {
    try {
      if (!subjectForm.name || !subjectForm.type) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Only update safe fields (name and description)
      const updateData = {
        name: subjectForm.name,
        description: subjectForm.description
      };

      await updateDoc(doc(db, 'programmeSubjects', subjectId), updateData);
      toast.success('Subject updated successfully');

      // Reset form
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
        workshopDuration: 40,
        numberOfRotations: 4,
        selectedWorkshopSubjects: [],
        numberOfStations: 4,
        numberOfTimeSlots: 4,
        timeSlotDuration: 30,
        stationNames: [],
        concurrentActivityName: '',
        scenarioCandidatesFirst: '',
        concurrentCandidatesFirst: '',
        scenarioCandidatesSecond: '',
        concurrentCandidatesSecond: ''
      });
      fetchProgrammeSubjects();
    } catch (error) {
      console.error('Error updating programme subject:', error);
      toast.error('Failed to update subject');
    }
  };

  // Fetch subjects when course changes
  useEffect(() => {
    fetchProgrammeSubjects();
  }, [selectedCourse]);

  return {
    // State
    programmeSubjects,
    showAddSubjectModal,
    setShowAddSubjectModal,
    subjectForm,
    setSubjectForm,
    predefinedWorkshopSubjects,
    predefinedSessionSubjects,
    predefinedPracticalSubjects,

    // Functions
    fetchProgrammeSubjects,
    addProgrammeSubject,
    deleteProgrammeSubject,
    editProgrammeSubject,
    updateProgrammeSubject,
    getWorkshopGroups
  };
};
