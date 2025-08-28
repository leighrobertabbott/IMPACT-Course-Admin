import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import PhotoRequirement from './components/PhotoRequirement';
import LandingPage from './pages/LandingPage';
import ApplicationForm from './pages/ApplicationForm';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import CandidateManagement from './pages/CandidateManagement';
import GeneralOfficeView from './pages/GeneralOfficeView';
import GeneralOfficeTutorial from './pages/GeneralOfficeTutorial';
import FacultyDashboard from './pages/FacultyDashboard';
import CourseManagement from './pages/CourseManagement';
import AssessmentManagement from './pages/AssessmentManagement';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import ProvisionStart from './pages/ProvisionStart';
import ProvisionCallback from './pages/ProvisionCallback';
import ProvisionConfirm from './pages/ProvisionConfirm';
import ProvisionDone from './pages/ProvisionDone';
import Setup from './pages/Setup';
import OAuthErrorHandler from './components/OAuthErrorHandler';

function App() {
  const { currentUser, userProfile } = useAuth();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-nhs-light-grey">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/apply" element={<ApplicationForm />} />
          <Route path="/login" element={<Login />} />
          
          {/* Provisioning Routes */}
          <Route path="/provision/start" element={<ProvisionStart />} />
          <Route path="/provision/callback" element={<ProvisionCallback />} />
          <Route path="/provision/confirm" element={<ProvisionConfirm />} />
          <Route path="/provision/done" element={<ProvisionDone />} />
          <Route path="/provision/error" element={<OAuthErrorHandler />} />
          <Route path="/setup" element={<Setup />} />
          
          {/* Protected Routes - Wrapped with PhotoRequirement for candidates */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <PhotoRequirement>
                  <Dashboard />
                </PhotoRequirement>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <PhotoRequirement>
                  <Profile />
                </PhotoRequirement>
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/candidates" 
            element={
              <ProtectedRoute requireAdmin>
                <CandidateManagement />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/course-management" 
            element={
              <ProtectedRoute requireAdmin>
                <CourseManagement />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/assessment" 
            element={
              <ProtectedRoute requireAdmin>
                <AssessmentManagement />
              </ProtectedRoute>
            } 
          />
          
          {/* General Office Routes */}
          <Route 
            path="/general-office" 
            element={
              <ProtectedRoute requireGeneralOffice>
                <GeneralOfficeView />
              </ProtectedRoute>
            } 
          />

          {/* General Office Tutorial Route */}
          <Route 
            path="/general-office/tutorial" 
            element={
              <ProtectedRoute requireGeneralOffice>
                <GeneralOfficeTutorial />
              </ProtectedRoute>
            } 
          />
          
          {/* Faculty Routes */}
          <Route 
            path="/faculty" 
            element={
              <ProtectedRoute requireFaculty>
                <FacultyDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </div>
    </ErrorBoundary>
  );
}

export default App;
