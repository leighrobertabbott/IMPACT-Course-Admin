# IMPACT Course Admin System

A comprehensive web application for managing the IMPACT Course at Whiston Hospital. Built with React, Firebase, and Tailwind CSS.

## 🚀 Features

### **Course Management**
- Create and manage multiple course sessions
- Set course dates, venues, and capacity limits
- Archive and reactivate courses
- Real-time course status tracking

### **Candidate Management**
- Comprehensive candidate application tracking
- Payment status management (Pending Payment → Paid → Live Candidate)
- Advanced filtering and search capabilities
- Export functionality (CSV/JSON)
- Detailed candidate profiles and assessment tracking

### **Assessment Management**
- Track candidate performance across multiple criteria
- Generate certificates for successful candidates
- Export assessment reports
- Handle unsuccessful candidates with proper notifications

### **Faculty Management**
- Manage faculty assignments to course sessions
- Track faculty credentials and availability
- Automated faculty notification system

### **General Office Integration**
- Payment processing and receipt management
- Course capacity monitoring
- Automated email notifications
- Real-time status updates

### **User Management**
- Role-based access control (Admin, Faculty, General Office)
- Secure authentication with Firebase Auth
- Profile management and settings

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Auth, Functions, Storage)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Deployment**: Firebase Hosting

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account and project
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd IMPACT
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication, Firestore, Functions, and Storage

#### Configure Firebase
1. Create a new file `src/firebase/config.js`:
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
Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 5. Run Development Server
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
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, etc.)
├── firebase/           # Firebase configuration
├── hooks/              # Custom React hooks
├── pages/              # Main application pages
├── utils/              # Utility functions
├── index.css           # Global styles
└── main.jsx           # Application entry point
```

## 🔐 Security Features

- **Authentication**: Firebase Auth with email/password
- **Authorization**: Role-based access control
- **Data Validation**: Firestore security rules
- **Secure Functions**: Cloud Functions with authentication checks

## 📧 Email Integration

The system includes automated email notifications for:
- Application confirmations
- Payment reminders
- Course updates
- Assessment results
- Faculty assignments

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Side Navigation**: Persistent navigation across all pages
- **Real-time Updates**: Live data synchronization
- **Loading States**: Smooth user experience
- **Error Handling**: Comprehensive error management
- **Toast Notifications**: User feedback system

## 🔧 Configuration

### Firebase Functions
The application uses several Firebase Functions:
- `activateCandidate`: Activates candidates after payment
- `sendBulkEmails`: Sends bulk email notifications
- `exportCandidateData`: Exports candidate data
- `generateCertificates`: Generates completion certificates

### Customization
- **Styling**: Modify `src/index.css` for custom styles
- **Components**: Add new components in `src/components/`
- **Pages**: Create new pages in `src/pages/`
- **Functions**: Extend Firebase Functions in `functions/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**IMPACT Team - Whiston Hospital**
- Course Administration
- Faculty Management
- Technical Support

## 📞 Support

For technical support or questions:
- Email: impact@sthk.nhs.uk
- Project Issues: [GitHub Issues](https://github.com/your-username/IMPACT/issues)

## 🔄 Version History

- **v1.0.0**: Initial release with core functionality
- **v1.1.0**: Added sidebar navigation and enhanced UI
- **v1.2.0**: Improved candidate management and assessment features

---

**Built with ❤️ for the NHS IMPACT Course Team**
