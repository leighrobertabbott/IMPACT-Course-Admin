import React, { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, Mail, Phone, User, Award } from 'lucide-react';
import { collection, addDoc, updateDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import { db, auth } from '../firebase/config';
import { cloudFunctions } from '../utils/cloudFunctions';
import toast from 'react-hot-toast';

const FacultyManagementModal = ({ 
  isOpen, 
  onClose, 
  faculty, 
  onFacultyUpdate,
  mode = 'add' // 'add' or 'edit'
}) => {
  const [facultyForm, setFacultyForm] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    specialty: ''
  });
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFacultyForm({ name: '', role: '', email: '', phone: '', specialty: '' });
      setEmailExists(false);
      setCheckingEmail(false);
    }
  }, [isOpen]);

  const checkEmailExists = async (email) => {
    if (!email || email.length < 3) return;
    
    setCheckingEmail(true);
    try {
      // Check if email exists in faculty collection
      const existingFaculty = faculty.find(f => f.email === email);
      if (existingFaculty) {
        setEmailExists(true);
        setCheckingEmail(false);
        return;
      }

      // Check if user exists in Firebase Auth
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      setEmailExists(signInMethods.length > 0);
    } catch (error) {
      console.error('Error checking email:', error);
      setEmailExists(false);
    } finally {
      setCheckingEmail(false);
    }
  };

  const addFacultyMember = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      if (!facultyForm.name || !facultyForm.email || !facultyForm.role) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Check if faculty member already exists in faculty collection
      const existingFaculty = faculty.find(f => f.email === facultyForm.email);
      if (existingFaculty) {
        toast.error('Faculty member with this email already exists');
        return;
      }

      // Check if user already exists in Firebase Auth
      let existingUser = null;
      try {
        const signInMethods = await fetchSignInMethodsForEmail(auth, facultyForm.email);
        if (signInMethods.length > 0) {
          existingUser = true;
        }
      } catch (authError) {
        console.error('Error checking existing user:', authError);
        // Continue with the process even if we can't check
      }

      // Create faculty profile
      const facultyDoc = await addDoc(collection(db, 'faculty'), {
        ...facultyForm,
        createdAt: new Date(),
        status: 'active'
      });

      if (existingUser) {
        // User exists but wasn't in faculty collection - just update their role
        try {
          // Find the existing user document
          const userQuery = query(collection(db, 'users'), where('email', '==', facultyForm.email));
          const userSnapshot = await getDocs(userQuery);
          
          if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            await updateDoc(doc(db, 'users', userDoc.id), {
              role: 'faculty',
              facultyId: facultyDoc.id,
              updatedAt: new Date()
            });
            
            toast.success(`Faculty member added successfully! ${facultyForm.email} already had a user account and has been updated.`);
          } else {
            toast.success(`Faculty member added successfully! ${facultyForm.email} already had a user account but no profile was found.`);
          }
        } catch (updateError) {
          console.error('Error updating existing user:', updateError);
          toast.success(`Faculty member added successfully! ${facultyForm.email} already had a user account.`);
        }
      } else {
        // Create new user account for faculty member
        try {
          // Generate a temporary password for faculty member
          const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
          
          const userCredential = await createUserWithEmailAndPassword(
            auth, 
            facultyForm.email, 
            tempPassword
          );

          // Create user profile
          await addDoc(collection(db, 'users'), {
            uid: userCredential.user.uid,
            email: facultyForm.email,
            name: facultyForm.name,
            role: 'faculty',
            facultyId: facultyDoc.id,
            createdAt: new Date(),
            status: 'active'
          });

          toast.success(`Faculty member added successfully! Login credentials sent to ${facultyForm.email}`);
          
          // Send email with login credentials via Cloud Function
          try {
            const { sendFacultyCredentials } = cloudFunctions;
            await sendFacultyCredentials({
              email: facultyForm.email,
              name: facultyForm.name,
              password: tempPassword
            });
          } catch (emailError) {
            console.error('Error sending faculty credentials email:', emailError);
            // Still show success but note that email wasn't sent
            toast.success(`Faculty member added successfully! Please manually send login credentials to ${facultyForm.email}`);
          }
          
        } catch (authError) {
          console.error('Error creating user account:', authError);
          // If user creation fails, still create the faculty profile but notify admin
          toast.success('Faculty member added, but user account creation failed. Please contact the faculty member directly.');
        }
      }

      onClose();
      if (onFacultyUpdate) {
        onFacultyUpdate();
      }
    } catch (error) {
      console.error('Error adding faculty member:', error);
      toast.error('Failed to add faculty member');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <UserPlus className="h-6 w-6 text-nhs-blue" />
            <h3 className="text-lg font-semibold text-nhs-dark-grey">
              {mode === 'edit' ? 'Edit Faculty Member' : 'Add Faculty Member'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Name *
            </label>
            <input
              type="text"
              value={facultyForm.name}
              onChange={(e) => setFacultyForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-nhs-blue focus:border-transparent"
              placeholder="Full name"
              disabled={isSubmitting}
            />
          </div>

          {/* Role Field */}
          <div>
            <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
              <Award className="inline h-4 w-4 mr-1" />
              Role *
            </label>
            <input
              type="text"
              value={facultyForm.role}
              onChange={(e) => setFacultyForm(prev => ({ ...prev, role: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-nhs-blue focus:border-transparent"
              placeholder="e.g., Course Director, Faculty Member"
              disabled={isSubmitting}
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
              <Mail className="inline h-4 w-4 mr-1" />
              Email *
            </label>
            <div className="relative">
              <input
                type="email"
                value={facultyForm.email}
                onChange={(e) => {
                  setFacultyForm(prev => ({ ...prev, email: e.target.value }));
                  // Debounce the email check
                  setTimeout(() => checkEmailExists(e.target.value), 500);
                }}
                className={`w-full p-3 border rounded-md pr-10 focus:ring-2 focus:ring-nhs-blue focus:border-transparent ${
                  emailExists ? 'border-red-300 bg-red-50' : 
                  checkingEmail ? 'border-yellow-300 bg-yellow-50' :
                  'border-gray-300'
                }`}
                placeholder="email@example.com"
                disabled={isSubmitting}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {checkingEmail && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-nhs-blue"></div>
                )}
                {emailExists && !checkingEmail && (
                  <div className="text-red-500" title="Email already exists in system">
                    ⚠️
                  </div>
                )}
                {!emailExists && !checkingEmail && facultyForm.email.length > 3 && (
                  <div className="text-green-500" title="Email available">
                    ✓
                  </div>
                )}
              </div>
            </div>
            {emailExists && (
              <p className="text-sm text-red-600 mt-1">
                This email already exists in the system. The user will be updated to faculty role.
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
              <Phone className="inline h-4 w-4 mr-1" />
              Phone
            </label>
            <input
              type="tel"
              value={facultyForm.phone}
              onChange={(e) => setFacultyForm(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-nhs-blue focus:border-transparent"
              placeholder="Phone number"
              disabled={isSubmitting}
            />
          </div>

          {/* Specialty Field */}
          <div>
            <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
              <Award className="inline h-4 w-4 mr-1" />
              Specialty
            </label>
            <input
              type="text"
              value={facultyForm.specialty}
              onChange={(e) => setFacultyForm(prev => ({ ...prev, specialty: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-nhs-blue focus:border-transparent"
              placeholder="e.g., Acute Medicine, Anaesthetics"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={addFacultyMember}
            disabled={isSubmitting}
            className="flex-1 bg-nhs-blue text-white px-4 py-3 rounded-md hover:bg-nhs-dark-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Add Faculty Member</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="bg-gray-300 text-gray-700 px-4 py-3 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacultyManagementModal;
