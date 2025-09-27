import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, Heart, Waves, Wind, 
  Clock, Target, CheckCircle, Star, ArrowLeft,
  Volume2, VolumeX, Settings, Award
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { updateStreak } from '../../utils/streakManager';

interface BreathingSession {
  id: string;
  name: string;
  duration: number;
  inhale: number;
  hold: number;
  exhale: number;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

function MindfulnessModule() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [currentSession, setCurrentSession] = useState<BreathingSession | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timeLeft, setTimeLeft] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [totalCycles, setTotalCycles] = useState(10);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const breathingSessions: BreathingSession[] = [
    {
      id: '1',
      name: '4-7-8 Relaxation',
      duration: 300,
      inhale: 4,
      hold: 7,
      exhale: 8,
      description: 'Perfect for reducing anxiety and promoting sleep',
      difficulty: 'Beginner'
    },
    {
      id: '2',
      name: 'Box Breathing',
      duration: 240,
      inhale: 4,
      hold: 4,
      exhale: 4,
      description: 'Used by Navy SEALs for stress management',
      difficulty: 'Beginner'
    },
    {
      id: '3',
      name: 'Coherent Breathing',
      duration: 360,
      inhale: 5,
      hold: 0,
      exhale: 5,
      description: 'Balances the nervous system and improves focus',
      difficulty: 'Intermediate'
    },
    {
      id: '4',
      name: 'Wim Hof Method',
      duration: 480,
      inhale: 3,
      hold: 15,
      exhale: 2,
      description: 'Advanced technique for stress resilience',
      difficulty: 'Advanced'
    }
  ];

  const mindfulnessExercises = [
    {
      title: '5-4-3-2-1 Grounding',
      description: 'Notice 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste',
      duration: '5 min'
    },
    {
      title: 'Body Scan',
      description: 'Progressive awareness of physical sensations from head to toe',
      duration: '10 min'
    },
    {
      title: 'Mindful Walking',
      description: 'Conscious awareness of each step and movement',
      duration: '15 min'
    },
    {
      title: 'Present Moment Awareness',
      description: 'Focus entirely on the current moment without judgment',
      duration: '8 min'
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && currentSession && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Move to next phase
            if (currentPhase === 'inhale') {
              setCurrentPhase('hold');
              return currentSession.hold;
            } else if (currentPhase === 'hold') {
              setCurrentPhase('exhale');
              return currentSession.exhale;
            } else {
              setCurrentPhase('inhale');
              setCompletedCycles(prev => prev + 1);
              return currentSession.inhale;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, currentPhase, currentSession]);

  const startSession = (session: BreathingSession) => {
    setCurrentSession(session);
    setCurrentPhase('inhale');
    setTimeLeft(session.inhale);
    setCompletedCycles(0);
    setIsActive(true);
  };

  const pauseSession = () => {
    setIsActive(!isActive);
  };

  const resetSession = () => {
    setIsActive(false);
    setCompletedCycles(0);
    if (currentSession) {
      setCurrentPhase('inhale');
      setTimeLeft(currentSession.inhale);
    }
  };

  const completeSession = () => {
    setIsActive(false);
    setCurrentSession(null);
    
    // Update streak
    updateStreak();
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('mindcare-data-updated'));
    
    // Save mindfulness session completion
    const mindfulnessSessions = JSON.parse(localStorage.getItem('mindcare_mindfulness_sessions') || '[]');
    const newSession = {
      id: Date.now().toString(),
      userId: user?.id,
      date: new Date().toISOString().split('T')[0],
      sessionType: currentSession?.name || 'Breathing Exercise',
      duration: sessionTime,
      completed: true
    };
    mindfulnessSessions.push(newSession);
    localStorage.setItem('mindcare_mindfulness_sessions', JSON.stringify(mindfulnessSessions));
    
    toast.success('Mindfulness session completed! Well done.');
  };

  const getPhaseInstruction = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      default:
        return 'Breathe';
    }
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'from-blue-400 to-cyan-400';
      case 'hold':
        return 'from-purple-400 to-pink-400';
      case 'exhale':
        return 'from-green-400 to-teal-400';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  if (currentSession) {
    return (
      <div className={`h-screen flex flex-col ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50'
      }`}>
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          {/* Back Button */}
          <button
            onClick={() => setCurrentSession(null)}
            className={`absolute top-4 left-4 p-2 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
            } shadow-lg hover:shadow-xl transition-all duration-300`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Session Info */}
          <div className="text-center mb-8">
            <h2 className={`text-2xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              {currentSession.name}
            </h2>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Cycle {completedCycles + 1} of {totalCycles}
            </p>
          </div>

          {/* Breathing Circle */}
          <div className="relative mb-8">
            <motion.div
              animate={{
                scale: currentPhase === 'inhale' ? 1.3 : currentPhase === 'exhale' ? 0.8 : 1.1
              }}
              transition={{ duration: timeLeft, ease: "easeInOut" }}
              className={`w-64 h-64 rounded-full bg-gradient-to-r ${getPhaseColor()} opacity-30 flex items-center justify-center`}
            >
              <motion.div
                animate={{
                  scale: currentPhase === 'inhale' ? 1.2 : currentPhase === 'exhale' ? 0.9 : 1
                }}
                transition={{ duration: timeLeft, ease: "easeInOut" }}
                className={`w-48 h-48 rounded-full bg-gradient-to-r ${getPhaseColor()} opacity-60 flex items-center justify-center`}
              >
                <div className={`w-32 h-32 rounded-full bg-gradient-to-r ${getPhaseColor()} flex items-center justify-center text-white`}>
                  <div className="text-center">
                    <p className="text-lg font-bold">{getPhaseInstruction()}</p>
                    <p className="text-2xl font-bold">{timeLeft}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={pauseSession}
              className="p-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetSession}
              className={`p-4 rounded-full shadow-lg transition-all duration-300 ${
                theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
              }`}
            >
              <RotateCcw className="w-6 h-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-4 rounded-full shadow-lg transition-all duration-300 ${
                theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </motion.button>
          </div>

          {/* Progress */}
          <div className={`w-full max-w-md p-4 rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Progress
              </span>
              <span className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {Math.round((completedCycles / totalCycles) * 100)}%
              </span>
            </div>
            <div className={`w-full h-2 rounded-full ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                style={{ width: `${(completedCycles / totalCycles) * 100}%` }}
              />
            </div>
          </div>

          {completedCycles >= totalCycles && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={completeSession}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Complete Session
            </motion.button>
          )}
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
          className="text-center mb-6"
        >
          <h1 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Mindfulness & Breathing
          </h1>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Evidence-based breathing techniques for anxiety relief and mental clarity
          </p>
        </motion.div>

        {/* Breathing Sessions */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {breathingSessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`p-4 rounded-xl shadow-lg cursor-pointer ${
                theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-xl'
              }`}
              onClick={() => startSession(session)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {session.name}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  session.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                  session.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {session.difficulty}
                </span>
              </div>
              
              <p className={`text-sm mb-3 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {session.description}
              </p>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Wind className="w-4 h-4 text-blue-500" />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {session.inhale}s
                    </span>
                  </div>
                  {session.hold > 0 && (
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4 text-purple-500" />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        {session.hold}s
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Waves className="w-4 h-4 text-green-500" />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {session.exhale}s
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {Math.floor(session.duration / 60)} min
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
              >
                Start Session
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Mindfulness Exercises */}
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
            Quick Mindfulness Exercises
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {mindfulnessExercises.map((exercise, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-700/50 hover:bg-gray-700' 
                    : 'border-gray-200 bg-gray-50 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {exercise.title}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {exercise.duration}
                  </span>
                </div>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {exercise.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default MindfulnessModule;