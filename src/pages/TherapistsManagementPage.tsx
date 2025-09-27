import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Search, Filter, Plus, Eye, Edit, Trash2, 
  Shield, UserCheck, UserX, Mail, Phone, Calendar,
  MoreVertical, Ban, CheckCircle, AlertTriangle,
  Award, DollarSign, Star, Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface Therapist {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization: string;
  experience: string;
  licenseNumber: string;
  hourlyRate: number;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  verified: boolean;
  joinDate: string;
  lastLogin: string;
  patientsCount: number;
  rating: number;
  bio?: string;
}

function TherapistsManagementPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [showTherapistModal, setShowTherapistModal] = useState(false);
  const [therapists, setTherapists] = useState<Therapist[]>([]);

  useEffect(() => {
    loadTherapists();
    
    // Set up interval to refresh data
    const interval = setInterval(loadTherapists, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadTherapists = () => {
    // Load registered therapist users
    const registeredUsers = JSON.parse(localStorage.getItem('mindcare_registered_users') || '[]');
    const therapistUsers = registeredUsers.filter((u: any) => 
      u.role === 'therapist' && u.status !== 'deleted'
    );
    
    // Load therapist services
    const therapistServices = JSON.parse(localStorage.getItem('mindcare_therapist_services') || '[]');
    const activeServices = therapistServices.filter((s: any) => s.status !== 'deleted');
    
    // Demo therapist
    const demoTherapist = {
      id: '2',
      name: 'Dr. Sarah Smith',
      email: 'therapist@example.com',
      phone: '+1 (555) 234-5678',
      specialization: 'Cognitive Behavioral Therapy',
      experience: '8 years',
      licenseNumber: 'LIC123456',
      hourlyRate: 120,
      status: 'active' as const,
      verified: true,
      joinDate: '2023-03-10',
      lastLogin: '2024-01-15',
      patientsCount: 28,
      rating: 4.8,
      bio: 'Experienced therapist specializing in CBT with a passion for helping patients overcome anxiety and depression.'
    };

    const allTherapists = [demoTherapist];
    
    // Add registered therapists
    therapistUsers.forEach((therapistUser: any) => {
      const service = activeServices.find((s: any) => s.therapistId === therapistUser.id);
      
      const therapistData: Therapist = {
        id: therapistUser.id,
        name: therapistUser.name,
        email: therapistUser.email,
        phone: therapistUser.phone,
        specialization: therapistUser.specialization || service?.specialization?.[0] || 'General Therapy',
        experience: therapistUser.experience || service?.experience || '0 years',
        licenseNumber: therapistUser.licenseNumber || service?.licenseNumber || 'N/A',
        hourlyRate: therapistUser.hourlyRate || service?.chargesPerSession || 100,
        status: therapistUser.status === 'suspended' ? 'suspended' :
                therapistUser.status === 'approved' ? 'active' : 
                therapistUser.status === 'pending' ? 'pending' : 'inactive',
        verified: therapistUser.verified || false,
        joinDate: therapistUser.joinDate || new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString().split('T')[0],
        patientsCount: 0,
        rating: 4.5,
        bio: therapistUser.bio || service?.bio
      };
      
      allTherapists.push(therapistData);
    });

    setTherapists(allTherapists);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'inactive': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

  const handleTherapistAction = (therapistId: string, action: string) => {
    if (action === 'suspend' || action === 'activate') {
      const newStatus = action === 'suspend' ? 'suspended' : 'active';
      
      // Update local state
      setTherapists(prev => prev.map(t => 
        t.id === therapistId ? { ...t, status: newStatus as any } : t
      ));
      
      // Update registered users in localStorage
      const registeredUsers = JSON.parse(localStorage.getItem('mindcare_registered_users') || '[]');
      const updatedUsers = registeredUsers.map((u: any) => 
        u.id === therapistId ? { ...u, status: newStatus === 'active' ? 'approved' : newStatus } : u
      );
      localStorage.setItem('mindcare_registered_users', JSON.stringify(updatedUsers));
      
      // Update therapist services status
      const therapistServices = JSON.parse(localStorage.getItem('mindcare_therapist_services') || '[]');
      const updatedServices = therapistServices.map((s: any) => 
        s.therapistId === therapistId ? { ...s, status: newStatus === 'suspended' ? 'suspended' : 'approved' } : s
      );
      localStorage.setItem('mindcare_therapist_services', JSON.stringify(updatedServices));
      
      // Update available therapists for booking based on status
      const availableTherapists = JSON.parse(localStorage.getItem('mindcare_therapists') || '[]');
      
      if (newStatus === 'suspended') {
        // Remove from available therapists
        const updatedAvailableTherapists = availableTherapists.filter((t: any) => t.id !== therapistId);
        localStorage.setItem('mindcare_therapists', JSON.stringify(updatedAvailableTherapists));
      } else if (newStatus === 'active') {
        // Add back to available therapists if not already there
        const therapistExists = availableTherapists.some((t: any) => t.id === therapistId);
        if (!therapistExists) {
          // Find therapist data to add back
          const therapistUser = registeredUsers.find((u: any) => u.id === therapistId);
          const therapistService = therapistServices.find((s: any) => s.therapistId === therapistId);
          
          if (therapistUser && therapistService) {
            const therapistForBooking = {
              id: therapistId,
              name: therapistUser.name,
              title: therapistService.qualification,
              specialization: therapistService.specialization,
              experience: parseInt(therapistUser.experience?.split(' ')[0] || '0') || 0,
              rating: 4.8,
              reviewCount: 0,
              hourlyRate: therapistUser.hourlyRate || therapistService.chargesPerSession,
              location: 'Online',
              avatar: therapistService.profilePicture || 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=150',
              verified: true,
              nextAvailable: 'Today, 2:00 PM',
              bio: therapistUser.bio || therapistService.bio,
              languages: therapistService.languages || ['English']
            };
            
            const updatedAvailableTherapists = [...availableTherapists, therapistForBooking];
            localStorage.setItem('mindcare_therapists', JSON.stringify(updatedAvailableTherapists));
          }
        }
      }
      
      // Force reload of therapists data
      setTimeout(() => {
        loadTherapists();
      }, 100);
      
    } else if (action === 'delete') {
      // Remove from local state
      setTherapists(prev => prev.filter(t => t.id !== therapistId));
      
      // Remove from registered users
      const registeredUsers = JSON.parse(localStorage.getItem('mindcare_registered_users') || '[]');
      const updatedUsers = registeredUsers.map((u: any) => 
        u.id === therapistId ? { ...u, status: 'deleted' } : u
      );
      localStorage.setItem('mindcare_registered_users', JSON.stringify(updatedUsers));
      
      // Remove therapist services
      const therapistServices = JSON.parse(localStorage.getItem('mindcare_therapist_services') || '[]');
      const updatedServices = therapistServices.map((s: any) => 
        s.therapistId === therapistId ? { ...s, status: 'deleted' } : s
      );
      localStorage.setItem('mindcare_therapist_services', JSON.stringify(updatedServices));
      
      // Remove from available therapists for booking
      const availableTherapists = JSON.parse(localStorage.getItem('mindcare_therapists') || '[]');
      const updatedAvailableTherapists = availableTherapists.filter((t: any) => t.id !== therapistId);
      localStorage.setItem('mindcare_therapists', JSON.stringify(updatedAvailableTherapists));
      
      // Force reload of therapists data
      setTimeout(() => {
        loadTherapists();
      }, 100);
    }
    
    const actionText = action === 'suspend' ? 'suspended' : 
                     action === 'activate' ? 'activated' : 
                     action === 'delete' ? 'deleted' : action;
    toast.success(`Therapist ${actionText} successfully`);
  };

  const filteredTherapists = therapists.filter(therapist => {
    const matchesSearch = therapist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         therapist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         therapist.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || therapist.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      title: 'Total Therapists',
      value: therapists.length,
      icon: Users,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Active Therapists',
      value: therapists.filter(t => t.status === 'active').length,
      icon: UserCheck,
      color: 'from-green-500 to-teal-500'
    },
    {
      title: 'Pending Approval',
      value: therapists.filter(t => t.status === 'pending').length,
      icon: Clock,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'Average Rating',
      value: (therapists.reduce((sum, t) => sum + t.rating, 0) / therapists.length || 0).toFixed(1),
      icon: Star,
      color: 'from-purple-500 to-pink-500'
    }
  ];

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
                Therapist Management
              </h1>
              <p className={`text-base ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Manage therapist accounts and monitor their performance
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
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
          transition={{ delay: 0.4 }}
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
                  placeholder="Search therapists..."
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
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Therapists Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTherapists.map((therapist, index) => (
            <motion.div
              key={therapist.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`p-4 rounded-xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className={`font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {therapist.name}
                      </h3>
                      {therapist.verified && (
                        <Shield className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {therapist.specialization}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(therapist.status)}`}>
                  {therapist.status}
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
                    {therapist.email}
                  </span>
                </div>
                {therapist.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className={`w-4 h-4 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {therapist.phone}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Award className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {therapist.experience}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm font-semibold text-green-600`}>
                    ${therapist.hourlyRate}/hour
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {therapist.rating} ({therapist.patientsCount} patients)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedTherapist(therapist);
                      setShowTherapistModal(true);
                    }}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex space-x-2">
                  {therapist.status === 'active' ? (
                    <button
                      onClick={() => handleTherapistAction(therapist.id, 'suspend')}
                      className="p-2 text-gray-500 hover:text-yellow-600 transition-colors"
                      title="Suspend therapist"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  ) : therapist.status === 'suspended' ? (
                    <button
                      onClick={() => handleTherapistAction(therapist.id, 'activate')}
                      className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                      title="Activate therapist"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleTherapistAction(therapist.id, 'activate')}
                      className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                      title="Activate therapist"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleTherapistAction(therapist.id, 'delete')}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    title="Delete therapist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Therapist Detail Modal */}
        {showTherapistModal && selectedTherapist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTherapistModal(false)}
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
                    Therapist Details
                  </h2>
                  <button
                    onClick={() => setShowTherapistModal(false)}
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
                          {selectedTherapist.name}
                        </p>
                      </div>
                      <div>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Email</label>
                        <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                          {selectedTherapist.email}
                        </p>
                      </div>
                      {selectedTherapist.phone && (
                        <div>
                          <label className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>Phone</label>
                          <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                            {selectedTherapist.phone}
                          </p>
                        </div>
                      )}
                      <div>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Status</label>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedTherapist.status)}`}>
                          {selectedTherapist.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      Professional Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Specialization</label>
                        <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                          {selectedTherapist.specialization}
                        </p>
                      </div>
                      <div>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Experience</label>
                        <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                          {selectedTherapist.experience}
                        </p>
                      </div>
                      <div>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>License Number</label>
                        <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                          {selectedTherapist.licenseNumber}
                        </p>
                      </div>
                      <div>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Hourly Rate</label>
                        <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                          ${selectedTherapist.hourlyRate}
                        </p>
                      </div>
                      <div>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Rating</label>
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                            {selectedTherapist.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedTherapist.bio && (
                  <div className="mt-6">
                    <h3 className={`text-lg font-semibold mb-4 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      Bio
                    </h3>
                    <div className={`p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {selectedTherapist.bio}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default TherapistsManagementPage;