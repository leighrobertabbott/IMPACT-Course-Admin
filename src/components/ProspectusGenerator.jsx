import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import { Download, FileText, Users, MapPin, Calendar, Clock, Award, Building, Phone, Mail, Globe, Car, Train, Bus } from 'lucide-react';

const ProspectusGenerator = ({ selectedCourse, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [faculty, setFaculty] = useState([]);
  const [programme, setProgramme] = useState([]);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (selectedCourse) {
      fetchFaculty();
      fetchProgramme();
      fetchLocation();
    }
  }, [selectedCourse]);

  const fetchFaculty = async () => {
    try {
      const facultyRef = collection(db, 'faculty');
      const q = query(facultyRef, where('deleted', '!=', true));
      const querySnapshot = await getDocs(q);
      const facultyData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFaculty(facultyData);
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const fetchProgramme = async () => {
    try {
      const programmeRef = collection(db, 'programmeSubjects');
      const q = query(programmeRef, where('courseId', '==', selectedCourse.id));
      const querySnapshot = await getDocs(q);
      const programmeData = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(item => !item.deleted);
      
      // Debug: Log the raw programme data
      console.log('Raw programme data:', programmeData);
      console.log('Total programme items:', programmeData.length);
      console.log('Workshop rotation items:', programmeData.filter(item => item.isWorkshopRotation).length);
      console.log('Non-workshop items:', programmeData.filter(item => !item.isWorkshopRotation).length);
      console.log('Selected course ID:', selectedCourse.id);
      console.log('Selected course name:', selectedCourse.name);
      
      // If no programme data exists, show a helpful message
      if (programmeData.length === 0) {
        console.warn('No programme subjects found for this course. Please add programme subjects in Course Management.');
        toast.error('No programme data found. Please add programme subjects in Course Management first.');
      }
      
      // Sort by day and time
      programmeData.sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day;
        return a.startTime.localeCompare(b.startTime);
      });
      setProgramme(programmeData);
    } catch (error) {
      console.error('Error fetching programme:', error);
      toast.error('Failed to fetch programme data');
    }
  };

  const fetchLocation = async () => {
    try {
      const locationsSnapshot = await getDocs(collection(db, 'locations'));
      const locationsData = locationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Use the selected location from the course, or fall back to first location, or create a default one
      let selectedLocation = null;
      
      if (selectedCourse.locationId) {
        selectedLocation = locationsData.find(loc => loc.id === selectedCourse.locationId);
      }
      
      const defaultLocation = selectedLocation || locationsData[0] || {
        name: selectedCourse.venue || 'Course Venue',
        address: {
          street: 'Warrington Road',
          city: 'Prescot',
          postcode: 'L35 5DR',
          country: 'UK'
        },
        contact: {
          phone: '0151 426 1600',
          email: 'impact@sthk.nhs.uk',
          website: ''
        },
        directions: {
          car: 'M62 Junction 6, follow signs for Whiston Hospital',
          train: 'Nearest station is Prescot (1 mile away)',
          bus: 'Routes 10, 10A, 10B, 10C from Liverpool'
        },
        parking: {
          available: true,
          cost: 'Free',
          restrictions: 'None',
          disabledAccess: true
        },
        facilities: {
          wifi: true,
          catering: true,
          audioVisual: true,
          accessibility: true
        },
        photos: []
      };
      
      setLocation(defaultLocation);
    } catch (error) {
      console.error('Error fetching location:', error);
      // Set default location if fetch fails
      setLocation({
        name: selectedCourse.venue || 'Course Venue',
        address: {
          street: 'Warrington Road',
          city: 'Prescot',
          postcode: 'L35 5DR',
          country: 'UK'
        },
        contact: {
          phone: '0151 426 1600',
          email: 'impact@sthk.nhs.uk',
          website: ''
        },
        directions: {
          car: 'M62 Junction 6, follow signs for Whiston Hospital',
          train: 'Nearest station is Prescot (1 mile away)',
          bus: 'Routes 10, 10A, 10B, 10C from Liverpool'
        },
        parking: {
          available: true,
          cost: 'Free',
          restrictions: 'None',
          disabledAccess: true
        },
        facilities: {
          wifi: true,
          catering: true,
          audioVisual: true,
          accessibility: true
        },
        photos: []
      });
    }
  };

  const generateProspectus = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF();
      
      // Set up fonts and colors
      doc.setFont('helvetica');
      
      // Title Page
      generateTitlePage(doc);
      
      // Course Information
      generateCourseInfo(doc);
      
      // Venue and Directions
      generateVenueInfo(doc);
      
      // Faculty Bios
      generateFacultyBios(doc);
      
      // Programme Schedule (only if programme data exists)
      if (programme.length > 0) {
        generateProgrammeSchedule(doc);
      }
      
      // Practical Information
      generatePracticalInfo(doc);
      
      // Save the PDF
      const filename = `IMPACT-Course-Prospectus-${selectedCourse.name.replace(/\s+/g, '-')}.pdf`;
      doc.save(filename);
      
      toast.success('Prospectus generated successfully!');
    } catch (error) {
      console.error('Error generating prospectus:', error);
      toast.error('Failed to generate prospectus');
    } finally {
      setLoading(false);
    }
  };

  const generateTitlePage = (doc) => {
    // Background gradient effect
    doc.setFillColor(0, 123, 255);
    doc.rect(0, 0, 210, 297, 'F');
    
    // NHS logo placeholder
    doc.setFillColor(255, 255, 255);
    doc.circle(105, 80, 20, 'F');
    doc.setTextColor(0, 123, 255);
    doc.setFontSize(24);
    doc.text('NHS', 105, 85, { align: 'center' });
    
    // Main title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('IMPACT COURSE', 105, 140, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(18);
    doc.setFont('helvetica', 'normal');
    doc.text('Ill Medical Patients\' Acute Care and Treatment', 105, 155, { align: 'center' });
    
    // Course details
    doc.setFontSize(16);
    doc.text(selectedCourse.name, 105, 180, { align: 'center' });
    doc.text(selectedCourse.startDate, 105, 195, { align: 'center' });
    doc.text(selectedCourse.venue, 105, 210, { align: 'center' });
    
    // Footer
    doc.setFontSize(12);
    doc.text('Whiston Hospital', 105, 270, { align: 'center' });
    doc.text('NHS Foundation Trust', 105, 280, { align: 'center' });
    
    doc.addPage();
  };

  const generateCourseInfo = (doc) => {
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(240, 248, 255);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Section header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Course Information', 20, 25);
    
    // Course details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const courseInfo = [
      ['Course Name:', selectedCourse.name],
      ['Start Date:', selectedCourse.startDate],
      ['End Date:', selectedCourse.endDate],
      ['Venue:', selectedCourse.venue],
      ['Maximum Capacity:', `${selectedCourse.maxCandidates} candidates`],
      ['Course Fee:', selectedCourse.courseCost || '£500'],
      ['Duration:', '2 Days']
    ];
    
    let yPos = 50;
    courseInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 80, yPos);
      yPos += 12; // Increased spacing between lines
    });
    
    // Course description
    if (selectedCourse.description) {
      yPos += 15; // More space before description
      doc.setFont('helvetica', 'bold');
      doc.text('Course Description:', 20, yPos);
      yPos += 10; // More space after header
      doc.setFont('helvetica', 'normal');
      const descriptionLines = doc.splitTextToSize(selectedCourse.description, 170);
      
      // Check if we have enough space for the description
      const descriptionHeight = descriptionLines.length * 8;
      if (yPos + descriptionHeight > 250) {
        // Not enough space, add a new page
        doc.addPage();
        doc.setFillColor(240, 248, 255);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Course Information (continued)', 20, 25);
        yPos = 50;
      }
      
      descriptionLines.forEach(line => {
        doc.text(line, 20, yPos);
        yPos += 8; // Increased line spacing
      });
    }
    
    doc.addPage();
  };

  const generateVenueInfo = (doc) => {
    if (!location) return;
    
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(240, 248, 255);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Section header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Venue & Directions', 20, 25);
    
    // Venue details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(location.name, 20, 50);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    // Address - with proper line spacing
    const address = [
      location.address.street,
      location.address.city,
      location.address.postcode,
      location.address.country
    ].filter(line => line && line.trim());
    
    let yPos = 65;
    address.forEach(line => {
      doc.text(line, 20, yPos);
      yPos += 8; // Increased spacing
    });
    
    // Contact information
    if (location.contact.phone || location.contact.email || location.contact.website) {
      yPos += 12; // More space before section
      doc.setFont('helvetica', 'bold');
      doc.text('Contact Information:', 20, yPos);
      yPos += 10; // More space after header
      doc.setFont('helvetica', 'normal');
      
      if (location.contact.phone) {
        doc.text(`Phone: ${location.contact.phone}`, 20, yPos);
        yPos += 8;
      }
      if (location.contact.email) {
        doc.text(`Email: ${location.contact.email}`, 20, yPos);
        yPos += 8;
      }
      if (location.contact.website) {
        doc.text(`Website: ${location.contact.website}`, 20, yPos);
        yPos += 8;
      }
    }
    
    // Directions - with proper text wrapping and page break checking
    if (location.directions.car || location.directions.train || location.directions.bus) {
      yPos += 15;
      doc.setFont('helvetica', 'bold');
      doc.text('Getting Here:', 20, yPos);
      yPos += 10;
      doc.setFont('helvetica', 'normal');
      
      const directions = [];
      if (location.directions.car) {
        const carText = `By Car: ${location.directions.car}`;
        const carLines = doc.splitTextToSize(carText, 170);
        directions.push(...carLines);
      }
      if (location.directions.train) {
        const trainText = `By Train: ${location.directions.train}`;
        const trainLines = doc.splitTextToSize(trainText, 170);
        directions.push(...trainLines);
      }
      if (location.directions.bus) {
        const busText = `By Bus: ${location.directions.bus}`;
        const busLines = doc.splitTextToSize(busText, 170);
        directions.push(...busLines);
      }
      if (location.parking && location.parking.available) {
        const parkingInfo = `Parking: ${location.parking.cost || 'Available'}`;
        if (location.parking.restrictions) {
          const parkingText = `${parkingInfo} (${location.parking.restrictions})`;
          const parkingLines = doc.splitTextToSize(parkingText, 170);
          directions.push(...parkingLines);
        } else {
          directions.push(parkingInfo);
        }
      }
      
      // Check if we have enough space for all directions
      const totalDirectionsHeight = directions.length * 8;
      if (yPos + totalDirectionsHeight > 250) {
        // Not enough space, add a new page
        doc.addPage();
        doc.setFillColor(240, 248, 255);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Venue & Directions (continued)', 20, 25);
        yPos = 50;
      }
      
      directions.forEach(direction => {
        doc.text(direction, 20, yPos);
        yPos += 8;
      });
    }
    
    // Facilities - check if we have enough space
    if (location.facilities && (location.facilities.wifi || location.facilities.catering || location.facilities.audioVisual || location.facilities.accessibility)) {
      const facilities = [];
      if (location.facilities.wifi) facilities.push('WiFi available');
      if (location.facilities.catering) facilities.push('Catering provided');
      if (location.facilities.audioVisual) facilities.push('Audio/Visual equipment');
      if (location.facilities.accessibility) facilities.push('Accessibility features');
      
      const facilitiesHeight = 15 + 10 + (facilities.length * 8); // Header + spacing + items
      
      if (yPos + facilitiesHeight > 250) {
        // Not enough space, add a new page
        doc.addPage();
        doc.setFillColor(240, 248, 255);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Venue & Directions (continued)', 20, 25);
        yPos = 50;
      }
      
      yPos += 15;
      doc.setFont('helvetica', 'bold');
      doc.text('Available Facilities:', 20, yPos);
      yPos += 10;
      doc.setFont('helvetica', 'normal');
      
      facilities.forEach(facility => {
        doc.text(`• ${facility}`, 20, yPos);
        yPos += 8;
      });
    }
    
    doc.addPage();
  };

  const generateFacultyBios = (doc) => {
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(240, 248, 255);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Section header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Faculty Biographies', 20, 25);
    
    let yPos = 50;
    let pageCount = 0;
    
    faculty.forEach((member, index) => {
      // Calculate how much space this faculty member will need
      let memberHeight = 8 + 10 + 15; // Name + role + spacing
      if (member.bio) {
        const bioLines = doc.splitTextToSize(member.bio, 170);
        memberHeight += bioLines.length * 8;
      }
      if (member.email) {
        memberHeight += 16; // Email + spacing
      }
      
      // Check if we need a new page
      if (yPos + memberHeight > 250) {
        doc.addPage();
        doc.setFillColor(240, 248, 255);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Faculty Biographies (continued)', 20, 25);
        yPos = 50;
        pageCount++;
      }
      
      // Faculty member header
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(member.name, 20, yPos);
      
      // Role
      yPos += 8; // More space after name
      doc.setFontSize(12);
      doc.setFont('helvetica', 'italic');
      doc.text(member.role, 20, yPos);
      
      // Bio
      yPos += 10; // More space after role
      doc.setFont('helvetica', 'normal');
      if (member.bio) {
        const bioLines = doc.splitTextToSize(member.bio, 170);
        bioLines.forEach(line => {
          doc.text(line, 20, yPos);
          yPos += 8; // Increased line spacing
        });
      }
      
      // Contact info
      if (member.email) {
        yPos += 8; // More space before contact
        doc.text(`Email: ${member.email}`, 20, yPos);
        yPos += 8; // More space after contact
      }
      
      yPos += 15; // More space between faculty members
    });
    
    doc.addPage();
  };

  const generateProgrammeSchedule = (doc) => {
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(240, 248, 255);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Section header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Programme Schedule', 20, 25);
    
    // Group by day
    const days = ['Day 1', 'Day 2'];
    
    days.forEach((day, dayIndex) => {
      const dayProgramme = programme.filter(item => item.day === dayIndex + 1 && !item.isWorkshopRotation);
      
      if (dayProgramme.length > 0) {
        // Day header
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(day, 20, 50 + (dayIndex * 120));
        
        // Create table for this day
        const tableData = dayProgramme.map(item => [
          item.startTime,
          item.endTime,
          item.name,
          item.type,
          item.faculty?.map(f => f.name).join(', ') || 'TBC'
        ]);
        
        autoTable(doc, {
          startY: 60 + (dayIndex * 120),
          head: [['Time', 'Duration', 'Session', 'Type', 'Faculty']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [0, 123, 255] },
          styles: { fontSize: 10 }
        });
      }
    });
    
    doc.addPage();
  };

  const generatePracticalInfo = (doc) => {
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(240, 248, 255);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Section header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Practical Information', 20, 25);
    
    let yPos = 50;
    
    const practicalInfo = [
      ['Registration:', '8:30 AM on Day 1'],
      ['Course Start:', '9:00 AM'],
      ['Lunch:', 'Provided both days'],
      ['Dress Code:', 'Smart casual'],
      ['What to Bring:', 'Pen, notebook, enthusiasm'],
      ['Certificates:', 'Awarded upon successful completion'],
      ['CPD Points:', 'Available for this course']
    ];
    
    // Add location-specific information
    if (location) {
      if (location.facilities.wifi) {
        practicalInfo.push(['WiFi:', 'Available on site']);
      }
      if (location.facilities.catering) {
        practicalInfo.push(['Refreshments:', 'Tea and coffee provided']);
      }
      if (location.parking.available) {
        practicalInfo.push(['Parking:', location.parking.cost || 'Available on site']);
      }
    }
    
    practicalInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 80, yPos);
      yPos += 8;
    });
    
    // Emergency contacts
    if (location && location.contact.phone) {
      yPos += 15;
      doc.setFont('helvetica', 'bold');
      doc.text('Emergency Contacts:', 20, yPos);
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      doc.text(`Course Coordinator: ${location.contact.phone}`, 20, yPos);
      yPos += 6;
      doc.text(`Hospital Switchboard: ${location.contact.phone}`, 20, yPos);
    }
    
    // Footer
    yPos += 20;
    doc.setFont('helvetica', 'italic');
    doc.text('We look forward to welcoming you to the IMPACT Course!', 20, yPos);
  };

  if (!selectedCourse) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-nhs-dark-grey mb-4">Generate Prospectus</h3>
          <p className="text-nhs-grey mb-4">Please select a course first to generate the prospectus.</p>
          <button
            onClick={onClose}
            className="w-full bg-nhs-blue text-white py-2 px-4 rounded-lg hover:bg-nhs-dark-blue"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-nhs-dark-grey">Generate Course Prospectus</h3>
          <button
            onClick={onClose}
            className="text-nhs-grey hover:text-nhs-dark-grey"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Course Information Preview */}
          <div className="bg-nhs-light-grey p-4 rounded-lg">
            <h4 className="font-semibold text-nhs-dark-grey mb-2">Course Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Name:</span> {selectedCourse.name}
              </div>
              <div>
                <span className="font-medium">Date:</span> {selectedCourse.startDate}
              </div>
              <div>
                <span className="font-medium">Venue:</span> {selectedCourse.venue}
              </div>
              <div>
                <span className="font-medium">Capacity:</span> {selectedCourse.maxCandidates} candidates
              </div>
            </div>
          </div>
          
          {/* Prospectus Contents */}
          <div className="bg-white border border-nhs-pale-grey rounded-lg p-4">
            <h4 className="font-semibold text-nhs-dark-grey mb-3">Prospectus Contents</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <FileText size={16} className="text-nhs-blue" />
                <span>Professional title page with NHS branding</span>
              </div>
              <div className="flex items-center space-x-2">
                <Building size={16} className="text-nhs-blue" />
                <span>Course information and objectives</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-nhs-blue" />
                <span>Venue details and directions</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users size={16} className="text-nhs-blue" />
                <span>Faculty biographies and credentials</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-nhs-blue" />
                <span>Detailed programme schedule</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-nhs-blue" />
                <span>Practical information and logistics</span>
              </div>
            </div>
          </div>
          
          {/* Faculty Count */}
          <div className="bg-nhs-light-grey p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium text-nhs-dark-grey">Faculty Members:</span>
              <span className="text-nhs-blue font-semibold">{faculty.length}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="font-medium text-nhs-dark-grey">Programme Sessions:</span>
              <span className="text-nhs-blue font-semibold">
                {programme.length > 0 ? programme.filter(item => !item.isWorkshopRotation).length : 0}
              </span>
            </div>
            {programme.length === 0 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-yellow-800">
                    No programme data available. The prospectus will be generated without a detailed schedule.
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Generate Button */}
          <div className="flex space-x-3">
            <button
              onClick={generateProspectus}
              disabled={loading}
              className="flex-1 bg-nhs-blue text-white py-3 px-4 rounded-lg hover:bg-nhs-dark-blue disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download size={20} />
                  <span>Generate Prospectus</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-nhs-pale-grey text-nhs-dark-grey rounded-lg hover:bg-nhs-light-grey"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProspectusGenerator;
