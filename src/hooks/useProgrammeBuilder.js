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
    concurrentCandidatesSecond: '',
    concurrentActivityFaculty: [] // Array to store faculty assigned to concurrent activities
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
                     } else if (session.group) {
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

     // Function to get practical session groups for display
   const getPracticalSessionGroups = (subject) => {
     if (subject.type !== 'practical-session' || !subject.rotationSchedule) {
       return null;
     }

    // Return a detailed breakdown of station assignments
    const stationAssignments = [];
    
    subject.rotationSchedule.forEach(timeSlot => {
      timeSlot.sessions.forEach(session => {
        if (session.station && session.groups) {
          const groupsText = Array.isArray(session.groups) ? session.groups.join('+') : session.groups;
          stationAssignments.push(`${session.station}: ${groupsText}`);
        }
      });
    });

    // Return the first time slot assignments as the main display
    if (stationAssignments.length > 0) {
      return stationAssignments.slice(0, subject.numberOfStations || 2).join(' | ');
    }

    return null;
  };

  // Utility function to calculate actual time slot times
  const calculateTimeSlot = (startTime, slotIndex, slotDuration) => {
    if (!startTime || !slotDuration) {
      return `Time Slot ${slotIndex + 1}`;
    }

    try {
      // Parse start time (assuming format like "09:00" or "9:00")
      const [hours, minutes] = startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);

      // Calculate slot start time
      const slotStartTime = new Date(startDate.getTime() + (slotIndex * slotDuration * 60 * 1000));
      
      // Calculate slot end time
      const slotEndTime = new Date(slotStartTime.getTime() + (slotDuration * 60 * 1000));

      // Format times as HH:MM
      const formatTime = (date) => {
        return date.toTimeString().slice(0, 5);
      };

      return `${formatTime(slotStartTime)} - ${formatTime(slotEndTime)}`;
    } catch (error) {
      console.error('Error calculating time slot:', error);
      return `Time Slot ${slotIndex + 1}`;
    }
  };

     // Function to get detailed station information for practical sessions
   const getPracticalSessionStationInfo = (subject) => {
     if (subject.type !== 'practical-session' || !subject.rotationSchedule) {
       return null;
     }

    const stationInfo = [];
    
    subject.rotationSchedule.forEach((timeSlot, timeSlotIndex) => {
      const timeSlotTime = calculateTimeSlot(subject.startTime, timeSlotIndex, subject.timeSlotDuration);
      
      timeSlot.sessions.forEach(session => {
        if (session.station && session.groups) {
          const groupsText = Array.isArray(session.groups) ? session.groups.join('+') : session.groups;
          stationInfo.push({
            station: session.station,
            groups: groupsText,
            timeSlot: timeSlotTime,
            subjectName: subject.name
          });
        }
      });
    });

    return stationInfo;
  };

     // Comprehensive validation function for subject form
   const validateSubjectForm = (form) => {
     const errors = [];

     // Basic required field validation
     if (!form.name || form.name.trim() === '') {
       errors.push('Subject name is required');
     }

     if (!form.type) {
       errors.push('Subject type is required');
     }

     if (!form.startTime) {
       errors.push('Start time is required');
     }

     if (!form.endTime) {
       errors.push('End time is required');
     }

     if (!form.duration || form.duration <= 0) {
       errors.push('Duration must be greater than 0');
     }

     // Time validation
     if (form.startTime && form.endTime) {
       const start = new Date(`2000-01-01T${form.startTime}`);
       const end = new Date(`2000-01-01T${form.endTime}`);
       if (start >= end) {
         errors.push('End time must be after start time');
       }
     }

     // Duration validation
     if (form.startTime && form.endTime && form.duration) {
       const start = new Date(`2000-01-01T${form.startTime}`);
       const end = new Date(`2000-01-01T${form.endTime}`);
       const durationMs = end - start;
       const durationMinutes = Math.round(durationMs / (1000 * 60));
       if (durationMinutes !== form.duration) {
         errors.push('Duration does not match start and end times');
       }
     }

     // Workshop rotation validation
     if (form.type === 'workshop' && form.isWorkshopRotation) {
       if (!form.numberOfWorkshops || form.numberOfWorkshops < 1) {
         errors.push('Number of workshops must be at least 1');
       }
       if (!form.workshopDuration || form.workshopDuration < 15) {
         errors.push('Workshop duration must be at least 15 minutes');
       }
       if (!form.numberOfRotations || form.numberOfRotations < 1) {
         errors.push('Number of rotations must be at least 1');
       }
       if (!form.selectedWorkshopSubjects || form.selectedWorkshopSubjects.filter(s => s.trim() !== '').length !== form.numberOfWorkshops) {
         errors.push('Please select all workshop subjects');
       }
     }

           // Assessment validation
      if (form.type === 'assessment') {
        if (!form.numberOfStations || form.numberOfStations < 2) {
          errors.push('Assessment must have at least 2 stations');
        }
        if (!form.numberOfTimeSlots || form.numberOfTimeSlots < 2) {
          errors.push('Assessment must have at least 2 time slots');
        }
        if (!form.timeSlotDuration || form.timeSlotDuration < 10) {
          errors.push('Time slot duration must be at least 10 minutes');
        }
        if (!form.stationNames || form.stationNames.filter(s => s.trim() !== '').length !== form.numberOfStations) {
          errors.push('Please configure all assessment station names');
        }
        if (!form.concurrentActivityName || form.concurrentActivityName.trim() === '') {
          errors.push('Assessment must have a concurrent activity (e.g., "Difficult Decision Workshop")');
        }
      }

     // Practical session validation
     if (form.type === 'practical-session') {
       if (!form.numberOfStations || form.numberOfStations < 1) {
         errors.push('Practical session must have at least 1 station');
       }
       if (!form.numberOfTimeSlots || form.numberOfTimeSlots < 1) {
         errors.push('Practical session must have at least 1 time slot');
       }
       if (!form.timeSlotDuration || form.timeSlotDuration < 15) {
         errors.push('Time slot duration must be at least 15 minutes');
       }
       if (!form.stationNames || form.stationNames.filter(s => s.trim() !== '').length !== form.numberOfStations) {
         errors.push('Please select all station names');
       }
     }

     // Scenario practice validation
     if (form.type === 'scenario-practice') {
       if (!form.numberOfStations || form.numberOfStations < 1) {
         errors.push('Scenario practice must have at least 1 station');
       }
       if (!form.numberOfTimeSlots || form.numberOfTimeSlots < 1) {
         errors.push('Scenario practice must have at least 1 time slot');
       }
       if (!form.timeSlotDuration || form.timeSlotDuration < 10) {
         errors.push('Time slot duration must be at least 10 minutes');
       }
     }

     return errors;
   };

   // Time conflict validation function
   const validateTimeConflicts = (newSubject, existingSubjects) => {
     const errors = [];
     
     if (!newSubject.startTime || !newSubject.endTime || !newSubject.day) {
       return errors; // Skip validation if times are not set
     }

     const newStart = new Date(`2000-01-01T${newSubject.startTime}`);
     const newEnd = new Date(`2000-01-01T${newSubject.endTime}`);

     // Check for conflicts with existing subjects on the same day
     existingSubjects.forEach(existingSubject => {
       if (existingSubject.day === newSubject.day && existingSubject.id !== newSubject.id) {
         const existingStart = new Date(`2000-01-01T${existingSubject.startTime}`);
         const existingEnd = new Date(`2000-01-01T${existingSubject.endTime}`);

         // Check for overlap
         if (newStart < existingEnd && newEnd > existingStart) {
           errors.push(`Time conflict with "${existingSubject.name}" (${existingSubject.startTime} - ${existingSubject.endTime})`);
         }
       }
     });

     return errors;
   };

   // Function to generate assessment time slots with candidate assignments
   const generateAssessmentTimeSlots = (assessmentForm) => {
    const timeSlots = [];
    const numberOfStations = assessmentForm.numberOfStations || 4;
    const numberOfTimeSlots = assessmentForm.numberOfTimeSlots || 4;
    const timeSlotDuration = assessmentForm.timeSlotDuration || 15;
    const stationNames = assessmentForm.stationNames || [];

    for (let timeSlotIndex = 0; timeSlotIndex < numberOfTimeSlots; timeSlotIndex++) {
      const slotStartTime = calculateTimeSlot(assessmentForm.startTime, timeSlotIndex, timeSlotDuration);
      
      const stations = [];
      for (let stationIndex = 0; stationIndex < numberOfStations; stationIndex++) {
        // Calculate candidate assignments for this station and time slot
        const candidatesPerStation = 2; // Lead and Assist roles
        const startCandidate = (timeSlotIndex * numberOfStations * candidatesPerStation) + (stationIndex * candidatesPerStation) + 1;
        const endCandidate = startCandidate + candidatesPerStation - 1;
        
        stations.push({
          station: stationIndex + 1,
          stationName: stationNames[stationIndex] || `Station ${stationIndex + 1}`,
          candidates: `${startCandidate}-${endCandidate}`,
          roles: ['Lead', 'Assist'],
          faculty: [] // Will be assigned later
        });
      }

      timeSlots.push({
        slot: timeSlotIndex + 1,
        startTime: slotStartTime,
        stations: stations,
        concurrentActivity: {
          name: assessmentForm.concurrentActivityName || '',
          candidates: assessmentForm.concurrentCandidatesFirst || '9-16',
          duration: timeSlotDuration,
          type: 'workshop',
          faculty: assessmentForm.concurrentActivityFaculty || [] // Include faculty assignment for concurrent activities
        }
      });
    }

    return timeSlots;
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

       // Comprehensive input validation
       const validationErrors = validateSubjectForm(subjectForm);
       if (validationErrors.length > 0) {
         validationErrors.forEach(error => toast.error(error));
         return;
       }

       // Time conflict validation
       const timeConflictErrors = validateTimeConflicts(subjectForm, programmeSubjects);
       if (timeConflictErrors.length > 0) {
         timeConflictErrors.forEach(error => toast.error(error));
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
                             } else if (schedule.group) {
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
                         // Removed redundant boolean flags - using type field only
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
      } else if (subjectForm.type === 'practical-session') {
        // Handle practical session with rotation logic
        if (!subjectForm.stationNames || subjectForm.stationNames.filter(s => s.trim() !== '').length !== subjectForm.numberOfStations) {
          toast.error('Please select all station names');
          return;
        }

        const groups = ['A', 'B', 'C', 'D'];
        const stationNames = subjectForm.stationNames.filter(name => name.trim() !== '');
        const numberOfStations = subjectForm.numberOfStations;
        const numberOfTimeSlots = subjectForm.numberOfTimeSlots;

        // Generate rotation schedule for practical session
        const rotationSchedule = [];

        for (let timeSlot = 1; timeSlot <= numberOfTimeSlots; timeSlot++) {
          const timeSlotSessions = [];
          
          // For each time slot, distribute groups across stations
          for (let stationIndex = 0; stationIndex < numberOfStations; stationIndex++) {
            if (numberOfStations >= groups.length) {
              // More stations than groups - one group per station, rotate
              const groupIndex = (stationIndex + (timeSlot - 1)) % groups.length;
              timeSlotSessions.push({
                station: stationNames[stationIndex],
                groups: [groups[groupIndex]]
              });
            } else {
              // Fewer stations than groups - combine groups with proper rotation
              const groupsPerStation = Math.ceil(groups.length / numberOfStations);
              
              // Calculate which groups should be at this station for this time slot
              const assignedGroups = [];
              
              for (let i = 0; i < groupsPerStation; i++) {
                const groupIndex = (stationIndex + (i * numberOfStations) + (timeSlot - 1)) % groups.length;
                assignedGroups.push(groups[groupIndex]);
              }
              
              timeSlotSessions.push({
                station: stationNames[stationIndex],
                groups: assignedGroups
              });
            }
          }

          rotationSchedule.push({
            timeSlot,
            sessions: timeSlotSessions
          });
        }

        const subjectData = {
          ...subjectForm,
          courseId: selectedCourse.id,
          isWorkshopRotation: false,
          rotationSequence: null,
          workshopIndex: null,
          totalWorkshops: null,
          totalRotations: null,
          rotationSchedule: rotationSchedule,
          completedGroups: [],
                     // Removed redundant boolean flags - using type field only
          numberOfStations: subjectForm.numberOfStations,
          numberOfTimeSlots: subjectForm.numberOfTimeSlots,
          timeSlotDuration: subjectForm.timeSlotDuration,
          stationNames: subjectForm.stationNames,
          concurrentActivityName: '',
          scenarioCandidatesFirst: '',
          concurrentCandidatesFirst: '',
          scenarioCandidatesSecond: '',
          concurrentCandidatesSecond: ''
        };

        await addDoc(collection(db, 'programmeSubjects'), subjectData);
        toast.success('Practical session added successfully');
             } else if (subjectForm.type === 'assessment') {
         // Handle assessment with proper time slot generation and concurrent activities
         if (!subjectForm.stationNames || subjectForm.stationNames.filter(s => s.trim() !== '').length !== subjectForm.numberOfStations) {
           toast.error('Please configure all assessment stations');
           return;
         }

         // Validate concurrent activity configuration
         if (!subjectForm.concurrentActivityName || subjectForm.concurrentActivityName.trim() === '') {
           toast.error('Please specify the concurrent activity name (e.g., "Difficult Decision Workshop")');
           return;
         }

         // Generate assessment time slots with concurrent activities
         const timeSlots = generateAssessmentTimeSlots(subjectForm);
         
         // Add concurrent activity information to each time slot
         const updatedTimeSlots = timeSlots.map(timeSlot => ({
           ...timeSlot,
           concurrentActivity: {
             name: subjectForm.concurrentActivityName,
             candidates: subjectForm.concurrentCandidatesFirst || '9-16', // Default to candidates 9-16
             duration: subjectForm.timeSlotDuration,
             type: 'workshop' // or 'lecture' based on activity
           }
         }));
         
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
                      // Removed redundant boolean flags - using type field only
           numberOfStations: subjectForm.numberOfStations,
           numberOfTimeSlots: subjectForm.numberOfTimeSlots,
           timeSlotDuration: subjectForm.timeSlotDuration,
           stationNames: subjectForm.stationNames,
           timeSlots: updatedTimeSlots,
           concurrentActivityName: subjectForm.concurrentActivityName || '',
           scenarioCandidatesFirst: subjectForm.scenarioCandidatesFirst || '',
           concurrentCandidatesFirst: subjectForm.concurrentCandidatesFirst || '',
           scenarioCandidatesSecond: subjectForm.scenarioCandidatesSecond || '',
           concurrentCandidatesSecond: subjectForm.concurrentCandidatesSecond || ''
         };

         await addDoc(collection(db, 'programmeSubjects'), subjectData);
         toast.success('Assessment session with concurrent activities added successfully');
      } else {
        // Handle regular subjects (non-workshop rotation, non-practical session, non-assessment)
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
                     // Removed redundant boolean flags - using type field only
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

  // Phase 4: Assessment System Integration Functions
  
  // Get assessment subjects for a course
  const getAssessmentSubjects = (courseId) => {
    return programmeSubjects.filter(subject => 
      subject.type === 'assessment' && subject.courseId === courseId
    );
  };

  // Get candidate assignments for a specific assessment subject (with concurrent activities)
  const getCandidateAssignments = (assessmentSubject) => {
    if (!assessmentSubject.timeSlots) return [];
    
    const assignments = [];
    assessmentSubject.timeSlots.forEach(timeSlot => {
      // Assessment station assignments
      timeSlot.stations.forEach(station => {
        const candidateRange = station.candidates;
        if (candidateRange) {
          const [start, end] = candidateRange.split('-').map(Number);
          // For assessment rotation: candidates take turns being assessed and assisting
          for (let i = start; i <= end; i++) {
            // First candidate in pair is assessed, second assists
            const isAssessed = (i - start) % 2 === 0;
            assignments.push({
              candidateNumber: i,
              timeSlot: timeSlot.slot,
              station: station.station,
              stationName: station.stationName,
              role: isAssessed ? 'Assessed' : 'Assist',
              activityType: 'assessment',
              faculty: station.faculty || []
            });
          }
        }
      });

      // Concurrent activity assignments
      if (timeSlot.concurrentActivity) {
        const concurrentCandidates = timeSlot.concurrentActivity.candidates;
        if (concurrentCandidates) {
          const [start, end] = concurrentCandidates.split('-').map(Number);
          for (let i = start; i <= end; i++) {
            assignments.push({
              candidateNumber: i,
              timeSlot: timeSlot.slot,
              activityName: timeSlot.concurrentActivity.name,
              activityType: 'concurrent',
              role: 'Participant',
              faculty: []
            });
          }
        }
      }
    });
    
    return assignments;
  };

  // Get assessment completion status for a candidate
  const getCandidateAssessmentStatus = async (candidateId, courseId) => {
    try {
      const assessmentSubjects = getAssessmentSubjects(courseId);
      const candidateAssignments = [];
      
      assessmentSubjects.forEach(subject => {
        const assignments = getCandidateAssignments(subject);
        candidateAssignments.push(...assignments);
      });
      
      // Get existing assessment records for this candidate
      const assessmentSnapshot = await getDocs(collection(db, 'assessments'));
      const existingAssessments = assessmentSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(assessment => assessment.candidateId === candidateId);
      
      return {
        candidateAssignments,
        existingAssessments,
        assessmentSubjects
      };
    } catch (error) {
      console.error('Error getting candidate assessment status:', error);
      return { candidateAssignments: [], existingAssessments: [], assessmentSubjects: [] };
    }
  };

  // Create assessment record for a specific station (candidate rotation)
  const createStationAssessment = async (candidateId, assessmentSubjectId, timeSlot, station, assessmentData) => {
    try {
      const assessmentRecord = {
        candidateId,
        assessmentSubjectId,
        timeSlot,
        station,
        role: assessmentData.role, // 'Assessed' or 'Assist'
        activityType: 'assessment',
        ...assessmentData,
        createdAt: new Date(),
        status: 'completed'
      };
      
      await addDoc(collection(db, 'stationAssessments'), assessmentRecord);
      return true;
    } catch (error) {
      console.error('Error creating station assessment:', error);
      return false;
    }
  };

  // Get all station assessments for a course
  const getStationAssessments = async (courseId) => {
    try {
      const assessmentSubjects = getAssessmentSubjects(courseId);
      const stationAssessments = [];
      
      for (const subject of assessmentSubjects) {
        const snapshot = await getDocs(collection(db, 'stationAssessments'));
        const subjectAssessments = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(assessment => assessment.assessmentSubjectId === subject.id);
        
        stationAssessments.push(...subjectAssessments);
      }
      
      return stationAssessments;
    } catch (error) {
      console.error('Error getting station assessments:', error);
      return [];
    }
  };

  // Update assessment completion tracking
  const updateAssessmentCompletion = async (candidateId, courseId) => {
    try {
      const { existingAssessments, assessmentSubjects } = await getCandidateAssessmentStatus(candidateId, courseId);
      
      // Count completed assessment sessions (where candidate was assessed, not assisted)
      const completedAssessments = existingAssessments.filter(assessment => 
        assessment.role === 'Assessed' && assessment.activityType === 'assessment'
      ).length;
      const totalAssessments = assessmentSubjects.reduce((total, subject) => {
        return total + (subject.timeSlots?.length || 0) * (subject.numberOfStations || 0);
      }, 0);
      
      const completionStatus = {
        completedAssessments,
        totalAssessments,
        completionPercentage: totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0,
        isComplete: completedAssessments >= totalAssessments
      };
      
      // Update candidate record with assessment completion status
      await updateDoc(doc(db, 'candidates', candidateId), {
        assessmentCompletion: completionStatus,
        lastAssessmentUpdate: new Date()
      });
      
      return completionStatus;
    } catch (error) {
      console.error('Error updating assessment completion:', error);
      return null;
    }
  };

  // Get candidate pairs for assessment rotation (with concurrent activities)
  const getCandidatePairs = (assessmentSubject) => {
    if (!assessmentSubject.timeSlots) return [];
    
    const pairs = [];
    assessmentSubject.timeSlots.forEach(timeSlot => {
      // Assessment station pairs
      timeSlot.stations.forEach(station => {
        const candidateRange = station.candidates;
        if (candidateRange) {
          const [start, end] = candidateRange.split('-').map(Number);
          // Create pairs for rotation
          for (let i = start; i < end; i += 2) {
            pairs.push({
              timeSlot: timeSlot.slot,
              station: station.station,
              stationName: station.stationName,
              candidate1: i,
              candidate2: i + 1,
              startTime: timeSlot.startTime,
              activityType: 'assessment'
            });
          }
        }
      });

      // Concurrent activity participants
      if (timeSlot.concurrentActivity) {
        const concurrentCandidates = timeSlot.concurrentActivity.candidates;
        if (concurrentCandidates) {
          const [start, end] = concurrentCandidates.split('-').map(Number);
          pairs.push({
            timeSlot: timeSlot.slot,
            activityName: timeSlot.concurrentActivity.name,
            candidates: `${start}-${end}`,
            startTime: timeSlot.startTime,
            activityType: 'concurrent'
          });
        }
      }
    });
    
    return pairs;
  };

  // Get concurrent activity schedule for assessment subjects
  const getConcurrentActivitySchedule = (assessmentSubject) => {
    if (!assessmentSubject.timeSlots) return [];
    
    const schedule = [];
    assessmentSubject.timeSlots.forEach(timeSlot => {
      if (timeSlot.concurrentActivity) {
        schedule.push({
          timeSlot: timeSlot.slot,
          startTime: timeSlot.startTime,
          activityName: timeSlot.concurrentActivity.name,
          candidates: timeSlot.concurrentActivity.candidates,
          activityType: timeSlot.concurrentActivity.type,
          duration: timeSlot.concurrentActivity.duration
        });
      }
    });
    
    return schedule;
  };

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
    getWorkshopGroups,
    getPracticalSessionGroups,
    getPracticalSessionStationInfo,
    generateAssessmentTimeSlots,
    getAssessmentSubjects,
    getCandidateAssignments,
    getCandidateAssessmentStatus,
    createStationAssessment,
    getStationAssessments,
    updateAssessmentCompletion,
    getCandidatePairs,
    getConcurrentActivitySchedule
  };
};
