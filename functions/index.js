/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest, onCall } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors')({ origin: true });

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// Email configuration using Resend API directly
const RESEND_API_KEY = 're_jFZHABcs_Z7nfZXznaW9ah7dzcR9BZM1Y';

// Send email function - Updated to use Resend API directly
async function sendEmail(to, subject, htmlContent) {
  console.log('Attempting to send email...');
  console.log('To:', to);
  console.log('Subject:', subject);
  
  // Use Resend's default sender
  const fromEmail = 'onboarding@resend.dev';
  
  console.log('From email config:', fromEmail);
  console.log('Resend API key configured:', true);
  
  // TEMPORARY: For candidate emails, send to test address with clear labeling
  const actualRecipient = to;
  const testEmail = 'leigh.abbott@merseywestlancs.nhs.uk';
  
  // If sending to a candidate (not the test email), modify the content
  let modifiedSubject = subject;
  let modifiedContent = htmlContent;
  
  if (to !== testEmail) {
    modifiedSubject = `[FORWARDED TO CANDIDATE: ${to}] ${subject}`;
    modifiedContent = `
      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
        <h3 style="color: #856404; margin: 0 0 10px 0;">📧 EMAIL FORWARDED</h3>
        <p style="color: #856404; margin: 0;"><strong>Original Recipient:</strong> ${to}</p>
        <p style="color: #856404; margin: 0;"><strong>Original Subject:</strong> ${subject}</p>
        <p style="color: #856404; margin: 10px 0 0 0;"><em>This email was meant for the candidate but is being sent to you for testing. Domain verification required for production.</em></p>
      </div>
      ${htmlContent}
    `;
  }
  
  const emailData = {
    from: fromEmail,
    to: testEmail, // Always send to test email for now
    subject: modifiedSubject,
    html: modifiedContent
  };

  console.log('Email data:', emailData);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`Email sent successfully to ${testEmail} (original: ${actualRecipient})`, result);
      return true;
    } else {
      console.error('Resend API error:', result);
      return false;
    }
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code
    });
    return false;
  }
}

// Email templates
const emailTemplates = {
  welcome: {
    subject: 'Welcome to IMPACT Course - Your Account is Ready',
    template: (candidate) => `
      <h2>Welcome to the IMPACT Course!</h2>
      <p>Dear ${candidate.firstName} ${candidate.surname},</p>
      <p>Your payment has been confirmed and your account is now active. Here are your login credentials:</p>
      <p><strong>Username:</strong> ${candidate.email}</p>
      <p><strong>Password:</strong> ${candidate.generatedPassword}</p>
      <p>Please log in at: <a href="https://mwl-impact.web.app/login">https://mwl-impact.web.app/login</a></p>
      <p>Don't forget to upload your profile photo and complete your profile information.</p>
      <p>Best regards,<br>IMPACT Course Team</p>
    `
  },
  paymentReminder: {
    subject: 'IMPACT Course - Payment Reminder',
    template: (candidate) => `
      <h2>Payment Reminder - IMPACT Course</h2>
      <p>Dear ${candidate.firstName} ${candidate.surname},</p>
      <p>We noticed that your payment for the IMPACT course is still pending. To secure your place, please complete your payment as soon as possible.</p>
      <p>Course Details:<br>
      - Date: [Course Date]<br>
      - Venue: [Course Venue]<br>
      - Cost: [Course Cost]</p>
      <p>Please contact our general office team to arrange payment.</p>
      <p>Best regards,<br>IMPACT Course Team</p>
    `
  },
  eLearningReminder: {
    subject: 'IMPACT Course - E-Learning Reminder',
    template: (candidate) => `
      <h2>E-Learning Completion Reminder</h2>
      <p>Dear ${candidate.firstName} ${candidate.surname},</p>
      <p>Please ensure you have completed the required e-learning modules before attending the IMPACT course.</p>
      <p>You can access the e-learning materials at: [E-Learning URL]</p>
      <p>Best regards,<br>IMPACT Course Team</p>
    `
  },
  courseReminder: {
    subject: 'IMPACT Course - Final Reminder',
    template: (candidate) => `
      <h2>IMPACT Course - Final Reminder</h2>
      <p>Dear ${candidate.firstName} ${candidate.surname},</p>
      <p>This is a final reminder that the IMPACT course is approaching.</p>
      <p>Course Details:<br>
      - Date: [Course Date]<br>
      - Venue: [Course Venue]<br>
      - Start Time: [Start Time]</p>
      <p>Please ensure you have completed all pre-course requirements.</p>
      <p>Best regards,<br>IMPACT Course Team</p>
    `
  },
  newApplication: {
    subject: 'New IMPACT Course Application Received',
    template: (candidate) => `
      <h2>New Application Received</h2>
      <p>Dear General Office Team,</p>
      <p>A new application has been received for the IMPACT course:</p>
      <p><strong>Candidate:</strong> ${candidate.firstName} ${candidate.surname}<br>
      <strong>Email:</strong> ${candidate.email}<br>
      <strong>Course:</strong> ${candidate.courseName}<br>
      <strong>Course Date:</strong> ${candidate.courseDate}<br>
      <strong>GMC Number:</strong> ${candidate.gmcNumber}</p>
      <p>Please contact the candidate to arrange payment and update their status in the system.</p>
      <p>Best regards,<br>IMPACT Course System</p>
    `
  },
  supervisorNotification: {
    subject: 'IMPACT Course - Candidate Assessment Update',
    template: (candidate, reason) => `
      <h2>Candidate Assessment Update</h2>
      <p>Dear ${candidate.educationalSupervisor},</p>
      <p>This is to inform you that ${candidate.firstName} ${candidate.surname} (GMC: ${candidate.gmcNumber}) was unsuccessful in completing the IMPACT course.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>Please contact the course director for further discussion if required.</p>
      <p>Best regards,<br>IMPACT Course Director</p>
    `
  },
  applicationConfirmation: {
    subject: 'IMPACT Course Application Confirmation - Payment Instructions',
    template: (candidate) => `
      <h2>IMPACT Course Application Confirmation</h2>
      <p>Dear ${candidate.firstName} ${candidate.surname},</p>
      <p>Thank you for your application to the IMPACT Course. Your application has been received and is currently pending payment confirmation.</p>
      
      <h3>Payment Instructions</h3>
      <p>Please see below for details on how to contact our general office to make payment for the IMPACT Course:</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0;">
        <p><strong>Payment Contact:</strong> General Office</p>
        <p><strong>Phone:</strong> 0151 705 7428</p>
        <p><strong>Important:</strong> Please quote "IMPACT" when making your payment.</p>
        <p><strong>Fee:</strong> £500 for both days (food will be provided)</p>
        <p><strong>Note:</strong> Please do not share this information with anyone outside of this email list.</p>
      </div>
      
      <p><strong>What happens next:</strong></p>
      <ul>
        <li>General office will provide you with a receipt number</li>
        <li>They will need your name and contact number</li>
        <li>Internal staff can alternatively go to general office and pay there</li>
      </ul>
      
      <h3>Important Course Information</h3>
      <p><strong>Course Criteria:</strong></p>
      <ul>
        <li>The IMPACT Course is aimed at CT1 and CT2 level doctors in acute medical specialties including Acute Medicine, Acute Care Common Stem (ACCS) and General Internal Medicine.</li>
        <li>The course is also open to FY2 level doctors who are able to demonstrate a particular interest in pursuing a career in the medical specialties noted above.</li>
        <li>FY2 doctors must have completed at least eight months practice in acute medical specialties in their FY2 year before they can attend the course.</li>
      </ul>
      
      <h3>Before Making Payment</h3>
      <p>Please ensure you have read the following very carefully before you attempt to make a payment:</p>
      <ul>
        <li>You need to ensure that you have the study leave available before making a payment. Please do not make a payment if this is not available.</li>
        <li>Check that you meet the course criteria.</li>
        <li>Complete your registration form, and I will then provide you with details of how to contact our General Office to make your payment and confirm your place.</li>
        <li>Once you have made payment, I will contact you to confirm your place on the course and provide details on how to register for your pre-course e-learning package.</li>
      </ul>
      
      <h3>Refund Policy</h3>
      <div style="background-color: #fff3cd; padding: 15px; border: 1px solid #ffeaa7; margin: 20px 0;">
        <h4>Notice of Cancellation prior to the course:</h4>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <tr style="background-color: #f8f9fa;">
            <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left;">Time Period</th>
            <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left;">Refund</th>
          </tr>
          <tr>
            <td style="border: 1px solid #dee2e6; padding: 8px;">3 months</td>
            <td style="border: 1px solid #dee2e6; padding: 8px;">Full Refund</td>
          </tr>
          <tr>
            <td style="border: 1px solid #dee2e6; padding: 8px;">1 – 3 months</td>
            <td style="border: 1px solid #dee2e6; padding: 8px;">50% Refund</td>
          </tr>
          <tr>
            <td style="border: 1px solid #dee2e6; padding: 8px;">1 month</td>
            <td style="border: 1px solid #dee2e6; padding: 8px;">25% Refund</td>
          </tr>
          <tr>
            <td style="border: 1px solid #dee2e6; padding: 8px;">2 weeks or less</td>
            <td style="border: 1px solid #dee2e6; padding: 8px;">No Refund</td>
          </tr>
        </table>
      </div>
      
      <h3>Contact Information</h3>
      <p>If you have any issues please send it to the generic email: <a href="mailto:impact@sthk.nhs.uk">impact@sthk.nhs.uk</a></p>
      
      <p>Thank you</p>
      <p>Kind regards,<br>IMPACT @ Whiston Hospital</p>
    `
  }
};

// Generate random password
function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Function to activate candidate (generate password and send welcome email)
exports.activateCandidate = onCall(async (request) => {
  try {
    console.log('Request data:', request.data);
    
    // Check if user is authenticated
    if (!request.auth) {
      console.log('No authentication found');
      return { error: 'Authentication required' };
    }
    
    console.log('User authenticated:', request.auth.uid);
    
    // Get user profile from Firestore to check role
    const userDoc = await db.collection('users').doc(request.auth.uid).get();
    if (!userDoc.exists) {
      console.log('User profile not found in Firestore');
      return { error: 'User profile not found' };
    }
    
    const userProfile = userDoc.data();
    console.log('User profile:', userProfile);
    
    // Check if user is admin or general office
    if (userProfile.role !== 'admin' && userProfile.role !== 'general-office') {
      console.log('User role not authorized:', userProfile.role);
      return { error: 'Admin or General Office access required' };
    }

    const { candidateId } = request.data;
    console.log('Candidate ID:', candidateId);
    
    if (!candidateId) {
      console.log('No candidate ID provided');
      return { error: 'Candidate ID is required' };
    }
    
    const candidateRef = db.collection('candidates').doc(candidateId);
    const candidateDoc = await candidateRef.get();

    if (!candidateDoc.exists) {
      console.log('Candidate not found');
      return { error: 'Candidate not found' };
    }

    const candidate = candidateDoc.data();
    console.log('Candidate data:', candidate);
    
    const generatedPassword = generatePassword();

    // Create user account in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: candidate.email,
      password: generatedPassword,
      displayName: `${candidate.firstName} ${candidate.surname}`
    });

    // Assign group and candidate number based on applicant type
    let assignedGroup = null;
    let candidateNumber = null;
    
    if (candidate.applicantType === 'Nurse Observer') {
      // For nurse observers, assign to groups A, B, C, D in rotation (1 nurse per group)
      const nurseCandidatesQuery = db.collection('candidates')
        .where('courseId', '==', candidate.courseId)
        .where('applicantType', '==', 'Nurse Observer')
        .where('status', 'in', ['Live Candidate', 'Paid in Full']);
      
      const nurseSnapshot = await nurseCandidatesQuery.get();
      const existingNurseGroups = nurseSnapshot.docs
        .map(doc => doc.data().assignedGroup)
        .filter(group => group); // Remove null/undefined values
      
      const groups = ['A', 'B', 'C', 'D'];
      const availableGroups = groups.filter(group => !existingNurseGroups.includes(group));
      
      if (availableGroups.length > 0) {
        assignedGroup = availableGroups[0]; // Assign to first available group
      } else {
        console.log('No available groups for nurse observer, assigning to group A');
        assignedGroup = 'A';
      }
      
      // Nurse observers don't get candidate numbers - they're observers
      candidateNumber = null;
      
    } else if (candidate.applicantType === 'Doctor' || candidate.applicantType === 'Advanced Nurse Practitioner') {
      // For doctors and ANPs, assign to groups A, B, C, D in rotation (4 per group)
      const doctorCandidatesQuery = db.collection('candidates')
        .where('courseId', '==', candidate.courseId)
        .where('applicantType', 'in', ['Doctor', 'Advanced Nurse Practitioner'])
        .where('status', 'in', ['Live Candidate', 'Paid in Full']);
      
      const doctorSnapshot = await doctorCandidatesQuery.get();
      const existingDoctorGroups = doctorSnapshot.docs
        .map(doc => doc.data().assignedGroup)
        .filter(group => group); // Remove null/undefined values
      
      const groups = ['A', 'B', 'C', 'D'];
      const groupCounts = {};
      groups.forEach(group => {
        groupCounts[group] = existingDoctorGroups.filter(g => g === group).length;
      });
      
      // Find the group with the fewest doctors (max 4 doctors per group)
      const minCount = Math.min(...Object.values(groupCounts));
      const availableGroups = groups.filter(group => groupCounts[group] === minCount);
      assignedGroup = availableGroups[0]; // Assign to first available group
      
      // Assign candidate number based on group and position within group
      const groupToNumberMap = { 'A': 1, 'B': 5, 'C': 9, 'D': 13 };
      const baseNumber = groupToNumberMap[assignedGroup];
      const positionInGroup = groupCounts[assignedGroup] + 1; // +1 because we're adding this candidate
      candidateNumber = baseNumber + positionInGroup - 1; // -1 because base number is the first position
    }

    // Update candidate document
    await candidateRef.update({
      status: 'Live Candidate',
      userId: userRecord.uid,
      generatedPassword: generatedPassword,
      activatedAt: admin.firestore.FieldValue.serverTimestamp(),
      assignedGroup: assignedGroup,
      candidateNumber: candidateNumber
    });

    // Create user profile
    await db.collection('users').doc(userRecord.uid).set({
      email: candidate.email,
      role: 'candidate',
      firstName: candidate.firstName,
      surname: candidate.surname,
      candidateNumber: candidateNumber,
      assignedGroup: assignedGroup,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send payment confirmation and welcome email
    console.log('Preparing to send welcome email...');
    const emailContent = emailTemplates.welcome.template({
      ...candidate,
      generatedPassword: generatedPassword
    });
    console.log('Email content generated:', emailContent.substring(0, 200) + '...');

    const emailSent = await sendEmail(candidate.email, emailTemplates.welcome.subject, emailContent);
    console.log('Email send result:', emailSent);

    if (!emailSent) {
      console.log('Email sending failed, but continuing with activation');
    }

    console.log('Candidate activated successfully');
    return { success: true, message: 'Candidate activated successfully' };
  } catch (error) {
    console.error('Error activating candidate:', error);
    return { error: 'Failed to activate candidate', details: error.message };
  }
});

// Check course capacity
exports.checkCourseCapacity = onCall(async (request) => {
  try {
    const { courseId } = request.data;
    
    if (!courseId) {
      return { success: false, error: 'Course ID is required' };
    }

    // Get course details
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return { success: false, error: 'Course not found' };
    }

    const courseData = courseDoc.data();
    const maxCandidates = courseData.maxCandidates || 20; // Total capacity (16 doctors + 4 nurses)
    const maxDoctors = 16;
    const maxNurses = 4;

    // Get all candidates for this course (Live + Paid in Full)
    const liveCandidatesQuery = db.collection('candidates')
      .where('courseId', '==', courseId)
      .where('status', '==', 'Live Candidate');
    const paidCandidatesQuery = db.collection('candidates')
      .where('courseId', '==', courseId)
      .where('status', '==', 'Paid in Full');
    
    const [liveSnapshot, paidSnapshot] = await Promise.all([
      liveCandidatesQuery.get(),
      paidCandidatesQuery.get()
    ]);
    
    // Combine all candidates and count by type
    const allCandidates = [
      ...liveSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })),
      ...paidSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
    ];
    
    const doctorCount = allCandidates.filter(c => c.applicantType === 'Doctor').length;
    const nurseCount = allCandidates.filter(c => c.applicantType === 'Nurse Observer').length;
    const totalCandidatesCount = doctorCount + nurseCount;
    
    const liveCandidatesCount = liveSnapshot.size;
    const paidCandidatesCount = paidSnapshot.size;

    // Check if course is full based on doctor capacity (the critical limit)
    const isFull = doctorCount >= maxDoctors;
    const availableSpaces = Math.max(0, maxCandidates - totalCandidatesCount);
    const availableDoctorSpaces = Math.max(0, maxDoctors - doctorCount);
    const availableNurseSpaces = Math.max(0, maxNurses - nurseCount);

    return {
      success: true,
      data: {
        courseId,
        maxCandidates,
        maxDoctors,
        maxNurses,
        liveCandidatesCount,
        paidCandidatesCount,
        totalCandidatesCount,
        doctorCount,
        nurseCount,
        availableSpaces,
        availableDoctorSpaces,
        availableNurseSpaces,
        isFull
      }
    };
  } catch (error) {
    console.error('Error checking course capacity:', error);
    return { success: false, error: 'Failed to check course capacity' };
  }
});

// Initialize email templates in Firestore
exports.initializeEmailTemplates = onCall(async (request) => {
  try {
    console.log('Initializing email templates...');
    
    const templates = [
      {
        id: 'applicationConfirmation',
        name: 'Application Confirmation',
        subject: 'IMPACT Course Application Confirmation - Payment Instructions',
        body: `Dear {{firstName}} {{surname}},

Thank you for your application to the IMPACT Course. Your application has been received and is currently pending payment confirmation.

**Payment Instructions**
Please see below for details on how to contact our general office to make payment for the IMPACT Course:

**Payment Contact:** General Office
**Phone:** 0151 705 7428
**Important:** Please quote "IMPACT" when making your payment.
**Fee:** £500 for both days (food will be provided)
**Note:** Please do not share this information with anyone outside of this email list.

**What happens next:**
- General office will provide you with a receipt number
- They will need your name and contact number
- Internal staff can alternatively go to general office and pay there

**Important Course Information**
**Course Criteria:**
- The IMPACT Course is aimed at CT1 and CT2 level doctors in acute medical specialties including Acute Medicine, Acute Care Common Stem (ACCS) and General Internal Medicine.
- The course is also open to FY2 level doctors who are able to demonstrate a particular interest in pursuing a career in the medical specialties noted above.
- FY2 doctors must have completed at least eight months practice in acute medical specialties in their FY2 year before they can attend the course.

**Before Making Payment**
Please ensure you have read the following very carefully before you attempt to make a payment:
- You need to ensure that you have the study leave available before making a payment. Please do not make a payment if this is not available.
- Check that you meet the course criteria.
- Complete your registration form, and I will then provide you with details of how to contact our General Office to make your payment and confirm your place.
- Once you have made payment, I will contact you to confirm your place on the course and provide details on how to register for your pre-course e-learning package.

**Refund Policy**
Notice of Cancellation prior to the course:
- 3 months: Full Refund
- 1 – 3 months: 50% Refund
- 1 month: 25% Refund
- 2 weeks or less: No Refund

**Contact Information**
If you have any issues please send it to the generic email: impact@sthk.nhs.uk

Thank you
Kind regards,
IMPACT @ Whiston Hospital`,
        variables: ['firstName', 'surname', 'email', 'courseName', 'courseDate'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const template of templates) {
      await db.collection('emailTemplates').doc(template.id).set(template);
      console.log(`Template ${template.id} initialized`);
    }

    return { success: true, message: 'Email templates initialized successfully' };
  } catch (error) {
    console.error('Error initializing email templates:', error);
    return { error: 'Failed to initialize email templates', details: error.message };
  }
});

// Function to send application confirmation email
exports.sendApplicationConfirmation = onRequest(async (req, res) => {
  // Enable CORS
  return cors(req, res, async () => {
    try {
      console.log('Application confirmation email requested');
      
      const { candidateData } = req.body;
      if (!candidateData) {
        console.log('No candidate data provided');
        return res.status(400).json({ error: 'Candidate data required' });
      }
      
      console.log('Candidate data:', candidateData);
      
      // Use the applicationConfirmation template
      const template = emailTemplates.applicationConfirmation;
      const emailSubject = template.subject;
      const emailContent = template.template(candidateData);
      
      // Send email to candidate
      const emailSent = await sendEmail(candidateData.email, emailSubject, emailContent);
      
      if (emailSent) {
        console.log('Application confirmation email sent successfully to:', candidateData.email);
        return res.status(200).json({ 
          success: true, 
          message: 'Application confirmation email sent successfully'
        });
      } else {
        console.error('Failed to send application confirmation email');
        return res.status(500).json({ error: 'Failed to send confirmation email' });
      }
      
    } catch (error) {
      console.error('Error in sendApplicationConfirmation:', error);
      return res.status(500).json({ error: 'Failed to send confirmation email', details: error.message });
    }
  });
});

// Function to send bulk emails
exports.sendBulkEmails = onCall(async (request) => {
  try {
    // Check if user is authenticated
    if (!request.auth) {
      console.log('No authentication found');
      return { error: 'Authentication required' };
    }
    
    console.log('User authenticated:', request.auth.uid);
    
    // Get user profile from Firestore to check role
    const userDoc = await db.collection('users').doc(request.auth.uid).get();
    if (!userDoc.exists) {
      console.log('User profile not found in Firestore');
      return { error: 'User profile not found' };
    }
    
    const userProfile = userDoc.data();
    console.log('User profile:', userProfile);
    
    // Check if user is admin
    if (userProfile.role !== 'admin') {
      console.log('User role not authorized:', userProfile.role);
      return { error: 'Admin access required' };
    }

    const { emailType, candidateIds } = request.data;
    
    // Get template from Firestore
    const templateDoc = await db.collection('emailTemplates').doc(emailType).get();
    if (!templateDoc.exists) {
      throw new Error('Email template not found');
    }
    
    const template = templateDoc.data();
    const results = [];

    for (const candidateId of candidateIds) {
      const candidateDoc = await db.collection('candidates').doc(candidateId).get();
      if (candidateDoc.exists) {
        const candidate = candidateDoc.data();
        
        // Replace variables in template
        let emailContent = template.body;
        let emailSubject = template.subject;
        
        // Replace common variables
        const variables = {
          firstName: candidate.firstName || '',
          surname: candidate.surname || '',
          email: candidate.email || '',
          courseName: candidate.courseName || 'IMPACT Course',
          courseDate: candidate.courseDate || '',
          venue: candidate.venue || 'Whiston Hospital',
          courseCost: candidate.courseCost || '£500',
          generatedPassword: candidate.generatedPassword || '',
          gmcNumber: candidate.gmcNumber || '',
          grade: candidate.grade || '',
          specialty: candidate.specialty || '',
          placeOfWork: candidate.placeOfWork || ''
        };
        
        // Replace all variables in content and subject
        Object.keys(variables).forEach(key => {
          const regex = new RegExp(`{{${key}}}`, 'g');
          emailContent = emailContent.replace(regex, variables[key]);
          emailSubject = emailSubject.replace(regex, variables[key]);
        });
        
        const success = await sendEmail(candidate.email, emailSubject, emailContent);
        results.push({
          candidateId,
          email: candidate.email,
          success
        });
      }
    }

    return { success: true, results };
  } catch (error) {
    console.error('Error sending bulk emails:', error);
    return { error: 'Failed to send emails', details: error.message };
  }
});

// Function to automatically send new application notification when candidate is created
exports.notifyNewApplication = onRequest(async (req, res) => {
  // Enable CORS
  return cors(req, res, async () => {
    try {
      console.log('New application notification requested');
      
      const { candidateData } = req.body;
      if (!candidateData) {
        console.log('No candidate data provided');
        return res.status(400).json({ error: 'Candidate data required' });
      }
      
      console.log('Candidate data:', candidateData);
      
      // TEMPORARY: Send to your own email for testing since Resend requires domain verification
      const testEmails = ['leigh.abbott@merseywestlancs.nhs.uk'];
      
      console.log('Sending notification to test emails:', testEmails);
      
      // Use the newApplication template
      const template = emailTemplates.newApplication;
      const emailSubject = template.subject;
      const emailContent = template.template(candidateData);
      
      // Send email to test address
      const emailPromises = testEmails.map(email => 
        sendEmail(email, emailSubject, emailContent)
      );
      
      const results = await Promise.allSettled(emailPromises);
      
      console.log('Email sending results:', results);
      
      // Count successful sends
      const successfulSends = results.filter(result => 
        result.status === 'fulfilled' && result.value
      ).length;
      
      // Log successful sends
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          console.log(`Email sent successfully to: ${testEmails[index]}`);
        } else {
          console.error(`Failed to send email to: ${testEmails[index]}`, result.reason);
        }
      });
      
      return res.status(200).json({ 
        success: true, 
        message: `Notification sent to ${successfulSends} test email(s)`,
        emailsSent: successfulSends,
        totalEmails: testEmails.length,
        note: 'Currently sending to test email only. Domain verification required for production.'
      });
      
    } catch (error) {
      console.error('Error in notifyNewApplication:', error);
      return res.status(500).json({ error: 'Failed to send notification', details: error.message });
    }
  });
});

// Function to export candidate data
exports.exportCandidateData = onCall(async (request) => {
  // Check if user is admin
  if (!request.auth || !request.auth.token.admin) {
    throw new Error('Admin access required');
  }

  try {
    const { status, format = 'json' } = request.data;
    let query = db.collection('candidates');

    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    const candidates = [];

    snapshot.forEach(doc => {
      candidates.push({
        id: doc.id,
        ...doc.data()
      });
    });

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = ['ID', 'First Name', 'Surname', 'Email', 'Status', 'Grade', 'Specialty', 'GMC Number'];
      const csvRows = candidates.map(c => [
        c.id,
        c.firstName || '',
        c.surname || '',
        c.email || '',
        c.status || '',
        c.grade || '',
        c.specialty || '',
        c.gmcNumber || ''
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      return { success: true, data: csvContent, format: 'csv' };
    }

    return { success: true, data: candidates, format: 'json' };
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
});

// Function to update course settings
exports.updateCourseSettings = onCall(async (request) => {
  // Check if user is admin
  if (!request.auth || !request.auth.token.admin) {
    throw new Error('Admin access required');
  }

  try {
    const { courseId, settings } = request.data;
    const courseRef = db.collection('courses').doc(courseId || 'current');

    await courseRef.set(settings, { merge: true });

    return { success: true, message: 'Course settings updated successfully' };
  } catch (error) {
    console.error('Error updating course settings:', error);
    throw new Error('Failed to update course settings');
  }
});

// Function to handle unsuccessful candidates
exports.handleUnsuccessfulCandidate = onCall(async (request) => {
  // Check if user is admin
  if (!request.auth || !request.auth.token.admin) {
    throw new Error('Admin access required');
  }

  try {
    const { candidateId, reason, notifySupervisor } = request.data;
    const candidateRef = db.collection('candidates').doc(candidateId);
    const candidateDoc = await candidateRef.get();

    if (!candidateDoc.exists) {
      throw new Error('Candidate not found');
    }

    const candidate = candidateDoc.data();

    // Update candidate status
    await candidateRef.update({
      courseStatus: 'Fail',
      unsuccessfulReason: reason,
      unsuccessfulDate: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create unsuccessful candidate record
    await db.collection('unsuccessfulCandidates').add({
      candidateId,
      candidateName: `${candidate.firstName} ${candidate.surname}`,
      candidateEmail: candidate.email,
      reason,
      supervisorEmail: candidate.supervisorEmail,
      supervisorName: candidate.educationalSupervisor,
      date: admin.firestore.FieldValue.serverTimestamp(),
      courseDirector: 'Current Course Director'
    });

    // Send notification to supervisor if requested
    if (notifySupervisor && candidate.supervisorEmail) {
      const emailContent = emailTemplates.supervisorNotification.template(candidate, reason);
      await sendEmail(
        candidate.supervisorEmail,
        emailTemplates.supervisorNotification.subject,
        emailContent
      );
    }

    return { success: true, message: 'Unsuccessful candidate processed successfully' };
  } catch (error) {
    console.error('Error handling unsuccessful candidate:', error);
    throw new Error('Failed to process unsuccessful candidate');
  }
});

// Function to generate certificates
exports.generateCertificates = onCall(async (request) => {
  // Check if user is admin
  if (!request.auth || !request.auth.token.admin) {
    throw new Error('Admin access required');
  }

  try {
    const { courseId } = request.data;
    const candidatesSnapshot = await db.collection('candidates')
      .where('courseStatus', '==', 'Pass')
      .get();

    const certificates = [];
    candidatesSnapshot.forEach(doc => {
      const candidate = doc.data();
      certificates.push({
        candidateId: doc.id,
        candidateName: `${candidate.firstName} ${candidate.surname}`,
        gmcNumber: candidate.gmcNumber,
        courseDate: new Date().toISOString().split('T')[0], // Use current date or course date
        certificateNumber: `IMPACT-${Date.now()}-${doc.id}`
      });
    });

    return { success: true, certificates };
  } catch (error) {
    console.error('Error generating certificates:', error);
    throw new Error('Failed to generate certificates');
  }
});

// Function to create/update email templates
exports.updateEmailTemplate = onCall(async (request) => {
  try {
    // Check if user is authenticated
    if (!request.auth) {
      return { success: false, message: 'Authentication required' };
    }

    // Check if user is admin by looking up their role in Firestore
    try {
      const userDoc = await db.collection('users').doc(request.auth.uid).get();
      if (!userDoc.exists || userDoc.data().role !== 'admin') {
        return { success: false, message: 'Admin access required' };
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      return { success: false, message: 'Admin access required' };
    }

    const { templateId, template } = request.data;
    await db.collection('emailTemplates').doc(templateId).set(template);

    return { success: true, message: 'Email template updated successfully' };
  } catch (error) {
    console.error('Error updating email template:', error);
    return { success: false, message: 'Failed to update email template' };
  }
});

// Function to get email templates
exports.getEmailTemplates = onCall(async (request) => {
  try {
    // Check if user is authenticated
    if (!request.auth) {
      // Return empty templates instead of throwing error
      return { success: true, templates: {} };
    }

    // Check if user is admin by looking up their role in Firestore
    try {
      const userDoc = await db.collection('users').doc(request.auth.uid).get();
      if (!userDoc.exists || userDoc.data().role !== 'admin') {
        // Return empty templates for non-admin users
        return { success: true, templates: {} };
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      // Return empty templates if role check fails
      return { success: true, templates: {} };
    }

    const templatesSnapshot = await db.collection('emailTemplates').get();
    const templates = {};

    templatesSnapshot.forEach(doc => {
      templates[doc.id] = doc.data();
    });

    return { success: true, templates };
  } catch (error) {
    console.error('Error getting email templates:', error);
    // Return empty templates instead of throwing error
    return { success: true, templates: {} };
  }
});

// Send faculty login credentials
exports.sendFacultyCredentials = onCall(async (request) => {
  try {
    const { email, name, password } = request.data;

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #005EB8; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">IMPACT Course - Faculty Access</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #005EB8;">Welcome to the IMPACT Course Faculty Team!</h2>
          
          <p>Dear ${name},</p>
          
          <p>You have been added as a faculty member for the IMPACT Course at Whiston Hospital. Your login credentials are provided below:</p>
          
          <div style="background-color: white; border: 2px solid #005EB8; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #005EB8; margin-top: 0;">Your Login Credentials</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${password}</p>
          </div>
          
          <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://mwl-impact.web.app/login" 
               style="background-color: #005EB8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Access Faculty Dashboard
            </a>
          </div>
          
          <h3 style="color: #005EB8;">What you can do:</h3>
          <ul>
            <li>View your assigned subjects and teaching schedule</li>
            <li>Download course materials for your assigned subjects</li>
            <li>Access course information and candidate details</li>
            <li>Update your profile and contact information</li>
          </ul>
          
          <p>If you have any questions or need assistance, please contact the course administrator.</p>
          
          <p>Best regards,<br>
          IMPACT Course Administration Team<br>
          Whiston Hospital</p>
        </div>
      </div>
    `;

    const success = await sendEmail(email, 'IMPACT Course - Faculty Access Credentials', emailContent);
    
    return { success };
  } catch (error) {
    console.error('Error sending faculty credentials:', error);
    throw new Error('Failed to send faculty credentials');
  }
});

// Test email function
exports.testEmail = onCall(async (request) => {
  try {
    console.log('Testing email configuration...');
    
    const testEmailContent = `
      <h2>IMPACT Course - Email Test</h2>
      <p>This is a test email to verify the email configuration is working correctly.</p>
      <p>If you receive this email, the Resend configuration is working properly.</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
      <p>Best regards,<br>IMPACT Course System</p>
    `;

    const emailSent = await sendEmail(
      'leigh.abbott@merseywestlancs.nhs.uk', 
      'IMPACT Course - Email Test', 
      testEmailContent
    );

    if (emailSent) {
      console.log('Test email sent successfully');
      return { success: true, message: 'Test email sent successfully' };
    } else {
      console.log('Test email failed to send');
      return { success: false, message: 'Test email failed to send' };
    }
  } catch (error) {
    console.error('Error in test email function:', error);
    return { success: false, error: error.message };
  }
});

// Purge all candidates and candidate user accounts (DEBUG ONLY)
exports.purgeAllCandidates = onCall(async (request) => {
  try {
    console.log('Starting purge of all candidates and candidate user accounts...');
    
    // Check if user is authenticated and is admin
    if (!request.auth) {
      console.log('No authentication found');
      return { error: 'Authentication required' };
    }
    
    console.log('User authenticated:', request.auth.uid);
    
    // Get user profile from Firestore to check role
    const userDoc = await db.collection('users').doc(request.auth.uid).get();
    if (!userDoc.exists) {
      console.log('User profile not found in Firestore');
      return { error: 'User profile not found' };
    }
    
    const userProfile = userDoc.data();
    console.log('User profile:', userProfile);
    
    // Check if user is admin
    if (userProfile.role !== 'admin') {
      console.log('User role not authorized:', userProfile.role);
      return { error: 'Admin access required' };
    }

    let deletedCandidates = 0;
    let deletedUsers = 0;
    let deletedNotifications = 0;

    // Delete all candidates
    console.log('Deleting all candidates...');
    const candidatesSnapshot = await db.collection('candidates').get();
    for (const doc of candidatesSnapshot.docs) {
      const candidateData = doc.data();
      
      // If candidate has a userId, delete the Firebase Auth user
      if (candidateData.userId) {
        try {
          await admin.auth().deleteUser(candidateData.userId);
          console.log(`Deleted Firebase Auth user: ${candidateData.userId}`);
          deletedUsers++;
        } catch (error) {
          console.log(`Failed to delete Firebase Auth user ${candidateData.userId}:`, error.message);
        }
      }
      
      // Delete the candidate document
      await doc.ref.delete();
      deletedCandidates++;
    }

    // Delete all candidate user profiles from Firestore
    console.log('Deleting all candidate user profiles...');
    const usersSnapshot = await db.collection('users').where('role', '==', 'candidate').get();
    for (const doc of usersSnapshot.docs) {
      await doc.ref.delete();
      deletedUsers++;
    }

    // Delete all notifications related to candidates
    console.log('Deleting all candidate-related notifications...');
    const notificationsSnapshot = await db.collection('notifications').get();
    for (const doc of notificationsSnapshot.docs) {
      await doc.ref.delete();
      deletedNotifications++;
    }

    console.log(`Purge completed successfully!`);
    console.log(`- Deleted ${deletedCandidates} candidates`);
    console.log(`- Deleted ${deletedUsers} user accounts and profiles`);
    console.log(`- Deleted ${deletedNotifications} notifications`);

    return { 
      success: true, 
      message: 'Purge completed successfully',
      summary: {
        candidatesDeleted: deletedCandidates,
        usersDeleted: deletedUsers,
        notificationsDeleted: deletedNotifications
      }
    };
  } catch (error) {
    console.error('Error purging candidates:', error);
    return { error: 'Failed to purge candidates', details: error.message };
  }
});

// Cleanup deleted programme subjects
exports.cleanupDeletedSubjects = onCall(async (request) => {
  try {
    console.log('Starting cleanup of deleted programme subjects...');
    
    // Check if user is authenticated
    if (!request.auth) {
      console.log('No authentication found');
      return { error: 'Authentication required' };
    }
    
    console.log('User authenticated:', request.auth.uid);
    
    // Get user profile from Firestore to check role
    const userDoc = await db.collection('users').doc(request.auth.uid).get();
    if (!userDoc.exists) {
      console.log('User profile not found in Firestore');
      return { error: 'User profile not found' };
    }
    
    const userProfile = userDoc.data();
    console.log('User profile:', userProfile);
    
    // Check if user is admin
    if (userProfile.role !== 'admin') {
      console.log('User role not authorized:', userProfile.role);
      return { error: 'Admin access required' };
    }

    const { retentionDays = 30 } = request.data;
    console.log(`Cleanup retention days: ${retentionDays}`);
    
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    console.log(`Cutoff date: ${cutoffDate.toISOString()}`);
    
    // Query for subjects that are deleted and older than retention period
    const deletedSubjectsQuery = db.collection('programmeSubjects')
      .where('deleted', '==', true)
      .where('deletedAt', '<', cutoffDate);
    
    const deletedSubjectsSnapshot = await deletedSubjectsQuery.get();
    console.log(`Found ${deletedSubjectsSnapshot.size} subjects to delete permanently`);
    
    let deletedCount = 0;
    let errorCount = 0;
    
    // Delete each subject permanently
    for (const doc of deletedSubjectsSnapshot.docs) {
      try {
        await doc.ref.delete();
        deletedCount++;
        console.log(`Permanently deleted subject: ${doc.id}`);
      } catch (error) {
        errorCount++;
        console.error(`Failed to delete subject ${doc.id}:`, error.message);
      }
    }
    
    console.log(`Cleanup completed successfully!`);
    console.log(`- Permanently deleted ${deletedCount} subjects`);
    console.log(`- Failed to delete ${errorCount} subjects`);
    
    return { 
      success: true, 
      message: 'Cleanup completed successfully',
      summary: {
        subjectsDeleted: deletedCount,
        errors: errorCount,
        retentionDays: retentionDays,
        cutoffDate: cutoffDate.toISOString()
      }
    };
  } catch (error) {
    console.error('Error cleaning up deleted subjects:', error);
    return { error: 'Failed to cleanup deleted subjects', details: error.message };
  }
});



// Scheduled cleanup of deleted programme subjects - runs every 30 days
exports.scheduledCleanupDeletedSubjects = onSchedule({
  schedule: '0 2 * * 0', // Every Sunday at 2 AM
  timeZone: 'Europe/London',
  retryCount: 3
}, async (event) => {
  try {
    console.log('Starting scheduled cleanup of deleted programme subjects...');
    
    const retentionDays = 30; // Keep deleted subjects for 30 days
    console.log(`Cleanup retention days: ${retentionDays}`);
    
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    console.log(`Cutoff date: ${cutoffDate.toISOString()}`);
    
    // Query for subjects that are deleted and older than retention period
    const deletedSubjectsQuery = db.collection('programmeSubjects')
      .where('deleted', '==', true)
      .where('deletedAt', '<', cutoffDate);
    
    const deletedSubjectsSnapshot = await deletedSubjectsQuery.get();
    console.log(`Found ${deletedSubjectsSnapshot.size} subjects to delete permanently`);
    
    let deletedCount = 0;
    let errorCount = 0;
    
    // Delete each subject permanently
    for (const doc of deletedSubjectsSnapshot.docs) {
      try {
        await doc.ref.delete();
        deletedCount++;
        console.log(`Permanently deleted subject: ${doc.id}`);
      } catch (error) {
        errorCount++;
        console.error(`Failed to delete subject ${doc.id}:`, error.message);
      }
    }
    
    console.log(`Scheduled cleanup completed successfully!`);
    console.log(`- Permanently deleted ${deletedCount} subjects`);
    console.log(`- Failed to delete ${errorCount} subjects`);
    
    // Log the results for monitoring
    await db.collection('cleanupLogs').add({
      timestamp: new Date(),
      type: 'scheduled_cleanup',
      subjectsDeleted: deletedCount,
      errors: errorCount,
      retentionDays: retentionDays,
      cutoffDate: cutoffDate.toISOString(),
      success: true
    });
    
  } catch (error) {
    console.error('Error in scheduled cleanup:', error);
    
    // Log the error for monitoring
    try {
      await db.collection('cleanupLogs').add({
        timestamp: new Date(),
        type: 'scheduled_cleanup',
        error: error.message,
        success: false
      });
    } catch (logError) {
      console.error('Failed to log cleanup error:', logError);
    }
  }
});
