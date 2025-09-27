import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Calendar, Users, MessageSquare, BarChart3, Clock, Bell,
  Video, Phone, CheckCircle, AlertTriangle, TrendingUp,
  DollarSign, Award, Heart, Target, Plus, Eye, Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

function TherapistDashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [todaysAppointments, setTodaysAppointments] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [weekSessions, setWeekSessions] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

  useEffect(() => {
    // Load appointments from localStorage
    const loadAppointments = () => {
      const allBookings = JSON.parse(localStorage.getItem('mindcare_bookings') || '[]');
      
      // Filter appointments for current therapist
      const therapistAppointments = allBookings.filter((booking: any) => 
        booking.therapistName === user?.name || booking.therapistId === user?.id
      );
      
      const today = new Date().toISOString().split('T')[0];
      const todaysAppts = therapistAppointments.filter((apt: any) => apt.date === today);
      const upcomingAppts = therapistAppointments.filter((apt: any) => 
        new Date(apt.date) >= new Date() && apt.status === 'confirmed'
      );
      
      setTodaysAppointments(todaysAppts);
      setUpcomingAppointments(upcomingAppts);

      // Calculate unique patients
      const uniquePatients = new Set(therapistAppointments.map((apt: any) => apt.patientId));
      setTotalPatients(uniquePatients.size);

      // Calculate this week's sessions
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeekSessions = therapistAppointments.filter((apt: any) => 
        new Date(apt.date) >= oneWeekAgo && apt.status === 'completed'
      );
      setWeekSessions(thisWeekSessions.length);

      // Calculate monthly revenue
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const monthlyBookings = therapistAppointments.filter((apt: any) => 
        new Date(apt.date) >= oneMonthAgo && apt.status === 'completed'
      );
      const revenue = monthlyBookings.reduce((sum: number, apt: any) => {
        const amount = parseFloat(apt.amount?.replace('$', '') || '0');
        return sum + amount;
      }, 0);
      setMonthlyRevenue(revenue);

      // Generate recent activity from real data
      const recentBookings = therapistAppointments
        .sort((a: any, b: any) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
        .slice(0, 4);
      
      const activities = recentBookings.map((booking: any) => {
        const timeDiff = new Date().getTime() - new Date(booking.createdAt || booking.date).getTime();
        const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
        const daysAgo = Math.floor(hoursAgo / 24);
        
        let timeText = '';
        if (daysAgo > 0) {
          timeText = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
        } else if (hoursAgo > 0) {
          timeText = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
        } else {
          timeText = 'Just now';
        }

        let action = '';
        let type = '';
        if (booking.status === 'pending_confirmation') {
          action = 'New appointment booked';
          type = 'booking';
        } else if (booking.status === 'completed') {
          action = 'Session completed';
          type = 'session';
        } else if (booking.status === 'confirmed') {
          action = 'Appointment confirmed';
          type = 'booking';
        } else {
          action = 'Appointment updated';
          type = 'booking';
        }

        return {
          id: booking.id,
          action,
          patient: booking.patientName,
          time: timeText,
          type
        };
      });
      
      setRecentActivity(activities);
    };

    loadAppointments();
    
    // Set up interval to refresh appointments
    const interval = setInterval(loadAppointments, 5000);
    
    // Listen for storage changes
    const handleStorageChange = () => {
      loadAppointments();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mindcare-data-updated', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mindcare-data-updated', handleStorageChange);
    };
  }, [user]);

  const stats = [
    {
      title: "Today's Appointments",
      value: todaysAppointments.length,
      icon: Calendar,
      color: 'from-blue-500 to-cyan-500',
      change: `${todaysAppointments.filter(apt => apt.status === 'confirmed').length} confirmed`
    },
    {
      title: 'Active Patients',
      value: totalPatients.toString(),
      icon: Users,
      color: 'from-green-500 to-teal-500',
      change: `${totalPatients > 0 ? 'Growing practice' : 'Start building'}`
    },
    {
      title: "This Week's Sessions",
      value: weekSessions.toString(),
      icon: BarChart3,
      color: 'from-orange-500 to-red-500',
      change: `$${monthlyRevenue.toLocaleString()} revenue`
    }
  ];

  const quickActions = [
    {
      icon: Plus,
      title: 'List Service',
      description: 'Create your professional profile',
      link: '/list-service',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Calendar,
      title: 'View Appointments',
      description: 'Manage your therapy sessions',
      link: '/appointments',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Patient Records',
      description: 'Access patient information',
      link: '/patients',
      color: 'from-teal-500 to-green-500'
    },
    {
      icon: BarChart3,
      title: 'Reports & Analytics',
      description: 'View practice performance',
      link: '/reports',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return Calendar;
      case 'session': return Video;
      case 'message': return MessageSquare;
      case 'report': return BarChart3;
      default: return Bell;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'booking': return 'text-blue-500';
      case 'session': return 'text-green-500';
      case 'message': return 'text-purple-500';
      case 'report': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className={`h-screen flex flex-col ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50'
    }`}>
      <div className="flex-1 overflow-y-auto p-4">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Welcome back, {user?.name}!
          </h1>
          <p className={`text-base ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Here's an overview of your practice and upcoming sessions
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

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h3 className={`text-lg font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Quick Actions
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.link}>
                <motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-6 rounded-xl shadow-lg transition-all duration-300 cursor-pointer ${
                    theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-xl'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-4`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className={`text-lg font-semibold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {action.title}
                  </h4>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {action.description}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className={`lg:col-span-2 rounded-2xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`p-6 border-b ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className={`text-lg font-semibold flex items-center ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Today's Schedule
              </h2>
            </div>
            <div className="p-6">
              {todaysAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className={`w-12 h-12 mx-auto mb-4 ${
                    theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                  <p className={`text-lg ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    No appointments scheduled for today
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todaysAppointments.map((appointment, index) => (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {appointment.time}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-800'
                          }`}>
                            {appointment.patientName}
                          </p>
                          <p className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Video Therapy Session
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          appointment.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                            : appointment.status === 'pending_confirmation'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                        }`}>
                          {appointment.status === 'pending_confirmation' ? 'Pending' : appointment.status}
                        </span>
                        {appointment.status === 'confirmed' && (
                          <button className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs">
                            Join
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`rounded-2xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`p-6 border-b ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className={`text-lg font-semibold flex items-center ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                <Bell className="h-5 w-5 mr-2 text-purple-600" />
                Recent Activity
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start space-x-3"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center`}>
                        <ActivityIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-white' : 'text-gray-800'
                        }`}>
                          {activity.action}
                        </p>
                        <p className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {activity.patient} • {activity.time}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`mt-8 p-6 rounded-2xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            This Week's Overview
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: 'Sessions Completed', value: '12', icon: CheckCircle, color: 'text-green-500' },
              { label: 'Revenue Generated', value: '$1,440', icon: DollarSign, color: 'text-green-600' },
              { label: 'Patient Satisfaction', value: '4.8/5', icon: Star, color: 'text-yellow-500' },
              { label: 'Response Time', value: '< 2h', icon: Clock, color: 'text-blue-500' }
            ].map((metric, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <p className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {metric.value}
                </p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default TherapistDashboard;