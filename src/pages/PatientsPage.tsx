import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Search, Filter, Plus, Eye, MessageSquare, 
  Calendar, BarChart3, Heart, Clock, Star, Phone,
  Mail, MapPin, Trash2, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  joinDate: string;
  lastSession: string;
  totalSessions: number;
  currentMood: number;
  diagnosis: string[];
  status: 'active' | 'inactive' | 'on-hold';
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  notes: string;
}

function PatientsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const loadPatients = () => {
      // Get all bookings for this therapist
      const allBookings = JSON.parse(localStorage.getItem('mindcare_bookings') || '[]');
      const therapistBookings = allBookings.filter((booking: any) => 
        (booking.therapistName === user?.name || booking.therapistId === user?.id) &&
        booking.status !== 'deleted_by_therapist' // Exclude patients deleted by this therapist
      );

      // Get registered users to get patient details
      const registeredUsers = JSON.parse(localStorage.getItem('mindcare_registered_users') || '[]');
      
      // Create patient records from bookings and user data
      const patientMap = new Map();
      
      therapistBookings.forEach((booking: any) => {
        const patientId = booking.patientId;
        const patientUser = registeredUsers.find((u: any) => u.id === patientId);
        
        if (!patientMap.has(patientId)) {
          // Calculate sessions for this patient
          const patientSessions = therapistBookings.filter((b: any) => b.patientId === patientId);
          const completedSessions = patientSessions.filter((s: any) => s.status === 'completed');
          const lastSession = completedSessions.length > 0 
            ? completedSessions.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
            : null;

          // Get current mood from mood tracker
          const moodEntries = JSON.parse(localStorage.getItem('mindcare_mood_entries') || '[]');
          const patientMoodEntries = moodEntries.filter((entry: any) => entry.userId === patientId);
          const latestMood = patientMoodEntries.length > 0 
            ? patientMoodEntries[patientMoodEntries.length - 1].moodIntensity || 3
            : 3;

          // Determine diagnosis based on therapy modules used or default
          let diagnosis = ['General Therapy'];
          const userProgress = JSON.parse(localStorage.getItem('mindcare_user_progress') || '{}');
          if (userProgress.currentPlan?.issue) {
            diagnosis = [userProgress.currentPlan.issue];
          }

          const patient: Patient = {
            id: patientId,
            name: booking.patientName,
            email: booking.patientEmail || patientUser?.email || 'patient@example.com',
            phone: patientUser?.phone || '+1 (555) 000-0000',
            age: patientUser?.age || 25,
            joinDate: patientUser?.joinDate || booking.createdAt?.split('T')[0] || '2024-01-01',
            lastSession: lastSession?.date || 'Never',
            totalSessions: completedSessions.length,
            currentMood: Math.floor(latestMood / 2) + 1, // Convert 1-10 scale to 1-5
            diagnosis,
            status: 'active', // Only show active patients since we filter out deleted ones
            emergencyContact: {
              name: patientUser?.emergencyContactEmail?.split('@')[0] || 'Emergency Contact',
              phone: '+1 (555) 000-0000',
              relation: patientUser?.emergencyContactRelation || 'Family'
            },
            notes: `Patient has ${completedSessions.length} completed sessions. ${
              lastSession ? `Last session on ${lastSession.date}.` : 'No sessions completed yet.'
            } Current mood level: ${Math.floor(latestMood / 2) + 1}/5.`
          };
          
          patientMap.set(patientId, patient);
        }
      });
      
      setPatients(Array.from(patientMap.values()));
    };

    loadPatients();
    
    // Set up interval to refresh data
    const interval = setInterval(loadPatients, 5000);
    
    // Listen for storage changes
    const handleStorageChange = () => {
      loadPatients();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mindcare-data-updated', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mindcare-data-updated', handleStorageChange);
    };
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 4) return 'text-green-500';
    if (mood >= 3) return 'text-yellow-500';
    return 'text-red-500';
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.diagnosis.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const handleDeletePatient = (patientId: string) => {
    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to remove this patient from your list? This will not delete their account, but will remove them from your patient roster.')) {
      return;
    }

    try {
      // Find patient data for the toast message
      const patientToRemove = patients.find(p => p.id === patientId);
      const patientName = patientToRemove?.name || 'Patient';
      
      // Update bookings to mark them as deleted for this therapist-patient relationship
      const allBookings = JSON.parse(localStorage.getItem('mindcare_bookings') || '[]');
      const updatedBookings = allBookings.map((booking: any) => {
        // If this booking is between the current therapist and the patient being removed
        if ((booking.therapistName === user?.name || booking.therapistId === user?.id) && 
            booking.patientId === patientId) {
          return { ...booking, status: 'deleted_by_therapist', cancelledBy: 'therapist', deletedAt: new Date().toISOString() };
        }
        return booking;
      });
      localStorage.setItem('mindcare_bookings', JSON.stringify(updatedBookings));
      
      // Remove patient from local state after updating bookings
      setPatients(prev => prev.filter(p => p.id !== patientId));
      
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('mindcare-data-updated'));
      
      toast.success(`${patientName} has been removed from your patient list.`);
    } catch (error) {
      toast.error('Failed to remove patient. Please try again.');
      console.error('Error removing patient:', error);
    }
  };

  return (
    <div className={`h-screen flex flex-col ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50'
    }`}>
      <div className="flex-1 overflow-y-auto p-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Patients
              </h1>
              <p className={`text-base ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Manage your patient records and treatment progress
              </p>
            </div>
            <button
              onClick={() => setShowPatientModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              <span>Add Patient</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          {[
            { title: 'Total Patients', value: patients.length, icon: User, color: 'from-blue-500 to-cyan-500' },
            { title: 'Active Patients', value: patients.filter(p => p.status === 'active').length, icon: Heart, color: 'from-green-500 to-teal-500' },
            { title: 'This Week Sessions', value: (() => {
              // Calculate this week's sessions for current therapist
              const oneWeekAgo = new Date();
              oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
              const allBookings = JSON.parse(localStorage.getItem('mindcare_bookings') || '[]');
              const thisWeekSessions = allBookings.filter((booking: any) => 
                (booking.therapistName === user?.name || booking.therapistId === user?.id) &&
                booking.status === 'completed' &&
                new Date(booking.date) >= oneWeekAgo
              );
              return thisWeekSessions.length.toString();
            })(), icon: Calendar, color: 'from-purple-500 to-pink-500' },
            { title: 'Avg Mood Score', value: (() => {
              // Calculate average mood score from therapist's patients
              if (patients.length === 0) return '0';
              const totalMood = patients.reduce((sum, patient) => sum + patient.currentMood, 0);
              const avgMood = totalMood / patients.length;
              return avgMood.toFixed(1);
            })(), icon: Star, color: 'from-yellow-500 to-orange-500' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className={`p-4 rounded-xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {stat.title}
                  </h3>
                  <p className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`mb-4 p-4 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Patients List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient, index) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className={`p-4 rounded-xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      {patient.name}
                    </h3>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Age {patient.age}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                  {patient.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <Mail className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {patient.email}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {patient.totalSessions} sessions
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className={`w-4 h-4 ${getMoodColor(patient.currentMood)}`} />
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Mood: {patient.currentMood}/5
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <p className={`text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Diagnosis:
                </p>
                <div className="flex flex-wrap gap-1">
                  {patient.diagnosis.map((diagnosis, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {diagnosis}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewPatient(patient)}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-green-600 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-purple-600 transition-colors">
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleDeletePatient(patient.id)}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    title="Remove patient from your list"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Patient Detail Modal */}
        {showPatientModal && selectedPatient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPatientModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`max-w-2xl w-full rounded-2xl shadow-2xl ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    Patient Details
                  </h2>
                  <button
                    onClick={() => setShowPatientModal(false)}
                    className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    ×
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Name</label>
                        <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                          {selectedPatient.name}
                        </p>
                      </div>
                      <div>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Email</label>
                        <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                          {selectedPatient.email}
                        </p>
                      </div>
                      <div>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Phone</label>
                        <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                          {selectedPatient.phone}
                        </p>
                      </div>
                      <div>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Age</label>
                        <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                          {selectedPatient.age} years old
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      Treatment Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Join Date</label>
                        <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                          {new Date(selectedPatient.joinDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Total Sessions</label>
                        <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                          {selectedPatient.totalSessions}
                        </p>
                      </div>
                      <div>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Current Mood</label>
                        <p className={`${getMoodColor(selectedPatient.currentMood)}`}>
                          {selectedPatient.currentMood}/5
                        </p>
                      </div>
                      <div>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Status</label>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPatient.status)}`}>
                          {selectedPatient.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className={`text-lg font-semibold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    Emergency Contact
                  </h3>
                  <div className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      <strong>{selectedPatient.emergencyContact.name}</strong> ({selectedPatient.emergencyContact.relation})
                    </p>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {selectedPatient.emergencyContact.phone}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className={`text-lg font-semibold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    Notes
                  </h3>
                  <div className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedPatient.notes}
                    </p>
                  </div>
                </div>

                {/* Delete Patient Option in Modal */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleDeletePatient(selectedPatient.id);
                      setShowPatientModal(false);
                    }}
                    className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove Patient from My List</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default PatientsPage;