import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, Sun, Clock, Bed, Coffee, Smartphone, Book,
  Volume2, VolumeX, Play, Pause, Target, TrendingUp,
  Calendar, Star, CheckCircle, AlertTriangle, Heart
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { updateStreak } from '../../utils/streakManager';

interface SleepLog {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  sleepQuality: number;
  timeToFallAsleep: number;
  nightWakings: number;
  totalSleep: number;
  mood: number;
  factors: string[];
  notes: string;
}

interface SleepHygieneTip {
  id: string;
  title: string;
  description: string;
  category: 'environment' | 'routine' | 'lifestyle' | 'mental';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  implemented: boolean;
}

function SleepTherapyModule() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [currentLog, setCurrentLog] = useState<Partial<SleepLog>>({
    date: new Date().toISOString().split('T')[0],
    bedtime: '22:00',
    wakeTime: '07:00',
    sleepQuality: 5,
    timeToFallAsleep: 15,
    nightWakings: 0,
    totalSleep: 8,
    mood: 5,
    factors: [],
    notes: ''
  });
  const [savedLogs, setSavedLogs] = useState<SleepLog[]>([]);
  const [selectedTab, setSelectedTab] = useState<'log' | 'hygiene' | 'sounds'>('log');
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);

  const sleepFactors = [
    'Caffeine', 'Alcohol', 'Exercise', 'Stress', 'Screen Time',
    'Heavy Meal', 'Medication', 'Noise', 'Temperature', 'Anxiety'
  ];

  const sleepHygieneTips: SleepHygieneTip[] = [
    {
      id: '1',
      title: 'Consistent Sleep Schedule',
      description: 'Go to bed and wake up at the same time every day',
      category: 'routine',
      difficulty: 'Medium',
      implemented: false
    },
    {
      id: '2',
      title: 'Cool, Dark Room',
      description: 'Keep bedroom temperature between 60-67°F and minimize light',
      category: 'environment',
      difficulty: 'Easy',
      implemented: false
    },
    {
      id: '3',
      title: 'No Screens 1 Hour Before Bed',
      description: 'Avoid phones, tablets, TV, and computers before bedtime',
      category: 'lifestyle',
      difficulty: 'Hard',
      implemented: false
    },
    {
      id: '4',
      title: 'Relaxation Routine',
      description: 'Develop a calming pre-sleep routine (reading, meditation, bath)',
      category: 'routine',
      difficulty: 'Medium',
      implemented: false
    },
    {
      id: '5',
      title: 'Limit Caffeine After 2 PM',
      description: 'Avoid caffeine in the afternoon and evening',
      category: 'lifestyle',
      difficulty: 'Medium',
      implemented: false
    },
    {
      id: '6',
      title: 'Worry Time',
      description: 'Set aside 15 minutes earlier in the day to process worries',
      category: 'mental',
      difficulty: 'Hard',
      implemented: false
    }
  ];

  const sleepSounds = [
    { id: '1', name: 'Rain on Roof', duration: '60 min', category: 'Nature' },
    { id: '2', name: 'Ocean Waves', duration: '45 min', category: 'Nature' },
    { id: '3', name: 'White Noise', duration: '120 min', category: 'Ambient' },
    { id: '4', name: 'Forest Sounds', duration: '90 min', category: 'Nature' },
    { id: '5', name: 'Gentle Piano', duration: '30 min', category: 'Music' },
    { id: '6', name: 'Meditation Bell', duration: '20 min', category: 'Meditation' }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('mindcare_sleep_logs');
    if (saved) {
      setSavedLogs(JSON.parse(saved));
    }
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setCurrentLog(prev => ({ ...prev, [field]: value }));
  };

  const handleFactorToggle = (factor: string) => {
    setCurrentLog(prev => ({
      ...prev,
      factors: prev.factors?.includes(factor)
        ? prev.factors.filter(f => f !== factor)
        : [...(prev.factors || []), factor]
    }));
  };

  const saveSleepLog = () => {
    if (!currentLog.bedtime || !currentLog.wakeTime) {
      toast.error('Please enter bedtime and wake time');
      return;
    }

    const newLog: SleepLog = {
      id: Date.now().toString(),
      userId: user?.id, // Add user ID to track logs per user
      ...currentLog as SleepLog
    };

    const updatedLogs = [...savedLogs, newLog];
    setSavedLogs(updatedLogs);
    localStorage.setItem('mindcare_sleep_logs', JSON.stringify(updatedLogs));
    
    // Update streak
    updateStreak();
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('mindcare-data-updated'));
    
    toast.success('Sleep log saved! Keep tracking for better insights.');
    
    // Reset form
    setCurrentLog({
      date: new Date().toISOString().split('T')[0],
      bedtime: '22:00',
      wakeTime: '07:00',
      sleepQuality: 5,
      timeToFallAsleep: 15,
      nightWakings: 0,
      totalSleep: 8,
      mood: 5,
      factors: [],
      notes: ''
    });
  };

  const toggleHygieneTip = (tipId: string) => {
    // In a real app, this would save to backend
    toast.success('Sleep hygiene tip updated!');
  };

  const playSound = (soundId: string) => {
    if (playingSoundId === soundId) {
      setPlayingSoundId(null);
      toast.success('Sleep sound stopped');
    } else {
      setPlayingSoundId(soundId);
      toast.success('Sleep sound playing');
    }
  };

  const calculateSleepEfficiency = () => {
    if (savedLogs.length === 0) return 0;
    const avgQuality = savedLogs.reduce((sum, log) => sum + log.sleepQuality, 0) / savedLogs.length;
    return Math.round((avgQuality / 5) * 100);
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
          className="text-center mb-4"
        >
          <h1 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Sleep Therapy
          </h1>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Improve sleep quality with proven techniques and comprehensive tracking
          </p>
        </motion.div>

        {/* Sleep Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-4 p-4 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Moon className="w-5 h-5 text-blue-500" />
                <span className={`text-xl font-bold text-blue-500`}>
                  {savedLogs.length > 0 ? savedLogs[savedLogs.length - 1].totalSleep : 8}h
                </span>
              </div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Last Night
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className={`text-xl font-bold text-yellow-500`}>
                  {calculateSleepEfficiency()}%
                </span>
              </div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Sleep Efficiency
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Calendar className="w-5 h-5 text-green-500" />
                <span className={`text-xl font-bold text-green-500`}>
                  {savedLogs.length}
                </span>
              </div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Days Tracked
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`mb-4 p-1 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="flex space-x-1">
            {[
              { id: 'log', label: 'Sleep Log', icon: Moon },
              { id: 'hygiene', label: 'Sleep Hygiene', icon: CheckCircle },
              { id: 'sounds', label: 'Sleep Sounds', icon: Volume2 }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-all duration-200 ${
                  selectedTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {selectedTab === 'log' && (
            <motion.div
              key="log"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className={`p-4 rounded-xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Daily Sleep Log
              </h3>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Bedtime
                  </label>
                  <input
                    type="time"
                    value={currentLog.bedtime}
                    onChange={(e) => handleInputChange('bedtime', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
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
                    Wake Time
                  </label>
                  <input
                    type="time"
                    value={currentLog.wakeTime}
                    onChange={(e) => handleInputChange('wakeTime', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-4 mb-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Sleep Quality: {currentLog.sleepQuality}/5
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={currentLog.sleepQuality}
                    onChange={(e) => handleInputChange('sleepQuality', parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-red-400 to-green-500"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Factors that affected your sleep:
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {sleepFactors.map((factor) => (
                      <motion.button
                        key={factor}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleFactorToggle(factor)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          currentLog.factors?.includes(factor)
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                            : theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {factor}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Additional Notes
                  </label>
                  <textarea
                    value={currentLog.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    placeholder="How did you feel? Any dreams or disturbances?"
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveSleepLog}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Save Sleep Log
              </motion.button>
            </motion.div>
          )}

          {selectedTab === 'hygiene' && (
            <motion.div
              key="hygiene"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className={`p-4 rounded-xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Sleep Hygiene Checklist
              </h3>
              <div className="space-y-3">
                {sleepHygieneTips.map((tip) => (
                  <motion.div
                    key={tip.id}
                    whileHover={{ scale: 1.01 }}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      tip.implemented
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                        : theme === 'dark'
                        ? 'border-gray-700 bg-gray-700/50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() => toggleHygieneTip(tip.id)}
                          className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            tip.implemented
                              ? 'border-green-500 bg-green-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {tip.implemented && <CheckCircle className="w-3 h-3 text-white" />}
                        </button>
                        <div>
                          <h4 className={`font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-800'
                          }`}>
                            {tip.title}
                          </h4>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {tip.description}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tip.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        tip.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {tip.difficulty}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {selectedTab === 'sounds' && (
            <motion.div
              key="sounds"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className={`p-4 rounded-xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Sleep Sounds
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {sleepSounds.map((sound) => (
                  <motion.div
                    key={sound.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      playingSoundId === sound.id
                        ? 'bg-purple-100 dark:bg-purple-900/50 border border-purple-300 dark:border-purple-700'
                        : theme === 'dark'
                        ? 'bg-gray-700/50 hover:bg-gray-700'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => playSound(sound.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center`}>
                          {playingSoundId === sound.id ? (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              <Pause className="w-5 h-5 text-white" />
                            </motion.div>
                          ) : (
                            <Play className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <h4 className={`font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-800'
                          }`}>
                            {sound.name}
                          </h4>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {sound.category} • {sound.duration}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SleepTherapyModule;