import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';
import { Download, FileText, Users, MapPin, Calendar, Clock, Award, Building, Phone, Mail, Globe, Car, Train, Bus } from 'lucide-react';

const ProgrammeGenerator = ({ selectedCourse, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [faculty, setFaculty] = useState([]);
  const [programme, setProgramme] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (selectedCourse) {
      fetchFaculty();
      fetchProgramme();
      fetchCandidates();
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
      console.log('ProgrammeGenerator - Raw programme data:', programmeData);
      console.log('ProgrammeGenerator - Total programme items:', programmeData.length);
      console.log('ProgrammeGenerator - Selected course ID:', selectedCourse.id);
      console.log('ProgrammeGenerator - Selected course name:', selectedCourse.name);
      
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

  const fetchCandidates = async () => {
    try {
      const candidatesRef = collection(db, 'candidates');
      const q = query(
        candidatesRef, 
        where('courseId', '==', selectedCourse.id),
        where('status', 'in', ['Live Candidate', 'Paid in Full'])
      );
      const querySnapshot = await getDocs(q);
      const candidatesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCandidates(candidatesData);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const fetchLocation = async () => {
    try {
      const locationsSnapshot = await getDocs(collection(db, 'locations'));
      const locationsData = locationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
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
        }
      };
      
      setLocation(defaultLocation);
    } catch (error) {
      console.error('Error fetching location:', error);
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
        }
      });
    }
  };

  const generateProgrammeHTML = () => {
    if (!selectedCourse || !location) return '';

    // Helper function to get faculty initials
    const getInitials = (name) => {
      if (!name) return '';
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    // Helper function to format time
    const formatTime = (time) => {
      if (!time) return '';
      return time.substring(0, 5); // Remove seconds if present
    };

    // Helper function to get faculty names for a subject
    const getFacultyNames = (subject) => {
      if (!subject.assignedFaculty || subject.assignedFaculty.length === 0) {
        return 'TBD';
      }
      return subject.assignedFaculty.map(f => f.name).join(', ');
    };

    // Helper function to get room for a subject
    const getRoom = (subject) => {
      if (subject.stationRooms && subject.stationRooms.length > 0) {
        return subject.stationRooms.join(', ');
      }
      return 'TBD';
    };

    // Group candidates by assigned group
    const groupCandidates = () => {
      const groups = { A: [], B: [], C: [], D: [] };
      candidates.forEach(candidate => {
        if (candidate.assignedGroup && groups[candidate.assignedGroup]) {
          groups[candidate.assignedGroup].push(candidate);
        }
      });
      return groups;
    };

    const candidateGroups = groupCandidates();

    // Get day-specific programme items
    const getDayProgramme = (day) => {
      // Exclude workshop rotations from main schedule - they go in separate section
      return programme.filter(item => item.day === day && !item.isWorkshopRotation);
    };

    const getWorkshopRotations = (day) => {
      return programme.filter(item => item.day === day && item.isWorkshopRotation);
    };

    const getAssessmentStations = (day) => {
      return programme.filter(item => item.day === day && item.type === 'assessment');
    };

    const getPracticalSessions = (day) => {
      return programme.filter(item => item.day === day && item.type === 'practical-session');
    };

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

    // Generate workshop rotation schedule with actual times
    const generateWorkshopSchedule = (workshops) => {
      if (!workshops || workshops.length === 0) return '';
      
      let html = '';
      workshops.forEach((workshop, index) => {
        html += `
          <div class="tile">
            <h5>${workshop.name}</h5>
            <table>
              <tbody>`;
        
        if (workshop.rotationSchedule) {
          workshop.rotationSchedule.forEach((schedule, slotIndex) => {
            // Calculate actual time instead of generic slot
            const timeSlot = calculateTimeSlot(workshop.startTime, slotIndex, workshop.workshopDuration || 40);
            const groups = schedule.groups ? schedule.groups.join(', ') : schedule.group;
            html += `
                <tr><td>${timeSlot}</td><td>Group ${groups}</td></tr>`;
          });
        }
        
        html += `
              </tbody>
            </table>
          </div>`;
      });
      
      return html;
    };

    // Generate assessment station schedule with actual times
    const generateAssessmentSchedule = (assessments) => {
      if (!assessments || assessments.length === 0) return '';
      
      let html = '';
      assessments.forEach((assessment, index) => {
        html += `
          <div class="tile">
            <h5>${assessment.name}</h5>
            <table>
              <tbody>`;
        
        if (assessment.timeSlots) {
          assessment.timeSlots.forEach((slot, slotIndex) => {
            // Use actual time from the time slot data
            const timeSlot = slot.startTime || calculateTimeSlot(assessment.startTime, slotIndex, assessment.timeSlotDuration || 15);
            const groups = slot.groups ? slot.groups.join(', ') : 'TBD';
            html += `
                <tr><td>${timeSlot}</td><td>Group ${groups}</td></tr>`;
          });
        }
        
        html += `
              </tbody>
            </table>
          </div>`;
      });
      
      return html;
    };

    // Generate candidate table rows
    const generateCandidateRows = (groupLetter, candidates) => {
      let html = '';
      const startNumber = (groupLetter.charCodeAt(0) - 65) * 4 + 1; // A=1, B=5, C=9, D=13
      
      for (let i = 0; i < 4; i++) {
        const candidate = candidates[i] || {};
        const candidateNumber = startNumber + i;
        html += `
              <tr><td>${candidateNumber}</td><td>${candidate.firstName} ${candidate.surname}</td><td>${candidate.grade || 'TBD'}</td><td>${candidate.specialty || 'TBD'}</td><td>${candidate.supervisorName || 'TBD'}</td></tr>`;
      }
      
      return html;
    };

    // Generate faculty table rows
    const generateFacultyRows = () => {
      let html = '';
      for (let i = 0; i < 8; i++) {
        const facultyMember = faculty[i] || {};
        html += `
            <tr><td>${facultyMember.name || 'TBD'} (${getInitials(facultyMember.name)})</td><td>${facultyMember.role || 'Faculty'}</td><td>${facultyMember.specialty || 'NHS'}</td></tr>`;
      }
      return html;
    };

    // Generate day schedule table
    const generateDaySchedule = (day) => {
      const dayProgramme = getDayProgramme(day);
      let html = '';
      
      dayProgramme.forEach((session, index) => {
        // Regular session - no workshop rotation expansion
        html += `
            <tr><td>${formatTime(session.startTime)}</td><td>${session.name}</td><td>${getFacultyNames(session)}</td><td>${getRoom(session)}</td></tr>`;
      });
      
      return html;
    };

    const template = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${selectedCourse.name} — Programme</title>
  <style>
    :root{
      /* Colourful but print-friendly accents */
      --ink:#0f172a;             /* text */
      --muted:#4b5563;           /* secondary text */
      --paper:#ffffff;           /* page */
      --rule:#e5e7eb;            /* light rule */
      --accent-1:#ef4444;        /* red */
      --accent-2:#f59e0b;        /* amber */
      --accent-3:#22c55e;        /* green */
      --accent-4:#06b6d4;        /* cyan */
      --accent-5:#8b5cf6;        /* purple */
      --accent-6:#e879f9;        /* fuchsia */
      --accent-7:#38bdf8;        /* sky */
      --accent-8:#f97316;        /* orange */
      --heading: 700;
      --radius: 8px;
    }
    *{box-sizing:border-box}
    html,body{height:100%}
    body{margin:0;background:#f8fafc;color:var(--ink);font:14px/1.4 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial}

    /* A4 page frame to mimic original PDF */
    .page{width:210mm; min-height:297mm; margin:16px auto; background:var(--paper); padding:18mm 16mm; box-shadow:0 4px 30px rgba(0,0,0,.08); border:1px solid #f1f5f9}

    /* Header band exactly across width */
    .header{
      display:grid; grid-template-columns: 1fr; gap:8px; margin-bottom:12mm;
      border:1px solid var(--rule); border-radius:var(--radius); overflow:hidden
    }
    .header-bar{padding:10px 12px; font-weight:var(--heading); color:#fff; background: linear-gradient(90deg,var(--accent-5),var(--accent-7),var(--accent-2));}
    .header-meta{display:flex; gap:8px; flex-wrap:wrap; padding:10px 12px; border-top:1px solid var(--rule);}
    .meta-chip{border:1px solid var(--rule); padding:6px 10px; border-radius:999px; background:#f8fafc}

    /* Section blocks follow the PDF stack order and full width */
    .section{border:1px solid var(--rule); border-radius:var(--radius); margin:6mm 0; overflow:hidden}
    .section-title{display:flex; justify-content:space-between; align-items:center; padding:8px 10px; font-weight:var(--heading); color:#111; background: linear-gradient(90deg, rgba(239,68,68,.18), rgba(245,158,11,.18), rgba(34,197,94,.18), rgba(56,189,248,.18));}
    .section-body{padding:10px 12px; background:#fff}

    /* Two-column intro like a leaflet */
    .intro{display:grid; grid-template-columns: 1.2fr .8fr; gap:10mm}
    .callout{border:1px solid var(--rule); border-radius:var(--radius); padding:10px 12px}
    .bullets{margin:0; padding-left:18px}
    .bullets li{margin:4px 0; color:var(--muted)}

    /* Faculty as a table (to match typical programme layout, not cards) */
    table{width:100%; border-collapse:collapse}
    thead th{font-size:12px; text-transform:uppercase; letter-spacing:.02em; text-align:left; color:#334155; border-bottom:2px solid var(--rule); padding:6px 6px}
    tbody td{padding:6px 6px; border-bottom:1px solid var(--rule)}

    .faculty-3col{table-layout:fixed}
    .faculty-3col col:nth-child(1){width:36%}
    .faculty-3col col:nth-child(2){width:32%}
    .faculty-3col col:nth-child(3){width:32%}

    /* Candidates grouped into four equal blocks across the page */
    .groups{display:grid; grid-template-columns: repeat(4, 1fr); gap:6mm}
    .group{border:1px solid var(--rule); border-radius:var(--radius); overflow:hidden}
    .group h4{margin:0; padding:6px 8px; font-weight:var(--heading); background:linear-gradient(90deg, var(--accent-4), var(--accent-7)); color:#073042}
    .group .sub{padding:4px 8px; color:var(--muted); border-bottom:1px solid var(--rule)}
    .group table thead th{font-size:11px}
    .group table td, .group table th{font-size:12px}

    /* Day schedules as strict 4-column tables to match PDF look */
    .sched-4col{table-layout:fixed}
    .sched-4col col:nth-child(1){width:18%}
    .sched-4col col:nth-child(2){width:42%}
    .sched-4col col:nth-child(3){width:20%}
    .sched-4col col:nth-child(4){width:20%}

    .strip{padding:6px 8px; font-weight:var(--heading); color:#0b132b; background:linear-gradient(90deg, rgba(249,115,22,.18), rgba(6,182,212,.18)); border:1px solid var(--rule); border-radius:6px; margin-bottom:4mm}

    /* Four-up blocks (Workshops / Stations) in exact grid */
    .four-grid{display:grid; grid-template-columns: repeat(4, 1fr); gap:4mm}
    .tile{border:1px solid var(--rule); border-radius:var(--radius); overflow:hidden}
    .tile h5{margin:0; padding:6px 8px; font-weight:var(--heading); background:linear-gradient(90deg, rgba(139,92,246,.18), rgba(236,72,153,.18)); color:#3b0764}
    .tile table td, .tile table th{font-size:12px}

    /* Footer */
    .footer{margin-top:10mm; color:#475569; font-size:12px}

    /* Print */
    @media print{
      body{background:#fff}
      .page{box-shadow:none; border:none; margin:0; width:auto; min-height:auto; padding:0}
      .section, .group, .tile{page-break-inside:avoid}
      .four-grid{break-inside:avoid}
    }
    /* Responsive for preview only */
    @media (max-width: 1000px){ .page{width:100%; min-height:auto; padding:20px} .intro{grid-template-columns:1fr} .groups, .four-grid{grid-template-columns:1fr 1fr} }
    @media (max-width: 640px){ .groups, .four-grid{grid-template-columns:1fr} }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <section class="header">
      <div class="header-bar">${selectedCourse.name}</div>
      <div class="header-meta">
        <div class="meta-chip">${selectedCourse.startDate} - ${selectedCourse.endDate}</div>
        <div class="meta-chip">${location.name}</div>
        <div class="meta-chip">${location.address.city}</div>
        <div class="meta-chip">IMPACT Course Programme</div>
      </div>
    </section>

    <!-- Welcome & Guidelines (two columns) -->
    <section class="section">
      <div class="section-title"> <span>Welcome & Guidelines</span> <span>Course Information</span> </div>
      <div class="section-body intro">
        <div class="callout">
          <p>Welcome to the IMPACT Course! This intensive two-day programme is designed to enhance your skills in managing acutely ill medical patients. Please review the following guidelines to ensure you get the most from your experience.</p>
          <ul class="bullets">
            <li><strong>Group Allocation:</strong> You have been assigned to a group (A, B, C, or D) for workshop rotations and practical sessions.</li>
            <li><strong>Faculty/Candidate List:</strong> Please refer to the faculty list for contact information and specialties.</li>
            <li><strong>Teaching Stations Time Sheet:</strong> Follow the schedule carefully for station rotations.</li>
            <li><strong>Course Evaluation:</strong> Complete the evaluation form at the end of the course.</li>
            <li><strong>Mentor Scheme:</strong> Your educational supervisor will receive feedback on your performance.</li>
            <li><strong>Course Completion:</strong> Certificates will be issued upon successful completion.</li>
          </ul>
        </div>
        <div class="callout">
          <p style="margin:0; font-weight:var(--heading); font-size:16px">Good luck with your IMPACT Course!</p>
          <p style="margin-top:6px">We hope you find this course valuable for your professional development.</p>
        </div>
      </div>
    </section>

    <!-- Faculty (table) -->
    <section class="section">
      <div class="section-title"> <span>Faculty</span> <span>Course Director: ${faculty.find(f => f.role === 'Course Director')?.name || 'TBD'}</span> </div>
      <div class="section-body">
        <table class="faculty-3col">
          <colgroup><col/><col/><col/></colgroup>
          <thead><tr><th>Name (Initials)</th><th>Role</th><th>Organisation</th></tr></thead>
          <tbody>
            ${generateFacultyRows()}
          </tbody>
        </table>
      </div>
    </section>

    <!-- Candidates (four groups) -->
    <section class="section">
      <div class="section-title"> <span>Candidates</span> <span>Total: ${candidates.length} participants</span> </div>
      <div class="section-body groups">
        <!-- Group A -->
        <div class="group">
          <h4>Group A</h4>
          <div class="sub">Candidates 1-4</div>
          <table>
            <thead><tr><th>#</th><th>Name</th><th>Grade</th><th>Speciality</th><th>Mentor</th></tr></thead>
            <tbody>
              ${generateCandidateRows('A', candidateGroups.A)}
            </tbody>
          </table>
        </div>
        <!-- Group B -->
        <div class="group">
          <h4>Group B</h4>
          <div class="sub">Candidates 5-8</div>
          <table>
            <thead><tr><th>#</th><th>Name</th><th>Grade</th><th>Speciality</th><th>Mentor</th></tr></thead>
            <tbody>
              ${generateCandidateRows('B', candidateGroups.B)}
            </tbody>
          </table>
        </div>
        <!-- Group C -->
        <div class="group">
          <h4>Group C</h4>
          <div class="sub">Candidates 9-12</div>
          <table>
            <thead><tr><th>#</th><th>Name</th><th>Grade</th><th>Speciality</th><th>Mentor</th></tr></thead>
            <tbody>
              ${generateCandidateRows('C', candidateGroups.C)}
            </tbody>
          </table>
        </div>
        <!-- Group D -->
        <div class="group">
          <h4>Group D</h4>
          <div class="sub">Candidates 13-16</div>
          <table>
            <thead><tr><th>#</th><th>Name</th><th>Grade</th><th>Speciality</th><th>Mentor</th></tr></thead>
            <tbody>
              ${generateCandidateRows('D', candidateGroups.D)}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Day 1 -->
    <section class="section">
      <div class="section-title"> <span>Day 1 — ${selectedCourse.startDate}</span> <span>${location.name}</span> </div>
      <div class="section-body">
        <div class="strip">Day 1 Schedule - Lectures, Workshops, and Assessment Stations</div>
        <table class="sched-4col">
          <colgroup><col/><col/><col/><col/></colgroup>
          <thead><tr><th>Time</th><th>Session</th><th>Faculty</th><th>Room</th></tr></thead>
          <tbody>
            ${generateDaySchedule(1)}
          </tbody>
        </table>

        <!-- Workshops 4-up -->
        <div class="four-grid" style="margin-top:6mm">
          ${generateWorkshopSchedule(getWorkshopRotations(1))}
        </div>

        <!-- Assessment Stations 4-up -->
        <div class="four-grid" style="margin-top:6mm">
          ${generateAssessmentSchedule(getAssessmentStations(1))}
        </div>
      </div>
    </section>

    <!-- Day 2 -->
    <section class="section">
      <div class="section-title"> <span>Day 2 — ${selectedCourse.endDate}</span> <span>${location.name}</span> </div>
      <div class="section-body">
        <div class="strip">Day 2 Schedule - Practical Sessions, Workshops, and Wrap-up</div>
        <table class="sched-4col">
          <colgroup><col/><col/><col/><col/></colgroup>
          <thead><tr><th>Time</th><th>Session</th><th>Faculty</th><th>Room</th></tr></thead>
          <tbody>
            ${generateDaySchedule(2)}
          </tbody>
        </table>

        <!-- Practical Sessions (2 tiles as per PDF style if present) -->
        <div class="four-grid" style="grid-template-columns:1fr 1fr; gap:6mm; margin-top:6mm">
          ${generateAssessmentSchedule(getPracticalSessions(2))}
        </div>

        <!-- Workshops 2-up -->
        <div class="four-grid" style="grid-template-columns:1fr 1fr; gap:6mm; margin-top:6mm">
          ${generateWorkshopSchedule(getWorkshopRotations(2))}
        </div>

        <!-- Assessment Stations 4-up -->
        <div class="four-grid" style="margin-top:6mm">
          ${generateAssessmentSchedule(getAssessmentStations(2))}
        </div>
      </div>
    </section>

    <div class="footer">For any queries, please contact: ${location.contact.email} | ${location.contact.phone}</div>
  </div>
</body>
</html>`;

    return template;
  };

  const generateProgramme = async () => {
    setLoading(true);
    try {
      const htmlContent = generateProgrammeHTML();
      
      // Create a blob with the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `IMPACT-Programme-${selectedCourse.name.replace(/\s+/g, '-')}.html`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      toast.success('Programme generated successfully!');
    } catch (error) {
      console.error('Error generating programme:', error);
      toast.error('Failed to generate programme');
    } finally {
      setLoading(false);
    }
  };

  const previewProgramme = () => {
    const htmlContent = generateProgrammeHTML();
    const newWindow = window.open('', '_blank');
    newWindow.document.write(htmlContent);
    newWindow.document.close();
  };

  if (!selectedCourse) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">No Course Selected</h3>
          <p className="text-gray-600 mb-4">Please select a course to generate the programme.</p>
          <button
            onClick={onClose}
            className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Generate Programme</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Course Information</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Course:</span> {selectedCourse.name}
              </div>
              <div>
                <span className="font-medium">Dates:</span> {selectedCourse.startDate} - {selectedCourse.endDate}
              </div>
              <div>
                <span className="font-medium">Venue:</span> {location?.name || selectedCourse.venue}
              </div>
              <div>
                <span className="font-medium">Candidates:</span> {candidates.length}
              </div>
              <div>
                <span className="font-medium">Faculty:</span> {faculty.length}
              </div>
              <div>
                <span className="font-medium">Programme Items:</span> {programme.length}
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={previewProgramme}
            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            <FileText size={16} />
            <span>Preview</span>
          </button>
          <button
            onClick={generateProgramme}
            disabled={loading}
            className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
          >
            <Download size={16} />
            <span>{loading ? 'Generating...' : 'Download HTML'}</span>
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Note:</strong> This generates an HTML file that can be opened in any web browser and printed to PDF if needed.</p>
        </div>
      </div>
    </div>
  );
};

export default ProgrammeGenerator;
