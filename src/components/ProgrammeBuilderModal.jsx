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
    'Imaging and Radiology'
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
              group: combinedGroups.join('+') // Combine groups with '+'
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
              group: groups[groupIndex]
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
                                  <span className="bg-nhs-blue text-white px-2 py-1 rounded text-xs">Group {session.group}</span>
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
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Time Slot Duration (minutes)
                </label>
                <select
                  value={subjectForm.timeSlotDuration || 15}
                  onChange={(e) => setSubjectForm(prev => ({ ...prev, timeSlotDuration: parseInt(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value={15}>15 minutes</option>
                  <option value={20}>20 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </div>
              
              {/* Concurrent Activity Configuration */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Concurrent Activity (Optional)
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
              
              <div className="md:col-span-2">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm text-purple-800">
                    <strong>Assessment Setup:</strong> This will create an assessment session with {subjectForm.numberOfStations || 4} stations 
                    and {subjectForm.numberOfTimeSlots || 4} time slots of {subjectForm.timeSlotDuration || 15} minutes each. 
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
                             const newStationRooms = [...(subjectForm.stationRooms || [])];
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
                     • Time Slot 1: A→Station1, B→Station2, C→Station3, D→Station4
                     <br />
                     • Time Slot 2: D→Station1, A→Station2, B→Station3, C→Station4
                     <br />
                     • Time Slot 3: C→Station1, D→Station2, A→Station3, B→Station4
                     <br />
                     • Time Slot 4: B→Station1, C→Station2, D→Station3, A→Station4
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
              
              <div className="md:col-span-2">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <p className="text-sm text-indigo-800">
                    <strong>Practical Session Setup:</strong> This will create a practical session with {subjectForm.numberOfStations || 2} stations 
                    and {subjectForm.numberOfTimeSlots || 2} time slots of {subjectForm.timeSlotDuration || 30} minutes each. 
                    Candidates will be grouped and rotate between stations. Group assignments will be made when candidates are confirmed.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onAddSubject}
            className="bg-nhs-blue text-white px-4 py-2 rounded-md hover:bg-nhs-dark-blue"
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
