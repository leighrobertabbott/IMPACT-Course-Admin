import React from 'react';
import { X, Users2 } from 'lucide-react';

const ProgrammeBuilderModal = ({
  isOpen,
  onClose,
  subjectForm,
  setSubjectForm,
  onAddSubject,
  predefinedWorkshopSubjects = [
    'Fluids and Transfusion',
    'Lumbar Puncture and CSF Analysis',
    'Advanced Arrhythmia Management',
    'Imaging and Radiology',
    'Poisoning Workshop'
  ],
  predefinedSessionSubjects = [
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
  ],
  predefinedPracticalSubjects = [
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
  ]
}) => {
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

  const generateRotationSchedule = () => {
    if (!subjectForm.isWorkshopRotation || !subjectForm.selectedWorkshopSubjects || subjectForm.selectedWorkshopSubjects.length === 0) {
      return [];
    }

    const groups = ['A', 'B', 'C', 'D'];
    const schedule = [];
    const newWorkshopNames = subjectForm.selectedWorkshopSubjects.filter(name => name.trim() !== '');

    // If we have fewer workshops than groups, combine groups
    const shouldCombineGroups = newWorkshopNames.length < groups.length;

    for (let rotation = 1; rotation <= subjectForm.numberOfRotations; rotation++) {
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
              groups: combinedGroups // Use array format consistently
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
              groups: [groups[groupIndex]] // Use array format consistently
            });
          }
        });
      }

      schedule.push({
        rotation,
        sessions: rotationSessions
      });
    }

    return schedule;
  };

  const generatePracticalSessionSchedule = () => {
    if (!subjectForm.stationNames || subjectForm.stationNames.length === 0) {
      return [];
    }

    const groups = ['A', 'B', 'C', 'D'];
    const schedule = [];
    const stationNames = subjectForm.stationNames.filter(name => name.trim() !== '');
    const numberOfStations = subjectForm.numberOfStations || 2;
    const numberOfTimeSlots = subjectForm.numberOfTimeSlots || 2;

    for (let timeSlot = 1; timeSlot <= numberOfTimeSlots; timeSlot++) {
      const timeSlotSessions = [];
      
      // For each time slot, distribute groups across stations
      for (let stationIndex = 0; stationIndex < numberOfStations; stationIndex++) {
        if (numberOfStations >= groups.length) {
          // More stations than groups - one group per station, rotate
          const groupIndex = (stationIndex + (timeSlot - 1)) % groups.length;
          timeSlotSessions.push({
            station: stationNames[stationIndex] || `Station ${stationIndex + 1}`,
            groups: [groups[groupIndex]] // Standardized array format
          });
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
            
            timeSlotSessions.push({
              station: stationNames[stationIndex] || `Station ${stationIndex + 1}`,
              groups: assignedGroups
            });
          } else {
            // General algorithm for other configurations
            const assignedGroups = [];
            
            for (let i = 0; i < groupsPerStation; i++) {
              const groupIndex = (stationIndex + (i * numberOfStations) + (timeSlot - 1)) % groups.length;
              assignedGroups.push(groups[groupIndex]);
            }
            
            timeSlotSessions.push({
              station: stationNames[stationIndex] || `Station ${stationIndex + 1}`,
              groups: assignedGroups
            });
          }
        }
      }

      schedule.push({
        timeSlot,
        sessions: timeSlotSessions
      });
    }

    return schedule;
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
            candidate1 = (stationIndex * 2) + 1; // 1, 3, 5, 7
            candidate2 = candidate1 + 1;          // 2, 4, 6, 8
            role1 = 'Lead';
            role2 = 'Assist';
          } else {
            candidate1 = ((stationIndex + 3) % 4 * 2) + 1; // 7, 1, 3, 5
            candidate2 = candidate1 + 1;                    // 8, 2, 4, 6
            role1 = 'Assist';
            role2 = 'Lead';
          }
        } else {
          // Time slots 3-4: Assessed/Observe pattern
          if (timeSlotIndex === 2) {
            candidate1 = ((stationIndex + 2) % 4 * 2) + 1; // 5, 7, 1, 3
            candidate2 = candidate1 + 1;                    // 6, 8, 2, 4
            role1 = 'Assessed';
            role2 = 'Observe';
          } else {
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
          candidates: `Candidate ${candidate1}, Candidate ${candidate2}`,
          roles: [role1, role2]
        });
      }

      timeSlots.push({
        slot: timeSlotIndex + 1,
        startTime: slotStartTime,
        duration: currentSlotDuration,
        stations: stations
      });
    }

    return timeSlots;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Subject to Programme</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
              Subject Name *
            </label>
            {subjectForm.type === 'workshop' ? (
              <input
                type="text"
                value={subjectForm.name}
                onChange={(e) => setSubjectForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter workshop name (e.g., Clinical Skills Workshop)"
              />
            ) : subjectForm.type === 'scenario-practice' ? (
              <input
                type="text"
                value={subjectForm.name}
                disabled
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
              />
            ) : subjectForm.type === 'break' ? (
              <input
                type="text"
                value={subjectForm.name}
                disabled
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
              />
            ) : subjectForm.type === 'lunch' ? (
              <input
                type="text"
                value={subjectForm.name}
                disabled
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
              />
            ) : subjectForm.type === 'assessment' || subjectForm.type === 'practical-session' ? (
              <input
                type="text"
                value={subjectForm.name}
                onChange={(e) => setSubjectForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder={`Enter ${subjectForm.type.replace('-', ' ')} name...`}
              />
            ) : (
              <select
                value={subjectForm.name}
                onChange={(e) => setSubjectForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a subject...</option>
                {subjectForm.type === 'session' && predefinedSessionSubjects.map((subject, index) => (
                  <option key={index} value={subject}>{subject}</option>
                ))}
                {subjectForm.type === 'practical' && predefinedPracticalSubjects.map((subject, index) => (
                  <option key={index} value={subject}>{subject}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
              Subject Type *
            </label>
            <select
              value={subjectForm.type}
              onChange={(e) => {
                const newType = e.target.value;
                let newName = subjectForm.name;
                
                // Auto-set name for fixed-text subject types
                if (newType === 'scenario-practice') {
                  newName = 'Scenario Practice';
                } else if (newType === 'break') {
                  newName = 'Break';
                } else if (newType === 'lunch') {
                  newName = 'Lunch';
                } else if (newType === 'workshop') {
                  newName = ''; // Clear for workshop as it's free text
                } else if (newType === 'assessment' || newType === 'practical-session') {
                  newName = ''; // Clear for free text types
                } else {
                  newName = ''; // Clear for dropdown types
                }
                
                setSubjectForm(prev => ({ ...prev, type: newType, name: newName }));
              }}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="session">Session</option>
              <option value="workshop">Workshop</option>
              <option value="practical">Practical</option>
              <option value="assessment">Assessment</option>
              <option value="scenario-practice">Scenario Practice</option>
              <option value="practical-session">Practical Session</option>
              <option value="break">Break</option>
              <option value="lunch">Lunch</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
              Day
            </label>
            <select
              value={subjectForm.day}
              onChange={(e) => setSubjectForm(prev => ({ ...prev, day: parseInt(e.target.value) }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value={1}>Day 1</option>
              <option value={2}>Day 2</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={subjectForm.duration}
              onChange={(e) => setSubjectForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              className="w-full p-2 border border-gray-300 rounded-md"
              min="15"
              step="15"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={subjectForm.startTime}
              onChange={(e) => setSubjectForm(prev => ({ ...prev, startTime: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
              End Time
            </label>
            <input
              type="time"
              value={subjectForm.endTime}
              onChange={(e) => setSubjectForm(prev => ({ ...prev, endTime: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
              Description
            </label>
            <textarea
              value={subjectForm.description}
              onChange={(e) => setSubjectForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="Brief description of the subject..."
            />
          </div>

          {/* Workshop Rotation Options - Only show when type is workshop */}
          {subjectForm.type === 'workshop' && (
            <>
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="checkbox"
                    id="isWorkshopRotation"
                    checked={subjectForm.isWorkshopRotation}
                    onChange={(e) => setSubjectForm(prev => ({ ...prev, isWorkshopRotation: e.target.checked }))}
                    className="rounded border-gray-300 text-nhs-blue focus:ring-nhs-blue"
                  />
                  <label htmlFor="isWorkshopRotation" className="text-sm font-medium text-nhs-dark-grey">
                    Enable Group Rotation for this Workshop
                  </label>
                </div>
              </div>

              {subjectForm.isWorkshopRotation && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                      Number of Workshops
                    </label>
                    <select
                      value={subjectForm.numberOfWorkshops}
                      onChange={(e) => setSubjectForm(prev => ({ ...prev, numberOfWorkshops: parseInt(e.target.value) }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value={2}>2 Workshops</option>
                      <option value={3}>3 Workshops</option>
                      <option value={4}>4 Workshops</option>
                      <option value={5}>5 Workshops</option>
                      <option value={6}>6 Workshops</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                      Workshop Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={subjectForm.workshopDuration}
                      onChange={(e) => setSubjectForm(prev => ({ ...prev, workshopDuration: parseInt(e.target.value) }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      min="15"
                      step="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                      Number of Rotations
                    </label>
                    <select
                      value={subjectForm.numberOfRotations}
                      onChange={(e) => setSubjectForm(prev => ({ ...prev, numberOfRotations: parseInt(e.target.value) }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value={2}>2 Rotations</option>
                      <option value={3}>3 Rotations</option>
                      <option value={4}>4 Rotations</option>
                      <option value={5}>5 Rotations</option>
                      <option value={6}>6 Rotations</option>
                    </select>
                  </div>
                  
                  {/* Workshop Subject Selection */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                      Select Workshop Subjects (each workshop will be a different subject)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Array.from({ length: subjectForm.numberOfWorkshops }, (_, index) => (
                        <div key={index}>
                          <label className="block text-xs text-nhs-grey mb-1">
                            Workshop {index + 1}
                          </label>
                          <select
                            value={subjectForm.selectedWorkshopSubjects[index] || ''}
                            onChange={(e) => {
                              const newSubjects = [...subjectForm.selectedWorkshopSubjects];
                              newSubjects[index] = e.target.value;
                              setSubjectForm(prev => ({ ...prev, selectedWorkshopSubjects: newSubjects }));
                            }}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="">Select a subject...</option>
                            {predefinedWorkshopSubjects.map((subject, subjectIndex) => (
                              <option 
                                key={subjectIndex} 
                                value={subject}
                                disabled={subjectForm.selectedWorkshopSubjects.includes(subject) && subjectForm.selectedWorkshopSubjects[index] !== subject}
                              >
                                {subject}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Rotation Schedule Preview */}
                  {subjectForm.selectedWorkshopSubjects.filter(s => s.trim() !== '').length === subjectForm.numberOfWorkshops && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                        Rotation Schedule Preview
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-60 overflow-y-auto">
                        {generateRotationSchedule().map((rotation, rotationIndex) => (
                          <div key={rotationIndex} className="mb-3 last:mb-0">
                            <h4 className="font-medium text-nhs-dark-grey mb-2">Rotation {rotation.rotation}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              {rotation.sessions.map((session, sessionIndex) => (
                                <div key={sessionIndex} className="flex justify-between items-center bg-white p-2 rounded border">
                                  <span className="text-nhs-dark-grey">{session.workshop}</span>
                                  <span className="bg-nhs-blue text-white px-2 py-1 rounded text-xs">Group {Array.isArray(session.groups) ? session.groups.join('+') : session.groups}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="md:col-span-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Workshop Rotation Setup:</strong> This will create {subjectForm.numberOfWorkshops} different workshop sessions 
                        of {subjectForm.workshopDuration} minutes each, with {subjectForm.numberOfRotations} rotation cycles. 
                        Each workshop is a different subject running concurrently. The system will track group rotations across breaks and other sessions.
                        Candidate groups will be assigned when candidates are paid and confirmed.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Assessment Configuration - Only show when type is assessment */}
          {subjectForm.type === 'assessment' && (
            <>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Number of Stations
                </label>
                <select
                  value={subjectForm.numberOfStations || 4}
                  onChange={(e) => setSubjectForm(prev => ({ ...prev, numberOfStations: parseInt(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value={4}>4 Stations</option>
                  <option value={3}>3 Stations</option>
                  <option value={2}>2 Stations</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Number of Time Slots
                </label>
                <select
                  value={subjectForm.numberOfTimeSlots || 4}
                  onChange={(e) => setSubjectForm(prev => ({ ...prev, numberOfTimeSlots: parseInt(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value={4}>4 Time Slots</option>
                  <option value={3}>3 Time Slots</option>
                  <option value={2}>2 Time Slots</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Assessment Time Slot Durations
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-nhs-grey mb-1">
                      Lead/Assist Slots (first 2 slots)
                    </label>
                    <select
                      value={subjectForm.leadAssistDuration || 20}
                      onChange={(e) => setSubjectForm(prev => ({ ...prev, leadAssistDuration: parseInt(e.target.value) }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={20}>20 minutes</option>
                      <option value={25}>25 minutes</option>
                      <option value={30}>30 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-nhs-grey mb-1">
                      Assessed/Observe Slots (last 2 slots)
                    </label>
                    <select
                      value={subjectForm.assessedObserveDuration || 15}
                      onChange={(e) => setSubjectForm(prev => ({ ...prev, assessedObserveDuration: parseInt(e.target.value) }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value={10}>10 minutes</option>
                      <option value={15}>15 minutes</option>
                      <option value={20}>20 minutes</option>
                      <option value={25}>25 minutes</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-nhs-grey mt-2">
                  Lead/Assist slots are longer for practice, Assessed/Observe slots are shorter for evaluation
                </p>
              </div>
              
              {/* Station Names Configuration */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Assessment Station Names
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Array.from({ length: subjectForm.numberOfStations || 4 }, (_, index) => (
                    <div key={index}>
                      <label className="block text-xs text-nhs-grey mb-1">
                        Station {index + 1}
                      </label>
                      <input
                        type="text"
                        value={subjectForm.stationNames?.[index] || ''}
                        onChange={(e) => {
                          const newStationNames = [...(subjectForm.stationNames || [])];
                          newStationNames[index] = e.target.value;
                          setSubjectForm(prev => ({ ...prev, stationNames: newStationNames }));
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        placeholder="e.g., Cardiac Assessment"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Concurrent Activity Configuration */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Concurrent Activity {subjectForm.type === 'assessment' ? '(Required)' : '(Optional)'}
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-nhs-grey mb-1">
                      Activity Name
                    </label>
                    <input
                      type="text"
                      value={subjectForm.concurrentActivityName || ''}
                      onChange={(e) => setSubjectForm(prev => ({ ...prev, concurrentActivityName: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      placeholder="e.g., Difficult Decision Workshop (CO)"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-nhs-grey mb-1">
                        Scenario Candidates (First Session)
                      </label>
                      <input
                        type="text"
                        value={subjectForm.scenarioCandidatesFirst || ''}
                        onChange={(e) => setSubjectForm(prev => ({ ...prev, scenarioCandidatesFirst: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        placeholder="e.g., 1-8"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-nhs-grey mb-1">
                        Concurrent Activity Candidates (First Session)
                      </label>
                      <input
                        type="text"
                        value={subjectForm.concurrentCandidatesFirst || ''}
                        onChange={(e) => setSubjectForm(prev => ({ ...prev, concurrentCandidatesFirst: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        placeholder="e.g., 9-16"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-nhs-grey mb-1">
                        Scenario Candidates (Second Session)
                      </label>
                      <input
                        type="text"
                        value={subjectForm.scenarioCandidatesSecond || ''}
                        onChange={(e) => setSubjectForm(prev => ({ ...prev, scenarioCandidatesSecond: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        placeholder="e.g., 9-16"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-nhs-grey mb-1">
                        Concurrent Activity Candidates (Second Session)
                      </label>
                      <input
                        type="text"
                        value={subjectForm.concurrentCandidatesSecond || ''}
                        onChange={(e) => setSubjectForm(prev => ({ ...prev, concurrentCandidatesSecond: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        placeholder="e.g., 1-8"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Assessment Time Slot Preview */}
              {subjectForm.stationNames?.filter(s => s.trim() !== '').length === subjectForm.numberOfStations && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    Assessment Time Slot Preview
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-60 overflow-y-auto">
                    {generateAssessmentTimeSlots(subjectForm).map((timeSlot, timeSlotIndex) => (
                      <div key={timeSlotIndex} className="mb-3 last:mb-0">
                        <h4 className="font-medium text-nhs-dark-grey mb-2">{timeSlot.startTime}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {/* Assessment Stations */}
                          <div className="md:col-span-1">
                            <h5 className="font-medium text-nhs-blue mb-2">Assessment Stations:</h5>
                            {timeSlot.stations.map((station, stationIndex) => (
                              <div key={stationIndex} className="bg-white p-3 rounded border mb-2">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium text-nhs-dark-grey">{station.stationName}</span>
                                  <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs">Station {station.station}</span>
                                </div>
                                <div className="space-y-1 text-xs">
                                  {station.candidateAssignments?.map((assignment, idx) => (
                                    <div key={idx} className="flex justify-between">
                                      <span className="text-gray-600">{assignment.role}:</span>
                                      <span className="font-medium">Candidate {assignment.candidateNumber}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                          {/* Concurrent Activity */}
                          {subjectForm.concurrentActivityName && (
                            <div className="md:col-span-1">
                              <h5 className="font-medium text-nhs-green mb-2">Concurrent Activity:</h5>
                              <div className="bg-white p-2 rounded border">
                                <div className="text-nhs-dark-grey mb-1">{subjectForm.concurrentActivityName}</div>
                                <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                                  Candidates {subjectForm.concurrentCandidatesFirst || '9-16'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="md:col-span-2">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm text-purple-800">
                    <strong>Assessment Setup:</strong> This will create an assessment session with {subjectForm.numberOfStations || 4} stations 
                    and {subjectForm.numberOfTimeSlots || 4} time slots. 
                    <br /><br />
                    <strong>Time Slot Durations:</strong>
                    <br />
                    • Time Slots 1-2: Lead/Assist roles ({subjectForm.leadAssistDuration || 20} minutes each)
                    <br />
                    • Time Slots 3-4: Assessed/Observe roles ({subjectForm.assessedObserveDuration || 15} minutes each)
                    <br /><br />
                    Candidates will be assigned Lead/Assist roles in the first two time slots and Assessed/Observe roles in the remaining slots.
                    {subjectForm.concurrentActivityName && (
                      <>
                        <br /><br />
                        <strong>Concurrent Activity:</strong> {subjectForm.concurrentActivityName}
                                            <br />
                    • First Session: Candidates {subjectForm.scenarioCandidatesFirst || '1-8'} do assessments, Candidates {subjectForm.concurrentCandidatesFirst || '9-16'} attend {subjectForm.concurrentActivityName}
                    <br />
                    • Second Session: Candidates {subjectForm.scenarioCandidatesSecond || '9-16'} do assessments, Candidates {subjectForm.concurrentCandidatesSecond || '1-8'} attend {subjectForm.concurrentActivityName}
                    <br /><br />
                    <strong>Note:</strong> Candidate numbers (1-16) will be automatically assigned when candidates are activated. Assessment assignments will be based on these numbers.
                      </>
                    )}
                    <br /><br />
                    <strong>Faculty Assignment:</strong> Faculty will be assigned to specific stations and concurrent activity using the faculty assignment system after creation.
                    <br /><br />
                    Individual candidate assignments will be made when candidates are confirmed.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Scenario Practice Configuration - Only show when type is scenario-practice */}
          {subjectForm.type === 'scenario-practice' && (
            <>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Number of Stations
                </label>
                <select
                  value={subjectForm.numberOfStations || 4}
                  onChange={(e) => setSubjectForm(prev => ({ ...prev, numberOfStations: parseInt(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value={4}>4 Stations</option>
                  <option value={3}>3 Stations</option>
                  <option value={2}>2 Stations</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Number of Time Slots
                </label>
                <select
                  value={subjectForm.numberOfTimeSlots || 4}
                  onChange={(e) => setSubjectForm(prev => ({ ...prev, numberOfTimeSlots: parseInt(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value={4}>4 Time Slots</option>
                  <option value={3}>3 Time Slots</option>
                  <option value={2}>2 Time Slots</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Time Slot Duration (minutes)
                </label>
                <select
                  value={subjectForm.timeSlotDuration || 20}
                  onChange={(e) => setSubjectForm(prev => ({ ...prev, timeSlotDuration: parseInt(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value={15}>15 minutes</option>
                  <option value={20}>20 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </div>
              
                             {/* Room Assignment for Each Station */}
               <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                   Room Assignment for Each Station
                 </label>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {Array.from({ length: subjectForm.numberOfStations || 4 }, (_, index) => (
                     <div key={index} className="border border-gray-200 rounded-lg p-3">
                       <label className="block text-xs font-medium text-nhs-dark-grey mb-2">
                         Station {index + 1}
                       </label>
                       <div>
                         <input
                           type="text"
                           value={subjectForm.stationRooms?.[index] || ''}
                           onChange={(e) => {
                             const newStationRooms = [...(subjectForm.stationRooms || Array(subjectForm.numberOfStations).fill(''))];
                             newStationRooms[index] = e.target.value;
                             setSubjectForm(prev => ({ ...prev, stationRooms: newStationRooms }));
                           }}
                           className="w-full p-2 border border-gray-300 rounded-md text-sm"
                           placeholder="e.g., Room 101 or To Be Directed"
                         />
                       </div>
                     </div>
                   ))}
                 </div>
               </div>

               
              
                             <div className="md:col-span-2">
                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                   <p className="text-sm text-blue-800">
                     <strong>Scenario Practice Setup:</strong> This will create a scenario practice session with {subjectForm.numberOfStations || 4} stations 
                     and {subjectForm.numberOfTimeSlots || 4} time slots of {subjectForm.timeSlotDuration || 20} minutes each. 
                     Groups A, B, C, D will rotate through the stations while faculty remain assigned to their specific stations.
                     <br /><br />
                     <strong>Faculty Assignment:</strong> Faculty are assigned to specific stations and will remain at their assigned stations throughout all time slots.
                     <br /><br />
                     <strong>Group Rotation Pattern:</strong>
                     <br />
                     • {calculateTimeSlot(subjectForm.startTime, 0, subjectForm.timeSlotDuration || 20)}: A→Station1, B→Station2, C→Station3, D→Station4
                     <br />
                     • {calculateTimeSlot(subjectForm.startTime, 1, subjectForm.timeSlotDuration || 20)}: D→Station1, A→Station2, B→Station3, C→Station4
                     <br />
                     • {calculateTimeSlot(subjectForm.startTime, 2, subjectForm.timeSlotDuration || 20)}: C→Station1, D→Station2, A→Station3, B→Station4
                     <br />
                     • {calculateTimeSlot(subjectForm.startTime, 3, subjectForm.timeSlotDuration || 20)}: B→Station1, C→Station2, D→Station3, A→Station4
                     <br /><br />
                     Group assignments will be made when candidates are confirmed.
                   </p>
                 </div>
               </div>
            </>
          )}



          {/* Practical Session Configuration - Only show when type is practical-session */}
          {subjectForm.type === 'practical-session' && (
            <>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Number of Stations
                </label>
                <select
                  value={subjectForm.numberOfStations || 2}
                  onChange={(e) => setSubjectForm(prev => ({ ...prev, numberOfStations: parseInt(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value={2}>2 Stations</option>
                  <option value={3}>3 Stations</option>
                  <option value={4}>4 Stations</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Number of Time Slots
                </label>
                <select
                  value={subjectForm.numberOfTimeSlots || 2}
                  onChange={(e) => setSubjectForm(prev => ({ ...prev, numberOfTimeSlots: parseInt(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value={2}>2 Time Slots</option>
                  <option value={3}>3 Time Slots</option>
                  <option value={4}>4 Time Slots</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Time Slot Duration (minutes)
                </label>
                <select
                  value={subjectForm.timeSlotDuration || 30}
                  onChange={(e) => setSubjectForm(prev => ({ ...prev, timeSlotDuration: parseInt(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                </select>
              </div>
              
              {/* Station Names */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Station Names
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Array.from({ length: subjectForm.numberOfStations || 2 }, (_, index) => (
                    <div key={index}>
                      <label className="block text-xs text-nhs-grey mb-1">
                        Station {index + 1}
                      </label>
                      <select
                        value={subjectForm.stationNames?.[index] || ''}
                        onChange={(e) => {
                          const newStationNames = [...(subjectForm.stationNames || [])];
                          newStationNames[index] = e.target.value;
                          setSubjectForm(prev => ({ ...prev, stationNames: newStationNames }));
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">Select a subject...</option>
                        {predefinedPracticalSubjects.map((subject, subjectIndex) => (
                          <option 
                            key={subjectIndex} 
                            value={subject}
                            disabled={subjectForm.stationNames?.includes(subject) && subjectForm.stationNames[index] !== subject}
                          >
                            {subject}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Rotation Schedule Preview */}
              {subjectForm.stationNames?.filter(s => s.trim() !== '').length === subjectForm.numberOfStations && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    Rotation Schedule Preview
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-60 overflow-y-auto">
                    {generatePracticalSessionSchedule().map((timeSlot, timeSlotIndex) => (
                      <div key={timeSlotIndex} className="mb-3 last:mb-0">
                        <h4 className="font-medium text-nhs-dark-grey mb-2">{calculateTimeSlot(subjectForm.startTime, timeSlotIndex, subjectForm.timeSlotDuration || 30)}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {timeSlot.sessions.map((session, sessionIndex) => (
                            <div key={sessionIndex} className="flex justify-between items-center bg-white p-2 rounded border">
                              <span className="text-nhs-dark-grey">{session.station}</span>
                                                             <span className="bg-indigo-500 text-white px-2 py-1 rounded text-xs">
                                Group {Array.isArray(session.groups) ? session.groups.join('+') : session.groups}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="md:col-span-2">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <p className="text-sm text-indigo-800">
                    <strong>Practical Session Setup:</strong> This will create a practical session with {subjectForm.numberOfStations || 2} stations 
                    and {subjectForm.numberOfTimeSlots || 2} time slots of {subjectForm.timeSlotDuration || 30} minutes each. 
                    Groups will rotate through the stations with proper group combinations when there are fewer stations than groups.
                    <br /><br />
                    <strong>Faculty Assignment:</strong> Faculty are assigned to specific stations and will remain at their assigned stations throughout all time slots.
                    <br /><br />
                    <strong>Group Rotation Pattern:</strong>
                    <br />
                    • When stations &lt; groups: Groups are combined (e.g., A+B, C+D)
                    <br />
                    • When stations ≥ groups: Each group rotates through stations
                    <br /><br />
                    Group assignments will be made when candidates are confirmed.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => {
              try {
                onAddSubject();
              } catch (error) {
                console.error('Error adding subject:', error);
                // Error will be handled by the hook function
              }
            }}
            className="bg-nhs-blue text-white px-4 py-2 rounded-md hover:bg-nhs-dark-blue disabled:opacity-50"
            disabled={!subjectForm.name || !subjectForm.type}
          >
            Add Subject
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgrammeBuilderModal;
