import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Calendar, Clock, Activity, Moon, Utensils, 
  Smartphone, Pill, Users, BookOpen, Save, TrendingUp,
  BarChart3, PieChart, Target, Sparkles, Sun, CloudRain,
  Thermometer, Wind, Eye, Brain, Zap, Coffee, Dumbbell
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell,
  RadialBarChart, RadialBar
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { updateStreak } from '../utils/streakManager';

interface MoodEntry {
  id: string;
  date: string;
  primaryMood: string;
  moodIntensity: number;
  energyLevel: string;
  sleepHours: number;
  sleepQuality: string;
  stressLevel: string;
  activities: string[];
  nutrition: string;
  physicalActivity: { minutes: number; type: string };
  screenTime: number;
  medicationCompliance: { taken: boolean; notes: string };
  triggers: string;
  socialInteractions: string;
  gratitude: string;
  notes: string;
  weather: string;
}

function MoodTrackerPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [currentEntry, setCurrentEntry] = useState<Partial<MoodEntry>>({
    date: new Date().toISOString().split('T')[0],
    primaryMood: '',
    moodIntensity: 5,
    energyLevel: 'Medium',
    sleepHours: 8,
    sleepQuality: 'Average',
    stressLevel: 'Medium',
    activities: [],
    nutrition: 'Balanced',
    physicalActivity: { minutes: 0, type: '' },
    screenTime: 4,
    medicationCompliance: { taken: false, notes: '' },
    triggers: '',
    socialInteractions: 'Online interaction',
    gratitude: '',
    notes: '',
    weather: 'Sunny'
  });
  
  const [viewMode, setViewMode] = useState<'entry' | 'analytics'>('entry');
  const [savedEntries, setSavedEntries] = useState<MoodEntry[]>([]);
  const [mockAnalyticsData, setMockAnalyticsData] = useState<any[]>([]);
  const [moodDistribution, setMoodDistribution] = useState<any[]>([]);

  const moodOptions = [
    { value: 'happy', emoji: '😊', label: 'Happy', color: '#10B981' },
    { value: 'neutral', emoji: '😐', label: 'Neutral', color: '#6B7280' },
    { value: 'sad', emoji: '😔', label: 'Sad', color: '#3B82F6' },
    { value: 'angry', emoji: '😡', label: 'Angry', color: '#EF4444' },
    { value: 'anxious', emoji: '😰', label: 'Anxious', color: '#F59E0B' },
    { value: 'tired', emoji: '😴', label: 'Tired', color: '#8B5CF6' },
    { value: 'excited', emoji: '😍', label: 'Excited', color: '#EC4899' }
  ];

  const activityOptions = [
    'Work', 'Study', 'Exercise', 'Meditation', 'Socializing', 'Hobbies', 'Other'
  ];

  const weatherOptions = [
    'Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Snowy', 'Foggy'
  ];

  useEffect(() => {
    // Load saved entries from localStorage
    const saved = localStorage.getItem('mindcare_mood_entries');
    if (saved) {
      setSavedEntries(JSON.parse(saved));
      updateAnalyticsData(JSON.parse(saved));
    }
  }, []);

  const updateAnalyticsData = (entries: MoodEntry[]) => {
    if (entries.length > 0) {
      // Generate analytics data from real entries
      const last7Days = entries.slice(-7).map((entry: any) => ({
        date: entry.date,
        mood: entry.moodIntensity || 3,
        sleep: entry.sleepHours || 7,
        stress: entry.stressLevel === 'Low' ? 2 : entry.stressLevel === 'Medium' ? 5 : 8,
        energy: entry.energyLevel === 'High' ? 8 : entry.energyLevel === 'Medium' ? 5 : 2
      }));
      setMockAnalyticsData(last7Days);

      // Calculate mood distribution from real data
      const moodCounts = { excellent: 0, good: 0, neutral: 0, sad: 0, verySad: 0 };
      entries.forEach((entry: any) => {
        const mood = entry.moodIntensity || 3;
        if (mood >= 9) moodCounts.excellent++;
        else if (mood >= 7) moodCounts.good++;
        else if (mood >= 5) moodCounts.neutral++;
        else if (mood >= 3) moodCounts.sad++;
        else moodCounts.verySad++;
      });

      const total = entries.length;
      setMoodDistribution([
        { name: 'Excellent', value: Math.round((moodCounts.excellent / total) * 100), color: '#10B981' },
        { name: 'Good', value: Math.round((moodCounts.good / total) * 100), color: '#3B82F6' },
        { name: 'Neutral', value: Math.round((moodCounts.neutral / total) * 100), color: '#F59E0B' },
        { name: 'Sad', value: Math.round((moodCounts.sad / total) * 100), color: '#EF4444' },
        { name: 'Very Sad', value: Math.round((moodCounts.verySad / total) * 100), color: '#DC2626' }
      ]);
    } else {
      // Default data
      setMockAnalyticsData([
        { date: new Date().toISOString().split('T')[0], mood: 3, sleep: 7, stress: 4, energy: 6 }
      ]);
      setMoodDistribution([
        { name: 'Excellent', value: 20, color: '#10B981' },
        { name: 'Good', value: 30, color: '#3B82F6' },
        { name: 'Neutral', value: 30, color: '#F59E0B' },
        { name: 'Sad', value: 15, color: '#EF4444' },
        { name: 'Very Sad', value: 5, color: '#DC2626' }
      ]);
    }
  };
  const handleInputChange = (field: string, value: any) => {
    setCurrentEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleActivityToggle = (activity: string) => {
    setCurrentEntry(prev => ({
      ...prev,
      activities: prev.activities?.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...(prev.activities || []), activity]
    }));
  };

  const handleSaveEntry = () => {
    if (!currentEntry.primaryMood) {
      toast.error('Please select your primary mood');
      return;
    }

    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      userId: user?.id, // Add user ID to track entries per user
      ...currentEntry as MoodEntry
    };

    const updatedEntries = [...savedEntries, newEntry];
    setSavedEntries(updatedEntries);
    localStorage.setItem('mindcare_mood_entries', JSON.stringify(updatedEntries));
    
    // Update streak
    updateStreak();
    
    // Update analytics data
    updateAnalyticsData(updatedEntries);
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('mindcare-data-updated'));
    
    toast.success('Mood entry saved successfully!');
    
    // Reset form for next entry
    setCurrentEntry({
      date: new Date().toISOString().split('T')[0],
      primaryMood: '',
      moodIntensity: 5,
      energyLevel: 'Medium',
      sleepHours: 8,
      sleepQuality: 'Average',
      stressLevel: 'Medium',
      activities: [],
      nutrition: 'Balanced',
      physicalActivity: { minutes: 0, type: '' },
      screenTime: 4,
      medicationCompliance: { taken: false, notes: '' },
      triggers: '',
      socialInteractions: 'Online interaction',
      gratitude: '',
      notes: '',
      weather: 'Sunny'
    });
  };

  const getSelectedMoodColor = () => {
    const selected = moodOptions.find(m => m.value === currentEntry.primaryMood);
    return selected?.color || '#6B7280';
  };

  return (
    <div className={`min-h-screen py-8 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50'
    }`}>
      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${
              theme === 'dark' ? 'bg-purple-400' : 'bg-purple-300'
            } opacity-20`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-30, 30, -30],
              x: [-20, 20, -20],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Mood Tracker
              </h1>
              <p className={`text-lg ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Track your daily mood and discover patterns in your mental wellness
              </p>
            </div>
            
            {/* View Toggle */}
            <div className={`flex rounded-xl p-1 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <button
                onClick={() => setViewMode('entry')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  viewMode === 'entry'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Daily Entry
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  viewMode === 'analytics'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {viewMode === 'entry' ? (
            <motion.div
              key="entry"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className="space-y-8"
            >
              {/* Primary Mood Selection */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-8 rounded-2xl shadow-lg ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <h3 className={`text-2xl font-semibold mb-6 flex items-center ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  <Heart className="w-6 h-6 mr-3 text-purple-500" />
                  How are you feeling today?
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {moodOptions.map((mood) => (
                    <motion.button
                      key={mood.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleInputChange('primaryMood', mood.value)}
                      className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                        currentEntry.primaryMood === mood.value
                          ? `border-[${mood.color}] bg-opacity-20`
                          : theme === 'dark'
                          ? 'border-gray-600 hover:border-gray-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{
                        borderColor: currentEntry.primaryMood === mood.value ? mood.color : undefined,
                        backgroundColor: currentEntry.primaryMood === mood.value ? `${mood.color}20` : undefined
                      }}
                    >
                      <div className="text-4xl mb-2">{mood.emoji}</div>
                      <div className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {mood.label}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Mood Intensity Slider */}
                {currentEntry.primaryMood && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-8"
                  >
                    <label className={`block text-lg font-medium mb-4 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      Mood Intensity: {currentEntry.moodIntensity}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={currentEntry.moodIntensity}
                      onChange={(e) => handleInputChange('moodIntensity', parseInt(e.target.value))}
                      className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${getSelectedMoodColor()} 0%, ${getSelectedMoodColor()} ${(currentEntry.moodIntensity || 5) * 10}%, #e5e7eb ${(currentEntry.moodIntensity || 5) * 10}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Detailed Tracking */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Energy & Sleep */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`p-6 rounded-2xl shadow-lg ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <h4 className={`text-xl font-semibold mb-6 flex items-center ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                    Energy & Sleep
                  </h4>

                  {/* Energy Level */}
                  <div className="mb-6">
                    <label className={`block text-sm font-medium mb-3 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Energy Level
                    </label>
                    <div className="flex space-x-3">
                      {['Low', 'Medium', 'High'].map((level) => (
                        <button
                          key={level}
                          onClick={() => handleInputChange('energyLevel', level)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            currentEntry.energyLevel === level
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                              : theme === 'dark'
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sleep Hours */}
                  <div className="mb-6">
                    <label className={`block text-sm font-medium mb-3 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Sleep Hours: {currentEntry.sleepHours}h
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      step="0.5"
                      value={currentEntry.sleepHours}
                      onChange={(e) => handleInputChange('sleepHours', parseFloat(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-blue-400 to-purple-500"
                    />
                  </div>

                  {/* Sleep Quality */}
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Sleep Quality
                    </label>
                    <select
                      value={currentEntry.sleepQuality}
                      onChange={(e) => handleInputChange('sleepQuality', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="Poor">Poor</option>
                      <option value="Average">Average</option>
                      <option value="Good">Good</option>
                    </select>
                  </div>
                </motion.div>

                {/* Stress & Activities */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`p-6 rounded-2xl shadow-lg ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <h4 className={`text-xl font-semibold mb-6 flex items-center ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    <Target className="w-5 h-5 mr-2 text-red-500" />
                    Stress & Activities
                  </h4>

                  {/* Stress Level */}
                  <div className="mb-6">
                    <label className={`block text-sm font-medium mb-3 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Stress Level
                    </label>
                    <div className="flex space-x-3">
                      {['Low', 'Medium', 'High'].map((level) => (
                        <button
                          key={level}
                          onClick={() => handleInputChange('stressLevel', level)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            currentEntry.stressLevel === level
                              ? level === 'Low' ? 'bg-green-500 text-white' :
                                level === 'Medium' ? 'bg-yellow-500 text-white' :
                                'bg-red-500 text-white'
                              : theme === 'dark'
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Activities */}
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Activities (select all that apply)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {activityOptions.map((activity) => (
                        <button
                          key={activity}
                          onClick={() => handleActivityToggle(activity)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            currentEntry.activities?.includes(activity)
                              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                              : theme === 'dark'
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {activity}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Additional Tracking Fields */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Nutrition & Physical Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`p-6 rounded-2xl shadow-lg ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <h4 className={`text-lg font-semibold mb-4 flex items-center ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    <Utensils className="w-5 h-5 mr-2 text-green-500" />
                    Nutrition & Exercise
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Nutrition
                      </label>
                      <div className="flex space-x-2">
                        {['Balanced', 'Junk', 'Skipped'].map((type) => (
                          <button
                            key={type}
                            onClick={() => handleInputChange('nutrition', type)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              currentEntry.nutrition === type
                                ? 'bg-green-500 text-white'
                                : theme === 'dark'
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Physical Activity (minutes)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={currentEntry.physicalActivity?.minutes || 0}
                        onChange={(e) => handleInputChange('physicalActivity', {
                          ...currentEntry.physicalActivity,
                          minutes: parseInt(e.target.value) || 0
                        })}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Screen Time & Medication */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`p-6 rounded-2xl shadow-lg ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <h4 className={`text-lg font-semibold mb-4 flex items-center ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    <Smartphone className="w-5 h-5 mr-2 text-blue-500" />
                    Digital & Health
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Screen Time: {currentEntry.screenTime}h
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="16"
                        step="0.5"
                        value={currentEntry.screenTime}
                        onChange={(e) => handleInputChange('screenTime', parseFloat(e.target.value))}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-blue-400 to-purple-500"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Medication Taken
                      </label>
                      <button
                        onClick={() => handleInputChange('medicationCompliance', {
                          ...currentEntry.medicationCompliance,
                          taken: !currentEntry.medicationCompliance?.taken
                        })}
                        className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          currentEntry.medicationCompliance?.taken
                            ? 'bg-green-500 text-white'
                            : theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {currentEntry.medicationCompliance?.taken ? 'Yes' : 'No'}
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Social & Weather */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className={`p-6 rounded-2xl shadow-lg ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <h4 className={`text-lg font-semibold mb-4 flex items-center ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    <Users className="w-5 h-5 mr-2 text-purple-500" />
                    Social & Environment
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Social Interactions
                      </label>
                      <select
                        value={currentEntry.socialInteractions}
                        onChange={(e) => handleInputChange('socialInteractions', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="Met friends/family">Met friends/family</option>
                        <option value="Isolated">Isolated</option>
                        <option value="Therapy session">Therapy session</option>
                        <option value="Online interaction">Online interaction</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Weather
                      </label>
                      <select
                        value={currentEntry.weather}
                        onChange={(e) => handleInputChange('weather', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        {weatherOptions.map(weather => (
                          <option key={weather} value={weather}>{weather}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Reflection Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`p-6 rounded-2xl shadow-lg ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <h4 className={`text-xl font-semibold mb-6 flex items-center ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  <BookOpen className="w-5 h-5 mr-2 text-indigo-500" />
                  Reflection & Notes
                </h4>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Gratitude (What are you grateful for today?)
                    </label>
                    <textarea
                      value={currentEntry.gratitude}
                      onChange={(e) => handleInputChange('gratitude', e.target.value)}
                      rows={4}
                      maxLength={200}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="I'm grateful for..."
                    />
                    <div className={`text-xs mt-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {(currentEntry.gratitude?.length || 0)}/200 characters
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-3 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      General Notes & Triggers
                    </label>
                    <textarea
                      value={currentEntry.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={4}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="How was your day? Any triggers or important events?"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Save Button */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveEntry}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3 mx-auto"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Today's Entry</span>
                </motion.button>
              </motion.div>
            </motion.div>
          ) : (
            /* Analytics View */
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-8"
            >
              {/* Analytics Overview */}
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { title: 'Average Mood', value: '4.2/5', icon: Heart, color: 'from-pink-500 to-rose-500' },
                  { title: 'Sleep Quality', value: '7.5h', icon: Moon, color: 'from-blue-500 to-indigo-500' },
                  { title: 'Stress Level', value: 'Low', icon: Target, color: 'from-green-500 to-teal-500' },
                  { title: 'Active Days', value: '85%', icon: Activity, color: 'from-orange-500 to-red-500' }
                ].map((stat, index) => (
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
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Mood Trend */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`p-6 rounded-2xl shadow-lg ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <h3 className={`text-xl font-semibold mb-6 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    Mood Trends (7 Days)
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockAnalyticsData}>
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
                        strokeWidth={3}
                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Mood Distribution */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className={`p-6 rounded-2xl shadow-lg ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <h3 className={`text-xl font-semibold mb-6 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    Mood Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={moodDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
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
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>

              {/* Correlation Analysis */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`p-6 rounded-2xl shadow-lg ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <h3 className={`text-xl font-semibold mb-6 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  Sleep vs Mood Correlation
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockAnalyticsData}>
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
                      dataKey="sleep" 
                      stackId="1"
                      stroke="#3B82F6" 
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="mood" 
                      stackId="2"
                      stroke="#8B5CF6" 
                      fill="#8B5CF6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Insights */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className={`p-6 rounded-2xl shadow-lg ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <h3 className={`text-xl font-semibold mb-6 flex items-center ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                  Personalized Insights
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className={`p-4 rounded-xl ${
                    theme === 'dark' ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'
                  }`}>
                    <h4 className="font-semibold text-green-600 mb-2">Positive Pattern</h4>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-green-300' : 'text-green-700'
                    }`}>
                      Your mood tends to be higher on days when you get 8+ hours of sleep and engage in physical activity.
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${
                    theme === 'dark' ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <h4 className="font-semibold text-blue-600 mb-2">Recommendation</h4>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                    }`}>
                      Try to maintain a consistent sleep schedule and incorporate 30 minutes of exercise daily for better mood stability.
                    </p>
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

export default MoodTrackerPage;