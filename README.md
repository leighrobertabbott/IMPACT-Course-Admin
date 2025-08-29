# IMPACT Course Management System

A comprehensive web application for managing the IMPACT (Ill Medical Patients' Acute Care and Treatment) Course at Whiston Hospital. Built with React, Firebase, and Tailwind CSS, featuring advanced course management, candidate tracking, and automated prospectus generation.

![IMPACT Course System](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Cloud-orange?style=for-the-badge&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🚀 Features

### **🚀 One-Click Provisioning** *(NEW)*
- **"Get your own IMPACT Management System"** button on the landing page
- **Google OAuth integration** for secure authentication
- **Automatic Firebase project creation** with all required services
- **Firestore database setup** with proper security rules
- **Firebase Hosting deployment** with your app
- **First-run setup wizard** for admin account creation
- **Complete isolation** - each hospital gets their own Firebase project

### **🎓 Course Management**
- Create and manage multiple course sessions with full lifecycle management
- Set course dates, venues, and capacity limits with real-time tracking
- Archive and reactivate courses with complete data preservation
- Advanced programme builder with drag-and-drop functionality
- Template-based programme creation for consistency

### **👥 Candidate Management**
- Comprehensive candidate application tracking with status progression
- Payment status management (Prospective → Pending Payment → Paid → Live Candidate)
- Advanced filtering, search, and export capabilities (CSV/JSON)
- Detailed candidate profiles with photo requirements and assessment tracking
- Automated email notifications and communication workflows

### **📊 Assessment Management**
- Track candidate performance across multiple criteria with detailed analytics
- Generate professional certificates for successful candidates
- Export comprehensive assessment reports and analytics
- Handle unsuccessful candidates with proper notifications and follow-up

### **🏥 Faculty Management**
- Complete faculty member lifecycle management (CRUD operations)
- **Subject-level assignments** to specific course sessions and workshops
- **Course-specific mentor assignments** for group mentoring (A, B, C, D)
- **Global faculty pool** with course-specific subject assignments
- **Mentor preferences system** allowing faculty to opt-in for mentoring roles
- Track faculty credentials, availability, and specializations
- Automated faculty notification system with email templates
- **Faculty dashboard** showing assigned subjects across all active courses

### **📍 Location Management** *(NEW)*
- **Comprehensive venue management** with detailed location information
- **Photo upload capabilities** with drag-and-drop interface and validation
- **Google Maps integration** for venue coordinates and directions
- **Parking and accessibility information** for candidate guidance
- **Facility details** including WiFi, catering, audio/visual equipment
- **Contact information management** for venue coordination

### **📄 Dynamic Prospectus Generation** *(ENHANCED)*
- **Professional PDF prospectuses** with NHS branding and course details
- **Dynamic venue information** pulled from location management system
- **Faculty biographies and credentials** automatically included
- **Detailed programme schedules** with workshop rotations
- **Practical information** including directions, parking, and facilities
- **Photo integration** from venue management system

### **🏢 General Office Integration**
- Payment processing and receipt management with real-time updates
- Course capacity monitoring with automated alerts
- Comprehensive email notification system
- Real-time status updates and candidate tracking

### **🔐 User Management & Security**
- Role-based access control (Admin, Faculty, General Office, Candidates)
- Secure authentication with Firebase Auth and session management
- Profile management with photo upload capabilities
- Comprehensive audit trails and activity logging

## 🛠️ Technology Stack

### **Frontend**
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework with NHS design system
- **Lucide React** - Beautiful, customizable icons
- **React Hot Toast** - Elegant notifications and user feedback

### **Backend & Infrastructure**
- **Firebase Firestore** - NoSQL database with real-time synchronization
- **Firebase Auth** - Secure authentication and user management
- **Firebase Functions** - Serverless backend with comprehensive API
- **Firebase Storage** - File storage for photos and documents
- **Firebase Hosting** - Global CDN hosting with SSL

### **Development Tools**
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **Git** - Version control with GitHub integration

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Firebase account** and project setup
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/leighrobertabbott/IMPACT-Course-Admin.git
cd IMPACT-Course-Admin
```

### 2. Install Dependencies
```bash
npm install
cd functions && npm install && cd ..
```

### 3. Firebase Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable the following services:
   - **Authentication** (Email/Password)
   - **Firestore Database**
   - **Cloud Functions**
   - **Storage**
   - **Hosting**

#### Configure Firebase
1. Create `src/firebase/config.js`:
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
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
export const functions = getFunctions(app);
export const storage = getStorage(app);
```

### 4. Environment Variables
Create `.env` file in the root directory:
```env
# App Configuration
VITE_APP_URL=https://your-domain.example
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# Firebase Configuration (for your main site)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Build Configuration
VITE_BUILD_DIR=dist
VITE_FIRESTORE_REGION=europe-west2

# Email Configuration (for your main site)
VITE_RESEND_API_KEY=your-resend-api-key
```

### 5. Run Development Server
### 5. Complete Provisioning System Setup

The provisioning system creates **exact replicas** of your IMPACT Course Management System for other hospitals. Each hospital gets their own isolated Firebase project with the complete application.

#### Prerequisites
- **Google Cloud Project** with billing enabled
- **Firebase CLI** installed globally
- **Git** installed
- **Node.js 16+** installed

#### Quick Setup (Automated)
```bash
# Run the automated setup script
node deploy-template.js
```

#### Manual Setup

1. **Create Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable billing (required for creating new projects)
   - Enable the following APIs:
     - Google+ API
     - Cloud Resource Manager API
     - Service Usage API
     - Firebase Management API

2. **Create OAuth 2.0 Credentials**:
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URI: `https://your-domain.example/provision/callback`
   - Copy the Client ID and Client Secret

3. **Configure Environment Variables**:
   ```bash
   # Copy the template
   cp .env.template .env.local
   
   # Edit .env.local with your values
   VITE_APP_URL=https://your-domain.example
   VITE_GOOGLE_CLIENT_ID=your-oauth-client-id
   VITE_GOOGLE_CLIENT_SECRET=your-oauth-client-secret
   ```

4. **Deploy Firebase Functions**:
   ```bash
   cd functions
   npm install
   firebase deploy --only functions
   ```

5. **Test the System**:
   - Visit your landing page
   - Click "Get your own IMPACT Management System"
   - Complete the OAuth flow
   - Verify a complete IMPACT instance is created

### 6. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Build and Deploy

### Build for Production
```bash
npm run build
```

### Deploy to Firebase
```bash
npm run deploy
```

## 📁 Project Structure

```
IMPACT-Course-Admin/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── LocationManagementModal.jsx    # Venue management
│   │   ├── ProspectusGenerator.jsx        # PDF generation
│   │   ├── FacultyManagementModal.jsx     # Faculty CRUD
│   │   └── ...
│   ├── contexts/           # React contexts
│   │   └── AuthContext.jsx # Authentication state
│   ├── firebase/           # Firebase configuration
│   │   └── config.js       # Firebase services
│   ├── pages/              # Main application pages
│   │   ├── AdminPanel.jsx  # Admin dashboard
│   │   ├── CourseManagement.jsx # Course CRUD
│   │   └── ...
│   ├── utils/              # Utility functions
│   │   └── cloudFunctions.js # API wrappers
│   ├── index.css           # Global styles
│   └── main.jsx           # Application entry point
├── functions/              # Firebase Cloud Functions
├── docs/                   # Documentation
│   └── CODE_INDEX.md      # Code architecture guide
├── Documentation/          # Course documentation
└── public/                # Static assets
```

## 🔐 Security Features

- **Authentication**: Firebase Auth with email/password and session management
- **Authorization**: Role-based access control with route protection
- **Data Validation**: Comprehensive Firestore security rules
- **Secure Functions**: Cloud Functions with authentication and validation
- **File Security**: Firebase Storage with access control and validation

## 📧 Email Integration

The system includes comprehensive automated email notifications:

- **Application Confirmations** - Welcome emails with course details
- **Payment Reminders** - Automated payment status updates
- **Course Updates** - Schedule changes and venue information
- **Assessment Results** - Performance feedback and certificates
- **Faculty Assignments** - Teaching schedule notifications
- **Prospectus Distribution** - Course information packages

## 🎨 UI/UX Features

- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Side Navigation** - Persistent navigation with role-based menus
- **Real-time Updates** - Live data synchronization across all users
- **Loading States** - Smooth user experience with progress indicators
- **Error Handling** - Comprehensive error management with user-friendly messages
- **Toast Notifications** - Elegant user feedback system
- **Photo Management** - Drag-and-drop file uploads with preview
- **Data Export** - CSV and JSON export capabilities

## 🔧 Configuration

### Firebase Functions
The application uses several Firebase Functions for backend operations:

- `activateCandidate` - Activates candidates after payment confirmation
- `sendBulkEmails` - Sends bulk email notifications
- `exportCandidateData` - Exports candidate data in various formats
- `generateCertificates` - Generates completion certificates
- `updateEmailTemplates` - Manages email template updates
- `handleUnsuccessfulCandidate` - Processes unsuccessful candidates

### Customization Options

- **Styling**: Modify `src/index.css` and `tailwind.config.js` for custom styles
- **Components**: Add new components in `src/components/`
- **Pages**: Create new pages in `src/pages/` with proper routing
- **Functions**: Extend Firebase Functions in `functions/`
- **Email Templates**: Customize email templates via admin panel

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow the existing code style and architecture patterns
- Update `docs/CODE_INDEX.md` for any new components or major changes
- Test thoroughly before submitting PRs
- Include appropriate error handling and user feedback

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**IMPACT Course Team - Whiston Hospital**
- **Course Administration** - Course planning and management
- **Faculty Management** - Teaching staff coordination
- **Technical Support** - System maintenance and development
- **General Office** - Payment processing and candidate support

## 📞 Support

For technical support or questions:

- **Email**: impact@sthk.nhs.uk
- **Project Issues**: [GitHub Issues](https://github.com/leighrobertabbott/IMPACT-Course-Admin/issues)
- **Documentation**: Check `docs/CODE_INDEX.md` for technical details

## 🔄 Version History

- **v1.3.0** - Location Management & Enhanced Prospectus Generation
  - Added comprehensive venue management with photo uploads
  - Enhanced prospectus generation with dynamic location data
  - Improved UI/UX with better navigation and feedback
- **v1.2.0** - Improved candidate management and assessment features
- **v1.1.0** - Added sidebar navigation and enhanced UI
- **v1.0.0** - Initial release with core functionality

## 🚀 Live Demo

Visit the live application: [IMPACT Course Management System](https://mwl-impact.web.app)

---

**Built with ❤️ for the NHS IMPACT Course Team at Whiston Hospital**

*Empowering healthcare professionals through advanced interventional cardiology education*

## One-Click Setup (For Hospital Administrators)

### Get Your Own IMPACT Management System

Want to run IMPACT courses at your hospital? Choose the option that works best for you.

## Option 1: We'll Set It Up For You (Recommended)

**Best for:** Non-technical users, hospital administrators, anyone who wants it done for them

#### How It Works

1. **Email us** at setup@impact-course.com
2. **Tell us your hospital name** and contact details
3. **We'll create your IMPACT system** and send you the login details
4. **You'll get a live website** like: https://your-hospital-impact.web.app

#### What We Do For You

- ✅ **Create your Firebase project** with your hospital name
- ✅ **Set up your database** for course data
- ✅ **Deploy your website** with all features
- ✅ **Create your admin account** ready to use
- ✅ **Send you login details** and instructions

#### Start Setup

**Email us:** setup@impact-course.com

**Or call:** 0151 705 7428

**Cost:** Free setup service

---

## Option 2: Technical Deployment Options

### Render Deployment

**Best for:** Users comfortable with web platforms

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/leighrobertabbott/IMPACT-Course-Admin)

### Vercel Deployment

**Best for:** Users familiar with development platforms

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Google Cloud Shell (Advanced)

**Best for:** Technical users who want their own Firebase project

**Note:** This option requires technical knowledge. After opening Cloud Shell, run:
1. `chmod +x setup-impact.sh`
2. `./setup-impact.sh`

[![Open in Google Cloud Shell](https://gstatic.com/cloudssh/images/open-btn.svg)](https://shell.cloud.google.com/cloudshell/open?cloudshell_git_repo=https://github.com/leighrobertabbott/IMPACT-Course-Admin&cloudshell_working_dir=/&force_new_clone=true)

---

## Your Live Site

Once setup is complete, you'll get a URL like:
- **We set it up:** `https://your-hospital-impact.web.app`
- **Render:** `https://your-site-name.onrender.com`
- **Vercel:** `https://your-site-name.vercel.app`
- **Cloud Shell:** `https://your-site-name-abc123.web.app`

## Next Steps

1. Complete the admin setup wizard to create your first user account
2. Add your hospital details and contact information
3. Create your first IMPACT course and add faculty members
4. Start accepting candidate applications

## Technical Requirements

- **We set it up:** No technical knowledge required
- **Render/Vercel:** Web platform accounts (free)
- **Cloud Shell:** Google account, basic familiarity with terminals

## Support

Need help? Contact us at support@impact-course.com or call 0151 705 7428
