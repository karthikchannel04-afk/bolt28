import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Users, UserCheck, Shield, BarChart3, AlertTriangle, TrendingUp, DollarSign, Clock, CheckCircle, XCircle, Eye, CreditCard as Edit, Trash2, Search, Filter, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  getAnalytics, updateAnalyticsFromCurrentData, trackTherapistApproval,
  getRecentActivity, generateTimeSeriesData
} from '../utils/analyticsManager';

function AdminDashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [pendingTherapists, setPendingTherapists] = useState<any[]>([]);
  const [pendingServices, setPendingServices] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    // Load initial analytics data
    const initialAnalytics = updateAnalyticsFromCurrentData();
    setAnalytics(initialAnalytics);
    
    // Load recent activity
    setRecentActivity(getRecentActivity());
    
    // Load pending services from localStorage
    const loadPendingServices = () => {
      const services = JSON.parse(localStorage.getItem('mindcare_therapist_services') || '[]');
      const pending = services.filter((service: any) => service.status === 'pending');
      setPendingServices(pending);
    };
    
    loadPendingServices();
    
    // Set up interval to refresh data
    const interval = setInterval(() => {
      loadPendingServices();
      const updatedAnalytics = updateAnalyticsFromCurrentData();
      setAnalytics(updatedAnalytics);
      setRecentActivity(getRecentActivity());
    }, 5000);
    
    // Listen for analytics updates
    const handleAnalyticsUpdate = () => {
      const updatedAnalytics = updateAnalyticsFromCurrentData();
      setAnalytics(updatedAnalytics);
      setRecentActivity(getRecentActivity());
    };
    
    window.addEventListener('mindcare-analytics-updated', handleAnalyticsUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('mindcare-analytics-updated', handleAnalyticsUpdate);
    };
  }, []);

  const stats = analytics ? [
    {
      title: 'Total Users',
      value: analytics.users.totalUsers.toLocaleString(),
      change: `+${analytics.users.userGrowthRate}% from last month`,
      icon: Users,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Active Therapists',
      value: analytics.therapists.activeTherapists.toString(),
      change: `${analytics.therapists.pendingApprovals} pending approval`,
      icon: UserCheck,
      color: 'from-green-500 to-teal-500'
    },
    {
      title: 'Platform Revenue',
      value: `$${analytics.revenue.totalRevenue.toLocaleString()}`,
      change: `+${analytics.revenue.revenueGrowthRate}% from last month`,
      icon: DollarSign,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Total Sessions',
      value: analytics.sessions.totalSessions.toString(),
      change: `${analytics.sessions.sessionCompletionRate.toFixed(1)}% completion rate`,
      icon: BarChart3,
      color: 'from-orange-500 to-red-500'
    }
  ] : [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'therapists', label: 'Therapists', icon: UserCheck },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ];

  const handleTabClick = (tabId: string) => {
    if (tabId === 'users') {
      navigate('/users');
    } else if (tabId === 'therapists') {
      navigate('/therapists');
    } else if (tabId === 'analytics') {
      navigate('/analytics');
    } else {
      setSelectedTab(tabId);
    }
  };

  const handleApproveTherapist = (id: string) => {
    const services = JSON.parse(localStorage.getItem('mindcare_therapist_services') || '[]');
    const registeredUsers = JSON.parse(localStorage.getItem('mindcare_registered_users') || '[]');
    
    const serviceToApprove = services.find((s: any) => s.id === id);
    if (serviceToApprove) {
      // Update service status
      const updatedServices = services.map((s: any) => 
        s.id === id ? { ...s, status: 'approved', approvedAt: new Date().toISOString() } : s
      );
      localStorage.setItem('mindcare_therapist_services', JSON.stringify(updatedServices));
      
      // Update the therapist's status in registered users
      const updatedUsers = registeredUsers.map((u: any) => 
        u.id === serviceToApprove.therapistId ? { ...u, status: 'approved', verified: true } : u
      );
      localStorage.setItem('mindcare_registered_users', JSON.stringify(updatedUsers));
      
      // Add to available therapists for booking
      const availableTherapists = JSON.parse(localStorage.getItem('mindcare_therapists') || '[]');
      
      // Get the therapist user data for complete profile
      const therapistUser = registeredUsers.find((u: any) => u.id === serviceToApprove.therapistId);
      
      const therapistForBooking = {
        id: serviceToApprove.therapistId,
        name: serviceToApprove.therapistName,
        title: serviceToApprove.qualification,
        specialization: serviceToApprove.specialization,
        experience: therapistUser?.experience ? parseInt(therapistUser.experience.split(' ')[0]) || 0 : parseInt(serviceToApprove.experience.split(' ')[0]) || 0,
        rating: 4.8,
        reviewCount: 0,
        hourlyRate: therapistUser?.hourlyRate || serviceToApprove.chargesPerSession,
        location: 'Online',
        avatar: serviceToApprove.profilePicture && serviceToApprove.profilePicture.trim() !== '' 
          ? serviceToApprove.profilePicture 
          : 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=150',
        verified: true,
        nextAvailable: 'Today, 2:00 PM',
        bio: therapistUser?.bio || serviceToApprove.bio,
        languages: serviceToApprove.languages
      };
      
      const updatedAvailableTherapists = availableTherapists.filter((t: any) => t.id !== serviceToApprove.therapistId);
      updatedAvailableTherapists.push(therapistForBooking);
      localStorage.setItem('mindcare_therapists', JSON.stringify(updatedAvailableTherapists));
      
      // Track the approval in analytics
      trackTherapistApproval(serviceToApprove);
      
      // Refresh pending services to remove the approved one
      setPendingServices(prev => prev.filter(s => s.id !== id));
      
      toast.success(`${serviceToApprove.therapistName}'s service has been approved!`);
      
      // Trigger a refresh of the therapists page data if it's loaded
      window.dispatchEvent(new CustomEvent('mindcare-therapist-approved', { detail: { therapistId: serviceToApprove.therapistId } }));
    }
  };

  const handleRejectTherapist = (id: string) => {
    const services = JSON.parse(localStorage.getItem('mindcare_therapist_services') || '[]');
    const registeredUsers = JSON.parse(localStorage.getItem('mindcare_registered_users') || '[]');
    
    const serviceToReject = services.find((s: any) => s.id === id);
    if (serviceToReject) {
      // Update service status
      const updatedServices = services.map((s: any) => 
        s.id === id ? { ...s, status: 'rejected' } : s
      );
      localStorage.setItem('mindcare_therapist_services', JSON.stringify(updatedServices));
      
      // Update the therapist's status in registered users
      const updatedUsers = registeredUsers.map((u: any) => 
        u.id === serviceToReject.therapistId ? { ...u, status: 'rejected' } : u
      );
      localStorage.setItem('mindcare_registered_users', JSON.stringify(updatedUsers));
      
      // Remove from available therapists for booking if they were there
      const availableTherapists = JSON.parse(localStorage.getItem('mindcare_therapists') || '[]');
      const updatedAvailableTherapists = availableTherapists.filter((t: any) => t.id !== serviceToReject.therapistId);
      localStorage.setItem('mindcare_therapists', JSON.stringify(updatedAvailableTherapists));
    }
    
    setPendingServices(prev => prev.filter(s => s.id !== id));
    toast.success(`${serviceToReject?.therapistName || 'Therapist'}'s service has been rejected.`);
    
    // Trigger a refresh of the therapists page data if it's loaded
    window.dispatchEvent(new CustomEvent('mindcare-therapist-rejected', { detail: { therapistId: serviceToReject?.therapistId } }));
  };

  const getIconComponent = (iconName: string) => {
    const icons: any = {
      Users,
      CheckCircle,
      DollarSign,
      Play: Clock,
      UserPlus: Users,
      Activity: BarChart3
    };
    return icons[iconName] || BarChart3;
  };

  return (
    <div className={`min-h-screen py-8 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50'
    }`}>
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Admin Dashboard
          </h1>
          <p className={`text-lg ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Manage platform operations and monitor system health
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-2xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {stat.title}
                  </h3>
                  <p className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {stat.change}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className={`flex space-x-1 p-1 rounded-2xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  selectedTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content based on selected tab */}
        {selectedTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Pending Service Approvals */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className={`p-6 rounded-2xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  Pending Service Approvals
                </h3>
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                  {pendingServices.length} pending
                </span>
              </div>
              <div className="space-y-4">
                {pendingServices.map((service) => (
                  <div
                    key={service.id}
                    className={`p-4 rounded-xl border ${
                      theme === 'dark' 
                        ? 'border-gray-700 bg-gray-700/50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className={`font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-800'
                        }`}>
                          Dr. {service.therapistName}
                        </h4>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {service.qualification} • {service.experience}
                        </p>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          ${service.chargesPerSession}/session
                        </p>
                      </div>
                      <span className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {new Date(service.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {service.specialization.slice(0, 3).map((spec: string, idx: number) => (
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
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleApproveTherapist(service.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleRejectTherapist(service.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Reject</span>
                      </button>
                      <button className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                        <Eye className="w-3 h-3" />
                        <span>Review</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activities */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className={`p-6 rounded-2xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <h3 className={`text-xl font-semibold mb-6 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Recent Activities
              </h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const IconComponent = getIconComponent(activity.icon);
                  return (
                  <div
                    key={activity.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activity.type.includes('user') ? 'bg-blue-100' :
                      activity.type.includes('therapist') ? 'bg-green-100' :
                      activity.type.includes('payment') ? 'bg-purple-100' :
                      activity.type.includes('session') ? 'bg-teal-100' :
                      'bg-orange-100'
                    }`}>
                      <IconComponent className={`w-4 h-4 ${
                        activity.type.includes('user') ? 'text-blue-600' :
                        activity.type.includes('therapist') ? 'text-green-600' :
                        activity.type.includes('payment') ? 'text-purple-600' :
                        activity.type.includes('session') ? 'text-teal-600' :
                        'text-orange-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {activity.description}
                      </p>
                      <p className={`text-xs ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}

        {selectedTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-2xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className={`text-lg ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Redirecting to User Management...
              </p>
            </div>
          </motion.div>
        )}

        {selectedTab === 'therapists' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-2xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className={`text-lg ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Redirecting to Therapist Management...
              </p>
            </div>
          </motion.div>
        )}

        {selectedTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-2xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className={`text-lg ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Redirecting to Analytics Dashboard...
              </p>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;