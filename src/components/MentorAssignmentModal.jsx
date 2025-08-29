import React, { useState, useEffect } from 'react';
import { X, Heart, Users, Award, CheckCircle, AlertCircle, User } from 'lucide-react';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

const MentorAssignmentModal = ({ 
  isOpen, 
  onClose, 
  selectedCourse,
  onMentorUpdate
}) => {
  const [faculty, setFaculty] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mentorAssignments, setMentorAssignments] = useState({
    groupA: { facultyId: '', facultyName: '', facultyEmail: '' },
    groupB: { facultyId: '', facultyName: '', facultyEmail: '' },
    groupC: { facultyId: '', facultyName: '', facultyEmail: '' },
    groupD: { facultyId: '', facultyName: '', facultyEmail: '' }
  });

  useEffect(() => {
    if (isOpen && selectedCourse) {
      fetchData();
    }
  }, [isOpen, selectedCourse]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch faculty who have mentor preferences
      const facultySnapshot = await getDocs(collection(db, 'faculty'));
      const facultyData = facultySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(f => !f.deleted && f.mentorPreferences?.isMentor);
      
      setFaculty(facultyData);

      // Fetch candidates for this course to see group assignments
      const candidatesSnapshot = await getDocs(
        query(collection(db, 'candidates'), 
          where('courseId', '==', selectedCourse.id),
          where('status', 'in', ['Live Candidate', 'Paid in Full'])
        )
      );
      
      const candidatesData = candidatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCandidates(candidatesData);

      // Load existing mentor assignments for this course
      if (selectedCourse.mentorAssignments) {
        setMentorAssignments(selectedCourse.mentorAssignments);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load mentor data');
    } finally {
      setLoading(false);
    }
  };

  const assignMentor = (group, facultyId) => {
    const selectedFaculty = faculty.find(f => f.id === facultyId);
    
    if (selectedFaculty) {
      setMentorAssignments(prev => ({
        ...prev,
        [group]: {
          facultyId: selectedFaculty.id,
          facultyName: selectedFaculty.name,
          facultyEmail: selectedFaculty.email
        }
      }));
    }
  };

  const removeMentor = (group) => {
    setMentorAssignments(prev => ({
      ...prev,
      [group]: { facultyId: '', facultyName: '', facultyEmail: '' }
    }));
  };

  const saveMentorAssignments = async () => {
    try {
      await updateDoc(doc(db, 'courses', selectedCourse.id), {
        mentorAssignments: mentorAssignments,
        updatedAt: new Date()
      });

      toast.success('Mentor assignments updated successfully');
      onClose();
      if (onMentorUpdate) {
        onMentorUpdate();
      }
    } catch (error) {
      console.error('Error saving mentor assignments:', error);
      toast.error('Failed to save mentor assignments');
    }
  };

  const getCandidatesInGroup = (group) => {
    return candidates.filter(candidate => candidate.groupAssignment === group);
  };

  const getFacultyByGroup = (group) => {
    const assignment = mentorAssignments[group];
    return faculty.find(f => f.id === assignment?.facultyId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-nhs-dark-grey">
              Mentor Assignments - {selectedCourse?.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-nhs-grey hover:text-nhs-dark-grey"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nhs-blue"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Available Faculty */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-nhs-dark-grey mb-3 flex items-center space-x-2">
                <Users size={16} />
                <span>Available Faculty (Mentor Preferences Enabled)</span>
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {faculty.map((facultyMember) => (
                  <div key={facultyMember.id} className="bg-white rounded-lg p-3 border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-nhs-dark-grey">{facultyMember.name}</p>
                        <p className="text-sm text-nhs-grey">{facultyMember.email}</p>
                        <p className="text-xs text-nhs-grey">
                          Preferred Groups: {facultyMember.mentorPreferences?.preferredGroups?.join(', ') || 'Any'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 text-green-600">
                        <Heart size={14} />
                        <span className="text-xs font-medium">Mentor</span>
                      </div>
                    </div>
                  </div>
                ))}
                {faculty.length === 0 && (
                  <p className="text-nhs-grey text-sm col-span-2">
                    No faculty members have enabled mentor preferences. Faculty must opt-in to be mentors.
                  </p>
                )}
              </div>
            </div>

            {/* Group Assignments */}
            <div className="grid md:grid-cols-2 gap-6">
              {['groupA', 'groupB', 'groupC', 'groupD'].map((group) => {
                const groupLetter = group.replace('group', '');
                const assignedFaculty = getFacultyByGroup(group);
                const candidatesInGroup = getCandidatesInGroup(groupLetter);
                
                return (
                  <div key={group} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-nhs-dark-grey flex items-center space-x-2">
                        <Award className="text-nhs-blue" size={16} />
                        <span>Group {groupLetter}</span>
                      </h4>
                      <span className="text-sm text-nhs-grey">
                        {candidatesInGroup.length} candidates
                      </span>
                    </div>

                    {/* Current Mentor */}
                    {assignedFaculty ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-nhs-dark-grey">{assignedFaculty.name}</p>
                            <p className="text-sm text-nhs-grey">{assignedFaculty.email}</p>
                          </div>
                          <button
                            onClick={() => removeMentor(group)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                        <p className="text-sm text-nhs-grey">No mentor assigned</p>
                      </div>
                    )}

                    {/* Assign Mentor Dropdown */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-nhs-dark-grey mb-1">
                        Assign Mentor
                      </label>
                      <select
                        value={mentorAssignments[group]?.facultyId || ''}
                        onChange={(e) => assignMentor(group, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">Select a faculty member</option>
                        {faculty.map((facultyMember) => (
                          <option key={facultyMember.id} value={facultyMember.id}>
                            {facultyMember.name} ({facultyMember.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Candidates in this group */}
                    <div>
                      <h5 className="text-sm font-medium text-nhs-dark-grey mb-2">Candidates in Group {groupLetter}:</h5>
                      {candidatesInGroup.length > 0 ? (
                        <div className="space-y-1">
                          {candidatesInGroup.map((candidate) => (
                            <div key={candidate.id} className="flex items-center space-x-2 text-sm text-nhs-grey">
                              <User size={12} />
                              <span>{candidate.firstName} {candidate.surname}</span>
                              <span className="text-xs">({candidate.grade})</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-nhs-grey">No candidates assigned to this group</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-nhs-dark-grey mb-2 flex items-center space-x-2">
                <CheckCircle size={16} className="text-blue-600" />
                <span>Assignment Summary</span>
              </h4>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                {['groupA', 'groupB', 'groupC', 'groupD'].map((group) => {
                  const groupLetter = group.replace('group', '');
                  const assignedFaculty = getFacultyByGroup(group);
                  const candidatesInGroup = getCandidatesInGroup(groupLetter);
                  
                  return (
                    <div key={group} className="text-center">
                      <p className="font-medium text-nhs-dark-grey">Group {groupLetter}</p>
                      <p className="text-nhs-grey">
                        {assignedFaculty ? assignedFaculty.name : 'No mentor'}
                      </p>
                      <p className="text-xs text-nhs-grey">
                        {candidatesInGroup.length} candidates
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-nhs-grey hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveMentorAssignments}
                className="px-4 py-2 bg-nhs-blue text-white rounded-md hover:bg-nhs-dark-blue flex items-center space-x-2"
              >
                <Heart size={16} />
                <span>Save Mentor Assignments</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorAssignmentModal;
