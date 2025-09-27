import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Eye, Heart, TrendingUp, Clock, Star,
  AlertTriangle, CheckCircle, Play, Pause, RotateCcw,
  Shield, Award, Calendar, Brain, Zap, Plus
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { updateStreak } from '../../utils/streakManager';

interface ExposureExercise {
  id: string;
  title: string;
  description: string;
  fearType: string;
  difficulty: number;
  duration: number;
  instructions: string[];
  safetyNotes: string[];
  completed: boolean;
}

interface ExposureSession {
  id: string;
  exerciseId: string;
  date: string;
  anxietyBefore: number;
  anxietyDuring: number;
  anxietyAfter: number;
  duration: number;
  completed: boolean;
  notes: string;
}

function ExposureTherapyModule() {
  const { theme } = useTheme();
  const [selectedExercise, setSelectedExercise] = useState<ExposureExercise | null>(null);
  const [currentSession, setCurrentSession] = useState<Partial<ExposureSession>>({
    anxietyBefore: 5,
    anxietyDuring: 5,
    anxietyAfter: 5,
    notes: ''
  });
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [savedSessions, setSavedSessions] = useState<ExposureSession[]>([]);

  const exposureExercises: ExposureExercise[] = [
    {
      id: '1',
      title: 'Social Interaction Practice',
      description: 'Gradual exposure to social situations',
      fearType: 'Social Anxiety',
      difficulty: 3,
      duration: 900, // 15 minutes
      instructions: [
        'Start by making eye contact with a cashier',
        'Ask a simple question to a store employee',
        'Make small talk with a neighbor',
        'Compliment someone genuinely',
        'Join a brief conversation'
      ],
      safetyNotes: [
        'Start with low-stakes interactions',
        'Have an exit strategy ready',
        'Practice self-compassion if it feels difficult'
      ],
      completed: false
    },
    {
      id: '2',
      title: 'Public Speaking Preparation',
      description: 'Build confidence in speaking situations',
      fearType: 'Performance Anxiety',
      difficulty: 4,
      duration: 1200, // 20 minutes
      instructions: [
        'Record yourself speaking for 1 minute',
        'Practice in front of a mirror',
        'Speak to a trusted friend',
        'Present to a small group',
        'Join a public speaking group'
      ],
      safetyNotes: [
        'Start with topics you\'re passionate about',
        'Use breathing techniques before speaking',
        'Remember that nervousness is normal'
      ],
      completed: false
    },
    {
      id: '3',
      title: 'Height Exposure',
      description: 'Gradual exposure to heights',
      fearType: 'Acrophobia',
      difficulty: 5,
      duration: 1800, // 30 minutes
      instructions: [
        'Look out a second-story window',
        'Stand on a sturdy chair',
        'Visit a balcony or deck',
        'Use an elevator to a higher floor',
        'Visit an observation deck'
      ],
      safetyNotes: [
        'Always ensure physical safety',
        'Have someone with you',
        'Start very gradually',
        'Stop if you feel dizzy or faint'
      ],
      completed: false
    },
    {
      id: '4',
      title: 'Driving Confidence',
      description: 'Overcome driving anxiety step by step',
      fearType: 'Driving Anxiety',
      difficulty: 4,
      duration: 2400, // 40 minutes
      instructions: [
        'Sit in the driver\'s seat (car off)',
        'Start the engine and sit for 5 minutes',
        'Drive around the block',
        'Drive to a nearby store',
        'Take a longer route you\'ve avoided'
      ],
      safetyNotes: [
        'Ensure you have a valid license',
        'Start in familiar, safe areas',
        'Have a support person available',
        'Pull over safely if overwhelmed'
      ],
      completed: false
    }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('mindcare_exposure_sessions');
    if (saved) {
      setSavedSessions(JSON.parse(saved));
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

  const startExposure = (exercise: ExposureExercise) => {
    setSelectedExercise(exercise);
    setCurrentSession({
      exerciseId: exercise.id,
      date: new Date().toISOString().split('T')[0],
      anxietyBefore: 5,
      anxietyDuring: 5,
      anxietyAfter: 5,
      notes: ''
    });
    setCurrentStep(0);
    setSessionTime(0);
    toast.success('Exposure session started. Remember: you are safe and in control.');
  };

  const startSession = () => {
    setIsSessionActive(true);
    toast.success('Exposure exercise begun. Take your time and breathe.');
  };

  const completeSession = () => {
    if (!selectedExercise) return;

    const newSession: ExposureSession = {
      id: Date.now().toString(),
      userId: user?.id, // Add user ID to track sessions per user
      exerciseId: selectedExercise.id,
      date: new Date().toISOString().split('T')[0],
      duration: sessionTime,
      completed: true,
      ...currentSession as ExposureSession
    };

    const updatedSessions = [...savedSessions, newSession];
    setSavedSessions(updatedSessions);
    localStorage.setItem('mindcare_exposure_sessions', JSON.stringify(updatedSessions));
    
    // Update streak
    updateStreak();
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('mindcare-data-updated'));
    
    toast.success('Exposure session completed! You showed great courage.');
    
    setSelectedExercise(null);
    setIsSessionActive(false);
    setSessionTime(0);
    setCurrentStep(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'from-green-500 to-teal-500';
    if (difficulty <= 3) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getAnxietyColor = (level: number) => {
    if (level <= 3) return 'text-green-500';
    if (level <= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (selectedExercise) {
    return (
      <div className={`h-screen flex flex-col ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50'
      }`}>
        <div className="flex-1 flex items-center justify-center p-4">
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
                {selectedExercise.title}
              </h2>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {selectedExercise.description}
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

            {!isSessionActive ? (
              <div className="space-y-4">
                {/* Pre-Session Anxiety */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Current Anxiety Level: {currentSession.anxietyBefore}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={currentSession.anxietyBefore}
                    onChange={(e) => setCurrentSession(prev => ({ ...prev, anxietyBefore: parseInt(e.target.value) }))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-green-400 to-red-500"
                  />
                </div>

                {/* Safety Notes */}
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <h4 className="font-semibold text-yellow-600 mb-2 flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Safety Guidelines
                  </h4>
                  <ul className="space-y-1">
                    {selectedExercise.safetyNotes.map((note, index) => (
                      <li key={index} className={`text-sm ${
                        theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'
                      }`}>
                        • {note}
                      </li>
                    ))}
                  </ul>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startSession}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Begin Exposure Exercise</span>
                </motion.button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Current Step */}
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <h4 className={`font-semibold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    Step {currentStep + 1} of {selectedExercise.instructions.length}
                  </h4>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedExercise.instructions[currentStep]}
                  </p>
                </div>

                {/* Progress */}
                <div className={`w-full h-2 rounded-full ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / selectedExercise.instructions.length) * 100}%` }}
                  />
                </div>

                {/* Anxiety Tracking */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Current Anxiety Level: {currentSession.anxietyDuring}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={currentSession.anxietyDuring}
                    onChange={(e) => setCurrentSession(prev => ({ ...prev, anxietyDuring: parseInt(e.target.value) }))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-green-400 to-red-500"
                  />
                </div>

                {/* Controls */}
                <div className="flex space-x-3">
                  {currentStep < selectedExercise.instructions.length - 1 ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCurrentStep(prev => prev + 1)}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                    >
                      Next Step
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={completeSession}
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-teal-600 transition-all duration-300"
                    >
                      Complete Exercise
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedExercise(null);
                      setIsSessionActive(false);
                      setSessionTime(0);
                    }}
                    className={`px-4 py-3 rounded-xl font-medium ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Stop
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
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
            Exposure Therapy
          </h1>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Gradual exposure techniques for overcoming anxiety and phobias
          </p>
        </motion.div>

        {/* Warning Notice */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-4 p-4 rounded-xl ${
            theme === 'dark' ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <div>
              <h3 className={`font-semibold ${
                theme === 'dark' ? 'text-red-300' : 'text-red-800'
              }`}>
                Important Safety Notice
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-red-400' : 'text-red-700'
              }`}>
                Exposure therapy should ideally be done with professional guidance. Start slowly and stop if you feel overwhelmed.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`mb-4 p-4 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Target className="w-5 h-5 text-purple-500" />
                <span className={`text-xl font-bold text-purple-500`}>
                  {savedSessions.length}
                </span>
              </div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Sessions Completed
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center space-x-2 mb-1">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className={`text-xl font-bold text-green-500`}>
                  {savedSessions.length > 0 ? 
                    Math.round(savedSessions.reduce((sum, s) => sum + (s.anxietyBefore - s.anxietyAfter), 0) / savedSessions.length) : 0}
                </span>
              </div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Avg Anxiety Reduction
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Award className="w-5 h-5 text-yellow-500" />
                <span className={`text-xl font-bold text-yellow-500`}>
                  {exposureExercises.filter(e => e.completed).length}
                </span>
              </div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Exercises Mastered
              </p>
            </div>
          </div>
        </motion.div>

        {/* Exercise Selection */}
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
            Exposure Exercises
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {exposureExercises.map((exercise) => (
              <motion.div
                key={exercise.id}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => startExposure(exercise)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  theme === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getDifficultyColor(exercise.difficulty)} flex items-center justify-center`}>
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {exercise.fearType}
                    </span>
                    {exercise.completed && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>
                
                <h4 className={`font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {exercise.title}
                </h4>
                
                <p className={`text-sm mb-3 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {exercise.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {Math.floor(exercise.duration / 60)} min
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="w-3 h-3 text-gray-500" />
                      <span className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Level {exercise.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Sessions */}
        {savedSessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`mt-4 p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-3 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Recent Sessions
            </h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {savedSessions.slice(-3).reverse().map((session) => {
                const exercise = exposureExercises.find(e => e.id === session.exerciseId);
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {exercise?.title}
                      </span>
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {new Date(session.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          Anxiety:
                        </span>
                        <span className={getAnxietyColor(session.anxietyBefore)}>
                          {session.anxietyBefore}
                        </span>
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          →
                        </span>
                        <span className={getAnxietyColor(session.anxietyAfter)}>
                          {session.anxietyAfter}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          {formatTime(session.duration)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default ExposureTherapyModule;