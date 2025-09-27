import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  MessageCircle, Brain, Video, BarChart3, Heart, 
  Calendar, Clock, Smile, Frown, Meh, Target,
  Book, Music, Palette, Camera
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getStreakData } from '../utils/streakManager';

function PatientDashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [streak, setStreak] = useState(0);
  const [modulesCompleted, setModulesCompleted] = useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    // Load streak data
    const streakData = getStreakData();
    setStreak(streakData.currentStreak);


    // Load modules completed count
    const userProgress = localStorage.getItem('mindcare_user_progress');
    if (userProgress) {
      const progress = JSON.parse(userProgress);
      const completedCount = progress.completedTherapies?.length || 0;
      setModulesCompleted(completedCount);
    }
    
    // Load upcoming appointments
    const savedAppointments = localStorage.getItem('mindcare_appointments');
    if (savedAppointments) {
      const appointments = JSON.parse(savedAppointments);
      const upcoming = appointments.filter((apt: any) => 
        apt.patientId === user?.id && 
        apt.status === 'confirmed' &&
        new Date(apt.date + ' ' + apt.time) > new Date()
      );
      setUpcomingAppointments(upcoming);
      
      // Set next appointment
      if (upcoming.length > 0) {
        const sortedUpcoming = upcoming.sort((a: any, b: any) => 
          new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime()
        );
        setNextAppointment(sortedUpcoming[0]);
      } else {
        setNextAppointment(null);
      }
    }

    // Load real recent activities
    loadRecentActivities();
  }, [user]);

  // Listen for storage changes to update data in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      // Update streak
      const streakData = getStreakData();
      setStreak(streakData.currentStreak);


      // Update modules completed
      const userProgress = localStorage.getItem('mindcare_user_progress');
      if (userProgress) {
        const progress = JSON.parse(userProgress);
        const completedCount = progress.completedTherapies?.length || 0;
        setModulesCompleted(completedCount);
      }

      // Update appointments
      const savedAppointments = localStorage.getItem('mindcare_bookings');
      if (savedAppointments) {
        const appointments = JSON.parse(savedAppointments);
        const upcoming = appointments.filter((apt: any) => 
          apt.patientId === user?.id && 
          apt.status === 'confirmed' &&
          new Date(apt.date + ' ' + apt.time) > new Date()
        );
        setUpcomingAppointments(upcoming);
        
        if (upcoming.length > 0) {
          const sortedUpcoming = upcoming.sort((a: any, b: any) => 
            new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime()
          );
          setNextAppointment(sortedUpcoming[0]);
        } else {
          setNextAppointment(null);
        }
      }

      // Update recent activities
      loadRecentActivities();
    };

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events for same-tab updates
    window.addEventListener('mindcare-data-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mindcare-data-updated', handleStorageChange);
    };
  }, [user]);

  const loadRecentActivities = () => {
    if (!user?.id) return;

    const activities: any[] = [];

    // Load mood tracker entries
    const moodEntries = JSON.parse(localStorage.getItem('mindcare_mood_entries') || '[]');
    const userMoodEntries = moodEntries
      .filter((entry: any) => entry.userId === user.id || !entry.userId) // Include entries without userId for demo
      .slice(-2)
      .map((entry: any) => ({
        module: 'Mood Tracker',
        time: getRelativeTime(entry.date),
        duration: '5 min',
        type: 'mood'
      }));
    activities.push(...userMoodEntries);

    // Load CBT records
    const cbtRecords = JSON.parse(localStorage.getItem('mindcare_cbt_records') || '[]');
    const userCBTRecords = cbtRecords
      .filter((record: any) => record.userId === user.id || !record.userId)
      .slice(-2)
      .map((record: any) => ({
        module: 'CBT Journaling',
        time: getRelativeTime(record.date),
        duration: '20 min',
        type: 'cbt'
      }));
    activities.push(...userCBTRecords);

    // Load gratitude entries
    const gratitudeEntries = JSON.parse(localStorage.getItem('mindcare_gratitude_entries') || '[]');
    const userGratitudeEntries = gratitudeEntries
      .filter((entry: any) => entry.userId === user.id || !entry.userId)
      .slice(-2)
      .map((entry: any) => ({
        module: 'Gratitude Practice',
        time: getRelativeTime(entry.date),
        duration: '10 min',
        type: 'gratitude'
      }));
    activities.push(...userGratitudeEntries);

    // Load sleep logs
    const sleepLogs = JSON.parse(localStorage.getItem('mindcare_sleep_logs') || '[]');
    const userSleepLogs = sleepLogs
      .filter((log: any) => log.userId === user.id || !log.userId)
      .slice(-1)
      .map((log: any) => ({
        module: 'Sleep Therapy',
        time: getRelativeTime(log.date),
        duration: '30 min',
        type: 'sleep'
      }));
    activities.push(...userSleepLogs);

    // Load completed sessions
    const bookings = JSON.parse(localStorage.getItem('mindcare_bookings') || '[]');
    const userSessions = bookings
      .filter((booking: any) => booking.patientId === user.id && booking.status === 'completed')
      .slice(-2)
      .map((booking: any) => ({
        module: 'Video Therapy Session',
        time: getRelativeTime(booking.date),
        duration: '50 min',
        type: 'session'
      }));
    activities.push(...userSessions);

    // Sort by most recent and limit to 4 items
    const sortedActivities = activities
      .sort((a, b) => {
        // Convert relative time to sortable value (rough approximation)
        const getTimeValue = (timeStr: string) => {
          if (timeStr.includes('hour')) return parseInt(timeStr) * 60;
          if (timeStr.includes('day')) return parseInt(timeStr) * 1440;
          if (timeStr.includes('minute')) return parseInt(timeStr);
          return 0;
        };
        return getTimeValue(a.time) - getTimeValue(b.time);
      })
      .slice(0, 4);

    // If no real activities, show default message
    if (sortedActivities.length === 0) {
      setRecentActivities([
        { module: 'Welcome to MindCare!', time: 'Just now', duration: '', type: 'welcome' }
      ]);
    } else {
      setRecentActivities(sortedActivities);
    }
  };

  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Recently';
  };
  const quickActions = [
    {
      icon: MessageCircle,
      title: 'AI Assistant',
      description: 'Chat with our intelligent mental health bot',
      link: '/chatbot',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Brain,
      title: 'Therapy Modules',
      description: 'Access 12 evidence-based therapy programs',
      link: '/therapy-modules',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Video,
      title: 'Book Session',
      description: 'Schedule a video call with licensed therapists',
      link: '/booking',
      color: 'from-teal-500 to-green-500'
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Monitor your mental health journey',
      link: '/progress',
      color: 'from-orange-500 to-red-500'
    }
  ];


  return (
    <div className={`h-screen flex flex-col ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50'
    }`}>
      <div className="flex-1 overflow-y-auto p-4">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h1 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Welcome back, {user?.name}!
          </h1>
          <p className={`text-base ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Continue your mental wellness journey today
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className={`text-base font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  Current Streak
                </h3>
                <p className={`text-2xl font-bold text-purple-500`}>
                  {streak} days
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Keep up the great work!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className={`text-base font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  Modules Completed
                </h3>
                <p className={`text-2xl font-bold text-blue-500`}>
                  {modulesCompleted}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Book className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {modulesCompleted > 0 ? `+${Math.min(modulesCompleted, 3)} this week` : 'Start your first therapy'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className={`text-base font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  Next Appointment
                </h3>
                <p className={`text-base font-bold ${
                  nextAppointment ? 'text-teal-500' : 'text-gray-500'
                }`}>
                  {nextAppointment ? 'Scheduled' : 'None'}
                </p>
              </div>
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-teal-600" />
              </div>
            </div>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {nextAppointment 
                ? `${nextAppointment.date} at ${nextAppointment.time}`
                : 'Book your first session'
              }
            </p>
          </motion.div>
        </div>


        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
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
                  className={`p-4 rounded-xl shadow-lg transition-all duration-300 cursor-pointer ${
                    theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-xl'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-3`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className={`text-base font-semibold mb-2 ${
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

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`p-4 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Recent Activity
          </h3>
          {recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activity.type === 'mood' ? 'bg-purple-100' :
                      activity.type === 'cbt' ? 'bg-blue-100' :
                      activity.type === 'gratitude' ? 'bg-green-100' :
                      activity.type === 'sleep' ? 'bg-indigo-100' :
                      activity.type === 'session' ? 'bg-teal-100' :
                      'bg-gray-100'
                    }`}>
                      {activity.type === 'mood' && <Heart className="w-4 h-4 text-purple-600" />}
                      {activity.type === 'cbt' && <Brain className="w-4 h-4 text-blue-600" />}
                      {activity.type === 'gratitude' && <Heart className="w-4 h-4 text-green-600" />}
                      {activity.type === 'stress' && <Target className="w-4 h-4 text-orange-600" />}
                      {activity.type === 'session' && <Video className="w-4 h-4 text-teal-600" />}
                      {activity.type === 'welcome' && <Heart className="w-4 h-4 text-purple-600" />}
                    </div>
                    <div>
                      <p className={`font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {activity.module}
                      </p>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {activity.time}
                      </p>
                    </div>
                  </div>
                  {activity.duration && (
                    <div className="flex items-center space-x-2">
                      <Clock className={`w-3 h-3 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {activity.duration}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className={`w-12 h-12 mx-auto mb-4 ${
                theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <p className={`text-lg ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Start your wellness journey today!
              </p>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Complete therapy modules to see your activity here
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default PatientDashboard;