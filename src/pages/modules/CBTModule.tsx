import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Brain, Target, CheckCircle, Plus, Save, ArrowLeft, Lightbulb, AlertTriangle, TrendingUp, Calendar, CreditCard as Edit, Trash2, Star, Award, Clock, Heart } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { updateStreak } from '../../utils/streakManager';

interface ThoughtRecord {
  id: string;
  date: string;
  situation: string;
  automaticThought: string;
  emotion: string;
  emotionIntensity: number;
  evidence: string;
  balancedThought: string;
  newEmotion: string;
  newIntensity: number;
}

interface CognitiveDistortion {
  id: string;
  name: string;
  description: string;
  example: string;
  challenge: string;
}

function CBTModule() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [currentRecord, setCurrentRecord] = useState<Partial<ThoughtRecord>>({
    date: new Date().toISOString().split('T')[0],
    situation: '',
    automaticThought: '',
    emotion: '',
    emotionIntensity: 5,
    evidence: '',
    balancedThought: '',
    newEmotion: '',
    newIntensity: 5
  });
  const [savedRecords, setSavedRecords] = useState<ThoughtRecord[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [showDistortions, setShowDistortions] = useState(false);

  const cognitiveDistortions: CognitiveDistortion[] = [
    {
      id: '1',
      name: 'All-or-Nothing Thinking',
      description: 'Seeing things in black and white categories',
      example: '"I\'m a complete failure" instead of "I made a mistake"',
      challenge: 'Look for the gray areas and partial successes'
    },
    {
      id: '2',
      name: 'Catastrophizing',
      description: 'Expecting the worst possible outcome',
      example: '"This headache means I have a brain tumor"',
      challenge: 'Consider more realistic, probable outcomes'
    },
    {
      id: '3',
      name: 'Mind Reading',
      description: 'Assuming you know what others are thinking',
      example: '"They think I\'m stupid"',
      challenge: 'Ask for clarification instead of assuming'
    },
    {
      id: '4',
      name: 'Emotional Reasoning',
      description: 'Believing feelings are facts',
      example: '"I feel guilty, so I must have done something wrong"',
      challenge: 'Separate feelings from facts and evidence'
    },
    {
      id: '5',
      name: 'Should Statements',
      description: 'Using "should," "must," or "ought" statements',
      example: '"I should be perfect at everything"',
      challenge: 'Replace with preferences and realistic expectations'
    },
    {
      id: '6',
      name: 'Personalization',
      description: 'Taking responsibility for things outside your control',
      example: '"It\'s my fault the meeting went badly"',
      challenge: 'Consider all factors that contributed to the situation'
    }
  ];

  const emotions = [
    'Anxious', 'Sad', 'Angry', 'Frustrated', 'Worried', 'Guilty',
    'Ashamed', 'Lonely', 'Overwhelmed', 'Disappointed', 'Confused', 'Hopeless'
  ];

  const steps = [
    { number: 1, title: 'Situation', description: 'What happened?' },
    { number: 2, title: 'Automatic Thought', description: 'What went through your mind?' },
    { number: 3, title: 'Emotion', description: 'How did you feel?' },
    { number: 4, title: 'Evidence', description: 'What evidence supports/contradicts this thought?' },
    { number: 5, title: 'Balanced Thought', description: 'What\'s a more balanced way to think about this?' },
    { number: 6, title: 'New Emotion', description: 'How do you feel now?' }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('mindcare_cbt_records');
    if (saved) {
      setSavedRecords(JSON.parse(saved));
    }
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setCurrentRecord(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveRecord = () => {
    if (!currentRecord.situation || !currentRecord.automaticThought || !currentRecord.emotion) {
      toast.error('Please complete the required fields');
      return;
    }

    const newRecord: ThoughtRecord = {
      id: Date.now().toString(),
      userId: user?.id, // Add user ID to track records per user
      ...currentRecord as ThoughtRecord
    };

    const updatedRecords = [...savedRecords, newRecord];
    setSavedRecords(updatedRecords);
    localStorage.setItem('mindcare_cbt_records', JSON.stringify(updatedRecords));
    
    // Update streak
    updateStreak();
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('mindcare-data-updated'));
    
    toast.success('Thought record saved! Great work on challenging your thoughts.');
    
    // Reset form
    setCurrentRecord({
      date: new Date().toISOString().split('T')[0],
      situation: '',
      automaticThought: '',
      emotion: '',
      emotionIntensity: 5,
      evidence: '',
      balancedThought: '',
      newEmotion: '',
      newIntensity: 5
    });
    setCurrentStep(1);
  };

  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Describe the situation that triggered your thoughts:
            </label>
            <textarea
              value={currentRecord.situation || ''}
              onChange={(e) => handleInputChange('situation', e.target.value)}
              rows={4}
              placeholder="Be specific about what happened, when, and where..."
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        );
      case 2:
        return (
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              What automatic thought went through your mind?
            </label>
            <textarea
              value={currentRecord.automaticThought || ''}
              onChange={(e) => handleInputChange('automaticThought', e.target.value)}
              rows={3}
              placeholder="Write down the first thought that came to mind..."
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                What emotion did you feel?
              </label>
              <select
                value={currentRecord.emotion || ''}
                onChange={(e) => handleInputChange('emotion', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Select an emotion</option>
                {emotions.map(emotion => (
                  <option key={emotion} value={emotion}>{emotion}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Intensity (1-10): {currentRecord.emotionIntensity}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={currentRecord.emotionIntensity || 5}
                onChange={(e) => handleInputChange('emotionIntensity', parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-green-400 to-red-500"
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              What evidence supports or contradicts this thought?
            </label>
            <textarea
              value={currentRecord.evidence || ''}
              onChange={(e) => handleInputChange('evidence', e.target.value)}
              rows={4}
              placeholder="List facts that support and contradict your automatic thought..."
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <button
              onClick={() => setShowDistortions(true)}
              className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View Common Thinking Patterns
            </button>
          </div>
        );
      case 5:
        return (
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              What's a more balanced, realistic thought?
            </label>
            <textarea
              value={currentRecord.balancedThought || ''}
              onChange={(e) => handleInputChange('balancedThought', e.target.value)}
              rows={4}
              placeholder="Rewrite your thought in a more balanced, evidence-based way..."
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                How do you feel now?
              </label>
              <select
                value={currentRecord.newEmotion || ''}
                onChange={(e) => handleInputChange('newEmotion', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Select new emotion</option>
                {emotions.map(emotion => (
                  <option key={emotion} value={emotion}>{emotion}</option>
                ))}
                <option value="Calm">Calm</option>
                <option value="Hopeful">Hopeful</option>
                <option value="Confident">Confident</option>
                <option value="Peaceful">Peaceful</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                New Intensity (1-10): {currentRecord.newIntensity}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={currentRecord.newIntensity || 5}
                onChange={(e) => handleInputChange('newIntensity', parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-green-400 to-blue-500"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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
            CBT Thought Records
          </h1>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Challenge negative thoughts with evidence-based cognitive restructuring
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              CBT Process
            </h3>
            <div className="space-y-3">
              {steps.map((step) => (
                <motion.div
                  key={step.number}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setCurrentStep(step.number)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    currentStep === step.number
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : currentStep > step.number
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                      : theme === 'dark'
                      ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep > step.number ? 'bg-green-500 text-white' : ''
                    }`}>
                      {currentStep > step.number ? <CheckCircle className="w-4 h-4" /> : step.number}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{step.title}</h4>
                      <p className="text-xs opacity-80">{step.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`lg:col-span-2 p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Step {currentStep}: {steps[currentStep - 1].title}
              </h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
              }`}>
                {currentStep}/6
              </div>
            </div>

            {/* Step Content */}
            <div className="mb-6">
              {getCurrentStepContent()}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={previousStep}
                disabled={currentStep === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentStep === 1
                    ? 'opacity-50 cursor-not-allowed'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </motion.button>

              {currentStep === steps.length ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveRecord}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all duration-300 font-medium flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Record</span>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={nextStep}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 font-medium"
                >
                  Next
                </motion.button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className={`w-full h-2 rounded-full ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Records */}
        {savedRecords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`mt-4 p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-3 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Recent Thought Records
            </h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {savedRecords.slice(-3).reverse().map((record) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {new Date(record.date).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {record.emotion}
                      </span>
                      <span className={`text-xs ${
                        record.newIntensity < record.emotionIntensity ? 'text-green-500' : 'text-gray-500'
                      }`}>
                        {record.emotionIntensity} → {record.newIntensity}
                      </span>
                    </div>
                  </div>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <strong>Situation:</strong> {record.situation.substring(0, 100)}...
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Cognitive Distortions Modal */}
        <AnimatePresence>
          {showDistortions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowDistortions(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`max-w-2xl w-full rounded-2xl shadow-2xl max-h-96 overflow-y-auto ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <h3 className={`text-xl font-bold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    Common Thinking Patterns
                  </h3>
                  <div className="space-y-4">
                    {cognitiveDistortions.map((distortion) => (
                      <div
                        key={distortion.id}
                        className={`p-3 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                        }`}
                      >
                        <h4 className={`font-semibold mb-1 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-800'
                        }`}>
                          {distortion.name}
                        </h4>
                        <p className={`text-sm mb-2 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {distortion.description}
                        </p>
                        <p className={`text-xs mb-1 ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          <strong>Example:</strong> {distortion.example}
                        </p>
                        <p className={`text-xs text-purple-600 dark:text-purple-400`}>
                          <strong>Challenge:</strong> {distortion.challenge}
                        </p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowDistortions(false)}
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

export default CBTModule;