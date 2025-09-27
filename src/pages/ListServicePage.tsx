import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Camera, Save, CreditCard as Edit, CheckCircle, Clock, DollarSign, Award, FileText, Star, Shield, AlertTriangle, Plus, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { trackTherapistRegistration } from '../utils/analyticsManager';

interface TherapistService {
  id: string;
  therapistId: string;
  therapistName: string;
  profilePicture: string;
  qualification: string;
  experience: string;
  chargesPerSession: number;
  specialization: string[];
  bio: string;
  languages: string[];
  availability: string[];
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
}

function ListServicePage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [serviceData, setServiceData] = useState<Partial<TherapistService>>({
    therapistId: user?.id || '',
    therapistName: user?.name || '',
    profilePicture: '',
    qualification: '',
    experience: '',
    chargesPerSession: 100,
    specialization: [],
    bio: '',
    languages: ['English'],
    availability: [],
    status: 'pending'
  });
  const [existingService, setExistingService] = useState<TherapistService | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const specializationOptions = [
    'Anxiety Disorders', 'Depression', 'PTSD', 'Trauma Therapy', 'CBT',
    'Family Therapy', 'Couples Counseling', 'Addiction Recovery', 'EMDR',
    'Mindfulness-Based Therapy', 'Grief Counseling', 'Eating Disorders',
    'Bipolar Disorder', 'OCD', 'ADHD', 'Autism Spectrum', 'Sleep Disorders'
  ];

  const languageOptions = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
    'Mandarin', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian'
  ];

  const availabilityOptions = [
    'Monday 9:00 AM', 'Monday 10:00 AM', 'Monday 11:00 AM', 'Monday 12:00 PM', 
    'Monday 1:00 PM', 'Monday 2:00 PM', 'Monday 3:00 PM', 'Monday 4:00 PM', 'Monday 5:00 PM',
    'Tuesday 9:00 AM', 'Tuesday 10:00 AM', 'Tuesday 11:00 AM', 'Tuesday 12:00 PM',
    'Tuesday 1:00 PM', 'Tuesday 2:00 PM', 'Tuesday 3:00 PM', 'Tuesday 4:00 PM', 'Tuesday 5:00 PM',
    'Wednesday 9:00 AM', 'Wednesday 10:00 AM', 'Wednesday 11:00 AM', 'Wednesday 12:00 PM',
    'Wednesday 1:00 PM', 'Wednesday 2:00 PM', 'Wednesday 3:00 PM', 'Wednesday 4:00 PM', 'Wednesday 5:00 PM',
    'Thursday 9:00 AM', 'Thursday 10:00 AM', 'Thursday 11:00 AM', 'Thursday 12:00 PM',
    'Thursday 1:00 PM', 'Thursday 2:00 PM', 'Thursday 3:00 PM', 'Thursday 4:00 PM', 'Thursday 5:00 PM',
    'Friday 9:00 AM', 'Friday 10:00 AM', 'Friday 11:00 AM', 'Friday 12:00 PM',
    'Friday 1:00 PM', 'Friday 2:00 PM', 'Friday 3:00 PM', 'Friday 4:00 PM', 'Friday 5:00 PM',
    'Saturday 9:00 AM', 'Saturday 10:00 AM', 'Saturday 11:00 AM', 'Saturday 12:00 PM',
    'Saturday 1:00 PM', 'Saturday 2:00 PM', 'Saturday 3:00 PM', 'Saturday 4:00 PM', 'Saturday 5:00 PM',
    'Sunday 9:00 AM', 'Sunday 10:00 AM', 'Sunday 11:00 AM', 'Sunday 12:00 PM',
    'Sunday 1:00 PM', 'Sunday 2:00 PM', 'Sunday 3:00 PM', 'Sunday 4:00 PM', 'Sunday 5:00 PM'
  ];

  useEffect(() => {
    // Load existing service if any
    const services = JSON.parse(localStorage.getItem('mindcare_therapist_services') || '[]');
    const userService = services.find((service: TherapistService) => service.therapistId === user?.id);
    
    if (userService) {
      setExistingService(userService);
      setServiceData(userService);
    } else {
      // Pre-populate with user profile data
      setServiceData(prev => ({
        ...prev,
        therapistId: user?.id || '',
        therapistName: user?.name || '',
        experience: user?.experience || '',
        chargesPerSession: user?.hourlyRate || 100,
        specialization: user?.specialization ? [user.specialization] : [],
        bio: user?.bio || ''
      }));
    }
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    setServiceData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: 'specialization' | 'languages' | 'availability', item: string) => {
    setServiceData(prev => ({
      ...prev,
      [field]: prev[field]?.includes(item)
        ? prev[field].filter((i: string) => i !== item)
        : [...(prev[field] || []), item]
    }));
  };

  const handleSubmitService = () => {
    if (!serviceData.qualification || !serviceData.experience || !serviceData.specialization?.length) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Create service object with profile picture
    const newService: TherapistService = {
      id: existingService?.id || Date.now().toString(),
      therapistId: user?.id || '',
      therapistName: user?.name || '',
      profilePicture: serviceData.profilePicture || '',
      qualification: serviceData.qualification || '',
      experience: serviceData.experience || '',
      chargesPerSession: serviceData.chargesPerSession || 100,
      specialization: serviceData.specialization || [],
      bio: serviceData.bio || '',
      languages: serviceData.languages || ['English'],
      availability: serviceData.availability || [],
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    try {
      // Save to therapist services for admin approval
      const services = JSON.parse(localStorage.getItem('mindcare_therapist_services') || '[]');
      const updatedServices = existingService 
        ? services.map((s: TherapistService) => s.id === existingService.id ? newService : s)
        : [...services, newService];
      
      localStorage.setItem('mindcare_therapist_services', JSON.stringify(updatedServices));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        // If quota exceeded, save without profile picture
        const serviceWithoutPhoto = { ...newService, profilePicture: '' };
        const services = JSON.parse(localStorage.getItem('mindcare_therapist_services') || '[]');
        const updatedServices = existingService 
          ? services.map((s: TherapistService) => s.id === existingService.id ? serviceWithoutPhoto : s)
          : [...services, serviceWithoutPhoto];
        
        localStorage.setItem('mindcare_therapist_services', JSON.stringify(updatedServices));
        toast.error('Profile photo too large. Service saved without photo.');
        return;
      }
      throw error;
    }
    
    setExistingService(newService);
    setIsEditing(false);
    
    // Track therapist service submission for analytics
    if (!existingService) {
      trackTherapistRegistration({
        therapistId: user?.id || '',
        therapistName: user?.name || '',
        specialization: newService.specialization
      });
    }
    
    toast.success(existingService ? 'Service updated! Awaiting admin approval.' : 'Service submitted! Awaiting admin approval.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
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
                List Your Service
              </h1>
              <p className={`text-base ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Create your professional profile to offer video therapy sessions
              </p>
            </div>
            {existingService && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Service</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Current Service Status */}
        {existingService && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`mb-4 p-4 rounded-xl shadow-lg ${
              existingService.status === 'approved' 
                ? theme === 'dark' ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'
                : existingService.status === 'pending'
                ? theme === 'dark' ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'
                : theme === 'dark' ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              {existingService.status === 'approved' ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : existingService.status === 'pending' ? (
                <Clock className="w-6 h-6 text-yellow-500" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-500" />
              )}
              <div>
                <h3 className={`font-semibold ${
                  existingService.status === 'approved' ? 'text-green-600 dark:text-green-400' :
                  existingService.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  Service Status: {existingService.status.charAt(0).toUpperCase() + existingService.status.slice(1)}
                </h3>
                <p className={`text-sm ${
                  existingService.status === 'approved' ? 'text-green-700 dark:text-green-300' :
                  existingService.status === 'pending' ? 'text-yellow-700 dark:text-yellow-300' :
                  'text-red-700 dark:text-red-300'
                }`}>
                  {existingService.status === 'approved' 
                    ? 'Your service is live and visible to patients!'
                    : existingService.status === 'pending'
                    ? 'Your service is under review by our admin team.'
                    : 'Your service was rejected. Please review and resubmit.'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Service Form */}
        {(!existingService || isEditing) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-6 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h3 className={`text-xl font-semibold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Professional Information
            </h3>

            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    {serviceData.profilePicture ? (
                      <img
                        src={serviceData.profilePicture}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <User className={`w-12 h-12 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white hover:bg-purple-600 transition-colors">
                    <label htmlFor="profile-photo-upload" className="cursor-pointer">
                      <Camera className="w-4 h-4" />
                    </label>
                    <input
                      id="profile-photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            handleInputChange('profilePicture', result);
                            toast.success('Profile photo uploaded successfully!');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </button>
                </div>
                <p className={`text-sm mt-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Upload your professional photo
                </p>
              </div>

              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Qualification/Degree *
                  </label>
                  <input
                    type="text"
                    value={serviceData.qualification}
                    onChange={(e) => handleInputChange('qualification', e.target.value)}
                    placeholder="e.g., Ph.D. in Clinical Psychology"
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Years of Experience * {user?.experience && '(from profile)'}
                  </label>
                  <input
                    type="text"
                    value={serviceData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="e.g., 8 years"
                    disabled={!!user?.experience}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      user?.experience ? 'cursor-not-allowed opacity-75' : ''
                    } ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  {user?.experience && (
                    <p className={`text-xs mt-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      This field is automatically filled from your profile. Update your profile to change this.
                    </p>
                  )}
                </div>
              </div>

              {/* Charges */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Charges per Session (USD) *
                </label>
                <div className="relative">
                  <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="number"
                    min="50"
                    max="500"
                    value={serviceData.chargesPerSession}
                    onChange={(e) => handleInputChange('chargesPerSession', parseInt(e.target.value))}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Specialization */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Specialization Areas * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {specializationOptions.map((spec) => (
                    <motion.button
                      key={spec}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleArrayToggle('specialization', spec)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        serviceData.specialization?.includes(spec)
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {spec}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Professional Bio
                </label>
                <textarea
                  value={serviceData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  placeholder="Tell patients about your approach, experience, and what makes you unique..."
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Languages */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Languages Spoken
                </label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {languageOptions.map((lang) => (
                    <motion.button
                      key={lang}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleArrayToggle('languages', lang)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        serviceData.languages?.includes(lang)
                          ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {lang}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Availability (9 AM - 5 PM, 1-hour slots)
                </label>
                <div className="max-h-64 overflow-y-auto space-y-4">
                  {(() => {
                    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                    const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
                    
                    return daysOfWeek.map((day) => {
                      const isToday = day === today;
                      const daySlots = timeSlots.map(time => `${day} ${time}`);
                      
                      return (
                        <div key={day} className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          isToday 
                            ? 'border-purple-300 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/20' 
                            : theme === 'dark' 
                            ? 'border-gray-600 bg-gray-700/30' 
                            : 'border-gray-200 bg-gray-50'
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className={`font-semibold ${
                              isToday 
                                ? 'text-purple-600 dark:text-purple-400' 
                                : theme === 'dark' 
                                ? 'text-white' 
                                : 'text-gray-800'
                            }`}>
                              {day} {isToday && '(Today)'}
                            </h4>
                            <div className="flex space-x-1">
                              <button
                                type="button"
                                onClick={() => {
                                  // Select all slots for this day
                                  setServiceData(prev => ({
                                    ...prev,
                                    availability: [...new Set([...(prev.availability || []), ...daySlots])]
                                  }));
                                }}
                                className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                              >
                                All
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  // Deselect all slots for this day
                                  setServiceData(prev => ({
                                    ...prev,
                                    availability: (prev.availability || []).filter(slot => !slot.startsWith(day))
                                  }));
                                }}
                                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                              >
                                None
                              </button>
                            </div>
                          </div>
                          <div className={`text-xs mb-2 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Selected: {daySlots.filter(slot => serviceData.availability?.includes(slot)).length} slots
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {timeSlots.map((time) => {
                              const fullSlot = `${day} ${time}`;
                              const isSelected = serviceData.availability?.includes(fullSlot);
                              return (
                                <motion.button
                                  key={time}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleArrayToggle('availability', fullSlot)}
                                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 flex-shrink-0 ${
                                    isSelected
                                      ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
                                      : theme === 'dark'
                                      ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {time}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
                <div className="mt-3 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      // Select all weekday slots (Mon-Fri)
                      const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
                      const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
                      const weekdaySlots = weekdays.flatMap(day => timeSlots.map(time => `${day} ${time}`));
                      setServiceData(prev => ({
                        ...prev,
                        availability: [...new Set([...(prev.availability || []), ...weekdaySlots])]
                      }));
                    }}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    Select All Weekdays
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Select all weekend slots (Sat-Sun)
                      const weekends = ['Saturday', 'Sunday'];
                      const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
                      const weekendSlots = weekends.flatMap(day => timeSlots.map(time => `${day} ${time}`));
                      setServiceData(prev => ({
                        ...prev,
                        availability: [...new Set([...(prev.availability || []), ...weekendSlots])]
                      }));
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Select Weekends
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setServiceData(prev => ({ ...prev, availability: [] }));
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmitService}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>{existingService ? 'Update Service' : 'Submit for Approval'}</span>
                </motion.button>
                {isEditing && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsEditing(false)}
                    className={`px-6 py-3 rounded-xl font-semibold ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Service Preview */}
        {existingService && !isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-6 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Service Preview
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(existingService.status)}`}>
                {existingService.status}
              </span>
            </div>

            <div className="flex items-start space-x-6">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                {existingService.profilePicture ? (
                  <img
                    src={existingService.profilePicture}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <User className={`w-10 h-10 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                )}
              </div>

              <div className="flex-1">
                <h4 className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  Dr. {existingService.therapistName}
                </h4>
                <p className={`text-sm mb-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {existingService.qualification}
                </p>
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4 text-purple-500" />
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {existingService.experience} experience
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className={`text-sm font-semibold text-green-600`}>
                      ${existingService.chargesPerSession}/session
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <p className={`text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Specializations:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {existingService.specialization.map((spec, idx) => (
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

                {existingService.bio && (
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {existingService.bio}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default ListServicePage;