import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Brain, Heart, Moon, Headphones, Palette, Gamepad2,
  BookOpen, Music, Target, Users, Clock, Star,
  Play, Pause, RotateCcw, CheckCircle, Lock, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { updateStreak } from '../utils/streakManager';

function TherapyModules() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [todaysDate, setTodaysDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [userProgress, setUserProgress] = useState<any>(null);

  useEffect(() => {
    // Load user progress from localStorage
    const savedProgress = localStorage.getItem('mindcare_user_progress');
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
      
      // Check for daily reset
      const currentDate = new Date().toISOString().split('T')[0];
      const progress = JSON.parse(savedProgress);
      
      if (!progress.lastResetDate || progress.lastResetDate !== currentDate) {
        // Reset daily completions for new day
        const resetProgress = {
          ...progress,
          lastResetDate: currentDate,
          dailyCompletions: {
            ...progress.dailyCompletions,
            [currentDate]: []
          }
        };
        localStorage.setItem('mindcare_user_progress', JSON.stringify(resetProgress));
        setUserProgress(resetProgress);
        setCompletedModules([]);
      } else {
        // Load today's completions
        const todaysCompletions = progress.dailyCompletions?.[currentDate] || [];
        setCompletedModules(todaysCompletions);
      }
    } else {
      // Initialize user progress if it doesn't exist
      const initialProgress = {
        lastResetDate: todaysDate,
        dailyCompletions: { [todaysDate]: [] }
      };
      localStorage.setItem('mindcare_user_progress', JSON.stringify(initialProgress));
      setUserProgress(initialProgress);
    }
  }, []);

  const updateTherapyProgress = (moduleId: string) => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Update streak
    updateStreak();
    
    if (userProgress?.currentPlan) {
      const updatedProgress = {
        ...userProgress,
        completedTherapies: [...(userProgress.completedTherapies || []), moduleId],
        dailyCompletions: {
          ...userProgress.dailyCompletions,
          [currentDate]: [...(userProgress.dailyCompletions?.[currentDate] || []), moduleId]
        }
      };
      setUserProgress(updatedProgress);
      localStorage.setItem('mindcare_user_progress', JSON.stringify(updatedProgress));
      
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('mindcare-data-updated'));
      
      // Update local state
      setCompletedModules(prev => [...prev, moduleId]);
    } else {
      // If no current plan, just track daily completions
      const currentProgress = userProgress || { dailyCompletions: {} };
      const updatedProgress = {
        ...currentProgress,
        lastResetDate: currentDate,
        dailyCompletions: {
          ...currentProgress.dailyCompletions,
          [currentDate]: [...(currentProgress.dailyCompletions?.[currentDate] || []), moduleId]
        }
      };
      setUserProgress(updatedProgress);
      localStorage.setItem('mindcare_user_progress', JSON.stringify(updatedProgress));
      
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('mindcare-data-updated'));
      
      // Update local state
      setCompletedModules(prev => [...prev, moduleId]);
    }
  };

  const therapyModules = [
    {
      id: 1,
      moduleId: 'cbt',
      title: 'CBT Thought Records',
      description: 'Cognitive Behavioral Therapy techniques with guided prompts',
      icon: BookOpen,
      color: 'from-purple-500 to-pink-500',
      duration: '15-20 min',
      difficulty: 'Beginner',
      sessions: 12,
      route: '/therapy-modules/cbt'
    },
    {
      id: 2,
      moduleId: 'mindfulness',
      title: 'Mindfulness & Breathing',
      description: 'Mindfulness and relaxation exercises with audio guidance',
      icon: Brain,
      color: 'from-blue-500 to-cyan-500',
      duration: '10-30 min',
      difficulty: 'Beginner',
      sessions: 15,
      route: '/therapy-modules/mindfulness'
    },
    {
      id: 3,
      moduleId: 'stress',
      title: 'Stress Management',
      description: 'Learn effective coping strategies for daily stress',
      icon: Target,
      color: 'from-teal-500 to-green-500',
      duration: '15-20 min',
      difficulty: 'Beginner',
      sessions: 8,
      route: '/therapy-modules/stress'
    },
    {
      id: 4,
      moduleId: 'gratitude',
      title: 'Gratitude Journal',
      description: 'Daily gratitude practice with streak tracking',
      icon: Heart,
      color: 'from-green-500 to-teal-500',
      duration: '5-10 min',
      difficulty: 'Beginner',
      sessions: 21,
      route: '/therapy-modules/gratitude'
    },
    {
      id: 5,
      moduleId: 'music',
      title: 'Relaxation Music',
      description: 'Curated audio library for relaxation and focus',
      icon: Music,
      color: 'from-purple-500 to-blue-500',
      duration: 'Variable',
      difficulty: 'Beginner',
      sessions: 20,
      route: '/therapy-modules/music'
    },
    {
      id: 6,
      moduleId: 'tetris',
      title: 'Tetris Therapy',
      description: 'Gamified stress relief and cognitive enhancement',
      icon: Gamepad2,
      color: 'from-cyan-500 to-blue-500',
      duration: '10-15 min',
      difficulty: 'Beginner',
      sessions: 12,
      route: '/therapy-modules/tetris'
    },
    {
      id: 7,
      moduleId: 'art',
      title: 'Art & Color Therapy',
      description: 'Creative expression through digital art and coloring',
      icon: Palette,
      color: 'from-pink-500 to-purple-500',
      duration: '20-30 min',
      difficulty: 'Beginner',
      sessions: 10,
      route: '/therapy-modules/art'
    },
    {
      id: 8,
      moduleId: 'exposure',
      title: 'Exposure Therapy',
      description: 'Gradual exposure techniques for anxiety and phobias',
      icon: Target,
      color: 'from-orange-500 to-red-500',
      duration: '30-45 min',
      difficulty: 'Advanced',
      sessions: 12,
      route: '/therapy-modules/exposure'
    },
    {
      id: 9,
      moduleId: 'video',
      title: 'Video Therapy',
      description: 'Guided video sessions with therapeutic content',
      icon: Play,
      color: 'from-blue-500 to-indigo-500',
      duration: '20-40 min',
      difficulty: 'Intermediate',
      sessions: 16,
      route: '/therapy-modules/video'
    },
    {
      id: 10,
      moduleId: 'act',
      title: 'Acceptance & Commitment Therapy',
      description: 'ACT principles for psychological flexibility',
      icon: Star,
      color: 'from-teal-500 to-cyan-500',
      duration: '25-35 min',
      difficulty: 'Intermediate',
      sessions: 14,
      route: '/therapy-modules/act'
    }
  ];

  const handleStartModule = (module: any) => {
    // Update progress when starting a therapy
    updateTherapyProgress(module.moduleId);
    navigate(module.route);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
          className="text-center mb-6"
        >
          <h1 className={`text-2xl font-bold mb-3 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Therapies
          </h1>
          <p className={`text-base mb-4 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Evidence-based therapeutic approaches tailored to your needs
          </p>
          
          {/* Progress Overview */}
          <div className={`inline-flex items-center space-x-4 px-4 py-3 rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
            <div className="text-center">
              <p className={`text-xl font-bold text-purple-500`}>
                {completedModules.length}
              </p>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Completed
              </p>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="text-center">
              <p className={`text-xl font-bold text-blue-500`}>
                {therapyModules.length - completedModules.length}
              </p>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Available
              </p>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="text-center">
              <p className={`text-xl font-bold text-teal-500`}>
                {Math.round((completedModules.length / therapyModules.length) * 100)}%
              </p>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Progress
              </p>
            </div>
          </div>
        </motion.div>

        {/* Modules Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {therapyModules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`relative p-4 rounded-xl shadow-lg cursor-pointer transition-all duration-300 ${
                theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-xl'
              }`}
              onClick={() => handleStartModule(module)}
            >
              {/* Completion Badge */}
              {completedModules.includes(module.moduleId) && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Module Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${module.color} flex items-center justify-center mb-3`}>
                <module.icon className="w-6 h-6 text-white" />
              </div>

              {/* Module Info */}
              <h3 className={`text-base font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {module.title}
              </h3>
              
              <p className={`text-xs mb-3 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {module.description}
              </p>

              {/* Module Details */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Clock className={`w-3 h-3 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {module.duration}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                  {module.difficulty}
                </span>
              </div>

              {/* Progress Bar */}
              <div className={`w-full h-2 rounded-full mb-3 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${module.color}`}
                  style={{ width: completedModules.includes(module.moduleId) ? '100%' : '0%' }}
                />
              </div>

              {/* Sessions Info */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {module.sessions} sessions
                </span>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-2 h-2 ${
                        i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartModule(module);
                }}
                className="w-full py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 text-sm font-medium"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Play className="w-3 h-3" />
                  <span>Start Therapy</span>
                </div>
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Recommended Path */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={`p-4 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-3 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Recommended Learning Path
          </h3>
          <p className={`mb-4 text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Based on your progress and goals, we recommend starting with these modules:
          </p>
          
          <div className="grid md:grid-cols-3 gap-3">
            {therapyModules.slice(2, 5).map((module, index) => (
              <div
                key={module.id}
                className={`p-3 rounded-lg border-2 border-dashed ${
                  theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${module.color} flex items-center justify-center`}>
                    <module.icon className="w-3 h-3 text-white" />
                  </div>
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {module.title}
                  </span>
                </div>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Step {index + 1} in your journey
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default TherapyModules;