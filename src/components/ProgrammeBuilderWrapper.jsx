import React from 'react';
import { useProgrammeBuilder } from '../hooks/useProgrammeBuilder';
import ProgrammeBuilderModal from './ProgrammeBuilderModal';

const ProgrammeBuilderWrapper = ({ 
  courseId, 
  isOpen, 
  onClose, 
  subjectForm, 
  setSubjectForm, 
  onAddSubject 
}) => {
  const {
    predefinedWorkshopSubjects,
    predefinedSessionSubjects,
    predefinedPracticalSubjects,
  } = useProgrammeBuilder(courseId);

  return (
    <ProgrammeBuilderModal
      isOpen={isOpen}
      onClose={onClose}
      subjectForm={subjectForm}
      setSubjectForm={setSubjectForm}
      onAddSubject={onAddSubject}
      predefinedWorkshopSubjects={predefinedWorkshopSubjects}
      predefinedSessionSubjects={predefinedSessionSubjects}
      predefinedPracticalSubjects={predefinedPracticalSubjects}
    />
  );
};

export default ProgrammeBuilderWrapper;
