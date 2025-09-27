import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Target, Compass, Mountain, Clover as River, Trees as Tree, Star, CheckCircle, Plus, Save, Calendar, Award, Brain, Lightbulb, Eye, Leaf, Sun, Wind } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { updateStreak } from '../../utils/streakManager';

interface Value {
  id: string;
  name: string;
  description: string;
  importance: number;
  actions: string[];
  progress: number;
}

interface ACTExercise {
  id: string;
  title: string;
  description: string;
  component: 'acceptance' | 'mindfulness' | 'values' | 'commitment' | 'defusion' | 'self';
  duration: number;
  instructions: string[];
  completed: boolean;
}

interface MindfulnessExercise {
  id: string;
  title: string;
  description: string;
  duration: number;
  steps: string[];
}

function ACTModule() {
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState<'values' | 'mindfulness' | 'acceptance' | 'commitment'>('values');
  const [personalValues, setPersonalValues] = useState<Value[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<ACTExercise | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const coreValues = [
    { name: 'Family', icon: Heart, description: 'Relationships with loved ones' },
    { name: 'Health', icon: Mountain, description: 'Physical and mental well-being' },
    { name: 'Career', icon: Target, description: 'Professional growth and achievement' },
    { name: 'Creativity', icon: Star, description: 'Artistic and creative expression' },
    { name: 'Learning', icon: Brain, description: 'Knowledge and personal growth' },
    { name: 'Adventure', icon: Compass, description: 'New experiences and exploration' },
    { name: 'Service', icon: Heart, description: 'Helping others and community' },
    { name: 'Spirituality', icon: Sun, description: 'Connection to something greater' },
    { name: 'Independence', icon: Mountain, description: 'Self-reliance and autonomy' },
    { name: 'Security', icon: Tree, description: 'Stability and safety' }
  ];

  const actExercises: ACTExercise[] = [
    {
      id: '1',
      title: 'Values Clarification',
      description: 'Identify what truly matters to you in life',
      component: 'values',
      duration: 900, // 15 minutes
      instructions: [
        'Reflect on what gives your life meaning',
        'Consider different life domains (family, work, health)',
        'Rate the importance of each value',
        'Identify specific actions aligned with your values',
        'Commit to one small value-based action today'
      ],
      completed: false
    },
    {
      id: '2',
      title: 'Mindful Awareness Practice',
      description: 'Develop present-moment awareness without judgment',
      component: 'mindfulness',
      duration: 600, // 10 minutes
      instructions: [
        'Find a comfortable position',
        'Notice your breathing without changing it',
        'Observe thoughts as they come and go',
        'Notice physical sensations in your body',
        'Return attention to the present when mind wanders'
      ],
      completed: false
    },
    {
      id: '3',
      title: 'Acceptance of Difficult Emotions',
      description: 'Learn to make room for uncomfortable feelings',
      component: 'acceptance',
      duration: 720, // 12 minutes
      instructions: [
        'Identify a current difficult emotion',
        'Notice where you feel it in your body',
        'Breathe into that area with kindness',
        'Say "I notice I\'m having the feeling of..."',
        'Allow the emotion to be present without fighting it'
      ],
      completed: false
    },
    {
      id: '4',
      title: 'Committed Action Planning',
      description: 'Create specific plans aligned with your values',
      component: 'commitment',
      duration: 1200, // 20 minutes
      instructions: [
        'Choose one important value',
        'Identify specific, measurable actions',
        'Anticipate potential obstacles',
        'Create implementation intentions',
        'Schedule your first action step'
      ],
      completed: false
    },
    {
      id: '5',
      title: 'Cognitive Defusion',
      description: 'Change your relationship with difficult thoughts',
      component: 'defusion',
      duration: 480, // 8 minutes
      instructions: [
        'Identify a troubling thought',
        'Say "I\'m having the thought that..."',
        'Sing the thought to a silly tune',
        'Thank your mind for the thought',
        'Choose whether to engage with the thought or not'
      ],
      completed: false
    },
    {
      id: '6',
      title: 'Self-as-Context',
      description: 'Connect with your observing self',
      component: 'self',
      duration: 900, // 15 minutes
      instructions: [
        'Sit quietly and close your eyes',
        'Notice you are the one observing your thoughts',
        'Recognize the difference between you and your thoughts',
        'Connect with the part of you that has always been there',
        'Rest in this awareness for a few minutes'
      ],
      completed: false
    }
  ];

  const mindfulnessExercises: MindfulnessExercise[] = [
    {
      id: '1',
      title: 'Leaves on a Stream',
      description: 'Visualize thoughts as leaves floating down a stream',
      duration: 600,
      steps: [
        'Imagine sitting by a gentle stream',
        'Notice thoughts arising in your mind',
        'Place each thought on a leaf',
        'Watch the leaf float downstream',
        'Return attention to the stream'
      ]
    },
    {
      id: '2',
      title: 'Passengers on a Bus',
      description: 'See difficult thoughts as passengers you can choose to listen to or not',
      duration: 480,
      steps: [
        'Imagine you\'re driving a bus',
        'Difficult thoughts are unruly passengers',
        'You can hear them but don\'t have to obey',
        'Keep driving toward your values',
        'Passengers can stay but you\'re in control'
      ]
    }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('mindcare_act_values');
    if (saved) {
      setPersonalValues(JSON.parse(saved));
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

  const addValue = (valueName: string) => {
    const newValue: Value = {
      id: Date.now().toString(),
      userId: user?.id, // Add user ID to track values per user
      name: valueName,
      description: coreValues.find(v => v.name === valueName)?.description || '',
      importance: 5,
      actions: [],
      progress: 0
    };

    const updatedValues = [...personalValues, newValue];
    setPersonalValues(updatedValues);
    localStorage.setItem('mindcare_act_values', JSON.stringify(updatedValues));
    toast.success(`${valueName} added to your values!`);
  };

  const updateValueImportance = (valueId: string, importance: number) => {
    const updatedValues = personalValues.map(v => 
      v.id === valueId ? { ...v, importance } : v
    );
    setPersonalValues(updatedValues);
    localStorage.setItem('mindcare_act_values', JSON.stringify(updatedValues));
  };

  const startExercise = (exercise: ACTExercise) => {
    setSelectedExercise(exercise);
    setIsSessionActive(true);
    setSessionTime(0);
    setCurrentStep(0);
    toast.success(`Starting ${exercise.title}`);
  };

  const completeExercise = () => {
    if (selectedExercise) {
      // Update streak
      updateStreak();
      
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('mindcare-data-updated'));
      
      toast.success(`${selectedExercise.title} completed! You\'re building psychological flexibility.`);
      setSelectedExercise(null);
      setIsSessionActive(false);
      setSessionTime(0);
      setCurrentStep(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getComponentColor = (component: string) => {
    switch (component) {
      case 'values': return 'from-purple-500 to-pink-500';
      case 'mindfulness': return 'from-blue-500 to-cyan-500';
      case 'acceptance': return 'from-green-500 to-teal-500';
      case 'commitment': return 'from-orange-500 to-red-500';
      case 'defusion': return 'from-yellow-500 to-orange-500';
      case 'self': return 'from-indigo-500 to-purple-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (selectedExercise) {
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
              {selectedExercise.title}
            </h2>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {selectedExercise.description}
            </p>
            <div className={`mt-3 inline-flex items-center space-x-2 px-3 py-1 rounded-full ${
              theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-medium">{formatTime(sessionTime)}</span>
            </div>
          </div>

          <div className={`p-4 rounded-lg mb-6 ${
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

          <div className={`w-full h-2 rounded-full mb-6 ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / selectedExercise.instructions.length) * 100}%` }}
            />
          </div>

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
                onClick={completeExercise}
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
              Exit
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
            Acceptance & Commitment Therapy
          </h1>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Build psychological flexibility through mindfulness, acceptance, and values-based action
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-4 p-1 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: 'values', label: 'Values', icon: Heart },
              { id: 'mindfulness', label: 'Mindfulness', icon: Brain },
              { id: 'acceptance', label: 'Acceptance', icon: Leaf },
              { id: 'commitment', label: 'Commitment', icon: Target }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-all duration-200 ${
                  selectedTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden md:inline">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {selectedTab === 'values' && (
            <motion.div
              key="values"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className="space-y-4"
            >
              {/* Values Selection */}
              <div className={`p-4 rounded-xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  Identify Your Core Values
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {coreValues.map((value) => (
                    <motion.button
                      key={value.name}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => addValue(value.name)}
                      disabled={personalValues.some(v => v.name === value.name)}
                      className={`p-3 rounded-lg transition-all duration-200 ${
                        personalValues.some(v => v.name === value.name)
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <value.icon className="w-5 h-5" />
                        <div className="text-left">
                          <h4 className="font-semibold text-sm">{value.name}</h4>
                          <p className="text-xs opacity-80">{value.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Personal Values */}
              {personalValues.length > 0 && (
                <div className={`p-4 rounded-xl shadow-lg ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    Your Personal Values
                  </h3>
                  <div className="space-y-3">
                    {personalValues.map((value) => (
                      <div
                        key={value.id}
                        className={`p-3 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={`font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-800'
                          }`}>
                            {value.name}
                          </h4>
                          <span className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Importance: {value.importance}/10
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={value.importance}
                          onChange={(e) => updateValueImportance(value.id, parseInt(e.target.value))}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-purple-400 to-blue-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {selectedTab === 'mindfulness' && (
            <motion.div
              key="mindfulness"
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
                ACT Mindfulness Exercises
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {mindfulnessExercises.map((exercise) => (
                  <motion.div
                    key={exercise.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                      theme === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
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
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {formatTime(exercise.duration)}
                      </span>
                      <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                        Start
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ACT Exercises */}
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
            ACT Core Exercises
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {actExercises.map((exercise) => (
              <motion.div
                key={exercise.id}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => startExercise(exercise)}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                  theme === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getComponentColor(exercise.component)} flex items-center justify-center`}>
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  {exercise.completed && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
                
                <h4 className={`font-semibold mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {exercise.title}
                </h4>
                
                <p className={`text-sm mb-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {exercise.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {formatTime(exercise.duration)}
                  </span>
                  <span className={`text-xs capitalize ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {exercise.component}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ACTModule;