import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { cloudFunctions } from '../utils/cloudFunctions';
import { toast } from 'react-hot-toast';
import { ArrowRight, Calendar, MapPin, Users } from 'lucide-react';

const ApplicationForm = () => {
  const [studyLeaveConfirmed, setStudyLeaveConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [submittedCandidateData, setSubmittedCandidateData] = useState(null);
  const [courseCapacity, setCourseCapacity] = useState({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm();

  const applicantType = watch('applicantType');

  useEffect(() => {
    fetchAvailableCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      checkCourseCapacity(selectedCourse.id);
    }
  }, [selectedCourse]);

  const fetchAvailableCourses = async () => {
    setCoursesLoading(true);
    try {
      // Get all courses from Firestore
      const allCoursesSnapshot = await getDocs(collection(db, 'courses'));
      const allCourses = allCoursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('All courses found:', allCourses);
      console.log('First course data:', allCourses[0]);
      
      // Filter for available courses (not archived and active)
      const available = allCourses.filter(course => {
        console.log(`Course ${course.name}: archived=${course.archived}, status=${course.status}`);
        // More robust filtering - accept courses that are not archived and either have status 'active' or no status field
        return course.archived !== true && (course.status === 'active' || !course.status);
      });
      
      console.log('Available courses after filtering:', available);
      
      setAvailableCourses(available);
      
      // Auto-select the first available course
      if (available.length > 0) {
        setSelectedCourse(available[0]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load available courses. Please refresh the page.');
    } finally {
      setCoursesLoading(false);
    }
  };

  const checkCourseCapacity = async (courseId) => {
    try {
      const response = await cloudFunctions.checkCourseCapacity({ courseId });
      if (response.success) {
        // Store capacity data with course ID as key
        setCourseCapacity(prev => ({
          ...prev,
          [courseId]: response.data
        }));
        console.log('Course capacity checked:', response.data);
      } else {
        console.error('Failed to check course capacity:', response.error);
        toast.error('Failed to check course capacity. Please try again.');
      }
    } catch (error) {
      console.error('Error checking course capacity:', error);
      toast.error('Failed to check course capacity. Please try again.');
    }
  };

  const onSubmit = async (data) => {
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    // Check if course is full based on applicant type
    const currentCapacity = courseCapacity[selectedCourse.id];
    if (currentCapacity) {
      if ((data.applicantType === 'Doctor' || data.applicantType === 'Advanced Nurse Practitioner') && currentCapacity.doctorCount >= 16) {
        toast.error('This course is full for doctors and advanced nurse practitioners. Please select another course or contact the administrator.');
        return;
      }
      if (data.applicantType === 'Nurse Observer' && currentCapacity.nurseCount >= 4) {
        toast.error('This course is full for nurse observers. Please select another course or contact the administrator.');
        return;
      }
    }

    setLoading(true);
    try {
      const candidateData = {
        ...data,
        courseId: selectedCourse.id,
        courseName: selectedCourse.name,
        courseDate: selectedCourse.startDate,
        status: 'Pending Payment',
        createdAt: new Date(),
        eLearningStatus: 'pending',
        courseStatus: 'pending'
      };

      // Add the candidate document and get the document reference
      const docRef = await addDoc(collection(db, 'candidates'), candidateData);
      
      // Add the ID to the candidate data
      const candidateWithId = { ...candidateData, id: docRef.id };

      // Send notification to general office staff
      await notifyGeneralOffice(candidateWithId);

      // Send confirmation email to candidate
      await sendCandidateConfirmationEmail(candidateWithId);

      // Show success message with payment instructions
      toast.success('Application submitted successfully! Check your email for payment instructions.');
      
      // Set data for confirmation popup
      setSubmittedCandidateData(candidateWithId);
      setShowConfirmationPopup(true);
      
      // Reset form
      setStudyLeaveConfirmed(false);
      setSelectedCourse(availableCourses[0]);
      setValue('firstName', '');
      setValue('surname', '');
      setValue('grade', '');
      setValue('specialty', '');
      setValue('placeOfWork', '');
      setValue('homeTelephone', '');
      setValue('mobileTelephone', '');
      setValue('email', '');
      setValue('gmcNumber', '');
      setValue('supervisorName', '');
      setValue('supervisorEmail', '');
      setValue('pidCode', '');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const notifyGeneralOffice = async (candidateData) => {
    try {
      // Create notification for general office
      await addDoc(collection(db, 'notifications'), {
        type: 'new_application',
        candidateId: candidateData.id,
        candidateName: `${candidateData.firstName} ${candidateData.surname}`,
        candidateEmail: candidateData.email,
        courseName: candidateData.courseName,
        courseDate: candidateData.courseDate,
        status: 'unread',
        createdAt: new Date(),
        message: `New application received from ${candidateData.firstName} ${candidateData.surname} for ${candidateData.courseName}`
      });

      // Send email notification to general office
      await sendGeneralOfficeNotification(candidateData);
    } catch (error) {
      console.error('Error notifying general office:', error);
    }
  };

  const sendGeneralOfficeNotification = async (candidateData) => {
    try {
      // Send email notification to general office using HTTP function
      const response = await fetch('https://us-central1-mwl-impact.cloudfunctions.net/notifyNewApplication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ candidateData })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('General office notification sent successfully:', result);
      } else {
        console.error('Failed to send general office notification:', result);
      }
    } catch (error) {
      console.error('Error sending general office notification:', error);
    }
  };

  const sendCandidateConfirmationEmail = async (candidateData) => {
    try {
      // Send confirmation email to candidate using HTTP function
      const response = await fetch('https://us-central1-mwl-impact.cloudfunctions.net/sendApplicationConfirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ candidateData })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Candidate confirmation email sent successfully:', result);
      } else {
        console.error('Failed to send candidate confirmation email:', result);
      }
    } catch (error) {
      console.error('Error sending candidate confirmation email:', error);
    }
  };

  if (!studyLeaveConfirmed) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-nhs-dark-grey mb-4">IMPACT Course Application</h1>
              <p className="text-nhs-grey">Before proceeding with your application, please review the course requirements and confirm your study leave.</p>
            </div>

            {/* Important Course Requirements - MOVED ABOVE STUDY LEAVE */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-nhs-dark-grey mb-4">Important Course Requirements</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-nhs-dark-grey mb-2">PID Code Requirement</h3>
                  <p className="text-nhs-grey mb-3">
                    You will be required to provide your PID Code during the application process. Please ensure you have this information available.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-nhs-dark-grey mb-2">Pre-Course E-Learning Access</h3>
                  <p className="text-nhs-grey mb-3">
                    <strong>Royal College of Physicians and Surgeons of Glasgow (RCPSG)</strong>
                  </p>
                  <p className="text-nhs-grey mb-3">
                    For the purposes of accessing the mandatory pre-course e-learning package, please create a free user profile on the RCPSG website found here:
                  </p>
                  <div className="bg-white border border-green-300 rounded-lg p-3">
                    <a 
                      href="https://community.rcpsg.ac.uk" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-nhs-blue hover:text-nhs-dark-blue font-medium underline"
                    >
                      community.rcpsg.ac.uk
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Study Leave Confirmation - MOVED BELOW COURSE REQUIREMENTS */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-nhs-dark-grey mb-4">Study Leave Confirmation</h2>
              <p className="text-nhs-grey mb-4">
                The IMPACT course requires full attendance on both days. You must confirm that you have secured study leave for the course dates before proceeding with your application.
              </p>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={studyLeaveConfirmed}
                    onChange={(e) => setStudyLeaveConfirmed(e.target.checked)}
                    className="rounded border-gray-300 text-nhs-blue focus:ring-nhs-blue"
                  />
                  <span className="text-nhs-dark-grey">
                    I confirm that I have secured study leave for the IMPACT course dates
                  </span>
                </label>
              </div>
            </div>

            {studyLeaveConfirmed && (
              <div className="text-center">
                <button
                  onClick={() => setStudyLeaveConfirmed(true)}
                  className="btn-primary flex items-center space-x-2 mx-auto"
                >
                  <span>Proceed to Application</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-nhs-dark-grey mb-4">IMPACT Course Application</h1>
            <p className="text-nhs-grey">Complete your application for the IMPACT course</p>
          </div>

          {/* Course Selection */}
          <div className="bg-nhs-blue/5 border border-nhs-blue/20 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-nhs-dark-grey mb-4">Select Course</h2>
            {coursesLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nhs-blue mx-auto"></div>
                <p className="text-nhs-grey mt-2">Loading available courses...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableCourses.map((course) => (
                  <div
                    key={course.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedCourse?.id === course.id
                        ? 'border-nhs-blue bg-nhs-blue/5'
                        : 'border-gray-200 hover:border-nhs-blue/50'
                    }`}
                    onClick={() => setSelectedCourse(course)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-nhs-dark-grey">{course.name}</h3>
                        <div className="flex items-center space-x-6 mt-2 text-sm text-nhs-grey">
                          <div className="flex items-center space-x-1">
                            <Calendar size={16} />
                            <span>{course.startDate} - {course.endDate}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin size={16} />
                            <span>Whiston Hospital</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users size={16} />
                            <span>
                              {courseCapacity[course.id] ? (
                                <>
                                  {courseCapacity[course.id].totalCandidatesCount}/{courseCapacity[course.id].maxCandidates} places
                                  <br />
                                  <span className="text-xs">
                                    Doctors: {courseCapacity[course.id].doctorCount}/16 • Nurses: {courseCapacity[course.id].nurseCount}/4
                                  </span>
                                </>
                              ) : (
                                'Loading capacity...'
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      {selectedCourse?.id === course.id && (
                        <div className="w-6 h-6 bg-nhs-blue rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-nhs-dark-grey mb-4">Personal Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    {...register('firstName', { required: 'First name is required' })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-nhs-blue focus:border-nhs-blue"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    Surname *
                  </label>
                  <input
                    type="text"
                    {...register('surname', { required: 'Surname is required' })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-nhs-blue focus:border-nhs-blue"
                  />
                  {errors.surname && (
                    <p className="text-red-500 text-sm mt-1">{errors.surname.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    Applicant Type *
                  </label>
                  <select
                    {...register('applicantType', { required: 'Applicant type is required' })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-nhs-blue focus:border-nhs-blue"
                  >
                    <option value="">Select Type</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Advanced Nurse Practitioner">Advanced Nurse Practitioner</option>
                    <option value="Nurse Observer">Nurse Observer</option>
                  </select>
                  {errors.applicantType && (
                    <p className="text-red-500 text-sm mt-1">{errors.applicantType.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    Grade *
                  </label>
                  {(applicantType === 'Nurse Observer' || applicantType === 'Advanced Nurse Practitioner') ? (
                    <div>
                      <input
                        type="text"
                        value="Non-Medic"
                        disabled
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                      <input
                        type="hidden"
                        {...register('grade', { required: 'Grade is required' })}
                        value="Non-Medic"
                      />
                    </div>
                  ) : (
                    <select
                      {...register('grade', { required: 'Grade is required' })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-nhs-blue focus:border-nhs-blue"
                    >
                      <option value="">Select Grade</option>
                      <option value="FY1">FY1</option>
                      <option value="FY2">FY2</option>
                      <option value="CT1">CT1</option>
                      <option value="CT2">CT2</option>
                      <option value="ST3">ST3</option>
                      <option value="ST4">ST4</option>
                      <option value="ST5">ST5</option>
                      <option value="ST6">ST6</option>
                      <option value="ST7">ST7</option>
                      <option value="ST8">ST8</option>
                      <option value="Consultant">Consultant</option>
                      <option value="Other">Other</option>
                    </select>
                  )}
                  {errors.grade && (
                    <p className="text-red-500 text-sm mt-1">{errors.grade.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    Specialty *
                  </label>
                  <input
                    type="text"
                    {...register('specialty', { required: 'Specialty is required' })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-nhs-blue focus:border-nhs-blue"
                    placeholder="e.g., Acute Medicine, General Internal Medicine, ACCS, etc."
                  />
                  {errors.specialty && (
                    <p className="text-red-500 text-sm mt-1">{errors.specialty.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    Place of Work *
                  </label>
                  <input
                    type="text"
                    {...register('placeOfWork', { required: 'Place of work is required' })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-nhs-blue focus:border-nhs-blue"
                    placeholder="Hospital/Trust name"
                  />
                  {errors.placeOfWork && (
                    <p className="text-red-500 text-sm mt-1">{errors.placeOfWork.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    Home Telephone Number
                  </label>
                  <input
                    type="tel"
                    {...register('homeTelephone', { 
                      pattern: { 
                        value: /^[0-9+\-\s()]+$/, 
                        message: 'Please enter a valid phone number' 
                      } 
                    })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-nhs-blue focus:border-nhs-blue"
                  />
                  {errors.homeTelephone && (
                    <p className="text-red-500 text-sm mt-1">{errors.homeTelephone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    Mobile Telephone Number *
                  </label>
                  <input
                    type="tel"
                    {...register('mobileTelephone', { 
                      required: 'Mobile number is required',
                      pattern: { 
                        value: /^[0-9+\-\s()]+$/, 
                        message: 'Please enter a valid phone number' 
                      } 
                    })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-nhs-blue focus:border-nhs-blue"
                  />
                  {errors.mobileTelephone && (
                    <p className="text-red-500 text-sm mt-1">{errors.mobileTelephone.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-nhs-blue focus:border-nhs-blue"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Conditional GMC Number - For Doctors and ANPs (disabled for ANPs) */}
                {(applicantType === 'Doctor' || applicantType === 'Advanced Nurse Practitioner') && (
                  <div>
                    <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                      GMC Number {applicantType === 'Advanced Nurse Practitioner' ? '(Not Applicable)' : '*'}
                    </label>
                    <input
                      type="text"
                      {...register('gmcNumber', { 
                        required: applicantType === 'Doctor' ? 'GMC number is required' : false,
                        pattern: {
                          value: /^[0-9]+$/,
                          message: 'Please enter a valid GMC number'
                        }
                      })}
                      disabled={applicantType === 'Advanced Nurse Practitioner'}
                      className={`w-full p-3 border border-gray-300 rounded-md focus:ring-nhs-blue focus:border-nhs-blue ${
                        applicantType === 'Advanced Nurse Practitioner' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                      }`}
                      placeholder={applicantType === 'Advanced Nurse Practitioner' ? 'Not applicable for ANPs' : 'Enter GMC number'}
                    />
                    {errors.gmcNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.gmcNumber.message}</p>
                    )}
                  </div>
                )}

                {/* Conditional PID Code - For Doctors and ANPs */}
                {(applicantType === 'Doctor' || applicantType === 'Advanced Nurse Practitioner') && (
                  <div>
                    <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                      PID Code *
                    </label>
                    <input
                      type="text"
                      {...register('pidCode', { 
                        required: 'PID code is required'
                      })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-nhs-blue focus:border-nhs-blue"
                      placeholder="From RCPSG registration"
                    />
                    {errors.pidCode && (
                      <p className="text-red-500 text-sm mt-1">{errors.pidCode.message}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Educational Supervisor Details */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-nhs-dark-grey mb-4">Educational Supervisor Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    Name of Educational Supervisor *
                  </label>
                  <input
                    type="text"
                    {...register('supervisorName', { required: 'Supervisor name is required' })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-nhs-blue focus:border-nhs-blue"
                  />
                  {errors.supervisorName && (
                    <p className="text-red-500 text-sm mt-1">{errors.supervisorName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    Email Address of Educational Supervisor *
                  </label>
                  <input
                    type="email"
                    {...register('supervisorEmail', { 
                      required: 'Supervisor email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-nhs-blue focus:border-nhs-blue"
                  />
                  {errors.supervisorEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.supervisorEmail.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Instructions - MOVED ABOVE SUBMIT BUTTON */}
            {(applicantType === 'Doctor' || applicantType === 'Advanced Nurse Practitioner') && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-3">Payment Instructions</h3>
                <div className="space-y-3 text-sm text-green-700">
                  <p><strong>Course Cost:</strong> £500 for both days (food will be provided)</p>
                  <p><strong>Payment Method:</strong> Phone payment only</p>
                  <p><strong>Important:</strong> You must contact General Office to make payment</p>
                  <p><strong>Contact General Office:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Phone:</strong> 0151 705 7428</li>
                    <li><strong>Important:</strong> Please quote "IMPACT" when making your payment</li>
                    <li><strong>Hours:</strong> Monday-Friday, 9:00 AM - 5:00 PM</li>
                    <li><strong>Internal staff:</strong> Can alternatively go to general office and pay there</li>
                  </ul>
                  <p className="mt-3"><strong>What to expect:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>You will receive an email confirmation with detailed payment instructions</li>
                    <li>You must proactively contact general office to make payment</li>
                    <li>General office will provide you with a receipt number</li>
                    <li>They will need your name and contact number</li>
                    <li>Once payment is confirmed, you'll receive login credentials</li>
                  </ul>
                </div>
              </div>
            )}
            
            {applicantType === 'Nurse Observer' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Nurse Observer Information</h3>
                <div className="space-y-3 text-sm text-blue-700">
                  <p><strong>No Payment Required:</strong> Nurse observers do not need to pay for the course.</p>
                  <p><strong>What happens next:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Your application will be reviewed by the course administrator</li>
                    <li>You will receive confirmation of your place on the course</li>
                    <li>You will be provided with access to course materials</li>
                    <li>You will receive login credentials for the course platform</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="text-center">
              <button
                type="submit"
                disabled={loading || !selectedCourse}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Popup */}
      {showConfirmationPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-nhs-dark-grey mb-2">Application Submitted Successfully!</h2>
                <p className="text-nhs-grey">Thank you for your application to the IMPACT Course.</p>
              </div>

              <div className="space-y-6">
                {/* Application Summary */}
                <div className="bg-nhs-pale-grey p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-nhs-dark-grey mb-3">Application Summary</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-nhs-grey">Name:</span>
                      <p className="font-medium">{submittedCandidateData?.firstName} {submittedCandidateData?.surname}</p>
                    </div>
                    <div>
                      <span className="text-nhs-grey">Course:</span>
                      <p className="font-medium">{submittedCandidateData?.courseName}</p>
                    </div>
                    <div>
                      <span className="text-nhs-grey">Email:</span>
                      <p className="font-medium">{submittedCandidateData?.email}</p>
                    </div>
                    <div>
                      <span className="text-nhs-grey">Status:</span>
                      <p className="font-medium text-nhs-orange">Pending Payment</p>
                    </div>
                  </div>
                </div>

                {/* Payment Instructions */}
                {(submittedCandidateData?.applicantType === 'Doctor' || submittedCandidateData?.applicantType === 'Advanced Nurse Practitioner') && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-nhs-blue mb-3">Payment Instructions</h3>
                    <div className="space-y-3 text-sm">
                      <p><strong>Important:</strong> You must contact General Office to make payment</p>
                      <p><strong>Payment Contact:</strong> General Office</p>
                      <p><strong>Phone:</strong> 0151 705 7428</p>
                      <p><strong>Important:</strong> Please quote "IMPACT" when making your payment</p>
                      <p><strong>Fee:</strong> £500 for both days (food will be provided)</p>
                      <p><strong>What happens next:</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>You must proactively contact general office to make payment</li>
                        <li>General office will provide you with a receipt number</li>
                        <li>They will need your name and contact number</li>
                        <li>Internal staff can alternatively go to general office and pay there</li>
                      </ul>
                    </div>
                  </div>
                )}
                
                {submittedCandidateData?.applicantType === 'Nurse Observer' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-800 mb-3">Nurse Observer Information</h3>
                    <div className="space-y-3 text-sm text-green-700">
                      <p><strong>No Payment Required:</strong> Nurse observers do not need to pay for the course.</p>
                      <p><strong>What happens next:</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Your application will be reviewed by the course administrator</li>
                        <li>You will receive confirmation of your place on the course</li>
                        <li>You will be provided with access to course materials</li>
                        <li>You will receive login credentials for the course platform</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Important Information */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3">Important Information</h3>
                  <div className="space-y-3 text-sm text-yellow-800">
                    <p><strong>Before Making Payment:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Ensure you have study leave available</li>
                      <li>Check that you meet the course criteria</li>
                      <li>Do not make payment if study leave is not available</li>
                    </ul>
                    <p className="mt-3"><strong>Contact:</strong> If you have any issues, email: <a href="mailto:impact@sthk.nhs.uk" className="underline">impact@sthk.nhs.uk</a></p>
                  </div>
                </div>

                {/* Email Confirmation */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">Email Confirmation</h3>
                  <p className="text-sm text-green-700">
                    A detailed confirmation email with complete payment instructions, course criteria, and refund policy has been sent to <strong>{submittedCandidateData?.email}</strong>. Please check your inbox and spam folder.
                  </p>
                </div>
              </div>

              <div className="flex justify-center mt-8 space-x-4">
                <button
                  onClick={() => {
                    setShowConfirmationPopup(false);
                    setSubmittedCandidateData(null);
                    // Reset form
                    setStudyLeaveConfirmed(false);
                    setSelectedCourse(availableCourses[0]);
                    setValue('firstName', '');
                    setValue('surname', '');
                    setValue('grade', '');
                    setValue('specialty', '');
                    setValue('placeOfWork', '');
                    setValue('homeTelephone', '');
                    setValue('mobileTelephone', '');
                    setValue('email', '');
                    setValue('gmcNumber', '');
                    setValue('supervisorName', '');
                    setValue('supervisorEmail', '');
                    setValue('pidCode', '');
                  }}
                  className="btn-primary"
                >
                  Submit Another Application
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="btn-secondary"
                >
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationForm;
