# IMPACT Course Administration System - Manual Setup Instructions

## 🎯 Overview

This document provides comprehensive setup instructions for the IMPACT Course Administration System. The system is built on Firebase and requires proper configuration of all Firebase services, security rules, and environment variables.

## 📋 Prerequisites

### Required Software
- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher
- **Firebase CLI**: Latest version (`npm install -g firebase-tools`)
- **Git**: For version control

### Required Accounts
- **Firebase Account**: Create at [Firebase Console](https://console.firebase.google.com/)
- **Email Service**: Gmail, SendGrid, or other SMTP provider
- **GitHub Account**: For code repository (optional)

## 🚀 Step-by-Step Setup

### 1. Project Initialization

#### Clone or Download the Project
```bash
# If using Git
git clone <repository-url>
cd IMPACT

# Or download and extract the project files
# Navigate to the project directory
cd IMPACT
```

#### Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 2. Firebase Project Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `mwl-impact` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

#### Enable Required Services
1. **Authentication**
   - Go to Authentication → Sign-in method
   - Enable Email/Password authentication
   - Configure authorized domains if needed

2. **Firestore Database**
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in production mode"
   - Select location (preferably `europe-west2` for UK)

3. **Storage**
   - Go to Storage
   - Click "Get started"
   - Choose "Start in production mode"
   - Select location (same as Firestore)

4. **Cloud Functions**
   - Go to Functions
   - Click "Get started"
   - Enable billing (required for Cloud Functions)

5. **Hosting**
   - Go to Hosting
   - Click "Get started"
   - Follow the setup wizard

#### Configure Firebase CLI
```bash
# Login to Firebase
firebase login

# Initialize Firebase in the project
firebase init

# Select the following services:
# - Firestore
# - Storage
# - Hosting (use 'dist' as public directory)
# - Functions
# - Emulators (optional for development)
```

### 3. Firebase Configuration

#### Update Firebase Config
Edit `src/firebase/config.js` with your project details:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

#### Get Configuration Values
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click the web app icon (</>)
4. Copy the configuration values

### 4. Security Rules Configuration

#### Firestore Security Rules
Deploy the security rules from `firestore.rules`:

```bash
firebase deploy --only firestore:rules
```

#### Storage Security Rules
Deploy the storage rules from `storage.rules`:

```bash
firebase deploy --only storage
```

### 5. Email Configuration

#### Set Up Email Service
The system uses Nodemailer for sending emails. Configure your email service:

**For Gmail:**
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in configuration

**For SendGrid:**
1. Create a SendGrid account
2. Generate an API key
3. Use the API key in configuration

#### Configure Environment Variables
```bash
# Set email configuration
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.pass="your-app-password"

# For SendGrid (alternative)
firebase functions:config:set email.sendgrid_key="your-sendgrid-api-key"
```

### 6. Database Initialization

#### Create Initial Collections
The system will create collections automatically, but you can pre-populate with initial data:

```javascript
// Example: Create initial admin user
// This should be done through the application interface
// or manually in Firestore Console
```

#### Required Collections Structure
The system uses these collections:
- `users` - User accounts and roles
- `candidates` - Candidate applications
- `courses` - Course configurations
- `faculty` - Faculty member information
- `courseMaterials` - Uploaded materials
- `programmeSubjects` - Course programme
- `assessments` - Assessment data
- `emailTemplates` - Email templates
- `notifications` - System notifications
- `unsuccessfulCandidates` - Failed candidates

### 7. Cloud Functions Deployment

#### Deploy All Functions
```bash
# Deploy all Cloud Functions
firebase deploy --only functions

# Or deploy specific functions
firebase deploy --only functions:activateCandidate
firebase deploy --only functions:sendBulkEmails
firebase deploy --only functions:exportCandidateData
firebase deploy --only functions:updateCourseSettings
firebase deploy --only functions:handleUnsuccessfulCandidate
firebase deploy --only functions:generateCertificates
firebase deploy --only functions:updateEmailTemplate
firebase deploy --only functions:getEmailTemplates
firebase deploy --only functions:sendFacultyCredentials
```

#### Verify Functions
1. Go to Firebase Console → Functions
2. Verify all functions are deployed and active
3. Check function logs for any errors

### 8. Frontend Build and Deployment

#### Build the Application
```bash
# Build for production
npm run build
```

#### Deploy to Firebase Hosting
```bash
# Deploy to hosting
firebase deploy --only hosting
```

### 9. Initial Setup and Configuration

#### Create First Admin User
1. Deploy the application
2. Access the application URL
3. Use Firebase Console to manually create the first admin user:
   - Go to Authentication → Users
   - Add user with admin email
   - Go to Firestore → users collection
   - Create document with admin role

#### Initialize Email Templates
1. Login as admin
2. Go to Email Templates section
3. Click "Initialize Templates" to create default templates

#### Create First Course
1. Login as admin
2. Go to Course Management
3. Click "Create New Course"
4. Fill in course details

## 🔧 Configuration Details

### Environment Variables

#### Required Variables
```bash
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Firebase Configuration (in firebase config)
API_KEY=your-api-key
AUTH_DOMAIN=your-project.firebaseapp.com
PROJECT_ID=your-project-id
STORAGE_BUCKET=your-project.appspot.com
MESSAGING_SENDER_ID=your-sender-id
APP_ID=your-app-id
```

#### Optional Variables
```bash
# For development
NODE_ENV=development
FIREBASE_EMULATOR_HOST=localhost
FIREBASE_EMULATOR_PORT=8080

# For production monitoring
SENTRY_DSN=your-sentry-dsn
```

### Security Configuration

#### Firestore Rules
The system includes comprehensive security rules:
- Role-based access control
- User data protection
- Admin-only operations
- Faculty and candidate restrictions

#### Storage Rules
File upload security:
- Authenticated users only
- File type restrictions
- Size limitations
- Path-based access control

### Email Template Configuration

#### Default Templates
The system includes these default templates:
- Welcome Email
- Payment Reminder
- E-Learning Reminder
- Course Reminder
- Supervisor Notification

#### Template Variables
Available variables for templates:
- `{{firstName}}` - Candidate's first name
- `{{surname}}` - Candidate's surname
- `{{email}}` - Candidate's email
- `{{courseDate}}` - Course start date
- `{{venue}}` - Course venue
- `{{courseCost}}` - Course cost
- `{{generatedPassword}}` - Generated password
- `{{eLearningUrl}}` - E-learning URL

## 🧪 Testing and Verification

### Function Testing
```bash
# Test Cloud Functions locally
firebase emulators:start --only functions

# Test specific functions
firebase functions:shell
```

### Application Testing
```bash
# Start development server
npm run dev

# Test production build
npm run build
npm run preview
```

### Security Testing
1. Test authentication flows
2. Verify role-based access
3. Test file upload restrictions
4. Verify email functionality

## 📊 Monitoring and Maintenance

### Firebase Console Monitoring
1. **Functions**: Monitor function execution and errors
2. **Firestore**: Monitor database usage and performance
3. **Storage**: Monitor file uploads and downloads
4. **Authentication**: Monitor user sign-ins and security

### Logging and Debugging
```bash
# View function logs
firebase functions:log

# View hosting logs
firebase hosting:log

# View all logs
firebase logs
```

### Performance Monitoring
1. Monitor Firestore read/write operations
2. Track function execution times
3. Monitor storage usage
4. Track authentication events

## 🔄 Updates and Maintenance

### Regular Maintenance Tasks
1. **Security Updates**: Keep dependencies updated
2. **Backup**: Regular database backups
3. **Monitoring**: Check system health regularly
4. **Updates**: Deploy security and feature updates

### Update Process
```bash
# Update dependencies
npm update

# Update Cloud Functions
cd functions
npm update
cd ..

# Deploy updates
firebase deploy
```

## 🆘 Troubleshooting

### Common Issues

#### CORS Errors
- Ensure Cloud Functions have CORS configured
- Check function deployment status
- Verify function URLs are correct

#### Authentication Issues
- Check Firebase Authentication settings
- Verify user roles in Firestore
- Check security rules configuration

#### Email Sending Issues
- Verify email credentials
- Check function logs for errors
- Test email configuration

#### File Upload Issues
- Check Storage security rules
- Verify file type restrictions
- Check file size limits

### Debug Commands
```bash
# Check Firebase project status
firebase projects:list

# Check function status
firebase functions:list

# Check hosting status
firebase hosting:list

# View detailed logs
firebase logs --only functions
```

## 📞 Support and Resources

### Documentation
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://reactjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Community Support
- [Firebase Community](https://firebase.google.com/community)
- [React Community](https://reactjs.org/community)
- [Stack Overflow](https://stackoverflow.com)

### Emergency Contacts
For critical issues with the IMPACT Course system:
- **Technical Support**: Contact development team
- **Course Administration**: Contact course administrators
- **Firebase Support**: [Firebase Support](https://firebase.google.com/support)

---

**Setup Status**: Complete  
**Last Updated**: December 2024  
**Version**: 1.0.0  
**Environment**: Production Ready
