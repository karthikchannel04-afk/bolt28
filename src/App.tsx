import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/PatientDashboard';
import TherapistDashboard from './pages/TherapistDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TherapyModules from './pages/TherapyModules';
import ChatbotPage from './pages/ChatbotPage';
import BookingPage from './pages/BookingPage';
import ProgressPage from './pages/ProgressPage';
import MoodTrackerPage from './pages/MoodTrackerPage';
import AppointmentsPage from './pages/AppointmentsPage';
import PatientsPage from './pages/PatientsPage';
import MessagesPage from './pages/MessagesPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import TherapistsManagementPage from './pages/TherapistsManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';
import VideoSessionPage from './pages/VideoSessionPage';
import ListServicePage from './pages/ListServicePage';

// Admin Therapy Management
import AdminTherapyManagement from './pages/AdminTherapyManagement';

// Therapy Module Components
import MindfulnessModule from './pages/modules/MindfulnessModule';
import GratitudeModule from './pages/modules/GratitudeModule';
import RelaxationMusicModule from './pages/modules/RelaxationMusicModule';
import TetrisTherapyModule from './pages/modules/TetrisTherapyModule';
import ArtTherapyModule from './pages/modules/ArtTherapyModule';
import CBTModule from './pages/modules/CBTModule';
import StressManagementModule from './pages/modules/StressManagementModule';
import ExposureTherapyModule from './pages/modules/ExposureTherapyModule';
import VideoTherapyModule from './pages/modules/VideoTherapyModule';
import ACTModule from './pages/modules/ACTModule';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProfilePage from './components/ProfilePage';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  
  // Don't show sidebar on landing, login, or register pages
  const showSidebar = user && !['/login', '/register', '/'].includes(location.pathname);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50'
    }`}>
      {!user && <Navbar />}
      {showSidebar && <Sidebar />}
      <div className={showSidebar ? 'ml-56' : ''}>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            user ? (
              user.role === 'patient' ? <PatientDashboard /> :
              user.role === 'therapist' ? <TherapistDashboard /> :
              user.role === 'admin' ? <AdminDashboard /> :
              <Navigate to="/" />
            ) : <Navigate to="/login" />
          } />
          
            <Route path="/profile" element={
              user ? <ProfilePage /> : <Navigate to="/login" />
            } />
            
          <Route path="/therapy-modules" element={
            user?.role === 'patient' ? <TherapyModules /> : <Navigate to="/dashboard" />
          } />
          
          {/* Individual Therapy Module Routes */}
          <Route path="/therapy-modules/mindfulness" element={
            user?.role === 'patient' ? <MindfulnessModule /> : <Navigate to="/dashboard" />
          } />
          <Route path="/therapy-modules/gratitude" element={
            user?.role === 'patient' ? <GratitudeModule /> : <Navigate to="/dashboard" />
          } />
          <Route path="/therapy-modules/music" element={
            user?.role === 'patient' ? <RelaxationMusicModule /> : <Navigate to="/dashboard" />
          } />
          <Route path="/therapy-modules/tetris" element={
            user?.role === 'patient' ? <TetrisTherapyModule /> : <Navigate to="/dashboard" />
          } />
          <Route path="/therapy-modules/cbt" element={
            user?.role === 'patient' ? <CBTModule /> : <Navigate to="/dashboard" />
          } />
          <Route path="/therapy-modules/stress" element={
            user?.role === 'patient' ? <StressManagementModule /> : <Navigate to="/dashboard" />
          } />
          <Route path="/therapy-modules/art" element={
            user?.role === 'patient' ? <ArtTherapyModule /> : <Navigate to="/dashboard" />
          } />
          <Route path="/therapy-modules/exposure" element={
            user?.role === 'patient' ? <ExposureTherapyModule /> : <Navigate to="/dashboard" />
          } />
          <Route path="/therapy-modules/video" element={
            user?.role === 'patient' ? <VideoTherapyModule /> : <Navigate to="/dashboard" />
          } />
          <Route path="/therapy-modules/act" element={
            user?.role === 'patient' ? <ACTModule /> : <Navigate to="/dashboard" />
          } />
          
          <Route path="/chatbot" element={
            user?.role === 'patient' ? <ChatbotPage /> : <Navigate to="/dashboard" />
          } />
          
          <Route path="/booking" element={
            user?.role === 'patient' ? <BookingPage /> : <Navigate to="/dashboard" />
          } />
          
          <Route path="/progress" element={
            user?.role === 'patient' ? <ProgressPage /> : <Navigate to="/dashboard" />
          } />
          
          <Route path="/mood-tracker" element={
            user?.role === 'patient' ? <MoodTrackerPage /> : <Navigate to="/dashboard" />
          } />
          
          {/* Therapist Routes */}
          <Route path="/list-service" element={
            user?.role === 'therapist' ? <ListServicePage /> : <Navigate to="/dashboard" />
          } />
          
          <Route path="/appointments" element={
            user?.role === 'therapist' ? <AppointmentsPage /> : <Navigate to="/dashboard" />
          } />
          
          <Route path="/patients" element={
            user?.role === 'therapist' ? <PatientsPage /> : <Navigate to="/dashboard" />
          } />
          
          <Route path="/messages" element={
            user?.role === 'therapist' ? <MessagesPage /> : <Navigate to="/dashboard" />
          } />
          
          <Route path="/reports" element={
            user?.role === 'therapist' ? <ReportsPage /> : <Navigate to="/dashboard" />
          } />
          
          {/* Admin Routes */}
          <Route path="/users" element={
            user?.role === 'admin' ? <UsersPage /> : <Navigate to="/dashboard" />
          } />
          
          <Route path="/therapists" element={
            user?.role === 'admin' ? <TherapistsManagementPage /> : <Navigate to="/dashboard" />
          } />
          
          <Route path="/analytics" element={
            user?.role === 'admin' ? <AnalyticsPage /> : <Navigate to="/dashboard" />
          } />
          
          <Route path="/admin/therapy-management" element={
            user?.role === 'admin' ? <AdminTherapyManagement /> : <Navigate to="/dashboard" />
          } />
          
          {/* Video Session Route */}
          <Route path="/video-session/:sessionId" element={
            user ? <VideoSessionPage /> : <Navigate to="/login" />
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>
      </div>
    </div>
  );
}

export default App;