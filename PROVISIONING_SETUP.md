# IMPACT Course Management System - Provisioning Setup Guide

This guide walks you through setting up the provisioning system that creates **exact replicas** of your IMPACT Course Management System for other hospitals.

## What the Provisioning System Does

When a hospital administrator clicks "Get your own IMPACT Management System":

1. **Creates a new Firebase project** for their hospital
2. **Clones your GitHub repository** (`https://github.com/leighrobertabbott/IMPACT-Course-Admin.git`)
3. **Builds the complete React application** with their Firebase configuration
4. **Deploys the full IMPACT system** to their new Firebase project
5. **Sets up all Firebase services** (Auth, Firestore, Hosting, Functions)
6. **Creates a setup wizard** for their admin account
7. **Gives them a live URL** like `https://their-hospital-impact.web.app`

Each hospital gets their own **completely isolated instance** with all features:
- Course management
- Candidate tracking
- Assessment management
- Faculty management
- Location management
- Prospectus generation
- Email notifications
- And all other IMPACT features

## Prerequisites

### Required Software
- **Node.js 16+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Firebase CLI** - Install with: `npm install -g firebase-tools`

### Required Accounts
- **Google Cloud Console** account with billing enabled
- **Firebase Console** access
- **GitHub** account (for repository access)

## Step-by-Step Setup

### 1. Google Cloud Console Setup

1. **Create a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Click "Create Project" or select an existing project
   - Enable billing (required for creating new projects)

2. **Enable Required APIs**:
   - Go to "APIs & Services" → "Library"
   - Enable these APIs:
     - **Google+ API**
     - **Cloud Resource Manager API**
     - **Service Usage API**
     - **Firebase Management API**
     - **Cloud Functions API**

3. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add these Authorized redirect URIs:
     - `https://your-domain.com/provision/callback`
     - `http://localhost:5173/provision/callback` (for development)
   - Copy the Client ID and Client Secret

### 2. Firebase Project Setup

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use your existing one
   - Enable these services:
     - **Authentication** (Email/Password)
     - **Firestore Database**
     - **Cloud Functions**
     - **Storage**
     - **Hosting**

2. **Deploy Your Main Site**:
   ```bash
   # Build your application
   npm run build
   
   # Deploy to Firebase
   firebase deploy
   ```

### 3. Environment Configuration

1. **Copy Environment Template**:
   ```bash
   cp .env.template .env.local
   ```

2. **Edit Environment Variables**:
   ```bash
   # Open .env.local and fill in your values
   VITE_APP_URL=https://your-domain.com
   VITE_GOOGLE_CLIENT_ID=your-oauth-client-id
   VITE_GOOGLE_CLIENT_SECRET=your-oauth-client-secret
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_RESEND_API_KEY=your-resend-api-key
   ```

### 4. Deploy Firebase Functions

1. **Install Function Dependencies**:
   ```bash
   cd functions
   npm install
   ```

2. **Deploy Functions**:
   ```bash
   firebase deploy --only functions
   ```

### 5. Test the Provisioning System

1. **Run the Setup Script**:
   ```bash
   node deploy-template.js
   ```

2. **Test the Flow**:
   - Visit your landing page
   - Click "Get your own IMPACT Management System"
   - Complete the OAuth flow
   - Verify a complete IMPACT instance is created

## How It Works

### For End Users (Hospital Administrators)

1. **Click the Button**: They click "Get your own IMPACT Management System" on your landing page
2. **Google OAuth**: They authorize your app to create resources in their Google account
3. **Enter Site Name**: They choose a name for their site (e.g., "whiston-impact")
4. **Automatic Setup**: The system creates everything automatically:
   - New Firebase project: `whiston-impact-abc123`
   - Live URL: `https://whiston-impact-abc123.web.app`
   - Complete IMPACT system with all features
5. **Admin Setup**: They complete the setup wizard to create their admin account
6. **Ready to Use**: They have a fully functional IMPACT Course Management System

### Technical Process

1. **OAuth Flow**: User authorizes Google Cloud access
2. **Project Creation**: Creates new GCP project with Firebase
3. **Repository Clone**: Clones your GitHub repo to temporary location
4. **Configuration Update**: Updates Firebase config with new project details
5. **Build Process**: Installs dependencies and builds React app
6. **Deployment**: Deploys built files to Firebase Hosting
7. **Service Setup**: Configures Firestore, Auth, and other services
8. **Cleanup**: Removes temporary files

## Troubleshooting

### Common Issues

1. **"Failed to clone repository"**:
   - Ensure your GitHub repo is public
   - Check network connectivity
   - Verify repository URL is correct

2. **"OAuth consent screen" errors**:
   - Add your domain to authorized redirect URIs
   - Verify OAuth client credentials
   - Check that Google+ API is enabled

3. **"Billing not enabled" errors**:
   - Enable billing on your Google Cloud project
   - Required for creating new projects

4. **"Build failed" errors**:
   - Check Node.js version (16+ required)
   - Verify all dependencies are installed
   - Check for build errors in your React app

### Debug Mode

Enable debug logging by setting:
```bash
export DEBUG=firebase-functions:*
```

### Testing Locally

1. **Start Firebase emulator**:
   ```bash
   firebase emulators:start
   ```

2. **Test provisioning locally**:
   ```bash
   npm run dev
   # Visit http://localhost:5173/provision/start
   ```

## Security Considerations

1. **OAuth Scopes**: The system requests minimal scopes needed for project creation
2. **Access Tokens**: Tokens are stored temporarily and cleared after use
3. **Project Isolation**: Each hospital gets completely isolated Firebase projects
4. **Data Privacy**: No data is shared between different hospital instances

## Cost Considerations

1. **Your Main Site**: Standard Firebase hosting costs
2. **Provisioned Sites**: Each hospital pays for their own Firebase usage
3. **Google Cloud APIs**: Minimal costs for project creation APIs
4. **Billing**: Each hospital manages their own billing

## Support

For technical support:
- **Email**: impact@sthk.nhs.uk
- **GitHub Issues**: [Create an issue](https://github.com/leighrobertabbott/IMPACT-Course-Admin/issues)
- **Documentation**: Check `docs/CODE_INDEX.md` for technical details

## Next Steps

After setup:
1. **Test thoroughly** with multiple hospital scenarios
2. **Monitor usage** and costs
3. **Gather feedback** from hospital administrators
4. **Iterate and improve** the provisioning process
5. **Scale up** as more hospitals adopt the system
