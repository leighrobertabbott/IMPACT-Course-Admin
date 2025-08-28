import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import toast from 'react-hot-toast';
import { User, Camera, Upload, AlertCircle, CheckCircle } from 'lucide-react';

const PhotoRequirement = ({ children }) => {
  const { currentUser, userProfile } = useAuth();
  const [candidateData, setCandidateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (currentUser && userProfile?.role === 'candidate') {
      fetchCandidateData();
    } else {
      setLoading(false);
    }
  }, [currentUser, userProfile]);

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
          ...data
        };
        
        setCandidateData(candidate);
        
        // Set photo preview if exists
        if (candidate.photoURL) {
          setPhotoPreview(candidate.photoURL);
        }
      }
    } catch (error) {
      console.error('Error fetching candidate data:', error);
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

  const handlePhotoUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a photo first');
      return;
    }

    const photoURL = await uploadPhoto();
    if (photoURL) {
      // Update candidate data
      await updateDoc(doc(db, 'candidates', candidateData.id), {
        photoURL,
        lastUpdated: new Date()
      });
      
      // Update local state
      setCandidateData(prev => ({
        ...prev,
        photoURL
      }));
      
      toast.success('Photo uploaded successfully!');
    }
  };

  // If not a candidate or still loading, render children normally
  if (!userProfile || userProfile.role !== 'candidate' || loading) {
    return children;
  }

  // If candidate has a photo, render children normally
  if (candidateData?.photoURL) {
    return children;
  }

  // If candidate doesn't have a photo, show photo upload requirement
  return (
    <div className="min-h-screen bg-nhs-light-grey py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-nhs-orange rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-white" size={40} />
              </div>
              <h1 className="text-3xl font-bold text-nhs-dark-grey mb-2">
                Photo Upload Required
              </h1>
              <p className="text-lg text-nhs-grey">
                You must upload a professional photo before accessing your account
              </p>
            </div>

            <div className="space-y-6">
              {/* Photo Preview */}
              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-nhs-pale-grey border-4 border-nhs-blue">
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="Profile Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="text-nhs-mid-grey" size={48} />
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Instructions */}
              <div className="bg-nhs-pale-grey p-4 rounded-lg">
                <h3 className="font-semibold text-nhs-dark-grey mb-2 flex items-center">
                  <Camera className="mr-2" size={20} />
                  Photo Requirements
                </h3>
                <ul className="text-sm text-nhs-grey space-y-1">
                  <li>• Professional portrait style</li>
                  <li>• Clear, well-lit image</li>
                  <li>• Maximum file size: 5MB</li>
                  <li>• Supported formats: JPG, PNG, GIF</li>
                </ul>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                  Select Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-nhs-grey file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-nhs-blue file:text-white hover:file:bg-nhs-dark-blue"
                />
              </div>

              {/* Upload Button */}
              <div className="flex justify-center">
                <button
                  onClick={handlePhotoUpload}
                  disabled={!selectedFile || uploading}
                  className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      <span>Upload Photo</span>
                    </>
                  )}
                </button>
              </div>

              {/* Information */}
              <div className="text-center">
                <p className="text-sm text-nhs-grey">
                  Once you upload your photo, you'll have full access to your account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoRequirement;
