import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import toast from 'react-hot-toast';
import { User, Camera, Save, Upload, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { currentUser } = useAuth();
  const [candidateData, setCandidateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm();

  useEffect(() => {
    if (currentUser) {
      fetchCandidateData();
    }
  }, [currentUser]);

  const fetchCandidateData = async () => {
    try {
      const q = query(
        collection(db, 'candidates'),
        where('email', '==', currentUser.email)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        const candidate = {
          id: querySnapshot.docs[0].id,
          ...data,
          applicationDate: data.applicationDate?.toDate() || new Date()
        };
        
        setCandidateData(candidate);
        
        // Pre-fill form with existing data
        setValue('firstName', candidate.firstName);
        setValue('surname', candidate.surname);
        setValue('grade', candidate.grade || candidate.position || '');
        setValue('specialty', candidate.specialty || '');
        setValue('placeOfWork', candidate.placeOfWork);
        setValue('homeTelephone', candidate.homeTelephone);
        setValue('mobileTelephone', candidate.mobileTelephone);
        setValue('gmcNumber', candidate.gmcNumber);
        setValue('pidCode', candidate.pidCode);
        setValue('educationalSupervisor', candidate.supervisorName || candidate.educationalSupervisor || '');
        setValue('supervisorEmail', candidate.supervisorEmail);
        
        // Set photo preview if exists
        if (candidate.photoURL) {
          setPhotoPreview(candidate.photoURL);
        }
      }
    } catch (error) {
      console.error('Error fetching candidate data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async () => {
    if (!selectedFile) return null;
    
    setUploading(true);
    try {
      const storageRef = ref(storage, `candidate-photos/${candidateData.id}/${selectedFile.name}`);
      const snapshot = await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      let photoURL = candidateData.photoURL;
      
      // Upload new photo if selected
      if (selectedFile) {
        photoURL = await uploadPhoto();
        if (!photoURL) {
          setSaving(false);
          return;
        }
      }
      
      // Map educationalSupervisor to supervisorName for consistency
      const updateData = {
        ...data,
        supervisorName: data.educationalSupervisor, // Map the form field to the correct database field
        photoURL,
        lastUpdated: new Date()
      };
      
      // Remove the educationalSupervisor field since we're using supervisorName
      delete updateData.educationalSupervisor;
      
      // Update candidate data
      await updateDoc(doc(db, 'candidates', candidateData.id), updateData);
      
      // Update local state
      setCandidateData(prev => ({
        ...prev,
        ...updateData
      }));
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nhs-blue mx-auto"></div>
          <p className="mt-4 text-nhs-grey">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!candidateData) {
    return (
      <div className="min-h-screen bg-nhs-light-grey py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="card">
              <h2 className="text-2xl font-bold text-nhs-dark-grey mb-4">
                Profile Not Found
              </h2>
              <p className="text-nhs-grey">
                We couldn't find your profile. Please ensure you have submitted an application.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nhs-light-grey py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-nhs-dark-grey mb-2">
              Profile Settings
            </h1>
            <p className="text-lg text-nhs-grey">
              Update your personal information and upload your photo
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Photo Upload Section */}
            <div className="card">
              <h2 className="text-2xl font-semibold text-nhs-blue mb-6 flex items-center">
                <Camera className="mr-2" size={24} />
                Profile Photo
              </h2>
              
              <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                {/* Photo Preview */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-nhs-pale-grey border-4 border-nhs-blue">
                    {photoPreview ? (
                      <img 
                        src={photoPreview} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="text-nhs-mid-grey" size={48} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Controls */}
                <div className="flex-1">
                  <p className="text-nhs-grey mb-4">
                    Upload a professional portrait photo for your course materials. 
                    The photo should be clear, well-lit, and suitable for professional use.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                        Photo Requirements
                      </label>
                      <ul className="text-sm text-nhs-grey space-y-1">
                        <li>• Professional portrait style</li>
                        <li>• Clear, well-lit image</li>
                        <li>• Maximum file size: 5MB</li>
                        <li>• Supported formats: JPG, PNG, GIF</li>
                      </ul>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                        Upload Photo
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="block w-full text-sm text-nhs-grey file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-nhs-blue file:text-white hover:file:bg-nhs-dark-blue"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="card">
              <h2 className="text-2xl font-semibold text-nhs-blue mb-6 flex items-center">
                <User className="mr-2" size={24} />
                Personal Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    {...register('firstName', { required: 'First name is required' })}
                    className="input-field"
                  />
                  {errors.firstName && (
                    <p className="text-nhs-red text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    Surname *
                  </label>
                  <input
                    type="text"
                    {...register('surname', { required: 'Surname is required' })}
                    className="input-field"
                  />
                  {errors.surname && (
                    <p className="text-nhs-red text-sm mt-1">{errors.surname.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    Applicant Type
                  </label>
                  <input
                    type="text"
                    value={candidateData?.applicantType || 'N/A'}
                    disabled
                    className="input-field bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-nhs-grey mt-1">This field cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    Grade *
                  </label>
                  <input
                    type="text"
                    {...register('grade', { required: 'Grade is required' })}
                    placeholder="e.g., FY2, CT1, ST3, Consultant"
                    className="input-field"
                  />
                  {errors.grade && (
                    <p className="text-nhs-red text-sm mt-1">{errors.grade.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    Specialty *
                  </label>
                  <input
                    type="text"
                    {...register('specialty', { required: 'Specialty is required' })}
                    placeholder="e.g., Acute Medicine, Emergency Medicine"
                    className="input-field"
                  />
                  {errors.specialty && (
                    <p className="text-nhs-red text-sm mt-1">{errors.specialty.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    Place of Work *
                  </label>
                  <input
                    type="text"
                    {...register('placeOfWork', { required: 'Place of work is required' })}
                    placeholder="e.g., Whiston Hospital, Mersey and West Lancashire NHS Trust"
                    className="input-field"
                  />
                  {errors.placeOfWork && (
                    <p className="text-nhs-red text-sm mt-1">{errors.placeOfWork.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="card">
              <h2 className="text-2xl font-semibold text-nhs-blue mb-6">
                Contact Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    Home Telephone Number *
                  </label>
                  <input
                    type="tel"
                    {...register('homeTelephone', { 
                      required: 'Home telephone number is required',
                      pattern: {
                        value: /^[0-9+\-\s()]+$/,
                        message: 'Please enter a valid telephone number'
                      }
                    })}
                    className="input-field"
                  />
                  {errors.homeTelephone && (
                    <p className="text-nhs-red text-sm mt-1">{errors.homeTelephone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    Mobile Telephone Number *
                  </label>
                  <input
                    type="tel"
                    {...register('mobileTelephone', { 
                      required: 'Mobile telephone number is required',
                      pattern: {
                        value: /^[0-9+\-\s()]+$/,
                        message: 'Please enter a valid mobile number'
                      }
                    })}
                    className="input-field"
                  />
                  {errors.mobileTelephone && (
                    <p className="text-nhs-red text-sm mt-1">{errors.mobileTelephone.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="input-field bg-nhs-pale-grey"
                  />
                  <p className="text-sm text-nhs-grey mt-1">
                    Email address cannot be changed. Contact administrator if needed.
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="card">
              <h2 className="text-2xl font-semibold text-nhs-blue mb-6">
                Professional Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    GMC Number *
                  </label>
                  <input
                    type="text"
                    {...register('gmcNumber', { 
                      required: 'GMC number is required',
                      pattern: {
                        value: /^[0-9]+$/,
                        message: 'GMC number must contain only numbers'
                      }
                    })}
                    className="input-field"
                  />
                  {errors.gmcNumber && (
                    <p className="text-nhs-red text-sm mt-1">{errors.gmcNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    PID Code *
                  </label>
                  <input
                    type="text"
                    {...register('pidCode', { required: 'PID code is required' })}
                    className="input-field"
                  />
                  {errors.pidCode && (
                    <p className="text-nhs-red text-sm mt-1">{errors.pidCode.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    Name of Educational Supervisor *
                  </label>
                  <input
                    type="text"
                    {...register('educationalSupervisor', { required: 'Educational supervisor name is required' })}
                    placeholder="Enter the full name of your educational supervisor"
                    className="input-field"
                  />
                  {errors.educationalSupervisor && (
                    <p className="text-nhs-red text-sm mt-1">{errors.educationalSupervisor.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                    Email Address of Educational Supervisor *
                  </label>
                  <input
                    type="email"
                    {...register('supervisorEmail', { 
                      required: 'Educational supervisor email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    placeholder="supervisor@nhs.net"
                    className="input-field"
                  />
                  {errors.supervisorEmail && (
                    <p className="text-nhs-red text-sm mt-1">{errors.supervisorEmail.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving || uploading}
                className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
