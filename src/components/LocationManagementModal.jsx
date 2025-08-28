import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import toast from 'react-hot-toast';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Car, 
  Train, 
  Bus, 
  Wifi, 
  Coffee, 
  Monitor, 
  Accessibility,
  Camera,
  Upload,
  X,
  Save,
  Plus,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react';

const LocationManagementModal = ({ onClose, selectedLocation = null }) => {
  const [loading, setLoading] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [locationForm, setLocationForm] = useState({
    name: '',
    address: {
      street: '',
      city: '',
      postcode: '',
      country: 'UK'
    },
    coordinates: {
      lat: '',
      lng: ''
    },
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    directions: {
      car: '',
      train: '',
      bus: ''
    },
    parking: {
      available: true,
      cost: '',
      restrictions: '',
      disabledAccess: true
    },
    facilities: {
      wifi: true,
      catering: true,
      audioVisual: true,
      accessibility: true
    },
    photos: [],
    description: ''
  });

  useEffect(() => {
    if (selectedLocation) {
      setLocationForm(selectedLocation);
    }
  }, [selectedLocation]);

  const handleInputChange = (section, field, value) => {
    setLocationForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section, subsection, field, value) => {
    setLocationForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploadingPhotos(true);
    try {
      const uploadedPhotos = [];
      
      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum size is 5MB`);
          continue;
        }

        const fileName = `location-photos/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, fileName);
        
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        
        uploadedPhotos.push({
          url: downloadURL,
          name: file.name,
          storagePath: fileName
        });
      }

      setLocationForm(prev => ({
        ...prev,
        photos: [...prev.photos, ...uploadedPhotos]
      }));

      toast.success(`${uploadedPhotos.length} photo(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('Failed to upload photos');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const removePhoto = async (photoIndex) => {
    try {
      const photo = locationForm.photos[photoIndex];
      
      // Delete from storage
      if (photo.storagePath) {
        const storageRef = ref(storage, photo.storagePath);
        await deleteObject(storageRef);
      }

      // Remove from form
      setLocationForm(prev => ({
        ...prev,
        photos: prev.photos.filter((_, index) => index !== photoIndex)
      }));

      toast.success('Photo removed successfully');
    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error('Failed to remove photo');
    }
  };

  const saveLocation = async () => {
    if (!locationForm.name.trim()) {
      toast.error('Please enter a location name');
      return;
    }

    setLoading(true);
    try {
      const locationData = {
        ...locationForm,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (selectedLocation) {
        // Update existing location
        await updateDoc(doc(db, 'locations', selectedLocation.id), locationData);
        toast.success('Location updated successfully');
      } else {
        // Create new location
        await addDoc(collection(db, 'locations'), locationData);
        toast.success('Location created successfully');
      }

      onClose();
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error('Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  const deleteLocation = async () => {
    if (!selectedLocation) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this location? This action cannot be undone.'
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      // Delete all photos from storage
      for (const photo of locationForm.photos) {
        if (photo.storagePath) {
          const storageRef = ref(storage, photo.storagePath);
          await deleteObject(storageRef);
        }
      }

      // Delete location document
      await deleteDoc(doc(db, 'locations', selectedLocation.id));
      toast.success('Location deleted successfully');
      onClose();
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-nhs-dark-grey">
            {selectedLocation ? 'Edit Location' : 'Add New Location'}
          </h3>
          <button
            onClick={onClose}
            className="text-nhs-grey hover:text-nhs-dark-grey"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-nhs-light-grey p-4 rounded-lg">
            <h4 className="font-semibold text-nhs-dark-grey mb-4 flex items-center">
              <MapPin size={20} className="mr-2" />
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-1">
                  Location Name *
                </label>
                <input
                  type="text"
                  value={locationForm.name}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., Whiston Hospital"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-1">
                  Description
                </label>
                <textarea
                  value={locationForm.description}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field"
                  rows={3}
                  placeholder="Brief description of the venue..."
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-nhs-light-grey p-4 rounded-lg">
            <h4 className="font-semibold text-nhs-dark-grey mb-4">Address Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={locationForm.address.street}
                  onChange={(e) => handleInputChange('address', 'street', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Warrington Road"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={locationForm.address.city}
                  onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Prescot"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-1">
                  Postcode
                </label>
                <input
                  type="text"
                  value={locationForm.address.postcode}
                  onChange={(e) => handleInputChange('address', 'postcode', e.target.value)}
                  className="input-field"
                  placeholder="e.g., L35 5DR"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={locationForm.address.country}
                  onChange={(e) => handleInputChange('address', 'country', e.target.value)}
                  className="input-field"
                  placeholder="e.g., UK"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-nhs-light-grey p-4 rounded-lg">
            <h4 className="font-semibold text-nhs-dark-grey mb-4 flex items-center">
              <Phone size={20} className="mr-2" />
              Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={locationForm.contact.phone}
                  onChange={(e) => handleInputChange('contact', 'phone', e.target.value)}
                  className="input-field"
                  placeholder="e.g., 0151 426 1600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={locationForm.contact.email}
                  onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
                  className="input-field"
                  placeholder="e.g., impact@sthk.nhs.uk"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={locationForm.contact.website}
                  onChange={(e) => handleInputChange('contact', 'website', e.target.value)}
                  className="input-field"
                  placeholder="e.g., https://www.sthk.nhs.uk"
                />
              </div>
            </div>
          </div>

          {/* Directions */}
          <div className="bg-nhs-light-grey p-4 rounded-lg">
            <h4 className="font-semibold text-nhs-dark-grey mb-4">Getting Here</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-1 flex items-center">
                  <Car size={16} className="mr-2" />
                  By Car
                </label>
                <textarea
                  value={locationForm.directions.car}
                  onChange={(e) => handleInputChange('directions', 'car', e.target.value)}
                  className="input-field"
                  rows={2}
                  placeholder="e.g., M62 Junction 6, follow signs for Whiston Hospital"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-1 flex items-center">
                  <Train size={16} className="mr-2" />
                  By Train
                </label>
                <textarea
                  value={locationForm.directions.train}
                  onChange={(e) => handleInputChange('directions', 'train', e.target.value)}
                  className="input-field"
                  rows={2}
                  placeholder="e.g., Nearest station is Prescot (1 mile away)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-1 flex items-center">
                  <Bus size={16} className="mr-2" />
                  By Bus
                </label>
                <textarea
                  value={locationForm.directions.bus}
                  onChange={(e) => handleInputChange('directions', 'bus', e.target.value)}
                  className="input-field"
                  rows={2}
                  placeholder="e.g., Routes 10, 10A, 10B, 10C from Liverpool"
                />
              </div>
            </div>
          </div>

          {/* Parking Information */}
          <div className="bg-nhs-light-grey p-4 rounded-lg">
            <h4 className="font-semibold text-nhs-dark-grey mb-4">Parking Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="parkingAvailable"
                  checked={locationForm.parking.available}
                  onChange={(e) => handleInputChange('parking', 'available', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="parkingAvailable" className="text-sm font-medium text-nhs-dark-grey">
                  Parking Available
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="disabledAccess"
                  checked={locationForm.parking.disabledAccess}
                  onChange={(e) => handleInputChange('parking', 'disabledAccess', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="disabledAccess" className="text-sm font-medium text-nhs-dark-grey">
                  Disabled Access
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-1">
                  Parking Cost
                </label>
                <input
                  type="text"
                  value={locationForm.parking.cost}
                  onChange={(e) => handleInputChange('parking', 'cost', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Free"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nhs-dark-grey mb-1">
                  Restrictions
                </label>
                <input
                  type="text"
                  value={locationForm.parking.restrictions}
                  onChange={(e) => handleInputChange('parking', 'restrictions', e.target.value)}
                  className="input-field"
                  placeholder="e.g., None"
                />
              </div>
            </div>
          </div>

          {/* Facilities */}
          <div className="bg-nhs-light-grey p-4 rounded-lg">
            <h4 className="font-semibold text-nhs-dark-grey mb-4">Available Facilities</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="wifi"
                  checked={locationForm.facilities.wifi}
                  onChange={(e) => handleInputChange('facilities', 'wifi', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="wifi" className="text-sm font-medium text-nhs-dark-grey flex items-center">
                  <Wifi size={16} className="mr-1" />
                  WiFi
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="catering"
                  checked={locationForm.facilities.catering}
                  onChange={(e) => handleInputChange('facilities', 'catering', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="catering" className="text-sm font-medium text-nhs-dark-grey flex items-center">
                  <Coffee size={16} className="mr-1" />
                  Catering
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="audioVisual"
                  checked={locationForm.facilities.audioVisual}
                  onChange={(e) => handleInputChange('facilities', 'audioVisual', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="audioVisual" className="text-sm font-medium text-nhs-dark-grey flex items-center">
                  <Monitor size={16} className="mr-1" />
                  Audio/Visual
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="accessibility"
                  checked={locationForm.facilities.accessibility}
                  onChange={(e) => handleInputChange('facilities', 'accessibility', e.target.checked)}
                  className="rounded"
                />
                                 <label htmlFor="accessibility" className="text-sm font-medium text-nhs-dark-grey flex items-center">
                   <Accessibility size={16} className="mr-1" />
                   Accessibility
                 </label>
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="bg-nhs-light-grey p-4 rounded-lg">
            <h4 className="font-semibold text-nhs-dark-grey mb-4 flex items-center">
              <Camera size={20} className="mr-2" />
              Venue Photos
            </h4>
            
            {/* Photo Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                Upload Photos (Max 5MB each)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photoUpload"
                  disabled={uploadingPhotos}
                />
                <label
                  htmlFor="photoUpload"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                    uploadingPhotos
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-nhs-blue text-white hover:bg-nhs-dark-blue'
                  }`}
                >
                  <Upload size={16} />
                  <span>{uploadingPhotos ? 'Uploading...' : 'Choose Photos'}</span>
                </label>
              </div>
            </div>

            {/* Photo Gallery */}
            {locationForm.photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {locationForm.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo.url}
                      alt={`Venue photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="flex space-x-3">
              {selectedLocation && (
                <button
                  onClick={deleteLocation}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Trash2 size={16} />
                  <span>Delete Location</span>
                </button>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveLocation}
                disabled={loading}
                className="px-4 py-2 bg-nhs-blue text-white rounded-lg hover:bg-nhs-dark-blue disabled:opacity-50 flex items-center space-x-2"
              >
                <Save size={16} />
                <span>{loading ? 'Saving...' : 'Save Location'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationManagementModal;
