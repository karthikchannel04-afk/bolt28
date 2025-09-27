import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, Moon, Brain, Target, Smile, Meh, Frown, Award, 
  Filter, Download, CheckCircle, PieChart as PieChartIcon,
  TrendingUp, Calendar, Clock, Star, Users, Activity
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getStreakData } from '../utils/streakManager';

function ProgressPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('mood');
  const [userProgress, setUserProgress] = useState<any>(null);
  const [moodData, setMoodData] = useState<any[]>([]);
  const [therapyProgress, setTherapyProgress] = useState<any[]>([]);
  const [moodDistribution, setMoodDistribution] = useState<any[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
  const [currentMood, setCurrentMood] = useState(3);
  const [averageSleepQuality, setAverageSleepQuality] = useState(7.5);
  const [totalTherapySessions, setTotalTherapySessions] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  const achievements = [
    { 
      title: '7-Day Streak', 
      description: 'Completed daily check-ins for 7 days', 
      earned: false, 
      date: '2024-01-07',
      progress: 0
    },
    { 
      title: 'Mindfulness Master', 
      description: 'Completed 10 meditation sessions', 
      earned: false, 
      date: '2024-01-05',
      progress: 0
    },
    { 
      title: 'Stress Warrior', 
      description: 'Successfully managed stress for 5 days', 
      earned: false, 
      progress: 0
    },
    { 
      title: 'Therapy Graduate', 
      description: 'Complete 3 therapy modules', 
      earned: false, 
      progress: 0
    }
  ];

  const timeframes = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '3 Months' },
    { value: '1y', label: '1 Year' }
  ];

  useEffect(() => {
    loadProgressData();
    
    // Listen for storage changes to update data in real-time
    const handleStorageChange = () => {
      loadProgressData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mindcare-data-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mindcare-data-updated', handleStorageChange);
    };
  }, [user, selectedTimeframe]);

  const loadProgressData = () => {
    if (!user?.id) return;

    // Load user progress
    const savedProgress = localStorage.getItem('mindcare_user_progress');
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }

    // Load streak data
    const streakData = getStreakData();
    setCurrentStreak(streakData.currentStreak);

    // Load and process mood data
    const moodEntries = JSON.parse(localStorage.getItem('mindcare_mood_entries') || '[]');
    const userMoodEntries = moodEntries.filter((entry: any) => 
      entry.userId === user.id || (!entry.userId && moodEntries.length <= 5) // Include entries without userId for demo
    );

    if (userMoodEntries.length > 0) {
      // Process mood data based on selected timeframe
      const filteredEntries = filterDataByTimeframe(userMoodEntries, selectedTimeframe);
      
      const processedMoodData = filteredEntries.map((entry: any) => ({
        date: entry.date,
        mood: (entry.moodIntensity || 3) / 2, // Convert 1-10 scale to 1-5
        anxiety: 10 - (entry.stressLevel === 'Low' ? 8 : entry.stressLevel === 'Medium' ? 5 : 2),
        energy: entry.energyLevel === 'High' ? 8 : entry.energyLevel === 'Medium' ? 5 : 2
      }));
      
      setMoodData(processedMoodData);

      // Calculate current mood from latest entry
      const latestEntry = userMoodEntries[userMoodEntries.length - 1];
      setCurrentMood((latestEntry?.moodIntensity || 6) / 2); // Convert to 1-5 scale

      // Set default sleep quality since sleep tracking is removed
      setAverageSleepQuality(7.5);

      // Calculate mood distribution
      const moodCounts = { excellent: 0, good: 0, neutral: 0, sad: 0, verySad: 0 };
      userMoodEntries.forEach((entry: any) => {
        const mood = entry.moodIntensity || 5;
        if (mood >= 9) moodCounts.excellent++;
        else if (mood >= 7) moodCounts.good++;
        else if (mood >= 5) moodCounts.neutral++;
        else if (mood >= 3) moodCounts.sad++;
        else moodCounts.verySad++;
      });

      const total = userMoodEntries.length;
      setMoodDistribution([
        { name: 'Excellent', value: Math.round((moodCounts.excellent / total) * 100), color: '#10B981' },
        { name: 'Good', value: Math.round((moodCounts.good / total) * 100), color: '#3B82F6' },
        { name: 'Neutral', value: Math.round((moodCounts.neutral / total) * 100), color: '#F59E0B' },
        { name: 'Sad', value: Math.round((moodCounts.sad / total) * 100), color: '#EF4444' },
        { name: 'Very Sad', value: Math.round((moodCounts.verySad / total) * 100), color: '#DC2626' }
      ]);
    } else {
      // Default data if no entries
      setMoodData([
        { date: new Date().toISOString().split('T')[0], mood: 3, anxiety: 4, energy: 6 }
      ]);
      setCurrentMood(3);
      setMoodDistribution([
        { name: 'Excellent', value: 20, color: '#10B981' },
        { name: 'Good', value: 30, color: '#3B82F6' },
        { name: 'Neutral', value: 30, color: '#F59E0B' },
        { name: 'Sad', value: 15, color: '#EF4444' },
        { name: 'Very Sad', value: 5, color: '#DC2626' }
      ]);
    }

    // Load therapy progress from actual user activities
    loadTherapyProgress();

    // Load weekly stats from real activity data
    loadWeeklyStats();

    // Update achievements based on real data
    updateAchievements();
  };

  const filterDataByTimeframe = (data: any[], timeframe: string) => {
    const now = new Date();
    let cutoffDate = new Date();

    switch (timeframe) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoffDate.setDate(now.getDate() - 7);
    }

    return data.filter((item: any) => {
      const itemDate = new Date(item.date || item.timestamp);
      return itemDate >= cutoffDate;
    });
  };

  const loadTherapyProgress = () => {
    // Load actual therapy completion data
    const cbtRecords = JSON.parse(localStorage.getItem('mindcare_cbt_records') || '[]');
    const gratitudeEntries = JSON.parse(localStorage.getItem('mindcare_gratitude_entries') || '[]');
    const moodEntries = JSON.parse(localStorage.getItem('mindcare_mood_entries') || '[]');
    const exposureSessions = JSON.parse(localStorage.getItem('mindcare_exposure_sessions') || '[]');
    const stressLogs = JSON.parse(localStorage.getItem('mindcare_stress_logs') || '[]');
    const videoProgress = JSON.parse(localStorage.getItem('mindcare_video_progress') || '[]');
    const actValues = JSON.parse(localStorage.getItem('mindcare_act_values') || '[]');

    // Filter data for current user
    const userCBT = cbtRecords.filter((r: any) => r.userId === user?.id || !r.userId);
    const userGratitude = gratitudeEntries.filter((e: any) => e.userId === user?.id || !e.userId);
    const userMood = moodEntries.filter((e: any) => e.userId === user?.id || !e.userId);
    const userExposure = exposureSessions.filter((s: any) => s.userId === user?.id || !s.userId);
    const userStress = stressLogs.filter((l: any) => l.userId === user?.id || !l.userId);
    const userVideo = videoProgress.filter((p: any) => p.userId === user?.id || !p.userId);
    const userACT = actValues.filter((v: any) => v.userId === user?.id || !v.userId);

    // Calculate total therapy sessions from all activities
    const totalActivities = userCBT.length + userGratitude.length + userExposure.length + userStress.length + 
                           userVideo.length + userACT.length;
    setTotalTherapySessions(totalActivities);

    // Define therapy modules with realistic session targets
    const therapyModules = [
      { 
        id: 'cbt', 
        name: 'CBT Journaling', 
        total: 20,
        completed: userCBT.length,
        description: 'Cognitive Behavioral Therapy thought records'
      },
      { 
        id: 'mindfulness', 
        name: 'Mindfulness', 
        total: 15,
        completed: Math.floor(userMood.length * 0.3), // Estimate from mood tracking mindfulness
        description: 'Mindfulness and breathing exercises'
      },
      { 
        id: 'stress', 
        name: 'Stress Management', 
        total: 12,
        completed: userStress.length,
        description: 'Stress reduction and coping strategies'
      },
      { 
        id: 'gratitude', 
        name: 'Gratitude Journal', 
        total: 30,
        completed: userGratitude.length,
        description: 'Daily gratitude practice'
      },
      { 
        id: 'music', 
        name: 'Relaxation Music', 
        total: 10,
        completed: Math.floor(totalActivities * 0.1), // Estimate
        description: 'Therapeutic music sessions'
      },
      { 
        id: 'tetris', 
        name: 'Tetris Therapy', 
        total: 8,
        completed: Math.floor(totalActivities * 0.05), // Estimate
        description: 'Gamified stress relief'
      },
      { 
        id: 'art', 
        name: 'Art Therapy', 
        total: 10,
        completed: Math.floor(totalActivities * 0.08), // Estimate
        description: 'Creative expression therapy'
      },
      { 
        id: 'exposure', 
        name: 'Exposure Therapy', 
        total: 12,
        completed: userExposure.length,
        description: 'Gradual exposure techniques'
      },
      { 
        id: 'video', 
        name: 'Video Therapy', 
        total: 16,
        completed: userVideo.length,
        description: 'Professional video sessions'
      },
      { 
        id: 'act', 
        name: 'ACT', 
        total: 14,
        completed: userACT.length,
        description: 'Acceptance and Commitment Therapy'
      }
    ];

    const therapyProgressData = therapyModules.map(module => ({
      module: module.name,
      completed: Math.min(module.completed, module.total),
      total: module.total,
      progress: Math.round((Math.min(module.completed, module.total) / module.total) * 100)
    }));
    
    setTherapyProgress(therapyProgressData);
  };

  const loadWeeklyStats = () => {
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Load all user activities for the past week
    const moodEntries = JSON.parse(localStorage.getItem('mindcare_mood_entries') || '[]');
    const cbtRecords = JSON.parse(localStorage.getItem('mindcare_cbt_records') || '[]');
    const gratitudeEntries = JSON.parse(localStorage.getItem('mindcare_gratitude_entries') || '[]');

    // Filter for current user and past week
    const userMoodEntries = moodEntries.filter((e: any) => 
      (e.userId === user?.id || !e.userId) && new Date(e.date) >= oneWeekAgo
    );
    const userCBT = cbtRecords.filter((r: any) => 
      (r.userId === user?.id || !r.userId) && new Date(r.date) >= oneWeekAgo
    );
    const userGratitude = gratitudeEntries.filter((e: any) => 
      (e.userId === user?.id || !e.userId) && new Date(e.date) >= oneWeekAgo
    );

    const weeklyData = weekDays.map((day, index) => {
      const dayDate = new Date();
      dayDate.setDate(dayDate.getDate() - (6 - index));
      const dayString = dayDate.toISOString().split('T')[0];

      // Count activities for this day
      const dayMoodEntries = userMoodEntries.filter((e: any) => e.date === dayString);
      const dayCBT = userCBT.filter((r: any) => r.date === dayString);
      const dayGratitude = userGratitude.filter((e: any) => e.date === dayString);

      const totalSessions = dayMoodEntries.length + dayCBT.length + dayGratitude.length;
      
      // Calculate average mood for the day
      const avgMood = dayMoodEntries.length > 0 
        ? dayMoodEntries.reduce((sum: number, entry: any) => sum + (entry.moodIntensity || 5), 0) / dayMoodEntries.length / 2
        : 0;

      // Set default sleep value since sleep tracking is removed
      const avgSleep = 7.5;

      return { 
        name: day, 
        sessions: totalSessions, 
        mood: Math.round(avgMood * 10) / 10, 
        sleep: Math.round(avgSleep * 10) / 10 
      };
    });
    
    setWeeklyStats(weeklyData);
  };

  const updateAchievements = () => {
    const streakData = getStreakData();
    const moodEntries = JSON.parse(localStorage.getItem('mindcare_mood_entries') || '[]');
    const userMoodEntries = moodEntries.filter((e: any) => e.userId === user?.id || !e.userId);
    
    // Load all therapy activities
    const cbtRecords = JSON.parse(localStorage.getItem('mindcare_cbt_records') || '[]');
    const gratitudeEntries = JSON.parse(localStorage.getItem('mindcare_gratitude_entries') || '[]');
    const exposureSessions = JSON.parse(localStorage.getItem('mindcare_exposure_sessions') || '[]');
    const videoProgress = JSON.parse(localStorage.getItem('mindcare_video_progress') || '[]');

    const userCBT = cbtRecords.filter((r: any) => r.userId === user?.id || !r.userId);
    const userGratitude = gratitudeEntries.filter((e: any) => e.userId === user?.id || !e.userId);
    const userExposure = exposureSessions.filter((s: any) => s.userId === user?.id || !s.userId);
    const userVideo = videoProgress.filter((p: any) => p.userId === user?.id || !p.userId);

    // Calculate mindfulness sessions (estimate from various activities)
    const mindfulnessSessions = Math.floor(userMoodEntries.length * 0.3) + 
                               Math.floor(userGratitude.length * 0.5) + 
                               userExposure.length;

    // Calculate stress management achievements
    const stressLogs = JSON.parse(localStorage.getItem('mindcare_stress_logs') || '[]');
    const userStressLogs = stressLogs.filter((l: any) => l.userId === user?.id || !l.userId);
    const goodStressDays = userStressLogs.filter((log: any) => 
      log.effectiveness >= 7 // High effectiveness in stress management
    ).length;

    // Calculate completed therapy modules
    const completedModules = [
      userCBT.length >= 3 ? 1 : 0,
      userGratitude.length >= 7 ? 1 : 0,
      userStressLogs.length >= 3 ? 1 : 0,
      mindfulnessSessions >= 5 ? 1 : 0,
      userVideo.length >= 2 ? 1 : 0
    ].reduce((sum, val) => sum + val, 0);

    // Update achievements with real progress
    achievements[0].earned = streakData.currentStreak >= 7;
    achievements[0].progress = Math.min(100, (streakData.currentStreak / 7) * 100);

    achievements[1].earned = mindfulnessSessions >= 10;
    achievements[1].progress = Math.min(100, (mindfulnessSessions / 10) * 100);

    achievements[2].earned = goodStressDays >= 5;
    achievements[2].progress = Math.min(100, (goodStressDays / 5) * 100);

    achievements[3].earned = completedModules >= 3;
    achievements[3].progress = Math.min(100, (completedModules / 3) * 100);
  };

  const calculateTherapyProgress = () => {
    if (!userProgress?.currentPlan) {
      // Calculate from actual activities if no plan exists
      const totalPossibleActivities = 50; // Reasonable target
      const currentActivities = totalTherapySessions;
      return { 
        completed: currentActivities, 
        total: totalPossibleActivities, 
        percentage: Math.round((currentActivities / totalPossibleActivities) * 100) 
      };
    }
    
    const total = userProgress.currentPlan.recommendations?.length || 0;
    const completed = userProgress.completedTherapies?.length || 0;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const getMoodIcon = (mood: number) => {
    if (mood >= 4) return Smile;
    if (mood >= 2.5) return Meh;
    return Frown;
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 4) return 'text-green-500';
    if (mood >= 2.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const exportData = () => {
    const exportData = {
      user: user?.name,
      exportDate: new Date().toISOString(),
      timeframe: selectedTimeframe,
      metrics: {
        currentMood,
        averageSleepQuality,
        totalTherapySessions,
        currentStreak
      },
      moodData,
      therapyProgress,
      weeklyStats,
      achievements: achievements.map(a => ({
        title: a.title,
        earned: a.earned,
        progress: a.progress
      }))
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mindcare-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Progress data exported successfully!');
  };

  const MoodIcon = getMoodIcon(currentMood);

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
          <h1 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Progress Tracking
          </h1>
          <p className={`text-base ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Monitor your mental health journey and celebrate your achievements
          </p>
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
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className={`w-4 h-4 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <span className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-700'
                }`}>
                  Timeframe:
                </span>
              </div>
              <div className="flex space-x-2">
                {timeframes.map((timeframe) => (
                  <button
                    key={timeframe.value}
                    onClick={() => setSelectedTimeframe(timeframe.value)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedTimeframe === timeframe.value
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {timeframe.label}
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={exportData}
              className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 text-sm"
            >
              <Download className="w-3 h-3" />
              <span>Export Data</span>
            </button>
          </div>
        </motion.div>

        {/* AI-Generated Therapy Plan Progress */}
        {userProgress?.currentPlan && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`mb-4 p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              <Target className="w-5 h-5 mr-2 text-purple-500" />
              Your Personalized {userProgress.currentPlan.issue || 'Therapy'} Plan
            </h3>
            
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className={`text-2xl font-bold text-purple-500`}>
                  {(() => {
                    const startDate = new Date(userProgress.startDate || Date.now());
                    const currentDate = new Date();
                    return Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  })()}
                </p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Current Day
                </p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold text-blue-500`}>
                  {userProgress.currentPlan.planDuration}
                </p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Days
                </p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold text-green-500`}>
                  {calculateTherapyProgress().completed}/{calculateTherapyProgress().total}
                </p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Therapies Done
                </p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold text-teal-500`}>
                  {calculateTherapyProgress().percentage}%
                </p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Complete
                </p>
              </div>
            </div>

            <div className={`w-full h-3 rounded-full mb-4 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                style={{ width: `${calculateTherapyProgress().percentage}%` }}
              />
            </div>

            <div className="space-y-2">
              <h4 className={`font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Recommended Therapies:
              </h4>
              <div className="grid md:grid-cols-2 gap-2">
                {userProgress.currentPlan.recommendations?.map((rec: any) => {
                  const isCompleted = userProgress.completedTherapies?.includes(rec.moduleId);
                  return (
                    <div
                      key={rec.moduleId}
                      className={`flex items-center space-x-2 p-2 rounded-lg ${
                        isCompleted
                          ? 'bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700'
                          : theme === 'dark'
                          ? 'bg-gray-700/50 border border-gray-600'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${rec.color} flex items-center justify-center`}>
                        <Target className="w-3 h-3 text-white" />
                      </div>
                      <span className={`text-sm font-medium flex-1 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {rec.title}
                      </span>
                      {isCompleted && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            { 
              title: 'Current Mood', 
              value: currentMood.toFixed(1), 
              max: 5, 
              icon: MoodIcon, 
              color: getMoodColor(currentMood),
              description: moodData.length > 0 ? 'Based on latest entry' : 'No data yet'
            },
            { 
              title: 'Sleep Quality', 
              value: averageSleepQuality.toFixed(1), 
              max: 10, 
              icon: Moon, 
              color: 'text-blue-500',
              description: `Average: ${averageSleepQuality.toFixed(1)}h per night`
            },
            { 
              title: 'Therapy Activities', 
              value: totalTherapySessions, 
              max: null, 
              icon: Target, 
              color: 'text-purple-500',
              description: 'Total completed activities'
            },
            { 
              title: 'Streak Days', 
              value: currentStreak, 
              max: null, 
              icon: Award, 
              color: 'text-green-500',
              description: 'Current daily streak'
            }
          ].map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`p-4 rounded-xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {metric.title}
                  </h3>
                  <p className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {metric.value}{metric.max && `/${metric.max}`}
                  </p>
                </div>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              <p className={`text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {metric.description}
              </p>
              {metric.max && (
                <div className={`w-full h-2 rounded-full mt-2 ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div
                    className={`h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500`}
                    style={{ width: `${(parseFloat(metric.value.toString()) / metric.max) * 100}%` }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          {/* Mood Trend Chart */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className={`p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Mood Trends ({selectedTimeframe})
            </h3>
            {moodData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                  <XAxis 
                    dataKey="date" 
                    stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                    fontSize={12}
                    domain={[1, 5]}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      color: theme === 'dark' ? '#FFFFFF' : '#000000'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    dot={{ fill: '#8B5CF6', strokeWidth: 1, r: 4 }}
                    activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <Heart className={`w-12 h-12 mx-auto mb-4 ${
                    theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                  <p className={`text-lg ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    No mood data yet
                  </p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    Start tracking your mood to see trends
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Sleep Quality Chart */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className={`p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Stress & Energy Levels ({selectedTimeframe})
            </h3>
            {moodData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                  <XAxis 
                    dataKey="date" 
                    stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                    fontSize={12}
                    domain={[0, 10]}
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
                    dataKey="energy" 
                    stroke="#10B981" 
                    fill="#10B981"
                    fillOpacity={0.3}
                    strokeWidth={2}
                    name="Energy Level"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <Target className={`w-12 h-12 mx-auto mb-4 ${
                    theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                  <p className={`text-lg ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    No energy data yet
                  </p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    Track your energy in the mood tracker
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Weekly Activity & Mood Distribution */}
        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          {/* Weekly Activity */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className={`p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Weekly Activity
            </h3>
            {weeklyStats.some(stat => stat.sessions > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                  <XAxis 
                    dataKey="name" 
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
                  <Bar dataKey="sessions" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <Activity className={`w-12 h-12 mx-auto mb-4 ${
                    theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                  <p className={`text-lg ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    No activity this week
                  </p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    Complete therapy modules to see activity
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Mood Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className={`p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Mood Distribution
            </h3>
            {moodData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={moodDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {moodDistribution.map((entry, index) => (
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
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <PieChartIcon className={`w-12 h-12 mx-auto mb-4 ${
                    theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                  <p className={`text-lg ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    No mood distribution yet
                  </p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    Track your mood to see patterns
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Therapy Progress */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className={`mb-4 p-4 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Therapy Module Progress
          </h3>
          <div className="space-y-3">
            {therapyProgress.map((module, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {module.module}
                  </h4>
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {module.completed}/{module.total} sessions
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full ${
                  theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                }`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${module.progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {module.progress}% complete
                  </span>
                  {module.progress === 100 && (
                    <div className="flex items-center space-x-1 text-green-500">
                      <Award className="w-4 h-4" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className={`p-4 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Achievements & Milestones
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  achievement.earned
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    achievement.earned
                      ? 'bg-green-100 dark:bg-green-800'
                      : 'bg-gray-100 dark:bg-gray-600'
                  }`}>
                    <Award className={`w-5 h-5 ${
                      achievement.earned
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      {achievement.title}
                    </h4>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {achievement.description}
                    </p>
                    {achievement.earned ? (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Earned on {achievement.date}
                      </p>
                    ) : (
                      <div className="mt-2">
                        <div className={`w-full h-2 rounded-full ${
                          theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                        }`}>
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                            style={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                        <p className={`text-xs mt-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {achievement.progress}% complete
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ProgressPage;