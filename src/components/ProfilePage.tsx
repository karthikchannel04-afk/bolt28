import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, Calendar, MapPin, Edit, Save, 
  X, Camera, Shield, Award, Clock, Heart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    emergencyContactEmail: user?.emergencyContactEmail || '',
    emergencyContactRelation: user?.emergencyContactRelation || '',
    age: user?.age || '',
    specialization: user?.specialization || '',
    licenseNumber: user?.licenseNumber || '',
    hourlyRate: user?.hourlyRate || '',
    experience: user?.experience || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    try {
      // Update user in auth context
      const updatedUserData = {
        ...user,
        ...formData,
        age: formData.age ? parseInt(formData.age) : user?.age,
        hourlyRate: formData.hourlyRate ? parseInt(formData.hourlyRate) : user?.hourlyRate
      };
      
      updateUser(updatedUserData);
      
      // Update registered users in localStorage
      const registeredUsers = JSON.parse(localStorage.getItem('mindcare_registered_users') || '[]');
      const updatedUsers = registeredUsers.map((u: any) => 
        u.id === user?.id ? { ...u, ...updatedUserData } : u
      );
      localStorage.setItem('mindcare_registered_users', JSON.stringify(updatedUsers));
      
      // If therapist, update therapist services
      if (user?.role === 'therapist') {
        const therapistServices = JSON.parse(localStorage.getItem('mindcare_therapist_services') || '[]');
        const updatedServices = therapistServices.map((s: any) => 
          s.therapistId === user?.id ? { 
            ...s, 
            therapistName: formData.name,
            experience: formData.experience,
            chargesPerSession: formData.hourlyRate ? parseInt(formData.hourlyRate) : s.chargesPerSession,
            bio: formData.bio
          } : s
        );
        localStorage.setItem('mindcare_therapist_services', JSON.stringify(updatedServices));
        
        // Update available therapists for booking
        const availableTherapists = JSON.parse(localStorage.getItem('mindcare_therapists') || '[]');
        const updatedAvailableTherapists = availableTherapists.map((t: any) => 
          t.id === user?.id ? { 
            ...t, 
            name: formData.name,
            hourlyRate: formData.hourlyRate ? parseInt(formData.hourlyRate) : t.hourlyRate,
            bio: formData.bio
          } : t
        );
        localStorage.setItem('mindcare_therapists', JSON.stringify(updatedAvailableTherapists));
        
        // Update bookings with therapist name
        const bookings = JSON.parse(localStorage.getItem('mindcare_bookings') || '[]');
        const updatedBookings = bookings.map((b: any) => 
          b.therapistId === user?.id ? { ...b, therapistName: formData.name } : b
        );
        localStorage.setItem('mindcare_bookings', JSON.stringify(updatedBookings));
      }
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      bio: user?.bio || '',
      emergencyContactEmail: user?.emergencyContactEmail || '',
      emergencyContactRelation: user?.emergencyContactRelation || '',
      age: user?.age || '',
      specialization: user?.specialization || '',
      licenseNumber: user?.licenseNumber || '',
      hourlyRate: user?.hourlyRate || '',
      experience: user?.experience || ''
    });
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className={`min-h-screen py-8 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50'
    }`}>
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Profile Settings
          </h1>
          <p className={`text-lg ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Manage your personal information and preferences
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`lg:col-span-1 p-6 rounded-2xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="text-center">
              {/* Profile Picture */}
              <div className="relative mb-6">
                <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <User className={`w-12 h-12 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
                <button className="absolute bottom-0 right-1/2 transform translate-x-6 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white hover:bg-purple-600 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <h3 className={`text-xl font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {user.name}
              </h3>
              <p className={`text-sm mb-4 capitalize ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {user.role}
              </p>

              {user.role === 'therapist' && user.verified && (
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500 font-medium">Verified Therapist</span>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center justify-center mb-2">
                    <Heart className="w-5 h-5 text-purple-500" />
                  </div>
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {user.role === 'patient' ? 'Sessions' : 'Patients'}
                  </p>
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {user.role === 'patient' ? '24' : '156'}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {user.role === 'patient' ? 'Streak' : 'Experience'}
                  </p>
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {user.role === 'patient' ? '7 days' : '8 years'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`lg:col-span-2 p-6 rounded-2xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Personal Information
              </h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                      isEditing
                        ? 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                        : 'cursor-not-allowed'
                    } ${
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
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                      isEditing
                        ? 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                        : 'cursor-not-allowed'
                    } ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="+1 (555) 123-4567"
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                    isEditing
                      ? 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                      : 'cursor-not-allowed'
                  } ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              {/* Role-specific fields */}
              {user.role === 'patient' && (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Age
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                          isEditing
                            ? 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                            : 'cursor-not-allowed'
                        } ${
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
                        Emergency Contact Email
                      </label>
                      <input
                        type="email"
                        name="emergencyContactEmail"
                        value={formData.emergencyContactEmail}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                          isEditing
                            ? 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                            : 'cursor-not-allowed'
                        } ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Emergency Contact Relationship
                    </label>
                    <select
                      name="emergencyContactRelation"
                      value={formData.emergencyContactRelation}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                        isEditing
                          ? 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                          : 'cursor-not-allowed'
                      } ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">Select relationship</option>
                      <option value="parent">Parent</option>
                      <option value="spouse">Spouse</option>
                      <option value="sibling">Sibling</option>
                      <option value="child">Child</option>
                      <option value="friend">Friend</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </>
              )}

              {user.role === 'therapist' && (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Specialization
                      </label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                          isEditing
                            ? 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                            : 'cursor-not-allowed'
                        } ${
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
                        License Number
                      </label>
                      <input
                        type="text"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                          isEditing
                            ? 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                            : 'cursor-not-allowed'
                        } ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Years of Experience
                      </label>
                      <input
                        type="text"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="e.g., 8 years"
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                          isEditing
                            ? 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                            : 'cursor-not-allowed'
                        } ${
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
                      Hourly Rate ($)
                    </label>
                    <input
                      type="number"
                      name="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                        isEditing
                          ? 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                          : 'cursor-not-allowed'
                      } ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  </div>
                </>
              )}

              {/* Bio */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 resize-none ${
                    isEditing
                      ? 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                      : 'cursor-not-allowed'
                  } ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;