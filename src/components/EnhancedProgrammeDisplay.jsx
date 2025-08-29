import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FileText, Clock, Users, MapPin, Star, Award, Calendar, BookOpen, Download, Eye } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const EnhancedProgrammeDisplay = ({ courseId, candidateData }) => {
  const [programmeSubjects, setProgrammeSubjects] = useState([]);
  const [allCandidates, setAllCandidates] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('html');

  // Real-time listeners for programme updates
  useEffect(() => {
    if (!courseId) return;

    // Listen to programme subjects changes
    const subjectsQuery = query(
      collection(db, 'programmeSubjects'),
      where('courseId', '==', courseId)
    );

    const unsubscribeSubjects = onSnapshot(subjectsQuery, (snapshot) => {
      const subjectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProgrammeSubjects(subjectsData);
    });

    // Listen to candidates changes
    const candidatesQuery = query(
      collection(db, 'candidates'),
      where('courseId', '==', courseId),
      where('status', 'in', ['Live Candidate', 'Paid in Full'])
    );

    const unsubscribeCandidates = onSnapshot(candidatesQuery, (snapshot) => {
      const candidatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllCandidates(candidatesData);
    });

    // Fetch faculty data
    const fetchFaculty = async () => {
      try {
        const facultyQuery = query(collection(db, 'faculty'));
        const facultySnapshot = await getDocs(facultyQuery);
        const facultyData = facultySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFaculty(facultyData);
      } catch (error) {
        console.error('Error fetching faculty:', error);
      }
    };

    fetchFaculty();
    setLoading(false);

    return () => {
      unsubscribeSubjects();
      unsubscribeCandidates();
    };
  }, [courseId]);

  // Get faculty name by initials
  const getFacultyName = (initials) => {
    const facultyMember = faculty.find(f => f.initials === initials);
    return facultyMember ? facultyMember.name : initials;
  };

  // Organize subjects by type and create appropriate table structures
  const organizeProgrammeData = () => {
    const workshops = programmeSubjects.filter(s => s.type === 'workshop');
    const scenarioPractice = programmeSubjects.filter(s => s.type === 'scenario-practice');
    const assessments = programmeSubjects.filter(s => s.type === 'assessment');
    const sessions = programmeSubjects.filter(s => s.type === 'session');
    const practicalSessions = programmeSubjects.filter(s => s.type === 'practical-session');
    const breaks = programmeSubjects.filter(s => s.type === 'break' || s.type === 'lunch');
    
    // Get unique workshop names and their time slots
    const workshopGroups = workshops.reduce((acc, workshop) => {
      if (!acc[workshop.subjectName]) {
        acc[workshop.subjectName] = [];
      }
      acc[workshop.subjectName].push(workshop);
      return acc;
    }, {});
    
    // Get unique time slots for workshops only
    const workshopTimeSlots = [...new Set(workshops.map(w => `${w.startTime} - ${w.endTime}`))].sort();
    
    // Get session time slots
    const sessionTimeSlots = [...new Set(sessions.map(s => `${s.startTime} - ${s.endTime}`))].sort();
    
    return {
      workshops,
      workshopGroups,
      workshopTimeSlots,
      scenarioPractice,
      assessments,
      sessions,
      practicalSessions,
      breaks,
      sessionTimeSlots
    };
  };

  // Generate PDF with proper structure
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      
      // Dark theme styling
      doc.setFillColor(40, 40, 40);
      doc.rect(0, 0, 210, 297, 'F');
      
      // Header
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('IMPACT', 20, 30);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('ILL MEDICAL PATIENTS ACUTE CARE & TREATMENT', 20, 40);
      
      // Course title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('IMPACT COURSE PROGRAMME', 105, 60, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Date: 3rd and 4th March 2025', 105, 75, { align: 'center' });
      doc.text('Venue: Nightingale House, Whiston Hospital', 105, 85, { align: 'center' });

      let yPosition = 100;

      // Group by day
      const subjectsByDay = programmeSubjects.reduce((acc, subject) => {
        if (!acc[subject.day]) acc[subject.day] = [];
        acc[subject.day].push(subject);
        return acc;
      }, {});

      Object.entries(subjectsByDay).forEach(([day, subjects]) => {
        // Day header
        doc.setFillColor(60, 60, 60);
        doc.rect(10, yPosition - 5, 190, 15, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`DAY ${day}`, 20, yPosition + 5);
        yPosition += 20;

        const { workshops, workshopGroups, workshopTimeSlots, sessions } = organizeProgrammeData();
        
        // Workshops table
        if (Object.keys(workshopGroups).length > 0) {
          const workshopNames = Object.keys(workshopGroups);
          const workshopHeaders = ['Time', ...workshopNames];
          const facultyRow = ['Faculty', ...workshopNames.map(name => {
            const workshop = workshops.find(w => w.subjectName === name);
            return workshop?.assignedFaculty ? getFacultyName(workshop.assignedFaculty) : '';
          })];
          const roomRow = ['Room', ...workshopNames.map(() => 'To Be Directed')];
          
          const timeSlotRows = workshopTimeSlots.map(timeSlot => {
            const row = [timeSlot];
            workshopNames.forEach(workshopName => {
              const workshop = workshops.find(w => w.subjectName === workshopName && `${w.startTime} - ${w.endTime}` === timeSlot);
              if (workshop) {
                row.push(workshop.assignedGroup || '');
              } else {
                row.push('');
              }
            });
            return row;
          });

          autoTable(doc, {
            startY: yPosition,
            head: [workshopHeaders],
            body: [facultyRow, roomRow, ...timeSlotRows],
            theme: 'grid',
            headStyles: { 
              fillColor: [40, 40, 40], 
              textColor: 255,
              fontStyle: 'bold',
              fontSize: 12
            },
            styles: { 
              fontSize: 10,
              cellPadding: 5,
              fillColor: [60, 60, 60],
              textColor: 255
            },
            alternateRowStyles: {
              fillColor: [50, 50, 50]
            },
            margin: { top: 10, right: 10, bottom: 10, left: 10 }
          });

          yPosition = doc.lastAutoTable.finalY + 20;
        }

        // Regular sessions table
        const daySessions = subjects.filter(s => s.type === 'session');
        if (daySessions.length > 0) {
          const sessionData = daySessions
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map(subject => [
              `${subject.startTime} - ${subject.endTime}`,
              subject.subjectName || subject.name || 'Activity',
              subject.assignedFaculty ? getFacultyName(subject.assignedFaculty) : '',
              subject.room || 'To Be Directed'
            ]);

          autoTable(doc, {
            startY: yPosition,
            head: [['Time', 'Activity', 'Faculty', 'Room']],
            body: sessionData,
            theme: 'grid',
            headStyles: { 
              fillColor: [40, 40, 40], 
              textColor: 255,
              fontStyle: 'bold',
              fontSize: 12
            },
            styles: { 
              fontSize: 10,
              cellPadding: 5,
              fillColor: [60, 60, 60],
              textColor: 255
            },
            alternateRowStyles: {
              fillColor: [50, 50, 50]
            },
            margin: { top: 10, right: 10, bottom: 10, left: 10 }
          });

          yPosition = doc.lastAutoTable.finalY + 20;
        }
      });

      doc.save('impact-programme.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white"></div>
      </div>
    );
  }

  const { workshops, workshopGroups, workshopTimeSlots, scenarioPractice, assessments, sessions, practicalSessions, sessionTimeSlots } = organizeProgrammeData();

  return (
    <div className="space-y-8">
      {/* Sophisticated Header with View Toggle */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8 rounded-3xl shadow-2xl border border-gray-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-5xl font-bold mb-4 flex items-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                <Star className="mr-6" size={50} />
                Your Course Programme
              </h3>
              <p className="text-2xl opacity-90 font-light">Professional dynamic schedule format</p>
            </div>
            <div className="flex space-x-4">
              <div className="flex bg-gray-800 rounded-xl p-1 border border-gray-600">
                <button
                  onClick={() => setSelectedView('html')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                    selectedView === 'html' 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Eye size={20} />
                  <span>View</span>
                </button>
                <button
                  onClick={generatePDF}
                  className="px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Download size={20} />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workshops Section - Only show actual workshop times */}
      {Object.keys(workshopGroups).length > 0 && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-gray-700">
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20"></div>
            <div className="relative z-10">
              <h4 className="text-4xl font-bold text-white flex items-center">
                <Users className="mr-4" size={40} />
                Workshops (40 minutes each)
              </h4>
              <p className="text-xl text-green-100 mt-2">Interactive skill development sessions - Groups rotate through specific workshops</p>
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {Object.entries(workshopGroups).map(([workshopName, workshopSessions], index) => {
                const mainWorkshop = workshopSessions[0];
                return (
                  <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-6 border border-gray-600 hover:border-green-500 transition-all duration-300 hover:shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="text-xl font-bold text-white">{workshopName}</h5>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Users className="text-green-400" size={20} />
                        <span className="text-gray-300">
                          {mainWorkshop?.assignedFaculty ? getFacultyName(mainWorkshop.assignedFaculty) : 'TBA'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <MapPin className="text-blue-400" size={20} />
                        <span className="text-gray-300">To Be Directed</span>
                      </div>
                      
                      <div className="border-t border-gray-600 pt-4">
                        <h6 className="text-sm font-semibold text-gray-400 mb-3">SCHEDULE</h6>
                        <div className="space-y-2">
                          {workshopSessions.map((session, sessionIndex) => (
                            <div key={sessionIndex} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                              <div className="flex items-center space-x-3">
                                <Clock className="text-yellow-400" size={16} />
                                <span className="text-sm text-white font-medium">
                                  {session.startTime} - {session.endTime}
                                </span>
                              </div>
                              {session.assignedGroup && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-400">Group</span>
                                  <span className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full text-xs font-bold text-white">
                                    {session.assignedGroup}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sessions Section */}
      {sessions.length > 0 && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-gray-700">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-700 p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20"></div>
            <div className="relative z-10">
              <h4 className="text-4xl font-bold text-white flex items-center">
                <BookOpen className="mr-4" size={40} />
                Sessions
              </h4>
              <p className="text-xl text-blue-100 mt-2">Educational presentations and discussions - All groups attend</p>
            </div>
          </div>
          
          <div className="p-8">
            <div className="space-y-4">
              {sessions
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((session, index) => (
                  <div key={session.id} className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600 hover:border-blue-500 transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-3">
                          <Clock className="text-white" size={24} />
                        </div>
                        <div>
                          <h5 className="text-xl font-bold text-white">
                            {session.startTime} - {session.endTime}
                          </h5>
                          <p className="text-lg text-gray-300">
                            {session.subjectName || session.name || 'Activity'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-400 mb-1">Faculty</div>
                        <div className="text-white font-medium">
                          {session.assignedFaculty ? getFacultyName(session.assignedFaculty) : 'TBA'}
                        </div>
                        <div className="text-sm text-gray-400 mt-2">Room</div>
                        <div className="text-white font-medium">
                          {session.room || 'To Be Directed'}
                        </div>
                        <div className="text-sm text-gray-400 mt-2">Groups</div>
                        <div className="flex justify-end mt-1">
                          <span className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full text-xs font-bold text-white">
                            All Groups
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Group Assignment Legend */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-gray-700">
        <div className="bg-gradient-to-r from-purple-600 to-pink-700 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"></div>
          <div className="relative z-10">
            <h4 className="text-2xl font-bold text-white flex items-center">
              <Users className="mr-3" size={28} />
              Group Assignment Guide
            </h4>
            <p className="text-purple-100 mt-1">Understanding which sessions you'll attend</p>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg border border-gray-600">
                <span className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full text-xs font-bold text-white">
                  All Groups
                </span>
                <span className="text-gray-300">Sessions, Assessments, Practical Sessions</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg border border-gray-600">
                <span className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full text-xs font-bold text-white">
                  Group A
                </span>
                <span className="text-gray-300">Workshop rotations (specific times)</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg border border-gray-600">
                <span className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full text-xs font-bold text-white">
                  Group B
                </span>
                <span className="text-gray-300">Workshop rotations (specific times)</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg border border-gray-600">
                <span className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full text-xs font-bold text-white">
                  Groups C & D
                </span>
                <span className="text-gray-300">Workshop rotations (specific times)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Programme Notes */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 rounded-3xl shadow-2xl border border-gray-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10"></div>
        <div className="relative z-10">
          <h4 className="font-bold text-3xl mb-8 flex items-center">
            <Award className="mr-4" size={32} />
            Programme Notes
          </h4>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-xl border border-gray-600">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-lg">Faculty assignments are subject to change</span>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-xl border border-gray-600">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-lg">Room assignments will be confirmed on the day</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-xl border border-gray-600">
                <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-lg">Please arrive 10 minutes before each session</span>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-xl border border-gray-600">
                <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-lg">Groups rotate through workshops and stations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProgrammeDisplay;
