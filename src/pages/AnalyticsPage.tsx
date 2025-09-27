import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, Users, DollarSign, Calendar, TrendingUp, Download,
  Activity, Heart, Clock, Star, RefreshCw, FileText
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

function AnalyticsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [patientEngagement, setPatientEngagement] = useState<any[]>([]);

  const loadAnalyticsData = () => {
    setIsLoading(true);
    
    // Get real data from localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('mindcare_registered_users') || '[]');
    const bookings = JSON.parse(localStorage.getItem('mindcare_bookings') || '[]');
    const moodEntries = JSON.parse(localStorage.getItem('mindcare_mood_entries') || '[]');
    const cbtRecords = JSON.parse(localStorage.getItem('mindcare_cbt_records') || '[]');
    const gratitudeEntries = JSON.parse(localStorage.getItem('mindcare_gratitude_entries') || '[]');
    const sleepLogs = JSON.parse(localStorage.getItem('mindcare_sleep_logs') || '[]');
    const therapistServices = JSON.parse(localStorage.getItem('mindcare_therapist_services') || '[]');
    const availableTherapists = JSON.parse(localStorage.getItem('mindcare_therapists') || '[]');
    
    // Load patient engagement data
    const engagementData = JSON.parse(localStorage.getItem('mindcare_patient_engagement') || '[]');
    if (engagementData.length > 0) {
      setPatientEngagement(engagementData);
    } else {
      // Default engagement data if none exists
      setPatientEngagement([
        { name: 'Highly Active', value: 8, color: '#10B981' },
        { name: 'Moderately Active', value: 12, color: '#3B82F6' },
        { name: 'Low Activity', value: 5, color: '#F59E0B' }
      ]);
    }

    // Calculate metrics
    const totalUsers = registeredUsers.length + 3; // +3 for demo users
    const patients = registeredUsers.filter((u: any) => u.role === 'patient');
    const therapists = registeredUsers.filter((u: any) => u.role === 'therapist');
    const activeTherapists = therapistServices.filter((s: any) => s.status === 'approved').length + 1; // +1 for demo therapist
    
    const completedSessions = bookings.filter((b: any) => b.status === 'completed').length;
    const totalSessions = bookings.length;
    const pendingSessions = bookings.filter((b: any) => b.status === 'pending_confirmation').length;
    
    // Calculate revenue from completed bookings
    const totalRevenue = bookings
      .filter((b: any) => b.status === 'completed')
      .reduce((sum: number, booking: any) => {
        const amount = parseFloat(booking.amount?.replace('$', '') || '120');
        return sum + amount;
      }, 0);

    // Generate monthly data for charts
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      // Simulate growth over time
      const baseUsers = Math.floor(totalUsers * (0.5 + (i * 0.1)));
      const baseSessions = Math.floor(totalSessions * (0.4 + (i * 0.12)));
      const baseRevenue = Math.floor(totalRevenue * (0.3 + (i * 0.15)));
      
      return {
        month: monthName,
        users: baseUsers,
        sessions: baseSessions,
        revenue: baseRevenue
      };
    });

    // Module usage data
    const moduleUsage = [
      { name: 'Mood Tracker', usage: moodEntries.length, color: '#8B5CF6' },
      { name: 'CBT Journaling', usage: cbtRecords.length, color: '#3B82F6' },
      { name: 'Gratitude Journal', usage: gratitudeEntries.length, color: '#10B981' },
      { name: 'Sleep Therapy', usage: sleepLogs.length, color: '#F59E0B' },
      { name: 'Video Sessions', usage: completedSessions, color: '#EF4444' },
      { name: 'AI Assistant', usage: Math.floor(totalUsers * 0.8), color: '#EC4899' }
    ];


    // Therapist performance
    const therapistPerformance = availableTherapists.map((therapist: any) => {
      const therapistBookings = bookings.filter((b: any) => 
        b.therapistId === therapist.id || b.therapistName === therapist.name
      );
      const completed = therapistBookings.filter((b: any) => b.status === 'completed').length;
      const revenue = completed * (therapist.hourlyRate || 120);
      
      return {
        name: therapist.name,
        sessions: completed,
        rating: therapist.rating || 4.8,
        revenue: revenue,
        patients: new Set(therapistBookings.map((b: any) => b.patientId)).size
      };
    });

    // Weekly activity data
    const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      return {
        day: dayName,
        sessions: Math.floor(Math.random() * 5) + 1,
        registrations: Math.floor(Math.random() * 3),
        moduleUsage: Math.floor(Math.random() * 10) + 5
      };
    });

    const analytics = {
      overview: {
        totalUsers,
        totalRevenue,
        totalSessions,
        activeTherapists,
        completedSessions,
        pendingSessions,
        averageSessionValue: totalSessions > 0 ? Math.round(totalRevenue / totalSessions) : 120,
        userGrowthRate: 15.2,
        revenueGrowthRate: 22.8,
        sessionCompletionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0
      },
      charts: {
        monthlyTrends: last6Months,
        moduleUsage,
        patientEngagement: patientEngagement,
        weeklyActivity
      },
      therapists: therapistPerformance,
      recentActivity: [
        { type: 'session', description: 'New therapy session completed', time: '2 hours ago' },
        { type: 'user', description: 'New patient registered', time: '4 hours ago' },
        { type: 'payment', description: 'Payment processed: $120', time: '6 hours ago' },
        { type: 'module', description: 'CBT module completed', time: '8 hours ago' },
        { type: 'therapist', description: 'Therapist approved', time: '1 day ago' }
      ]
    };

    setAnalyticsData(analytics);
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  useEffect(() => {
    loadAnalyticsData();
    
    // Set up interval to refresh data every 10 seconds
    const interval = setInterval(loadAnalyticsData, 10000);
    
    // Listen for data updates
    const handleDataUpdate = () => {
      loadAnalyticsData();
    };
    
    window.addEventListener('mindcare-data-updated', handleDataUpdate);
    window.addEventListener('storage', handleDataUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('mindcare-data-updated', handleDataUpdate);
      window.removeEventListener('storage', handleDataUpdate);
    };
  }, []);

  const exportData = (format: 'json' | 'csv' | 'report') => {
    if (!analyticsData) {
      toast.error('No data available to export');
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    let content = '';
    let filename = '';
    let mimeType = '';

    try {
      switch (format) {
        case 'json':
          content = JSON.stringify(analyticsData, null, 2);
          filename = `mindcare-analytics-${timestamp}.json`;
          mimeType = 'application/json';
          break;
          
        case 'csv':
          content = 'Metric,Value\n';
          content += `Total Users,${analyticsData.overview.totalUsers}\n`;
          content += `Total Revenue,$${analyticsData.overview.totalRevenue}\n`;
          content += `Total Sessions,${analyticsData.overview.totalSessions}\n`;
          content += `Completed Sessions,${analyticsData.overview.completedSessions}\n`;
          content += `Active Therapists,${analyticsData.overview.activeTherapists}\n`;
          content += `Session Completion Rate,${analyticsData.overview.sessionCompletionRate}%\n`;
          content += `Average Session Value,$${analyticsData.overview.averageSessionValue}\n\n`;
          
          content += 'Module,Usage Count\n';
          analyticsData.charts.moduleUsage.forEach((module: any) => {
            content += `${module.name},${module.usage}\n`;
          });
          
          content += '\nTherapist,Sessions,Rating,Revenue,Patients\n';
          analyticsData.therapists.forEach((therapist: any) => {
            content += `${therapist.name},${therapist.sessions},${therapist.rating},$${therapist.revenue},${therapist.patients}\n`;
          });
          
          filename = `mindcare-analytics-${timestamp}.csv`;
          mimeType = 'text/csv';
          break;
          
        case 'report':
          content = `MindCare Analytics Report\n`;
          content += `Generated: ${new Date().toLocaleDateString()}\n`;
          content += `=================================\n\n`;
          
          content += `OVERVIEW METRICS:\n`;
          content += `- Total Users: ${analyticsData.overview.totalUsers}\n`;
          content += `- Total Revenue: $${analyticsData.overview.totalRevenue.toLocaleString()}\n`;
          content += `- Total Sessions: ${analyticsData.overview.totalSessions}\n`;
          content += `- Completed Sessions: ${analyticsData.overview.completedSessions}\n`;
          content += `- Active Therapists: ${analyticsData.overview.activeTherapists}\n`;
          content += `- Session Completion Rate: ${analyticsData.overview.sessionCompletionRate}%\n`;
          content += `- Average Session Value: $${analyticsData.overview.averageSessionValue}\n\n`;
          
          content += `THERAPY MODULE USAGE:\n`;
          analyticsData.charts.moduleUsage.forEach((module: any) => {
            content += `- ${module.name}: ${module.usage} uses\n`;
          });
          
          content += `\nTOP THERAPIST PERFORMANCE:\n`;
          analyticsData.therapists.forEach((therapist: any, index: number) => {
            content += `${index + 1}. ${therapist.name}\n`;
            content += `   Sessions: ${therapist.sessions}\n`;
            content += `   Rating: ${therapist.rating.toFixed(1)}/5\n`;
            content += `   Revenue: $${therapist.revenue.toLocaleString()}\n`;
            content += `   Patients: ${therapist.patients}\n\n`;
          });
          
          filename = `mindcare-analytics-report-${timestamp}.txt`;
          mimeType = 'text/plain';
          break;
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Analytics data exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export data');
      console.error('Export error:', error);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className={`h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50'
      }`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Access Denied
          </h2>
          <p className={`${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            You don't have permission to view analytics.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || !analyticsData) {
    return (
      <div className={`h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className={`text-lg ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Loading Analytics...
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: analyticsData.overview.totalUsers.toLocaleString(),
      change: `+${analyticsData.overview.userGrowthRate}% this month`,
      icon: Users,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Total Revenue',
      value: `$${analyticsData.overview.totalRevenue.toLocaleString()}`,
      change: `+${analyticsData.overview.revenueGrowthRate}% this month`,
      icon: DollarSign,
      color: 'from-green-500 to-teal-500'
    },
    {
      title: 'Total Sessions',
      value: analyticsData.overview.totalSessions.toString(),
      change: `${analyticsData.overview.sessionCompletionRate}% completion rate`,
      icon: Calendar,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Active Therapists',
      value: analyticsData.overview.activeTherapists.toString(),
      change: `${analyticsData.overview.pendingSessions} pending sessions`,
      icon: Heart,
      color: 'from-orange-500 to-red-500'
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
                Analytics Dashboard
              </h1>
              <p className={`text-base ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Real-time platform insights and performance metrics
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={loadAnalyticsData}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <div className="relative group">
                <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => exportData('json')}
                    className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                  >
                    Export as JSON
                  </button>
                  <button
                    onClick={() => exportData('csv')}
                    className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => exportData('report')}
                    className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                  >
                    Export Report
                  </button>
                </div>
              </div>
            </div>
          </div>
          <p className={`text-sm mt-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
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
              <div className="flex items-center justify-between mb-2">
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
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {stat.change}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          {/* Monthly Trends */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className={`p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              6-Month Growth Trends
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analyticsData.charts.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  dataKey="month" 
                  stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                />
                <YAxis 
                  stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    color: theme === 'dark' ? '#FFFFFF' : '#000000'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="Users"
                />
                <Line 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Sessions"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Patient Engagement */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className={`p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Patient Engagement Levels
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={patientEngagement}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {patientEngagement.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    color: theme === 'dark' ? '#FFFFFF' : '#000000'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Module Usage & Weekly Activity */}
        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          {/* Module Usage */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Therapy Module Usage
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsData.charts.moduleUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  dataKey="name" 
                  stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    color: theme === 'dark' ? '#FFFFFF' : '#000000'
                  }}
                />
                <Bar dataKey="usage" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Weekly Activity */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className={`p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Weekly Platform Activity
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analyticsData.charts.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  dataKey="day" 
                  stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                />
                <YAxis 
                  stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    color: theme === 'dark' ? '#FFFFFF' : '#000000'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sessions" 
                  stackId="1"
                  stroke="#3B82F6" 
                  fill="#3B82F6"
                  fillOpacity={0.6}
                  name="Sessions"
                />
                <Area 
                  type="monotone" 
                  dataKey="moduleUsage" 
                  stackId="1"
                  stroke="#10B981" 
                  fill="#10B981"
                  fillOpacity={0.6}
                  name="Module Usage"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Therapist Performance Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={`mb-4 rounded-xl shadow-lg overflow-hidden ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Therapist Performance
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <tr>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Therapist
                  </th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Sessions
                  </th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Patients
                  </th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Rating
                  </th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {analyticsData.therapists.map((therapist: any, index: number) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className={`px-4 py-3 text-sm font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      {therapist.name}
                    </td>
                    <td className={`px-4 py-3 text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {therapist.sessions}
                    </td>
                    <td className={`px-4 py-3 text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {therapist.patients}
                    </td>
                    <td className={`px-4 py-3 text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{therapist.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-sm font-medium text-green-600`}>
                      ${therapist.revenue.toLocaleString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className={`p-4 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Recent Platform Activity
          </h3>
          <div className="space-y-3">
            {analyticsData.recentActivity.map((activity: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activity.type === 'session' ? 'bg-green-100' :
                  activity.type === 'user' ? 'bg-blue-100' :
                  activity.type === 'payment' ? 'bg-purple-100' :
                  activity.type === 'module' ? 'bg-teal-100' :
                  'bg-orange-100'
                }`}>
                  {activity.type === 'session' && <Calendar className="w-4 h-4 text-green-600" />}
                  {activity.type === 'user' && <Users className="w-4 h-4 text-blue-600" />}
                  {activity.type === 'payment' && <DollarSign className="w-4 h-4 text-purple-600" />}
                  {activity.type === 'module' && <BarChart3 className="w-4 h-4 text-teal-600" />}
                  {activity.type === 'therapist' && <Heart className="w-4 h-4 text-orange-600" />}
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
                    {activity.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AnalyticsPage;