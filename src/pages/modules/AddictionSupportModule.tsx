import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Target, Calendar, Clock, AlertTriangle,
  CheckCircle, Phone, Users, Book, Heart, Award,
  TrendingUp, MessageCircle, Star, Zap, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { updateStreak } from '../../utils/streakManager';

interface CravingLog {
  id: string;
  timestamp: Date;
  intensity: number;
  trigger: string;
  copingStrategy: string;
  outcome: 'resisted' | 'relapsed';
  notes: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  daysRequired: number;
  achieved: boolean;
  achievedDate?: string;
}

function AddictionSupportModule() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [sobrietyDate, setSobrietyDate] = useState<string>('2024-01-01');
  const [currentCraving, setCurrentCraving] = useState({
    intensity: 5,
    trigger: '',
    notes: ''
  });
  const [cravingLogs, setCravingLogs] = useState<CravingLog[]>([]);
  const [showCravingLog, setShowCravingLog] = useState(false);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);

  const copingStrategies = [
    { id: '1', name: 'Deep Breathing', description: '4-7-8 breathing technique', icon: Heart },
    { id: '2', name: 'Call Support Person', description: 'Reach out to your sponsor or friend', icon: Phone },
    { id: '3', name: 'Physical Exercise', description: 'Go for a walk or do jumping jacks', icon: Zap },
    { id: '4', name: 'Mindfulness', description: '5-minute meditation or grounding', icon: Target },
    { id: '5', name: 'Journaling', description: 'Write about your feelings and triggers', icon: Book },
    { id: '6', name: 'Distraction Activity', description: 'Engage in a healthy hobby', icon: Star }
  ];

  const emergencyContacts = [
    { name: 'SAMHSA National Helpline', number: '1-800-662-4357', available: '24/7' },
    { name: 'Crisis Text Line', number: 'Text HOME to 741741', available: '24/7' },
    { name: 'Your Sponsor', number: 'Contact your assigned sponsor', available: 'Varies' },
    { name: 'Therapist Emergency Line', number: 'Your therapist emergency contact', available: 'Business hours' }
  ];

  const milestones: Milestone[] = [
    { id: '1', title: '24 Hours Sober', description: 'First day of recovery', daysRequired: 1, achieved: true, achievedDate: '2024-01-02' },
    { id: '2', title: '1 Week Sober', description: 'One week of sobriety', daysRequired: 7, achieved: true, achievedDate: '2024-01-08' },
    { id: '3', title: '1 Month Sober', description: 'One month milestone', daysRequired: 30, achieved: false },
    { id: '4', title: '3 Months Sober', description: 'Quarter year achievement', daysRequired: 90, achieved: false },
    { id: '5', title: '6 Months Sober', description: 'Half year milestone', daysRequired: 180, achieved: false },
    { id: '6', title: '1 Year Sober', description: 'One year of recovery', daysRequired: 365, achieved: false }
  ];

  const triggers = [
    'Stress', 'Boredom', 'Social Pressure', 'Emotional Pain', 'Physical Pain',
    'Celebration', 'Loneliness', 'Anger', 'Anxiety', 'Depression', 'Other'
  ];

  const calculateDaysSober = () => {
    const start = new Date(sobrietyDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleCravingLog = (strategy: string, outcome: 'resisted' | 'relapsed') => {
    const newLog: CravingLog = {
      id: Date.now().toString(),
      userId: user?.id, // Add user ID to track logs per user
      timestamp: new Date(),
      intensity: currentCraving.intensity,
      trigger: currentCraving.trigger,
      copingStrategy: strategy,
      outcome,
      notes: currentCraving.notes
    };

    const updatedLogs = [...cravingLogs, newLog];
    setCravingLogs(updatedLogs);
    localStorage.setItem('mindcare_craving_logs', JSON.stringify(updatedLogs));
    
    // Update streak only if craving was resisted
    if (outcome === 'resisted') {
      updateStreak();
      
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('mindcare-data-updated'));
    }
    
    if (outcome === 'resisted') {
      toast.success('Great job resisting the craving! You\'re getting stronger.');
    } else {
      toast.error('It\'s okay. Recovery is a journey. Let\'s get back on track.');
    }
    
    setShowCravingLog(false);
    setCurrentCraving({ intensity: 5, trigger: '', notes: '' });
  };

  const daysSober = calculateDaysSober();

  return (
    <div className={`h-screen flex flex-col ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50'
    }`}>
      <div className="flex-1 overflow-y-auto p-4">
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/therapy-modules')}
          className={`mb-4 flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            theme === 'dark'
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          } shadow-lg`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Therapies</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <h1 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Addiction Recovery Support
          </h1>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Evidence-based tools and support for your recovery journey
          </p>
        </motion.div>

        {/* Sobriety Counter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-4 p-6 rounded-xl shadow-lg text-center ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-green-500" />
            <div>
              <h2 className={`text-3xl font-bold text-green-500`}>
                {daysSober}
              </h2>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Days Sober
              </p>
            </div>
          </div>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Since {new Date(sobrietyDate).toLocaleDateString()}
          </p>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Craving Emergency */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-red-300' : 'text-red-800'
              }`}>
                Having a Craving?
              </h3>
            </div>
            <p className={`text-sm mb-4 ${
              theme === 'dark' ? 'text-red-400' : 'text-red-700'
            }`}>
              You're not alone. Let's work through this together.
            </p>
            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCravingLog(true)}
                className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Log Craving & Get Help
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowEmergencyContacts(true)}
                className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Emergency Contacts
              </motion.button>
            </div>
          </motion.div>

          {/* Daily Check-in */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <Heart className="w-6 h-6 text-purple-500" />
              <h3 className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Daily Check-in
              </h3>
            </div>
            <p className={`text-sm mb-4 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              How are you feeling today? Track your recovery progress.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button className="py-2 px-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
                Feeling Strong
              </button>
              <button className="py-2 px-3 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium">
                Some Struggles
              </button>
              <button className="py-2 px-3 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
                Need Support
              </button>
              <button className="py-2 px-3 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium">
                Grateful Today
              </button>
            </div>
          </motion.div>
        </div>

        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`p-4 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Recovery Milestones
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  milestone.achieved
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : daysSober >= milestone.daysRequired
                    ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    milestone.achieved
                      ? 'bg-green-100 dark:bg-green-800'
                      : daysSober >= milestone.daysRequired
                      ? 'bg-yellow-100 dark:bg-yellow-800'
                      : 'bg-gray-100 dark:bg-gray-600'
                  }`}>
                    {milestone.achieved ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Award className={`w-5 h-5 ${
                        daysSober >= milestone.daysRequired
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`} />
                    )}
                  </div>
                  <div>
                    <h4 className={`font-semibold text-sm ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      {milestone.title}
                    </h4>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {milestone.description}
                    </p>
                  </div>
                </div>
                {milestone.achieved && milestone.achievedDate && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Achieved: {new Date(milestone.achievedDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Craving Log Modal */}
        <AnimatePresence>
          {showCravingLog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowCravingLog(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`max-w-md w-full rounded-2xl shadow-2xl ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <h3 className={`text-xl font-bold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    Craving Support
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Craving Intensity: {currentCraving.intensity}/10
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={currentCraving.intensity}
                        onChange={(e) => setCurrentCraving(prev => ({ ...prev, intensity: parseInt(e.target.value) }))}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-green-400 to-red-500"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        What triggered this craving?
                      </label>
                      <select
                        value={currentCraving.trigger}
                        onChange={(e) => setCurrentCraving(prev => ({ ...prev, trigger: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="">Select trigger</option>
                        {triggers.map(trigger => (
                          <option key={trigger} value={trigger}>{trigger}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Choose a coping strategy:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {copingStrategies.slice(0, 4).map((strategy) => (
                          <motion.button
                            key={strategy.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleCravingLog(strategy.name, 'resisted')}
                            className="p-2 text-left rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                          >
                            <div className="flex items-center space-x-2">
                              <strategy.icon className="w-4 h-4" />
                              <span className="text-sm font-medium">{strategy.name}</span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowCravingLog(false)}
                        className={`flex-1 py-2 rounded-lg font-medium ${
                          theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleCravingLog('Other', 'relapsed')}
                        className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                      >
                        I Relapsed
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emergency Contacts Modal */}
        <AnimatePresence>
          {showEmergencyContacts && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowEmergencyContacts(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`max-w-md w-full rounded-2xl shadow-2xl ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <h3 className={`text-xl font-bold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    Emergency Support
                  </h3>
                  <div className="space-y-3">
                    {emergencyContacts.map((contact, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-green-500" />
                          <div>
                            <h4 className={`font-semibold ${
                              theme === 'dark' ? 'text-white' : 'text-gray-800'
                            }`}>
                              {contact.name}
                            </h4>
                            <p className={`text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {contact.number}
                            </p>
                            <p className={`text-xs ${
                              theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                            }`}>
                              Available: {contact.available}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowEmergencyContacts(false)}
                    className="w-full mt-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 font-medium"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AddictionSupportModule;