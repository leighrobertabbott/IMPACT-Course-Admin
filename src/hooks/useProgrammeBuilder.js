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
    type: 'session', // session, workshop, practical, assessment, break, lunch, practical-session, scenario-practice
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
    // Station-based fields (for practical sessions, assessments, scenario practice)
    numberOfStations: 4,
    numberOfTimeSlots: 4,
    timeSlotDuration: 30,
    stationNames: [],
    stationRooms: [], // Room assignments for stations
    // Concurrent activity fields for assessments
    concurrentActivityName: '',
    scenarioCandidatesFirst: '',
    concurrentCandidatesFirst: '',
    scenarioCandidatesSecond: '',
    concurrentCandidatesSecond: '',
    concurrentActivityFaculty: [], // Array to store faculty assigned to concurrent activities
    // Assessment-specific fields
    timeSlots: [], // Generated time slots for assessments
    stationAssignments: [] // Station-candidate assignments
  });

  // Predefined workshop subjects for rotation
  const predefinedWorkshopSubjects = [
    'Fluids and Transfusion',
    'Lumbar Puncture and CSF Analysis',
    'Advanced Arrhythmia Management',
    'Imaging and Radiology',
    'Poisoning Workshop'
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
    'Sepsis Structured Judgement Review',
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

  // Function to get workshop groups for display - standardized format
  const getWorkshopGroups = (subject) => {
    if (!subject.isWorkshopRotation || !subject.rotationSchedule) {
      return null;
    }

    const workshopGroups = new Set(); // Use Set to prevent duplicates

    // Extract groups from standardized rotation schedule
    subject.rotationSchedule.forEach(rotation => {
      if (rotation.sessions) {
        rotation.sessions.forEach(session => {
          if (session.workshop === subject.name && session.groups) {
            // Standardized format - always array
            if (Array.isArray(session.groups)) {
              session.groups.forEach(group => workshopGroups.add(group));
            } else {
              // Handle legacy string format during transition
              const groups = session.groups.includes('+') 
                ? session.groups.split('+') 
                : [session.groups];
              groups.forEach(group => workshopGroups.add(group.trim()));
            }
          }
        });
      }
    });

    return workshopGroups.size > 0 ? Array.from(workshopGroups).sort().join(', ') : null;
  };

     // Function to get practical session groups for display - standardized format
   const getPracticalSessionGroups = (subject) => {
     if (subject.type !== 'practical-session' || !subject.rotationSchedule) {
       return null;
     }

    // Return a detailed breakdown of station assignments
    const stationAssignments = [];
    
    // Get first time slot for main display
    const firstTimeSlot = subject.rotationSchedule[0];
    if (firstTimeSlot && firstTimeSlot.sessions) {
      firstTimeSlot.sessions.forEach(session => {
        if (session.station && session.groups) {
          // Standardized group format handling
          let groupsText;
          if (Array.isArray(session.groups)) {
            groupsText = session.groups.join('+');
          } else {
            // Handle legacy format during transition
            groupsText = session.groups;
          }
          stationAssignments.push(`${session.station}: ${groupsText}`);
        }
      });
    }

    return stationAssignments.length > 0 ? stationAssignments.join(' | ') : null;
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

   // Type-specific validation function
   const validateSubjectTypeSpecific = (form, existingSubjects) => {
     const errors = [];
     
     // Workshop rotation specific validation
     if (form.type === 'workshop' && form.isWorkshopRotation) {
       // Check for duplicate workshop subjects in same time slot
       const conflictingWorkshops = existingSubjects.filter(subject => 
         subject.type === 'workshop' && 
         subject.isWorkshopRotation &&
         subject.startTime === form.startTime &&
         subject.endTime === form.endTime &&
         subject.day === form.day &&
         !subject.deleted
       );
       
       if (conflictingWorkshops.length > 0) {
         form.selectedWorkshopSubjects.forEach(newWorkshop => {
           conflictingWorkshops.forEach(existing => {
             if (existing.name === newWorkshop) {
               errors.push(`Workshop "${newWorkshop}" already exists for this time slot`);
             }
           });
         });
       }
     }
     
     // Assessment specific validation
     if (form.type === 'assessment') {
       // Check for multiple assessments on same day
       const dayAssessments = existingSubjects.filter(subject => 
         subject.type === 'assessment' && 
         subject.day === form.day && 
         !subject.deleted
       );
       
       if (dayAssessments.length > 0) {
         errors.push(`Only one assessment per day is recommended. Day ${form.day} already has an assessment.`);
       }
     }
     
     // Practical session specific validation
     if (form.type === 'practical-session') {
       // Validate station names are unique within the session
       const stationNames = form.stationNames?.filter(name => name && name.trim() !== '') || [];
       const uniqueNames = new Set(stationNames);
       if (stationNames.length !== uniqueNames.size) {
         errors.push('Station names must be unique within the practical session');
       }
     }
     
     return errors;
   };

   // Enhanced time conflict validation function
   const validateTimeConflicts = (newSubject, existingSubjects) => {
     const errors = [];
     
     if (!newSubject.startTime || !newSubject.endTime || !newSubject.day) {
       return errors; // Skip validation if times are not set
     }

     const newStart = new Date(`2000-01-01T${newSubject.startTime}`);
     const newEnd = new Date(`2000-01-01T${newSubject.endTime}`);

     // Check for conflicts with existing subjects on the same day
     existingSubjects.forEach(existingSubject => {
       if (existingSubject.day === newSubject.day && existingSubject.id !== newSubject.id && !existingSubject.deleted) {
         const existingStart = new Date(`2000-01-01T${existingSubject.startTime}`);
         const existingEnd = new Date(`2000-01-01T${existingSubject.endTime}`);

         // Check for overlap (improved logic)
         if (newStart < existingEnd && newEnd > existingStart) {
           errors.push(`Time conflict with "${existingSubject.name}" (${existingSubject.startTime} - ${existingSubject.endTime}) on Day ${existingSubject.day}`);
         }
         
         // Check for exact time matches (which should be allowed for concurrent workshops)
         if (newStart.getTime() === existingStart.getTime() && newEnd.getTime() === existingEnd.getTime()) {
           // Allow concurrent workshops but warn for other types
           if (newSubject.type !== 'workshop' || existingSubject.type !== 'workshop') {
             errors.push(`Exact time match with "${existingSubject.name}" - consider if this is intentional`);
           }
         }
       }
     });

     return errors;
   };

     // Function to generate assessment time slots with specific candidate assignments (matches programme structure)
  const generateAssessmentTimeSlots = (assessmentForm) => {
   const timeSlots = [];
   const numberOfStations = assessmentForm.numberOfStations || 4;
   const numberOfTimeSlots = assessmentForm.numberOfTimeSlots || 4;
   const leadAssistDuration = assessmentForm.leadAssistDuration || 20;
   const assessedObserveDuration = assessmentForm.assessedObserveDuration || 15;
   const stationNames = assessmentForm.stationNames || [];

   // Assessment candidate assignment algorithm (matches IMPACT programme structure)
   // First 2 time slots: Lead/Assist roles (20 min), Last 2 time slots: Assessed/Observe roles (15 min)
   for (let timeSlotIndex = 0; timeSlotIndex < numberOfTimeSlots; timeSlotIndex++) {
     const isFirstHalf = timeSlotIndex < 2; // First 2 slots are Lead/Assist, last 2 are Assessed/Observe
     const currentSlotDuration = isFirstHalf ? leadAssistDuration : assessedObserveDuration;
     
     // Calculate start time based on previous slots' durations
     let slotStartTime;
     if (timeSlotIndex === 0) {
       slotStartTime = assessmentForm.startTime;
     } else {
       // Calculate cumulative time from previous slots
       let totalMinutes = 0;
       for (let i = 0; i < timeSlotIndex; i++) {
         const prevSlotDuration = i < 2 ? leadAssistDuration : assessedObserveDuration;
         totalMinutes += prevSlotDuration;
       }
       slotStartTime = calculateTimeSlot(assessmentForm.startTime, 0, totalMinutes);
     }
     
     const stations = [];
     for (let stationIndex = 0; stationIndex < numberOfStations; stationIndex++) {
       // Calculate specific candidate assignments based on IMPACT programme pattern
       let candidate1, candidate2, role1, role2;
       
       if (isFirstHalf) {
         // Time slots 1-2: Lead/Assist pattern
         if (timeSlotIndex === 0) {
           // First time slot: sequential assignment
           candidate1 = (stationIndex * 2) + 1; // 1, 3, 5, 7
           candidate2 = candidate1 + 1;          // 2, 4, 6, 8
           role1 = 'Lead';
           role2 = 'Assist';
         } else {
           // Second time slot: rotated assignment
           candidate1 = ((stationIndex + 3) % 4 * 2) + 1; // 7, 1, 3, 5
           candidate2 = candidate1 + 1;                    // 8, 2, 4, 6
           role1 = 'Assist';
           role2 = 'Lead';
         }
       } else {
         // Time slots 3-4: Assessed/Observe pattern
         if (timeSlotIndex === 2) {
           // Third time slot: different assignment pattern
           candidate1 = ((stationIndex + 2) % 4 * 2) + 1; // 5, 7, 1, 3
           candidate2 = candidate1 + 1;                    // 6, 8, 2, 4
           role1 = 'Assessed';
           role2 = 'Observe';
         } else {
           // Fourth time slot: final rotation
           candidate1 = ((stationIndex + 1) % 4 * 2) + 1; // 3, 5, 7, 1
           candidate2 = candidate1 + 1;                    // 4, 6, 8, 2
           role1 = 'Observe';
           role2 = 'Assessed';
         }
       }
       
       stations.push({
         station: stationIndex + 1,
         stationName: stationNames[stationIndex] || `Station ${stationIndex + 1}`,
         candidateAssignments: [
           { candidateNumber: candidate1, role: role1 },
           { candidateNumber: candidate2, role: role2 }
         ],
         candidates: `Candidate ${candidate1}, Candidate ${candidate2}`, // For display
         roles: [role1, role2],
         faculty: [] // Will be assigned later
       });
     }

     // Determine concurrent activity candidates based on time slot
     const concurrentCandidates = timeSlotIndex < 2 ? '9-16' : '1-8';

     timeSlots.push({
       slot: timeSlotIndex + 1,
       startTime: slotStartTime,
       duration: currentSlotDuration,
       stations: stations,
       concurrentActivity: {
         name: assessmentForm.concurrentActivityName || '',
         candidates: concurrentCandidates,
         duration: currentSlotDuration,
         type: 'workshop',
         faculty: assessmentForm.concurrentActivityFaculty || []
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
       
       // Additional validation for specific subject types
       const typeSpecificErrors = validateSubjectTypeSpecific(subjectForm, programmeSubjects);
       if (typeSpecificErrors.length > 0) {
         typeSpecificErrors.forEach(error => toast.error(error));
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
            subject.rotationSchedule.forEach(rotation => {
              if (rotation.sessions) {
                rotation.sessions.forEach(session => {
                  // Standardized format - always use groups array
                  if (session.groups && Array.isArray(session.groups)) {
                    session.groups.forEach(group => {
                      groupProgress[group].add(session.workshop || subject.name);
                    });
                  } else if (session.group) {
                    // Legacy format conversion - convert to array
                    const groups = session.group.includes('+') 
                      ? session.group.split('+') 
                      : [session.group];
                    groups.forEach(group => {
                      groupProgress[group.trim()].add(session.workshop || subject.name);
                    });
                  }
                });
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

        // Generate rotation schedule with improved algorithm
        const rotationSchedule = [];
        const shouldCombineGroups = newWorkshopNames.length < groups.length;

        // Validate workshop configuration
        if (newWorkshopNames.length === 0) {
          throw new Error('No workshop names selected');
        }
        
        // Track group assignments to prevent conflicts
        const groupAssignmentTracker = new Map();

        for (let rotation = 1; rotation <= totalRotations; rotation++) {
          const rotationSessions = [];

          if (shouldCombineGroups) {
            // Calculate optimal group distribution
            const groupsPerWorkshop = Math.ceil(groups.length / newWorkshopNames.length);

            newWorkshopNames.forEach((workshop, workshopIndex) => {
              if (workshop.trim() !== '') {
                // Improved group assignment algorithm to prevent conflicts
                const baseGroupIndex = ((rotation - 1) + workshopIndex) % groups.length;
                const assignedGroups = [];
                
                for (let i = 0; i < groupsPerWorkshop && assignedGroups.length < groups.length; i++) {
                  const groupIndex = (baseGroupIndex + i) % groups.length;
                  const group = groups[groupIndex];
                  
                  // Check for conflicts in this rotation
                  const assignmentKey = `${rotation}-${group}`;
                  if (!groupAssignmentTracker.has(assignmentKey)) {
                    assignedGroups.push(group);
                    groupAssignmentTracker.set(assignmentKey, workshop);
                  }
                }

                if (assignedGroups.length > 0) {
                  rotationSessions.push({
                    workshop,
                    groups: assignedGroups // Standardized array format
                  });
                }
              }
            });
          } else {
            // Standard rotation - one group per workshop with proper rotation
            newWorkshopNames.forEach((workshop, workshopIndex) => {
              if (workshop.trim() !== '') {
                const groupIndex = (workshopIndex + (rotation - 1)) % groups.length;
                const assignedGroup = groups[groupIndex];
                
                // Check for conflicts
                const assignmentKey = `${rotation}-${assignedGroup}`;
                if (!groupAssignmentTracker.has(assignmentKey)) {
                  rotationSessions.push({
                    workshop,
                    groups: [assignedGroup] // Standardized array format
                  });
                  groupAssignmentTracker.set(assignmentKey, workshop);
                }
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
            description: subjectForm.description || `Workshop: ${workshopName}`,
            day: subjectForm.day,
            startTime: subjectForm.startTime,
            endTime: subjectForm.endTime,
            courseId: selectedCourse.id,
            createdAt: new Date(),
            // Workshop rotation specific fields
            isWorkshopRotation: true,
            workshopIndex: workshopIndex + 1,
            totalWorkshops: newWorkshopNames.length,
            totalRotations: totalRotations,
            rotationSchedule: rotationSchedule,
            selectedWorkshopSubjects: newWorkshopNames, // Store all workshop names for reference
            // Initialize empty arrays for future assignments
            assignedFaculty: [],
            assignedMaterials: [],
            completedGroups: []
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

        // Generate rotation schedule for practical session using Latin Square algorithm
        // Validate configuration
        if (numberOfStations < 1 || numberOfTimeSlots < 1) {
          throw new Error('Invalid practical session configuration');
        }
        
        // Latin Square algorithm for proper rotation without conflicts
        const generateLatinSquareRotation = () => {
          const practicalRotationSchedule = [];
          const assignments = new Map(); // Track assignments to prevent conflicts
          
          for (let timeSlot = 1; timeSlot <= numberOfTimeSlots; timeSlot++) {
            const timeSlotSessions = [];
            
            for (let stationIndex = 0; stationIndex < numberOfStations; stationIndex++) {
              const stationName = stationNames[stationIndex] || `Station ${stationIndex + 1}`;
              
              if (numberOfStations >= groups.length) {
                // More stations than groups - proper rotation with Latin Square
                const groupIndex = (stationIndex + (timeSlot - 1)) % groups.length;
                const assignedGroup = groups[groupIndex];
                
                // Validate no conflicts
                const key = `${timeSlot}-${assignedGroup}`;
                if (!assignments.has(key)) {
                  timeSlotSessions.push({
                    station: stationName,
                    groups: [assignedGroup]
                  });
                  assignments.set(key, stationName);
                }
              } else {
                // Fewer stations than groups - use IMPACT programme pattern (A&B, C&D)
                const groupsPerStation = Math.ceil(groups.length / numberOfStations);
                
                if (numberOfStations === 2 && groups.length === 4) {
                  // Special case for 2 stations, 4 groups - use A&B, C&D pattern
                  let assignedGroups;
                  if (stationIndex === 0) {
                    // Station 1 gets A&B for time slot 1, C&D for time slot 2, etc.
                    assignedGroups = (timeSlot - 1) % 2 === 0 ? ['A', 'B'] : ['C', 'D'];
                  } else {
                    // Station 2 gets C&D for time slot 1, A&B for time slot 2, etc.
                    assignedGroups = (timeSlot - 1) % 2 === 0 ? ['C', 'D'] : ['A', 'B'];
                  }
                  
                  // Validate no conflicts
                  const hasConflicts = assignedGroups.some(group => {
                    const conflictKey = `${timeSlot}-${group}`;
                    return assignments.has(conflictKey);
                  });
                  
                  if (!hasConflicts) {
                    assignedGroups.forEach(group => {
                      assignments.set(`${timeSlot}-${group}`, stationName);
                    });
                    
                    timeSlotSessions.push({
                      station: stationName,
                      groups: assignedGroups
                    });
                  }
                } else {
                  // General Latin Square algorithm for other configurations
                  const assignedGroups = [];
                  
                  for (let i = 0; i < groupsPerStation && assignedGroups.length < groups.length; i++) {
                    const groupIndex = (stationIndex + (timeSlot - 1) + (i * numberOfStations)) % groups.length;
                    const group = groups[groupIndex];
                    
                    const conflictKey = `${timeSlot}-${group}`;
                    if (!assignments.has(conflictKey) && !assignedGroups.includes(group)) {
                      assignedGroups.push(group);
                      assignments.set(conflictKey, stationName);
                    }
                  }
                  
                  if (assignedGroups.length > 0) {
                    timeSlotSessions.push({
                      station: stationName,
                      groups: assignedGroups
                    });
                  }
                }
              }
            }

            practicalRotationSchedule.push({
              timeSlot,
              sessions: timeSlotSessions
            });
          }
          
          return practicalRotationSchedule;
        };
        
        const rotationSchedule = generateLatinSquareRotation();

        const subjectData = {
          name: subjectForm.name,
          type: subjectForm.type,
          duration: subjectForm.duration,
          description: subjectForm.description,
          day: subjectForm.day,
          startTime: subjectForm.startTime,
          endTime: subjectForm.endTime,
          courseId: selectedCourse.id,
          createdAt: new Date(),
          // Practical session specific fields
          numberOfStations: subjectForm.numberOfStations,
          numberOfTimeSlots: subjectForm.numberOfTimeSlots,
          timeSlotDuration: subjectForm.timeSlotDuration,
          stationNames: subjectForm.stationNames,
          stationRooms: subjectForm.stationRooms || [],
          rotationSchedule: rotationSchedule,
          // Initialize empty arrays for future assignments
          assignedFaculty: [],
          assignedMaterials: [],
          stationFaculty: Array(subjectForm.numberOfStations).fill([]) // Faculty assignments per station
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
         
         // Add concurrent activity information to each time slot with proper candidate rotation
         const updatedTimeSlots = timeSlots.map((timeSlot, index) => {
           // Alternate candidate groups for concurrent activities
           const isFirstHalf = index < Math.floor(timeSlots.length / 2);
           const concurrentCandidates = isFirstHalf 
             ? (subjectForm.concurrentCandidatesFirst || '9-16')
             : (subjectForm.concurrentCandidatesSecond || '1-8');
           
           return {
             ...timeSlot,
             concurrentActivity: {
               name: subjectForm.concurrentActivityName,
               candidates: concurrentCandidates,
               duration: subjectForm.timeSlotDuration,
               type: 'workshop', // Could be configurable in future
               faculty: subjectForm.concurrentActivityFaculty || []
             }
           };
         });
         
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
          // Assessment-specific data structure
          numberOfStations: subjectForm.numberOfStations,
          numberOfTimeSlots: subjectForm.numberOfTimeSlots,
          timeSlotDuration: subjectForm.timeSlotDuration,
          stationNames: subjectForm.stationNames,
          timeSlots: updatedTimeSlots,
          stationAssignments: updatedTimeSlots.map(timeSlot => ({
            timeSlot: timeSlot.slot,
            startTime: timeSlot.startTime,
            stations: timeSlot.stations.map(station => ({
              stationId: station.station,
              stationName: station.stationName,
              assignedCandidates: station.candidates,
              candidateRoles: station.roles,
              assignedFaculty: [] // Will be populated when faculty are assigned
            })),
            concurrentActivity: timeSlot.concurrentActivity
          })),
          concurrentActivityName: subjectForm.concurrentActivityName || '',
          scenarioCandidatesFirst: subjectForm.scenarioCandidatesFirst || '',
          concurrentCandidatesFirst: subjectForm.concurrentCandidatesFirst || '',
          scenarioCandidatesSecond: subjectForm.scenarioCandidatesSecond || '',
          concurrentCandidatesSecond: subjectForm.concurrentCandidatesSecond || '',
          // Assessment metadata
          assessmentType: 'station-based',
          maxCandidatesPerTimeSlot: subjectForm.numberOfStations * 2, // 2 candidates per station
          totalAssessmentSlots: subjectForm.numberOfTimeSlots * subjectForm.numberOfStations
        };

         await addDoc(collection(db, 'programmeSubjects'), subjectData);
         toast.success('Assessment session with concurrent activities added successfully');
      } else {
        // Handle regular subjects (sessions, breaks, lunch, scenario-practice)
        const subjectData = {
          name: subjectForm.name,
          type: subjectForm.type,
          duration: subjectForm.duration,
          description: subjectForm.description,
          day: subjectForm.day,
          startTime: subjectForm.startTime,
          endTime: subjectForm.endTime,
          courseId: selectedCourse.id,
          createdAt: new Date(),
          // Initialize empty arrays for future assignments
          assignedFaculty: [],
          assignedMaterials: [],
          // Only include station fields for scenario-practice type
          ...(subjectForm.type === 'scenario-practice' && {
            numberOfStations: subjectForm.numberOfStations || 4,
            numberOfTimeSlots: subjectForm.numberOfTimeSlots || 4,
            timeSlotDuration: subjectForm.timeSlotDuration || 30,
            stationRooms: subjectForm.stationRooms || [],
            stationFaculty: [] // Will be populated when faculty are assigned
          })
        };

        await addDoc(collection(db, 'programmeSubjects'), subjectData);
        toast.success('Subject added to programme successfully');
      }

      // Reset form with all fields
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
        stationRooms: [],
        concurrentActivityName: '',
        scenarioCandidatesFirst: '',
        concurrentCandidatesFirst: '',
        scenarioCandidatesSecond: '',
        concurrentCandidatesSecond: '',
        concurrentActivityFaculty: [],
        timeSlots: [],
        stationAssignments: []
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
      stationRooms: subject.stationRooms || [],
      concurrentActivityName: subject.concurrentActivityName || '',
      scenarioCandidatesFirst: subject.scenarioCandidatesFirst || '',
      concurrentCandidatesFirst: subject.concurrentCandidatesFirst || '',
      scenarioCandidatesSecond: subject.scenarioCandidatesSecond || '',
      concurrentCandidatesSecond: subject.concurrentCandidatesSecond || '',
      concurrentActivityFaculty: subject.concurrentActivityFaculty || [],
      timeSlots: subject.timeSlots || [],
      stationAssignments: subject.stationAssignments || []
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

      // Reset form with all fields
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
        stationRooms: [],
        concurrentActivityName: '',
        scenarioCandidatesFirst: '',
        concurrentCandidatesFirst: '',
        scenarioCandidatesSecond: '',
        concurrentCandidatesSecond: '',
        concurrentActivityFaculty: [],
        timeSlots: [],
        stationAssignments: []
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

  // Get candidate assignments for a specific assessment subject (with specific candidate assignments)
  const getCandidateAssignments = (assessmentSubject) => {
    if (!assessmentSubject.timeSlots) return [];
    
    const assignments = [];
    assessmentSubject.timeSlots.forEach(timeSlot => {
      // Assessment station assignments - using specific candidate assignments
      timeSlot.stations.forEach(station => {
        if (station.candidateAssignments) {
          // New format with specific candidate assignments
          station.candidateAssignments.forEach(assignment => {
            assignments.push({
              candidateNumber: assignment.candidateNumber,
              timeSlot: timeSlot.slot,
              station: station.station,
              stationName: station.stationName,
              role: assignment.role,
              activityType: 'assessment',
              faculty: station.faculty || []
            });
          });
        } else if (station.candidates) {
          // Legacy format fallback
          const candidateRange = station.candidates;
          if (candidateRange.includes('-')) {
            const [start, end] = candidateRange.split('-').map(Number);
            for (let i = start; i <= end; i++) {
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
              faculty: timeSlot.concurrentActivity.faculty || []
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

    // Core Functions
    fetchProgrammeSubjects,
    addProgrammeSubject,
    deleteProgrammeSubject,
    editProgrammeSubject,
    updateProgrammeSubject,
    
    // Display Functions
    getWorkshopGroups,
    getPracticalSessionGroups,
    getPracticalSessionStationInfo,
    calculateTimeSlot,
    
    // Assessment Functions
    generateAssessmentTimeSlots,
    getAssessmentSubjects,
    getCandidateAssignments,
    getCandidateAssessmentStatus,
    createStationAssessment,
    getStationAssessments,
    updateAssessmentCompletion,
    getCandidatePairs,
    getConcurrentActivitySchedule,
    
    // Validation Functions
    validateSubjectForm,
    validateTimeConflicts,
    validateSubjectTypeSpecific
  };
};
