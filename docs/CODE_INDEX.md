# IMPACT Course System - Code Index

## Overview
This document provides a comprehensive index of the IMPACT Course Management System codebase, organized by folder structure with key files, exports, usage patterns, and single sources of truth.

## Root Level Files

| File | Purpose | Key Exports | Usage | Single Source of Truth |
|------|---------|-------------|-------|------------------------|
| `package.json` | Project dependencies and scripts | React, Vite, Firebase, Tailwind | Build system configuration | ✅ |
| `package-lock.json` | Dependency lock file | Exact dependency versions | Reproducible builds | ✅ |
| `vite.config.js` | Vite build configuration | Development server, build settings | Development and production builds | ✅ |
| `tailwind.config.js` | Tailwind CSS configuration | NHS color scheme, custom styles | Global styling system | ✅ |
| `postcss.config.js` | PostCSS configuration | CSS processing pipeline | Build optimization | ✅ |
| `firebase.json` | Firebase project configuration | Hosting, functions, firestore rules | Deployment configuration | ✅ |
| `.firebaserc` | Firebase project selection | Project ID and aliases | Multi-project management | ✅ |
| `firestore.rules` | Firestore security rules | Database access permissions | Data security | ✅ |
| `firestore.indexes.json` | Firestore indexes | Database query optimization | Performance tuning | ✅ |
| `storage.rules` | Firebase Storage rules | File upload permissions | File security | ✅ |
| `index.html` | HTML entry point | Root DOM element | Application bootstrap | ✅ |
| `README.md` | Project documentation | Setup and usage instructions | Developer onboarding | ✅ |
| `IMPLEMENTATION_SUMMARY.md` | System documentation | Architecture and features | System overview | ✅ |
| `FEATURE_AUDIT.md` | Feature documentation | System capabilities | Feature reference | ✅ |
| `EMAIL_SETUP.md` | Email configuration | Email system setup | Email integration | ✅ |
| `manual-setup-instructions.md` | Setup guide | Installation steps | Deployment guide | ✅ |
| `setup-email.js` | Email setup script | Email configuration automation | Email system setup | ✅ |
| `test-email.js` | Email testing script | Email functionality testing | Email validation | ✅ |

## Source Code Structure (`src/`)

### Components (`src/components/`)

| Component | Purpose | Key Exports | Usage | Single Source of Truth |
|-----------|---------|-------------|-------|------------------------|
| `Header.jsx` | Navigation and user menu | Header component with role-based navigation | All authenticated pages | ✅ |
| `ProtectedRoute.jsx` | Route protection wrapper | Route guards for role-based access | App.jsx routing | ✅ |
| `ErrorBoundary.jsx` | Error handling wrapper | Error catching and display | App.jsx root wrapper | ✅ |
| `PhotoRequirement.jsx` | Photo upload enforcement | Photo validation for candidates | Candidate dashboard/profile | ✅ |
| `EmailTemplateManager.jsx` | Email template CRUD | Template management interface | Admin panel | ✅ |
| `ProgrammeBuilderModal.jsx` | Course programme creation | Drag-drop programme builder | Course management | ✅ |
| `EnhancedProgrammeDisplay.jsx` | Programme visualization | Interactive programme display | Candidate dashboard | ✅ |
| `FacultyManagementModal.jsx` | Faculty member management | Faculty CRUD operations | Admin panel | ✅ |
| `MentorAssignmentModal.jsx` | Course-specific mentor assignments | Mentor assignment to course groups (A, B, C, D) | Admin panel | ✅ |
| `ProspectusGenerator.jsx` | Course prospectus generation | PDF prospectus creation with course details | Admin panel, Course management | ✅ |
| `LocationManagementModal.jsx` | Venue location management | Location CRUD with photo uploads and venue details | Admin panel | ✅ |

### Faculty-Course Association System

| Component | Purpose | Assignment Type | Scope | Usage |
|-----------|---------|----------------|-------|-------|
| `FacultyManagementModal.jsx` | Global faculty creation | Global faculty pool | System-wide | Admin panel - creates faculty members |
| `assignFacultyToSubject()` | Subject-level assignments | Programme subjects | Course-specific | Course Manager & Admin Panel - assigns faculty to subjects |
| `MentorAssignmentModal.jsx` | Mentor assignments | Course groups (A, B, C, D) | Course-specific | Admin Panel - assigns mentors to course groups |
| `FacultyDashboard.jsx` | Faculty view assignments | Display assigned subjects | Faculty perspective | Faculty members - view their assignments |

**Key Concepts:**
- **Global Faculty Pool**: Faculty members exist globally and can be assigned to subjects across multiple courses
- **Subject-Level Assignments**: Faculty are assigned to specific programme subjects, not directly to courses
- **Course Manager vs Admin Panel**: Course Manager handles subject assignments within selected course; Admin Panel handles global faculty creation + mentor assignments
- **Mentor System**: Separate from subject assignments, mentors are assigned to course groups for candidate mentoring
- **Faculty Dashboard**: Shows assigned subjects across all active courses where faculty have subject assignments

### Pages (`src/pages/`)

| Page | Purpose | Key Exports | Usage | Single Source of Truth |
|------|---------|-------------|-------|------------------------|
| `App.jsx` | Main application router | Route definitions and layout | Application entry point | ✅ |
| `LandingPage.jsx` | Public course information | Course overview and application link | Public homepage | ✅ |
| `ApplicationForm.jsx` | Candidate application form | Application submission | Public application process | ✅ |
| `Login.jsx` | User authentication | Login/logout functionality | Authentication flow | ✅ |
| `Dashboard.jsx` | Role-based dashboard | Personalized dashboard views with sidebar navigation | Authenticated user home | ✅ |
| `AdminPanel.jsx` | Administrative interface | System administration tools with location management | Admin users | ✅ |
| `CourseManagement.jsx` | Course CRUD operations | Course lifecycle management | Admin users | ✅ |
| `CandidateManagement.jsx` | Candidate data management | Candidate status and data with sidebar navigation | Admin/General Office | ✅ |
| `GeneralOfficeView.jsx` | Payment and status management | Payment processing interface with sidebar navigation | General Office staff | ✅ |
| `FacultyDashboard.jsx` | Faculty member interface | Teaching schedule and materials with sidebar navigation | Faculty members | ✅ |
| `AssessmentManagement.jsx` | Assessment creation/tracking | Assessment lifecycle with sidebar navigation | Admin users | ✅ |
| `Profile.jsx` | User profile management | Profile editing and photo upload | All authenticated users | ✅ |
| `GeneralOfficeTutorial.jsx` | Staff training interface | Tutorial and guidance | General Office onboarding | ✅ |
| `ProvisionStart.jsx` | OAuth initiation page | Google OAuth flow start | Provisioning system | ✅ |
| `ProvisionCallback.jsx` | OAuth callback handler | OAuth response processing | Provisioning system | ✅ |
| `ProvisionConfirm.jsx` | Site name collection | Site slug input and validation | Provisioning system | ✅ |
| `ProvisionDone.jsx` | Success page | Live site URL and next steps | Provisioning system | ✅ |
| `Setup.jsx` | First-run admin setup | Hospital and admin configuration | Deployed IMPACT sites | ✅ |

### Contexts (`src/contexts/`)

| Context | Purpose | Key Exports | Usage | Single Source of Truth |
|---------|---------|-------------|-------|------------------------|
| `AuthContext.jsx` | Authentication state management | `useAuth()`, user state, auth methods | Global authentication | ✅ |

### Firebase (`src/firebase/`)

| File | Purpose | Key Exports | Usage | Single Source of Truth |
|------|---------|-------------|-------|------------------------|
| `config.js` | Firebase service initialization | `auth`, `db`, `storage`, `functions` | All Firebase interactions | ✅ |

### Utils (`src/utils/`)

| File | Purpose | Key Exports | Usage | Single Source of Truth |
|------|---------|-------------|-------|------------------------|
| `cloudFunctions.js` | Cloud Function wrappers | `cloudFunctions` object with error handling | Backend API calls | ✅ |
| `google.js` | Google API helper functions | `gapi`, `exchangeCodeForTokens`, `randomId` | OAuth and Google Cloud API calls | ✅ |
| `provisionApi.js` | Provisioning API functions | `provisionApi` object with OAuth and provisioning methods | Frontend provisioning flow | ✅ |

### Entry Points (`src/`)

| File | Purpose | Key Exports | Usage | Single Source of Truth |
|------|---------|-------------|-------|------------------------|
| `main.jsx` | Application entry point | React app bootstrap with providers | Application startup | ✅ |
| `index.css` | Global styles | Tailwind imports and custom CSS | Global styling | ✅ |

## Backend Structure (`functions/`)

| File | Purpose | Key Exports | Usage | Single Source of Truth |
|------|---------|-------------|-------|------------------------|
| `index.js` | Cloud Functions implementation | All backend API endpoints including provisioning functions | Serverless backend logic | ✅ |
| `package.json` | Function dependencies | Node.js packages for functions | Backend dependencies | ✅ |

## Documentation (`Documentation/`)

| File | Purpose | Key Content | Usage | Single Source of Truth |
|------|---------|-------------|-------|------------------------|
| `IMPACT Programme.doc` | Course programme template | Programme structure and content | Course creation reference | ✅ |
| `Candidate Registration Form - MANDATORY.DOCX` | Application form template | Required application fields | Application process | ✅ |
| `Guide.docx` | System user guide | User instructions and workflows | User training | ✅ |
| `Candidate E-learning Access.docx` | E-learning setup guide | E-learning platform access | Candidate onboarding | ✅ |
| `Faculty and Facility Equipment Requirements.docx` | Resource requirements | Equipment and facility needs | Course planning | ✅ |
| `Candidate Confirmation.docx` | Confirmation template | Confirmation letter format | Communication templates | ✅ |
| `Candidate Datasource.xlsx` | Data structure reference | Candidate data fields | Data management | ✅ |

## Build Output (`dist/`)

| Folder | Purpose | Contents | Usage | Single Source of Truth |
|--------|---------|----------|-------|------------------------|
| `assets/` | Compiled application assets | JS, CSS, and map files | Production deployment | Generated |
| `index.html` | Production HTML entry point | Optimized HTML with asset references | Production hosting | Generated |

## Key Architecture Patterns

### Single Sources of Truth
- **Authentication**: `AuthContext.jsx` - Centralized user state and auth methods
- **Firebase Config**: `src/firebase/config.js` - All Firebase service instances
- **Routing**: `src/App.jsx` - Centralized route definitions with role-based protection
- **Styling**: `tailwind.config.js` - Global design system configuration with NHS color scheme
- **Backend API**: `functions/index.js` - All serverless function implementations
- **Cloud Functions**: `src/utils/cloudFunctions.js` - Frontend API call wrappers with error handling
- **Error Handling**: `ErrorBoundary.jsx` - Global error catching and user-friendly error display
- **Security**: `ProtectedRoute.jsx` - Role-based route protection and access control
- **Location Management**: `LocationManagementModal.jsx` - Venue data management with photo uploads
- **Prospectus Generation**: `ProspectusGenerator.jsx` - Dynamic PDF generation with location data
- **Provisioning System**: `provisionApi.js` + Firebase Functions - Complete OAuth and Firebase project provisioning

### Data Flow Patterns
1. **Authentication Flow**: Login → AuthContext → Protected Routes → Role-Based Redirects
2. **Role-Based Access**: User Profile → Route Guards → Role-Specific Pages → Component-Level Protection
3. **API Communication**: Components → Cloud Functions → Firebase Services → Error Handling → User Feedback
4. **State Management**: Context Providers → Component Consumption → Real-Time Updates
5. **Error Handling**: ErrorBoundary → User-Friendly Messages → Recovery Options
6. **Location Management**: Admin Panel → Location CRUD → Firebase Storage (photos) → Prospectus Generation
7. **Prospectus Generation**: Course Selection → Location Data → Faculty Data → Programme Data → PDF Generation

### Security Patterns
- **Route Protection**: `ProtectedRoute.jsx` enforces role-based access with automatic redirects
- **Firestore Rules**: `firestore.rules` controls database access with granular permissions
- **Storage Rules**: `storage.rules` controls file upload permissions and validation
- **Authentication**: Firebase Auth with role-based user profiles and secure session management
- **Input Validation**: Form validation with React Hook Form and server-side validation
- **Error Handling**: Secure error messages that don't expose sensitive information

## Development Workflow

### Frontend Development
- **Entry Point**: `src/main.jsx` → `src/App.jsx` → ErrorBoundary wrapper
- **Component Structure**: Pages → Components → Utils with proper separation of concerns
- **Styling**: Tailwind CSS with NHS design system and responsive design
- **State Management**: React Context for global state with proper error handling
- **Form Handling**: React Hook Form with validation and error display
- **User Feedback**: Toast notifications for all user actions and errors

### Backend Development
- **Entry Point**: `functions/index.js` with comprehensive API endpoints
- **API Design**: Callable functions with error handling and user feedback
- **Email System**: Resend.com integration via Cloud Functions with template management
- **Database**: Firestore with security rules and real-time data synchronization
- **Data Validation**: Server-side validation with proper error responses
- **Logging**: Comprehensive error logging and monitoring capabilities

### Deployment
- **Frontend**: Vite build → Firebase Hosting with optimized assets
- **Backend**: Cloud Functions deployment with proper environment configuration
- **Database**: Firestore with security rules and optimized indexes
- **Storage**: Firebase Storage for file uploads with access control
- **Monitoring**: Firebase Analytics and error tracking for production monitoring

## DoNotDuplicate - Single Sources of Truth

⚠️ **CRITICAL**: These files are the ONLY sources of truth for their domains. Do NOT duplicate or create alternatives.

### Authentication & User Management
- **`src/contexts/AuthContext.jsx`** - User authentication state, login/logout, profile management
- **`src/firebase/config.js`** - Firebase Auth service instance

### API Client & Backend Communication
- **`src/utils/cloudFunctions.js`** - All Cloud Function API calls with error handling
- **`functions/index.js`** - All backend API endpoint implementations

### Configuration & Environment
- **`src/firebase/config.js`** - All Firebase service configurations
- **`tailwind.config.js`** - Global styling and design system
- **`firebase.json`** - Firebase project and deployment configuration
- **`vite.config.js`** - Build and development configuration

### Data Types & Schemas
- **`Documentation/Candidate Datasource.xlsx`** - Candidate data structure reference
- **`firestore.rules`** - Database schema and access patterns
- **`functions/index.js`** - API data validation and processing

### Logging & Error Handling
- **`src/components/ErrorBoundary.jsx`** - Global error catching and user-friendly error display
- **`src/utils/cloudFunctions.js`** - API error handling and user feedback with toast notifications
- **`functions/index.js`** - Backend error logging and response formatting with proper error codes
- **Toast notifications** - Consistent user feedback across all operations

### Security & Access Control
- **`src/components/ProtectedRoute.jsx`** - Route-level access control with role-based redirects
- **`firestore.rules`** - Database access permissions with granular collection-level control
- **`storage.rules`** - File upload permissions and validation
- **`src/contexts/AuthContext.jsx`** - Centralized authentication state and user profile management

### Location & Prospectus Management
- **`src/components/LocationManagementModal.jsx`** - Venue data management with photo uploads and validation
- **`src/components/ProspectusGenerator.jsx`** - Dynamic prospectus generation with location integration
- **Firebase Storage** - Photo storage with access control and cleanup
- **Firestore Collections** - `locations` collection for venue data management

### Faculty & Course Association Management
- **`src/components/FacultyManagementModal.jsx`** - Global faculty creation and management
- **`src/components/MentorAssignmentModal.jsx`** - Course-specific mentor assignments to groups
- **`assignFacultyToSubject()`** - Subject-level faculty assignments in Course Manager and Admin Panel
- **`src/pages/FacultyDashboard.jsx`** - Faculty view of assigned subjects and mentor roles
- **Firestore Collections** - `faculty` (global pool), `programmeSubjects.assignedFaculty` (subject assignments), `courses.mentorAssignments` (mentor assignments)
