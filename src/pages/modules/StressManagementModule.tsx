import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Zap, Brain, Heart, Clock, CheckCircle,
  AlertTriangle, TrendingUp, Calendar, Star, Award,
  Activity, Thermometer, Wind, Shield, Plus, Save
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { updateStreak } from '../../utils/streakManager';

interface StressLog {
  id: string;
  date: string;
  stressLevel: number;
  triggers: string[];
  symptoms: string[];
  copingStrategies: string[];
  effectiveness: number;
  notes: string;
}

interface StressReliefTechnique {
  id: string;
  name: string;
  description: string;
  duration: string;
  category: 'immediate' | 'short-term' | 'long-term';
  steps: string[];
  effectiveness: number;
}

function StressManagementModule() {
  const { theme } = useTheme();
  const [currentStressLevel, setCurrentStressLevel] = useState(5);
  const [selectedTechnique, setSelectedTechnique] = useState<StressReliefTechnique | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [currentLog, setCurrentLog] = useState<Partial<StressLog>>({
    date: new Date().toISOString().split('T')[0],
    stressLevel: 5,
    triggers: [],
    symptoms: [],
    copingStrategies: [],
    effectiveness: 5,
    notes: ''
  });
  const [savedLogs, setSavedLogs] = useState<StressLog[]>([]);

  const stressTriggers = [
    'Work Pressure', 'Relationships', 'Financial Concerns', 'Health Issues',
    'Family Problems', 'Social Situations', 'Time Pressure', 'Uncertainty',
    'Technology', 'Traffic', 'Noise', 'Crowds'
  ];

  const stressSymptoms = [
    'Headache', 'Muscle Tension', 'Fatigue', 'Irritability',
    'Anxiety', 'Racing Thoughts', 'Difficulty Concentrating', 'Sleep Problems',
    'Stomach Issues', 'Rapid Heartbeat', 'Sweating', 'Restlessness'
  ];

  const techniques: StressReliefTechnique[] = [
    {
      id: '1',
      name: 'Progressive Muscle Relaxation',
      description: 'Systematically tense and relax muscle groups',
      duration: '10-15 min',
      category: 'short-term',
      effectiveness: 85,
      steps: [
        'Find a comfortable position',
        'Start with your toes - tense for 5 seconds',
        'Release and notice the relaxation',
        'Move up through each muscle group',
        'End with your face and scalp',
        'Take deep breaths throughout'
      ]
    },
    {
      id: '2',
      name: '5-4-3-2-1 Grounding',
      description: 'Use your senses to anchor yourself in the present',
      duration: '3-5 min',
      category: 'immediate',
      effectiveness: 78,
      steps: [
        'Notice 5 things you can see',
        'Notice 4 things you can touch',
        'Notice 3 things you can hear',
        'Notice 2 things you can smell',
        'Notice 1 thing you can taste',
        'Take three deep breaths'
      ]
    },
    {
      id: '3',
      name: 'Box Breathing',
      description: 'Structured breathing pattern for quick stress relief',
      duration: '2-5 min',
      category: 'immediate',
      effectiveness: 82,
      steps: [
        'Inhale for 4 counts',
        'Hold for 4 counts',
        'Exhale for 4 counts',
        'Hold empty for 4 counts',
        'Repeat 4-8 cycles',
        'Focus only on counting'
      ]
    },
    {
      id: '4',
      name: 'Mindful Body Scan',
      description: 'Systematic awareness of physical sensations',
      duration: '15-20 min',
      category: 'short-term',
      effectiveness: 88,
      steps: [
        'Lie down comfortably',
        'Close your eyes and breathe naturally',
        'Start awareness at the top of your head',
        'Slowly move attention down your body',
        'Notice sensations without judgment',
        'End with whole-body awareness'
      ]
    },
    {
      id: '5',
      name: 'Cognitive Reframing',
      description: 'Challenge and reframe stressful thoughts',
      duration: '10-15 min',
      category: 'long-term',
      effectiveness: 90,
      steps: [
        'Identify the stressful thought',
        'Ask: "Is this thought realistic?"',
        'Look for evidence for and against',
        'Consider alternative perspectives',
        'Create a balanced, realistic thought',
        'Practice the new thought pattern'
      ]
    },
    {
      id: '6',
      name: 'Quick Stress Reset',
      description: 'Rapid technique for immediate relief',
      duration: '1-2 min',
      category: 'immediate',
      effectiveness: 70,
      steps: [
        'Stop what you\'re doing',
        'Take 3 deep breaths',
        'Drop your shoulders',
        'Unclench your jaw',
        'Smile slightly',
        'Say "I can handle this"'
      ]
    }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('mindcare_stress_logs');
    if (saved) {
      setSavedLogs(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  const startTechnique = (technique: StressReliefTechnique) => {
    setSelectedTechnique(technique);
    setIsSessionActive(true);
    setSessionTime(0);
    toast.success(`Starting ${technique.name} session`);
  };

  const completeTechnique = () => {
    if (selectedTechnique) {
      setIsSessionActive(false);
      toast.success(`${selectedTechnique.name} completed! How do you feel?`);
      setSelectedTechnique(null);
      setSessionTime(0);
    }
  };

  const handleToggle = (field: 'triggers' | 'symptoms' | 'copingStrategies', item: string) => {
    setCurrentLog(prev => ({
      ...prev,
      [field]: prev[field]?.includes(item)
        ? prev[field].filter((i: string) => i !== item)
        : [...(prev[field] || []), item]
    }));
  };

  const saveStressLog = () => {
    const newLog: StressLog = {
      id: Date.now().toString(),
      userId: user?.id, // Add user ID to track logs per user
      ...currentLog as StressLog
    };

    const updatedLogs = [...savedLogs, newLog];
    setSavedLogs(updatedLogs);
    localStorage.setItem('mindcare_stress_logs', JSON.stringify(updatedLogs));
    
    // Update streak
    updateStreak();
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('mindcare-data-updated'));
    
    toast.success('Stress log saved! Great job tracking your patterns.');
    
    // Reset form
    setCurrentLog({
      date: new Date().toISOString().split('T')[0],
      stressLevel: 5,
      triggers: [],
      symptoms: [],
      copingStrategies: [],
      effectiveness: 5,
      notes: ''
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'immediate': return 'from-red-500 to-orange-500';
      case 'short-term': return 'from-yellow-500 to-orange-500';
      case 'long-term': return 'from-green-500 to-teal-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (selectedTechnique) {
    return (
      <div className={`h-screen flex flex-col items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50'
      }`}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`max-w-2xl w-full p-6 rounded-2xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="text-center mb-6">
            <h2 className={`text-2xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              {selectedTechnique.name}
            </h2>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {selectedTechnique.description}
            </p>
            {isSessionActive && (
              <div className={`mt-3 inline-flex items-center space-x-2 px-3 py-1 rounded-full ${
                theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="font-medium">{formatTime(sessionTime)}</span>
              </div>
            )}
          </div>

          <div className="space-y-4 mb-6">
            {selectedTechnique.steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`flex items-start space-x-3 p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                  {index + 1}
                </div>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {step}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedTechnique(null);
                setIsSessionActive(false);
                setSessionTime(0);
              }}
              className={`flex-1 py-3 rounded-xl font-medium ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Back to Techniques
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={completeTechnique}
              className="flex-1 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-teal-600 transition-all duration-300"
            >
              Complete Session
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

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
            Stress Management
          </h1>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Learn effective coping strategies and track your stress patterns
          </p>
        </motion.div>

        {/* Current Stress Level */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-4 p-4 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-3 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Current Stress Level
          </h3>
          <div className="flex items-center space-x-4">
            <Thermometer className={`w-6 h-6 ${
              currentStressLevel <= 3 ? 'text-green-500' :
              currentStressLevel <= 6 ? 'text-yellow-500' : 'text-red-500'
            }`} />
            <div className="flex-1">
              <input
                type="range"
                min="1"
                max="10"
                value={currentStressLevel}
                onChange={(e) => setCurrentStressLevel(parseInt(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-green-400 to-red-500"
              />
              <div className="flex justify-between text-xs mt-1">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Calm</span>
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Overwhelmed</span>
              </div>
            </div>
            <span className={`text-2xl font-bold ${
              currentStressLevel <= 3 ? 'text-green-500' :
              currentStressLevel <= 6 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {currentStressLevel}
            </span>
          </div>
        </motion.div>

        {/* Stress Relief Techniques */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`mb-4 p-4 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Stress Relief Techniques
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {techniques.map((technique) => (
              <motion.div
                key={technique.id}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => startTechnique(technique)}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                  theme === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getCategoryColor(technique.category)} flex items-center justify-center`}>
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    technique.category === 'immediate' ? 'bg-red-100 text-red-800' :
                    technique.category === 'short-term' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {technique.category}
                  </span>
                </div>
                
                <h4 className={`font-semibold mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {technique.name}
                </h4>
                
                <p className={`text-sm mb-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {technique.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {technique.duration}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span className={`text-xs font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {technique.effectiveness}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stress Log */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-4 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Daily Stress Log
          </h3>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Stress Triggers (select all that apply):
              </label>
              <div className="grid grid-cols-2 gap-2">
                {stressTriggers.slice(0, 8).map((trigger) => (
                  <motion.button
                    key={trigger}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleToggle('triggers', trigger)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      currentLog.triggers?.includes(trigger)
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {trigger}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Physical Symptoms:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {stressSymptoms.slice(0, 8).map((symptom) => (
                  <motion.button
                    key={symptom}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleToggle('symptoms', symptom)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      currentLog.symptoms?.includes(symptom)
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {symptom}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={saveStressLog}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Save Stress Log</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

export default StressManagementModule;