import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Video, Star, MapPin, DollarSign,
  User, Phone, Mail, Award, CheckCircle, Filter,
  Search, Heart, Brain, Users, Target, Plus,
  Eye, MessageSquare, CreditCard, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { trackPayment, trackSessionStart } from '../utils/analyticsManager';

interface Therapist {
  id: string;
  name: string;
  title: string;
  specialization: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  location: string;
  avatar: string;
  verified: boolean;
  nextAvailable: string;
  bio: string;
  languages: string[];
  availability?: string[];
}

interface TimeSlot {
  time: string;
  available: boolean;
  day: string;
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  date: string;
  time: string;
  duration: number;
  amount: string;
  status: 'pending_confirmation' | 'confirmed' | 'completed' | 'cancelled';
  sessionType: 'video' | 'phone' | 'in-person';
  notes?: string;
  createdAt: string;
}

function BookingPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'book' | 'appointments'>('appointments');
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('');
  const [availableTherapists, setAvailableTherapists] = useState<Therapist[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [userAppointments, setUserAppointments] = useState<Appointment[]>([]);
  const [bookingStep, setBookingStep] = useState(1);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);

  const defaultTherapists: Therapist[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      title: 'Ph.D. in Clinical Psychology',
      specialization: ['Anxiety', 'Depression'],
      experience: 8,
      rating: 4.9,
      reviewCount: 127,
      hourlyRate: 150,
      location: 'New York, NY',
      avatar: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=150',
      verified: true,
      nextAvailable: 'Today, 2:00 PM',
      bio: 'Specializing in cognitive behavioral therapy with over 8 years of experience helping patients overcome anxiety and depression.',
      languages: ['English', 'Spanish']
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      title: 'M.D. Psychiatrist',
      specialization: ['Trauma', 'PTSD'],
      experience: 12,
      rating: 4.8,
      reviewCount: 89,
      hourlyRate: 180,
      location: 'Los Angeles, CA',
      avatar: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=150',
      verified: true,
      nextAvailable: 'Tomorrow, 10:00 AM',
      bio: 'Expert in trauma therapy and EMDR with extensive experience in helping veterans and first responders.',
      languages: ['English', 'Mandarin']
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      title: 'Licensed Family Therapist',
      specialization: ['Family Therapy', 'Couples'],
      experience: 10,
      rating: 4.7,
      reviewCount: 156,
      hourlyRate: 160,
      location: 'Chicago, IL',
      avatar: 'https://images.pexels.com/photos/5327647/pexels-photo-5327647.jpeg?auto=compress&cs=tinysrgb&w=150',
      verified: true,
      nextAvailable: 'Today, 4:30 PM',
      bio: 'Dedicated to helping families and couples build stronger relationships through evidence-based therapeutic approaches.',
      languages: ['English', 'Spanish', 'Portuguese']
    }
  ];

  useEffect(() => {
    // Load approved therapist services
    const therapistServices = JSON.parse(localStorage.getItem('mindcare_therapist_services') || '[]');
    const approvedServices = therapistServices.filter((service: any) => service.status === 'approved');
    
    // Also check if the therapist user still exists and is active
    const registeredUsers = JSON.parse(localStorage.getItem('mindcare_registered_users') || '[]');
    const activeApprovedServices = approvedServices.filter((service: any) => {
      const therapistUser = registeredUsers.find((u: any) => u.id === service.therapistId);
      return therapistUser && therapistUser.status !== 'deleted' && therapistUser.status !== 'suspended';
    });
    
    // Convert services to therapist format for booking
    const availableTherapistsFromServices = activeApprovedServices.map((service: any) => {
      const therapistUser = registeredUsers.find((u: any) => u.id === service.therapistId);
      return {
        id: service.therapistId,
        name: service.therapistName,
        title: service.qualification,
        specialization: service.specialization,
        experience: parseInt(service.experience.split(' ')[0]) || 0,
        rating: 4.8, // Default rating for new therapists
        reviewCount: 0,
        hourlyRate: service.chargesPerSession,
        location: 'Online',
        avatar: service.profilePicture && service.profilePicture.trim() !== '' 
          ? service.profilePicture 
          : 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=150',
        verified: true,
        nextAvailable: 'Today, 2:00 PM',
        bio: service.bio,
        languages: service.languages,
        availability: service.availability || []
      };
    });

    // Load existing therapists from localStorage and merge with services
    const existingTherapists = JSON.parse(localStorage.getItem('mindcare_therapists') || '[]');
    
    // Filter out deleted/suspended therapists from existing list
    const activeExistingTherapists = existingTherapists.filter((therapist: any) => {
      const therapistUser = registeredUsers.find((u: any) => u.id === therapist.id);
      return !therapistUser || (therapistUser.status !== 'deleted' && therapistUser.status !== 'suspended');
    });
    
    // Combine and deduplicate
    const allTherapists = [...activeExistingTherapists];
    availableTherapistsFromServices.forEach((serviceTherapist: any) => {
      const existingIndex = allTherapists.findIndex((t: any) => t.id === serviceTherapist.id);
      if (existingIndex >= 0) {
        // Update existing therapist with service data
        allTherapists[existingIndex] = serviceTherapist;
      } else {
        // Add new therapist
        allTherapists.push(serviceTherapist);
      }
    });

    if (allTherapists.length > 0) {
      setAvailableTherapists(allTherapists);
      localStorage.setItem('mindcare_therapists', JSON.stringify(allTherapists));
    } else {
      // Initialize with default therapists if none exist
      localStorage.setItem('mindcare_therapists', JSON.stringify(defaultTherapists));
      setAvailableTherapists(defaultTherapists);
    }

    // Load user appointments
    loadUserAppointments();
  }, [user]);

  const loadUserAppointments = () => {
    const allBookings = JSON.parse(localStorage.getItem('mindcare_bookings') || '[]');
    const userBookings = allBookings.filter((booking: Appointment) => 
      booking.patientId === user?.id
    );
    setUserAppointments(userBookings);
  };

  // Generate time slots based on therapist availability
  const generateTimeSlots = (therapist: Therapist, selectedDate: string) => {
    if (!selectedDate) return [];
    
    const selectedDateObj = new Date(selectedDate);
    const dayName = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Get therapist availability from multiple sources
    let therapistAvailability = therapist.availability || [];
    
    // If no availability in therapist object, check therapist services
    if (therapistAvailability.length === 0) {
      const therapistServices = JSON.parse(localStorage.getItem('mindcare_therapist_services') || '[]');
      const therapistService = therapistServices.find((s: any) => 
        s.therapistId === therapist.id || s.therapistName === therapist.name
      );
      if (therapistService && therapistService.availability) {
        therapistAvailability = therapistService.availability;
      }
    }
    
    // If still no availability, provide default slots
    if (therapistAvailability.length === 0) {
      const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
      therapistAvailability = timeSlots.map(time => `${dayName} ${time}`);
    }
    
    // Get all slots for the selected day
    const daySlots = therapistAvailability.filter(slot => slot.startsWith(dayName));
    
    // If no slots for the specific day, check if it's a weekday and provide default slots
    if (daySlots.length === 0) {
      const dayOfWeek = selectedDateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.
      if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
        const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
        const defaultSlots = timeSlots.map(time => `${dayName} ${time}`);
        return defaultSlots.map(slot => {
          const timeMatch = slot.match(/(\d{1,2}:\d{2} [AP]M)/);
          const time = timeMatch ? timeMatch[1] : '';
          
          const convertTo24Hour = (time12: string) => {
            const [time, modifier] = time12.split(' ');
            let [hours, minutes] = time.split(':');
            if (hours === '12') {
              hours = '00';
            }
            if (modifier === 'PM') {
              hours = (parseInt(hours, 10) + 12).toString();
            }
            return `${hours.padStart(2, '0')}:${minutes}`;
          };
          
          return {
            time: convertTo24Hour(time),
            available: !isSlotBooked(therapist.id, selectedDate, convertTo24Hour(time)),
            day: dayName
          };
        });
      }
    }
    
    // Extract time from slots like "Monday 9:00 AM"
    const timeSlots = daySlots.map(slot => {
      const timeMatch = slot.match(/(\d{1,2}:\d{2} [AP]M)/);
      const time = timeMatch ? timeMatch[1] : '';
      
      // Convert to 24-hour format for easier handling
      const convertTo24Hour = (time12: string) => {
        const [time, modifier] = time12.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') {
          hours = '00';
        }
        if (modifier === 'PM') {
          hours = (parseInt(hours, 10) + 12).toString();
        }
        return `${hours.padStart(2, '0')}:${minutes}`;
      };
      
      return {
        time: convertTo24Hour(time),
        available: !isSlotBooked(therapist.id, selectedDate, convertTo24Hour(time)),
        day: dayName
      };
    });
    
    return timeSlots.sort((a, b) => a.time.localeCompare(b.time));
  };
  
  // Check if a specific time slot is already booked
  const isSlotBooked = (therapistId: string, date: string, time: string) => {
    const allBookings = JSON.parse(localStorage.getItem('mindcare_bookings') || '[]');
    return allBookings.some((booking: any) => 
      (booking.therapistId === therapistId || booking.therapistName === therapistId) &&
      booking.date === date &&
      booking.time === time &&
      booking.status !== 'cancelled'
    );
  };

  // Update available time slots when therapist or date changes
  useEffect(() => {
    if (selectedTherapist && selectedDate) {
      const slots = generateTimeSlots(selectedTherapist, selectedDate);
      setAvailableTimeSlots(slots);
    }
  }, [selectedTherapist, selectedDate]);

  const specializations = ['All', 'Anxiety', 'Depression', 'PTSD', 'Trauma', 'Family Therapy', 'Addiction', 'CBT'];

  const filteredTherapists = availableTherapists.filter(therapist => {
    const matchesSearch = therapist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         therapist.specialization.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSpecialization = selectedSpecialization === '' || selectedSpecialization === 'All' ||
                                 therapist.specialization.includes(selectedSpecialization);
    return matchesSearch && matchesSpecialization;
  });

  const handleBookSession = () => {
    if (!selectedTherapist || !selectedDate || !selectedTime) {
      toast.error('Please select a therapist, date, and time');
      return;
    }
    
    // Convert 24-hour time back to 12-hour format for display
    const convertTo12Hour = (time24: string) => {
      const [hours, minutes] = time24.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    };
    
    const displayTime = convertTo12Hour(selectedTime);

    // Create booking object and save to localStorage
    const booking: Appointment = {
      id: Date.now().toString(),
      patientId: user?.id || '',
      patientName: user?.name || '',
      therapistId: selectedTherapist.id,
      therapistName: selectedTherapist.name,
      date: selectedDate,
      time: selectedTime, // Keep 24-hour format for internal use
      duration: 60,
      amount: `$${selectedTherapist.hourlyRate}`,
      status: 'pending_confirmation',
      sessionType: 'video',
      patientEmail: user?.email || '',
      createdAt: new Date().toISOString(),
      displayTime: displayTime // Add display time for UI
    };

    // Save to localStorage
    const existingBookings = JSON.parse(localStorage.getItem('mindcare_bookings') || '[]');
    existingBookings.push(booking);
    localStorage.setItem('mindcare_bookings', JSON.stringify(existingBookings));

    // Track session booking
    trackSessionStart(booking);

    toast.success(`Session booked with ${selectedTherapist.name} for ${selectedDate} at ${displayTime}!`);
    setShowBookingModal(false);
    setShowPaymentModal(true);
  };

  const handlePayment = () => {
    if (!selectedTherapist || !selectedDate || !selectedTime) {
      toast.error('Missing booking information');
      return;
    }

    // Update booking status to confirmed after payment
    const existingBookings = JSON.parse(localStorage.getItem('mindcare_bookings') || '[]');
    const updatedBookings = existingBookings.map((booking: Appointment) => {
      if (booking.therapistId === selectedTherapist.id && 
          booking.date === selectedDate && 
          booking.time === selectedTime &&
          booking.patientId === user?.id) {
        return { ...booking, status: 'confirmed' };
      }
      return booking;
    });
    localStorage.setItem('mindcare_bookings', JSON.stringify(updatedBookings));

    // Track payment
    trackPayment({
      amount: `$${selectedTherapist.hourlyRate}`,
      patientId: user?.id,
      therapistId: selectedTherapist.id,
      sessionType: 'video'
    });

    toast.success('Payment successful! Your session is confirmed.');
    setShowPaymentModal(false);
    setSelectedTherapist(null);
    setSelectedDate('');
    setSelectedTime('');
    setBookingStep(1);
    
    // Refresh appointments
    loadUserAppointments();
    setViewMode('appointments');
  };

  const joinSession = (appointment: Appointment) => {
    if (appointment.status !== 'confirmed') {
      toast.error('Session must be confirmed to join');
      return;
    }

    // Navigate to video session page
    navigate(`/video-session/${appointment.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'pending_confirmation': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

  const getSpecializationIcon = (spec: string) => {
    switch (spec.toLowerCase()) {
      case 'anxiety':
      case 'depression':
        return Brain;
      case 'ptsd':
      case 'trauma':
        return Heart;
      case 'family therapy':
      case 'couples':
        return Users;
      case 'addiction':
        return Target;
      default:
        return Brain;
    }
  };

  const upcomingAppointments = userAppointments.filter(apt => 
    apt.status === 'confirmed' && new Date(`${apt.date} ${apt.time}`) > new Date()
  );

  return (
    <div className={`h-screen flex flex-col ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50'
    }`}>
      <div className="flex-1 overflow-y-auto p-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className={`p-6 rounded-2xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h1 className={`text-2xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Video Therapy Sessions
            </h1>
            <p className={`text-base ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Connect with licensed therapists through secure, encrypted video calls
            </p>

            {/* Upcoming Session Alert */}
            {upcomingAppointments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl text-white"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Video className="w-6 h-6" />
                    <div>
                      <h3 className="font-semibold">Upcoming Session</h3>
                      <p className="text-sm opacity-90">
                        {upcomingAppointments[0].therapistName} • Today at {upcomingAppointments[0].time}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => joinSession(upcomingAppointments[0])}
                    className="px-4 py-2 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Join Call
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* View Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className={`flex space-x-1 p-1 rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setViewMode('book')}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                viewMode === 'book'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Book Session</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setViewMode('appointments')}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                viewMode === 'appointments'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>My Appointments</span>
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {viewMode === 'appointments' ? (
            <motion.div
              key="appointments"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className="space-y-4"
            >
              <div className={`p-4 rounded-xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  My Appointments
                </h3>

                {userAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className={`w-16 h-16 mx-auto mb-4 ${
                      theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                    <p className={`text-lg mb-4 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      No appointments scheduled
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode('book')}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                    >
                      Book Your First Session
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userAppointments.map((appointment) => (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl border ${
                          theme === 'dark' 
                            ? 'border-gray-700 bg-gray-700/50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                              <h4 className={`font-semibold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-800'
                              }`}>
                                {appointment.therapistName}
                              </h4>
                              <p className={`text-sm ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {appointment.date} at {
                                  appointment.displayTime || 
                                  (appointment.time ? new Date(`2000-01-01T${appointment.time}`).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                  }) : appointment.time)
                                }
                              </p>
                              <p className={`text-sm ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                Duration: {appointment.duration} minutes
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                              {appointment.status === 'pending_confirmation' ? 'Pending' : 
                               appointment.status === 'confirmed' ? 'Upcoming' :
                               appointment.status === 'completed' ? 'Completed' : 'Cancelled'}
                            </span>
                            {appointment.status === 'confirmed' && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => joinSession(appointment)}
                                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                              >
                                Join
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="book"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-6"
            >
              {/* Search and Filters */}
              <div className={`p-4 rounded-xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    Available Therapists
                  </h3>
                  <button className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 text-sm">
                    <Filter className="w-4 h-4" />
                    <span>Filter & Sort</span>
                  </button>
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      placeholder="Search therapists by name or specialization..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                  <select
                    value={selectedSpecialization}
                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                    className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {specializations.map((spec) => (
                      <option key={spec} value={spec === 'All' ? '' : spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Therapists List */}
              <div className="space-y-4">
                {filteredTherapists.map((therapist, index) => (
                  <motion.div
                    key={therapist.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-xl shadow-lg ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img
                            src={therapist.avatar}
                            alt={therapist.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          {therapist.verified && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className={`text-lg font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-800'
                          }`}>
                            {therapist.name}
                          </h3>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {therapist.title}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className={`text-sm font-medium ${
                                theme === 'dark' ? 'text-white' : 'text-gray-800'
                              }`}>
                                {therapist.rating}
                              </span>
                            </div>
                            <span className={`text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {therapist.experience} years exp
                            </span>
                            <span className={`text-sm font-semibold text-green-600`}>
                              ${therapist.hourlyRate}/hour
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            {therapist.specialization.map((spec, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                                }`}
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Available Hours:
                        </p>
                        <p className={`font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-800'
                        }`}>
                          9 AM - 5 PM Daily
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedTherapist(therapist);
                            setShowBookingModal(true);
                          }}
                          className="mt-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                        >
                          Book Session
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booking Modal */}
        <AnimatePresence>
          {showBookingModal && selectedTherapist && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowBookingModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`max-w-2xl w-full rounded-2xl shadow-2xl ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className={`text-2xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        Book Session
                      </h2>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          bookingStep >= 1 ? 'bg-purple-500' : 'bg-gray-400'
                        }`}>
                          1
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          bookingStep >= 2 ? 'bg-purple-500' : 'bg-gray-400'
                        }`}>
                          2
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          bookingStep >= 3 ? 'bg-purple-500' : 'bg-gray-400'
                        }`}>
                          3
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowBookingModal(false)}
                      className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      ×
                    </button>
                  </div>

                  {bookingStep === 1 && (
                    <div>
                      <h3 className={`text-lg font-semibold mb-4 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        Select Date & Time
                      </h3>

                      {/* Therapist Info */}
                      <div className="flex items-center space-x-4 mb-6">
                        <img
                          src={selectedTherapist.avatar}
                          alt={selectedTherapist.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h4 className={`font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-800'
                          }`}>
                            {selectedTherapist.name}
                          </h4>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {selectedTherapist.title}
                          </p>
                        </div>
                      </div>

                      {/* Date Selection */}
                      <div className="mb-4">
                        <label className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Preferred Date
                        </label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>

                      {/* Time Selection */}
                      <div className="mb-6">
                        <label className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Available Time Slots
                        </label>
                        {availableTimeSlots.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                            {availableTimeSlots.map((slot) => (
                              <motion.button
                                key={slot.time}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedTime(slot.time)}
                                disabled={!slot.available}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                  selectedTime === slot.time
                                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                                    : slot.available
                                    ? theme === 'dark'
                                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    : 'bg-red-100 text-red-500 cursor-not-allowed opacity-50'
                                }`}
                              >
                                {/* Convert 24-hour back to 12-hour for display */}
                                {new Date(`2000-01-01T${slot.time}`).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                                {!slot.available && (
                                  <span className="block text-xs mt-1">Booked</span>
                                )}
                              </motion.button>
                            ))}
                          </div>
                        ) : selectedDate ? (
                          <div className={`p-4 rounded-lg text-center ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                          }`}>
                            <p className={`text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              No available slots for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}. 
                              Please try a different date or contact the therapist directly.
                            </p>
                          </div>
                        ) : (
                          <div className={`p-4 rounded-lg text-center ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                          }`}>
                            <p className={`text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              Please select a date first
                            </p>
                          </div>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setBookingStep(2)}
                        disabled={!selectedDate || !selectedTime}
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue
                      </motion.button>
                    </div>
                  )}

                  {bookingStep === 2 && (
                    <div>
                      <h3 className={`text-lg font-semibold mb-4 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        Session Details
                      </h3>

                      {/* Session Summary */}
                      <div className={`p-4 rounded-xl mb-6 ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <h4 className={`font-semibold mb-3 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-800'
                        }`}>
                          Booking Summary
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                              Therapist:
                            </span>
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                              {selectedTherapist.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                              Date & Time:
                            </span>
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                              {selectedDate} at {selectedTime}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                              Duration:
                            </span>
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                              60 minutes
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                              Session Fee:
                            </span>
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                              ${selectedTherapist.hourlyRate}
                            </span>
                          </div>
                          <div className="flex justify-between font-semibold pt-2 border-t border-gray-300 dark:border-gray-600">
                            <span className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>
                              Total:
                            </span>
                            <span className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>
                              ${selectedTherapist.hourlyRate}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setBookingStep(1)}
                          className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200 ${
                            theme === 'dark'
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Back
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleBookSession}
                          className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                        >
                          Proceed to Payment
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Modal */}
        <AnimatePresence>
          {showPaymentModal && selectedTherapist && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowPaymentModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`max-w-md w-full rounded-2xl shadow-2xl ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <h2 className={`text-2xl font-bold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    Payment
                  </h2>

                  <div className={`p-4 rounded-lg mb-4 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <h4 className={`font-semibold mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      Session with {selectedTherapist.name}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          Date & Time:
                        </span>
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {selectedDate} at {selectedTime ? new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          }) : 'Not selected'}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold pt-2 border-t border-gray-300 dark:border-gray-600">
                        <span className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>
                          Amount:
                        </span>
                        <span className="text-green-600">
                          ${selectedTherapist.hourlyRate} - paid
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowPaymentModal(false)}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200 ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePayment}
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Pay ${selectedTherapist.hourlyRate}</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default BookingPage;