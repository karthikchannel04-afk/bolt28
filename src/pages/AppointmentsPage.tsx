import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, Video, Phone, User, MapPin, 
  CheckCircle, XCircle, AlertCircle, Plus, Search,
  Filter, Edit, Trash2, Eye, MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { trackSessionComplete } from '../utils/analyticsManager';

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  sessionType: 'video' | 'phone' | 'in-person';
  notes?: string;
}

function AppointmentsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([
  ]);

  useEffect(() => {
    // Load appointments from localStorage
    const loadAppointments = () => {
      const allBookings = JSON.parse(localStorage.getItem('mindcare_bookings') || '[]');
      
      // Filter appointments for current therapist by both ID and name matching
      const therapistAppointments = allBookings
        .filter((booking: any) => {
          // Match by therapist name or ID, and ensure it's for this specific therapist
          return (booking.therapistName === user?.name || 
                  booking.therapistId === user?.id ||
                  booking.therapistId === user?.name) && // Handle cases where name was used as ID
                 booking.status !== 'cancelled'; // Don't show cancelled appointments
        })
        .map((booking: any) => ({
          id: booking.id,
          patientName: booking.patientName,
          patientEmail: booking.patientEmail || 'patient@example.com',
          date: booking.date,
          time: booking.time,
          duration: 50,
          type: 'Therapy Session',
          status: booking.status === 'pending_confirmation' ? 'pending' : 
                  booking.status === 'confirmed' ? 'confirmed' :
                  booking.status === 'completed' ? 'completed' : 'pending',
          sessionType: booking.sessionType || 'video',
          notes: booking.notes || ''
        }));
      
      setAppointments(therapistAppointments);
    };

    loadAppointments();
    
    // Set up interval to refresh appointments
    const interval = setInterval(loadAppointments, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'phone': return Phone;
      case 'in-person': return MapPin;
      default: return Video;
    }
  };

  const handleStatusChange = (appointmentId: string, newStatus: string) => {
    // Update appointment status in localStorage
    const allBookings = JSON.parse(localStorage.getItem('mindcare_bookings') || '[]');
    const appointmentToUpdate = allBookings.find((booking: any) => booking.id === appointmentId);
    const updatedBookings = allBookings.map((booking: any) => 
      booking.id === appointmentId ? { ...booking, status: newStatus } : booking
    );
    localStorage.setItem('mindcare_bookings', JSON.stringify(updatedBookings));
    
    // Update local state
    setAppointments(prev => prev.map(apt => 
      apt.id === appointmentId ? { ...apt, status: newStatus as any } : apt
    ));
    
    // Track session completion in analytics
    if (newStatus === 'completed' && appointmentToUpdate) {
      trackSessionComplete({
        patientId: appointmentToUpdate.patientId,
        therapistId: appointmentToUpdate.therapistId,
        sessionType: appointmentToUpdate.sessionType || 'video',
        duration: 50, // Default session duration
        rating: 5 // Default rating
      });
    }
    
    toast.success(`Appointment ${newStatus}`);
  };

  const joinVideoSession = (appointmentId: string) => {
    navigate(`/video-session/${appointmentId}`);
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
                Appointments
              </h1>
              <p className={`text-base ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Manage your therapy sessions and patient appointments
              </p>
            </div>
            <button
              onClick={() => setShowNewAppointment(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              <span>New Appointment</span>
            </button>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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
                  placeholder="Search appointments..."
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
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  viewMode === 'calendar'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Calendar
              </button>
            </div>
          </div>
        </motion.div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`p-4 rounded-xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      {appointment.patientName}
                    </h3>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {appointment.patientEmail}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                    </p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {appointment.duration} minutes • {appointment.type}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {React.createElement(getSessionIcon(appointment.sessionType), {
                      className: `w-5 h-5 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`
                    })}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </div>
              
              {appointment.notes && (
                <div className={`mt-3 p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <strong>Notes:</strong> {appointment.notes}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between mt-4">
                <div className="flex space-x-2">
                  {(appointment.status === 'pending' || appointment.status === 'pending_confirmation') && (
                    <>
                      <button
                        onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Confirm</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                        className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}
                  {appointment.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => joinVideoSession(appointment.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                      >
                        <Video className="w-3 h-3" />
                        <span>Join Session</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(appointment.id, 'completed')}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Complete</span>
                      </button>
                    </>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-green-600 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AppointmentsPage;