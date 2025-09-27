import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Send, Bot, User, Brain, Heart, Target,
  Moon, Shield, Users, TrendingDown, Clock, Star, CheckCircle,
  ArrowRight, Play, RotateCcw, Eye, AlertTriangle, Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface Question {
  id: string;
  text: string;
  type: 'rating' | 'binary' | 'multiple' | 'text';
  options?: string[];
  required: boolean;
}

interface Assessment {
  issue: string;
  questions: Question[];
  responses: Record<string, any>;
}

interface TherapyRecommendation {
  moduleId: string;
  title: string;
  description: string;
  priority: number;
  icon: any;
  color: string;
  estimatedDuration: string;
  benefits: string[];
}

interface TherapyPlan {
  id: string;
  issue: string;
  severity: 'mild' | 'moderate' | 'severe';
  planDuration: number;
  recommendations: TherapyRecommendation[];
  startDate: string;
  description: string;
}

const ChatbotPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState<TherapyPlan | null>(null);
  const [showPlanSelection, setShowPlanSelection] = useState(false);

  const mentalHealthIssues = [
    { id: 'anxiety', name: 'Anxiety', icon: Brain, color: 'from-blue-500 to-cyan-500', description: 'Worry, fear, and nervousness' },
    { id: 'depression', name: 'Depression', icon: Heart, color: 'from-purple-500 to-pink-500', description: 'Sadness, hopelessness, low mood' },
    { id: 'stress', name: 'Stress', icon: Target, color: 'from-orange-500 to-red-500', description: 'Overwhelm and pressure' },
    { id: 'sleep', name: 'Sleep Problems', icon: Moon, color: 'from-indigo-500 to-purple-500', description: 'Insomnia and sleep quality issues' },
    { id: 'addiction', name: 'Addiction', icon: Shield, color: 'from-red-500 to-pink-500', description: 'Substance or behavioral dependencies' },
    { id: 'motivation', name: 'Low Motivation', icon: TrendingDown, color: 'from-gray-500 to-gray-600', description: 'Lack of drive and energy' },
    { id: 'relationships', name: 'Relationship Issues', icon: Users, color: 'from-green-500 to-teal-500', description: 'Interpersonal difficulties' }
  ];

  const questionnaires = {
    anxiety: [
      { id: '1', text: 'How often do you experience anxiety in a typical week? (Please describe in detail)', type: 'text', required: true },
      { id: '2', text: 'Do you experience physical symptoms like sweating, rapid heartbeat, or trembling? Please describe what you feel.', type: 'text', required: true },
      { id: '3', text: 'Which situations typically trigger your anxiety? Please list them.', type: 'text', required: true },
      { id: '4', text: 'How would you rate the intensity of your anxiety when it occurs on a scale of 1-10? Please explain.', type: 'text', required: true },
      { id: '5', text: 'Do you avoid certain situations because of anxiety? If yes, which ones?', type: 'text', required: true },
      { id: '6', text: 'How does anxiety affect your daily activities? Please describe the impact.', type: 'text', required: true },
      { id: '7', text: 'Have you tried any coping strategies before? Please list what you\'ve tried.', type: 'text', required: false },
      { id: '8', text: 'How long have you been experiencing anxiety? Please provide details.', type: 'text', required: true },
      { id: '9', text: 'Do you have panic attacks? Please describe your experience.', type: 'text', required: true },
      { id: '10', text: 'Describe a recent situation where you felt anxious:', type: 'text', required: false }
    ],
    depression: [
      { id: '1', text: 'How often do you feel sad or down? Please describe your experience.', type: 'text', required: true },
      { id: '2', text: 'Have you lost interest in activities you used to enjoy? Please explain.', type: 'text', required: true },
      { id: '3', text: 'How would you rate your energy levels? Please describe how you feel.', type: 'text', required: true },
      { id: '4', text: 'Do you have trouble sleeping or sleep too much? Please describe your sleep patterns.', type: 'text', required: true },
      { id: '5', text: 'How is your appetite? Please describe any changes.', type: 'text', required: true },
      { id: '6', text: 'Do you have feelings of worthlessness or guilt? Please describe these feelings.', type: 'text', required: true },
      { id: '7', text: 'How difficult is it to concentrate or make decisions? Please explain.', type: 'text', required: true },
      { id: '8', text: 'Have you had thoughts of death or suicide? Please share if you feel comfortable.', type: 'text', required: true },
      { id: '9', text: 'How long have you been feeling this way? Please provide details.', type: 'text', required: true },
      { id: '10', text: 'What do you think might be contributing to these feelings?', type: 'text', required: false }
    ],
    stress: [
      { id: '1', text: 'How stressed do you feel on a typical day? Please describe your stress levels.', type: 'text', required: true },
      { id: '2', text: 'What are your main sources of stress? Please list them.', type: 'text', required: true },
      { id: '3', text: 'Do you experience physical symptoms of stress? Please describe them.', type: 'text', required: true },
      { id: '4', text: 'How well do you currently manage stress? Please explain your methods.', type: 'text', required: true },
      { id: '5', text: 'Do you feel overwhelmed by daily responsibilities? Please describe how.', type: 'text', required: true },
      { id: '6', text: 'How often do you take time for relaxation? Please describe your routine.', type: 'text', required: true },
      { id: '7', text: 'What stress management techniques have you tried? Please list them.', type: 'text', required: false },
      { id: '8', text: 'How does stress affect your relationships? Please explain.', type: 'text', required: true },
      { id: '9', text: 'Do you use unhealthy coping mechanisms? Please describe them.', type: 'text', required: true },
      { id: '10', text: 'Describe your most stressful situation recently:', type: 'text', required: false }
    ],
    sleep: [
      { id: '1', text: 'How many hours of sleep do you typically get? Please provide details.', type: 'text', required: true },
      { id: '2', text: 'How long does it take you to fall asleep? Please describe your experience.', type: 'text', required: true },
      { id: '3', text: 'How often do you wake up during the night? Please explain.', type: 'text', required: true },
      { id: '4', text: 'How refreshed do you feel when you wake up? Please describe.', type: 'text', required: true },
      { id: '5', text: 'Do you have a consistent bedtime routine? Please describe it.', type: 'text', required: true },
      { id: '6', text: 'What factors affect your sleep? Please list them.', type: 'text', required: true },
      { id: '7', text: 'Do you use electronic devices before bed? Please describe your habits.', type: 'text', required: true },
      { id: '8', text: 'How comfortable is your sleep environment? Please describe it.', type: 'text', required: true },
      { id: '9', text: 'Do you take naps during the day? Please describe your napping habits.', type: 'text', required: true },
      { id: '10', text: 'What sleep aids have you tried? Please list them.', type: 'text', required: false }
    ],
    addiction: [
      { id: '1', text: 'What type of addiction are you struggling with? Please describe.', type: 'text', required: true },
      { id: '2', text: 'How often do you engage in this behavior? Please provide details.', type: 'text', required: true },
      { id: '3', text: 'How strong are your cravings typically? Please describe them.', type: 'text', required: true },
      { id: '4', text: 'Have you tried to quit or reduce this behavior before? Please explain your attempts.', type: 'text', required: true },
      { id: '5', text: 'What triggers your addictive behavior? Please describe your triggers.', type: 'text', required: true },
      { id: '6', text: 'How does this addiction affect your daily life? Please explain the impact.', type: 'text', required: true },
      { id: '7', text: 'Do you have a support system? Please describe who supports you.', type: 'text', required: true },
      { id: '8', text: 'How motivated are you to change this behavior? Please explain your motivation level.', type: 'text', required: true },
      { id: '9', text: 'Have you experienced withdrawal symptoms? Please describe them.', type: 'text', required: true },
      { id: '10', text: 'What would success look like for you?', type: 'text', required: false }
    ],
    motivation: [
      { id: '1', text: 'How motivated do you feel on a typical day? Please describe your motivation levels.', type: 'text', required: true },
      { id: '2', text: 'In which areas do you lack motivation? Please list them.', type: 'text', required: true },
      { id: '3', text: 'Do you have clear goals for yourself? Please describe your goals.', type: 'text', required: true },
      { id: '4', text: 'How often do you procrastinate? Please describe your procrastination habits.', type: 'text', required: true },
      { id: '5', text: 'What do you think causes your low motivation? Please explain.', type: 'text', required: true },
      { id: '6', text: 'How satisfied are you with your current life? Please explain your satisfaction level.', type: 'text', required: true },
      { id: '7', text: 'Do you celebrate small wins and achievements? Please describe how.', type: 'text', required: true },
      { id: '8', text: 'How supportive is your environment? Please describe your support system.', type: 'text', required: true },
      { id: '9', text: 'What activities used to motivate you?', type: 'text', required: false },
      { id: '10', text: 'What would help you feel more motivated?', type: 'text', required: false }
    ],
    relationships: [
      { id: '1', text: 'How satisfied are you with your current relationships? Please explain.', type: 'text', required: true },
      { id: '2', text: 'What type of relationship issues are you experiencing? Please describe them.', type: 'text', required: true },
      { id: '3', text: 'Do you feel heard and understood by others? Please explain your experience.', type: 'text', required: true },
      { id: '4', text: 'How comfortable are you expressing your feelings? Please describe.', type: 'text', required: true },
      { id: '5', text: 'Do you have difficulty setting boundaries? Please explain your challenges.', type: 'text', required: true },
      { id: '6', text: 'How do you typically handle conflict? Please describe your approach.', type: 'text', required: true },
      { id: '7', text: 'Do you feel lonely or isolated? Please describe these feelings.', type: 'text', required: true },
      { id: '8', text: 'How supportive do you feel your relationships are? Please explain.', type: 'text', required: true },
      { id: '9', text: 'What relationship patterns do you want to change?', type: 'text', required: false },
      { id: '10', text: 'What does a healthy relationship look like to you?', type: 'text', required: false }
    ]
  };

  const [currentTextResponse, setCurrentTextResponse] = useState('');

  const therapyModules = {
    'cbt': { title: 'CBT Thought Records', icon: Brain, color: 'from-purple-500 to-pink-500' },
    'mindfulness': { title: 'Mindfulness & Breathing', icon: Brain, color: 'from-blue-500 to-cyan-500' },
    'sleep': { title: 'Sleep Therapy', icon: Moon, color: 'from-indigo-500 to-purple-500' },
    'stress': { title: 'Stress Management', icon: Target, color: 'from-orange-500 to-red-500' },
    'gratitude': { title: 'Gratitude Journal', icon: Heart, color: 'from-green-500 to-teal-500' },
    'addiction': { title: 'Addiction Support', icon: Shield, color: 'from-red-500 to-pink-500' },
    'music': { title: 'Relaxation Music', icon: Heart, color: 'from-purple-500 to-blue-500' },
    'tetris': { title: 'Tetris Therapy', icon: Target, color: 'from-cyan-500 to-blue-500' },
    'art': { title: 'Art & Color Therapy', icon: Heart, color: 'from-pink-500 to-purple-500' },
    'exposure': { title: 'Exposure Therapy', icon: Eye, color: 'from-yellow-500 to-orange-500' },
    'video': { title: 'Video Therapy', icon: Play, color: 'from-blue-500 to-indigo-500' },
    'act': { title: 'Acceptance & Commitment Therapy', icon: Star, color: 'from-teal-500 to-cyan-500' }
  };

  useEffect(() => {
    // Initial greeting
    const initialMessage: Message = {
      id: '1',
      type: 'bot',
      content: `Hello ${user?.name}! I'm your AI mental health assistant. I'm here to provide personalized support and create a therapy plan tailored just for you.\n\nWould you like me to help you identify the best therapy approach for your current needs?`,
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, [user]);

  const addMessage = (content: string, type: 'user' | 'bot') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateTyping = async (content: string, type: 'bot' | 'user' = 'bot') => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    setIsTyping(false);
    addMessage(content, type);
  };

  const startAssessment = (issueId: string) => {
    const issue = mentalHealthIssues.find(i => i.id === issueId);
    const questions = questionnaires[issueId as keyof typeof questionnaires] || [];
    
    // Clear previous assessment state
    setCurrentAssessment(null);
    setCurrentQuestionIndex(0);
    setGeneratedPlan(null);
    setShowPlanSelection(false);

    // Add initial bot messages to chat history
    addMessage(`I'd like to start an assessment for ${issue?.name}. This will help me understand your specific situation better.`, 'user');
    simulateTyping(`Great! I'll ask you some questions about ${issue?.name.toLowerCase()} to create the best therapy plan for you. Let's begin:`);

    setCurrentAssessment({
      issue: issue?.name || 'Unknown Issue',
      questions,
      responses: {}
    });
  };

  const handleQuestionResponse = (response: any) => {
    if (!currentAssessment) return;

    const currentQuestion = currentAssessment.questions[currentQuestionIndex];

    const updatedAssessment = {
      ...currentAssessment,
      responses: { ...currentAssessment.responses, [currentQuestion.id]: response }
    };
    setCurrentAssessment(updatedAssessment);

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < currentAssessment.questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setCurrentTextResponse(updatedAssessment.responses[currentAssessment.questions[nextIndex].id] || '');
    } else {
      // Assessment complete, generate plan
      setCurrentAssessment(null); // Clear assessment from main view
      setCurrentQuestionIndex(0);
      generateTherapyPlan(updatedAssessment);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      setCurrentTextResponse(currentAssessment?.responses[currentAssessment.questions[prevIndex].id] || '');
      // No need to add message to history, it's already there.
    }
  };

  const generateTherapyPlan = (assessment: Assessment) => {
    // Analyze responses to determine severity and recommendations
    const responses = assessment.responses;
    const ratingQuestions = assessment.questions.filter(q => q.type === 'rating');
    const avgRating = ratingQuestions.reduce((sum, q) => sum + (responses[q.id] || 5), 0) / ratingQuestions.length;
    
    let severity: 'mild' | 'moderate' | 'severe' = 'moderate';
    let planDuration = 15;
    
    if (avgRating <= 3) {
      severity = 'mild';
      planDuration = 7;
    } else if (avgRating >= 7) {
      severity = 'severe';
      planDuration = 30;
    }

    // Generate recommendations based on issue type
    const recommendations = getRecommendationsForIssue(assessment.issue.toLowerCase(), severity);

    const plan: TherapyPlan = {
      id: Date.now().toString(),
      issue: assessment.issue,
      severity,
      planDuration,
      recommendations,
      startDate: new Date().toISOString(),
      description: `A ${planDuration}-day personalized therapy plan for ${assessment.issue.toLowerCase()}`
    };

    setGeneratedPlan(plan); // Set plan for modal
    setShowPlanSelection(true);
    simulateTyping(`Based on your responses, I've created a personalized ${planDuration}-day therapy plan for ${assessment.issue.toLowerCase()}. This plan includes ${recommendations.length} evidence-based therapies tailored to your specific needs.`);
  };

  const getRecommendationsForIssue = (issue: string, severity: string): TherapyRecommendation[] => {
    const baseRecommendations: Record<string, string[]> = {
      anxiety: ['cbt', 'mindfulness', 'exposure', 'music'],
      depression: ['cbt', 'gratitude', 'video', 'act'],
      stress: ['stress', 'mindfulness', 'music', 'art'],
      'sleep problems': ['sleep', 'mindfulness', 'music', 'video'],
      addiction: ['addiction', 'cbt', 'mindfulness', 'video'],
      'low motivation': ['gratitude', 'cbt', 'video', 'act'],
      'relationship issues': ['video', 'cbt', 'act', 'art']
    };

    const moduleIds = baseRecommendations[issue] || ['cbt', 'mindfulness', 'video'];
    
    return moduleIds.map((moduleId, index) => {
      const module = therapyModules[moduleId as keyof typeof therapyModules];
      return {
        moduleId,
        title: module.title,
        description: `Evidence-based ${module.title.toLowerCase()} for ${issue}`,
        priority: index + 1,
        icon: module.icon,
        color: module.color,
        estimatedDuration: '15-30 min',
        benefits: [`Reduces ${issue}`, 'Improves coping skills', 'Builds resilience']
      };
    });
  };

  const acceptPlan = () => {
    if (!generatedPlan) return;

    // Save plan to user progress
    const userProgress = {
      userId: user?.id,
      currentPlan: generatedPlan,
      startDate: new Date().toISOString(),
      completedTherapies: [],
      dailyProgress: {}
    };

    localStorage.setItem('mindcare_user_progress', JSON.stringify(userProgress));
    
    toast.success('Therapy plan accepted! You can now start your personalized journey.');
    setShowPlanSelection(false);
    
    // Navigate to therapies page
    navigate('/therapy-modules');
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    addMessage(inputMessage, 'user');
    setInputMessage('');
    
    // Simple response logic
    if (inputMessage.toLowerCase().includes('help') || inputMessage.toLowerCase().includes('start')) {
      simulateTyping('I can help you with various mental health concerns. Would you like to start an assessment to get personalized therapy recommendations?');
    } else if (!currentAssessment && !showPlanSelection) { // Only respond if not in assessment or plan selection
      simulateTyping('I understand. Feel free to ask me anything about mental health or start an assessment when you\'re ready.');
    }
  };

  const handleSubmitTextResponse = () => {
    if (!currentTextResponse.trim()) {
      toast.error('Please provide an answer before continuing');
      return;
    }
    handleQuestionResponse(currentTextResponse);
    setCurrentTextResponse('');
  };

  const currentQuestion = currentAssessment?.questions[currentQuestionIndex];

  return (
    <div className={`h-screen flex flex-col ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50'
    }`}>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 border-b ${
            theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          } shadow-lg`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                AI Mental Health Assistant
              </h1>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Your personalized companion for mental wellness support and therapy planning
              </p>
            </div>
          </div>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-sm lg:max-w-lg px-5 py-4 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-200'
                  : 'bg-white text-gray-800 shadow-lg'
              }`}>
                <div className="flex items-start space-x-2">
                  {message.type === 'bot' && (
                    <Bot className="w-4 h-4 mt-1 text-purple-500" />
                  )}
                  <div>
                    <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-purple-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className={`px-5 py-4 rounded-2xl ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-white shadow-lg'
              }`}>
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-purple-500" />
                  <div className="flex space-x-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-purple-500 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-purple-500 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-purple-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Issue Selection */}
          {!currentAssessment && !showPlanSelection && (
            <div className="flex justify-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full max-w-4xl p-6 rounded-2xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 text-center ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  What would you like help with today?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mentalHealthIssues.map((issue) => (
                    <motion.button
                      key={issue.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => startAssessment(issue.id)}
                      className={`p-5 rounded-xl transition-all duration-200 ${
                        theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${issue.color} flex items-center justify-center mx-auto mb-3`}>
                        <issue.icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className={`font-semibold text-base ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {issue.name}
                      </h4>
                      <p className={`text-xs mt-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {issue.description}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Assessment Questions */}
          {currentAssessment && currentQuestion && (
            <div className="px-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full max-w-lg p-4 rounded-xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Question {currentQuestionIndex + 1} of {currentAssessment.questions.length}
                    </span>
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      {currentAssessment.issue}
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / currentAssessment.questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <h3 className={`text-lg font-semibold mb-4 leading-relaxed ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {currentQuestion.text}
                </h3>

              {/* Text Input for All Questions */}
              <div className="space-y-4">
                <textarea
                  placeholder="Please type your answer here..."
                  value={currentTextResponse}
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  onChange={(e) => setCurrentTextResponse(e.target.value)}
                />

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      currentQuestionIndex === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Previous
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmitTextResponse}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                  >
                    {currentQuestionIndex === currentAssessment.questions.length - 1 ? 'Finish Assessment' : 'Next Question'}
                  </motion.button>
                </div>
              </div>
              </motion.div>
            </div>
          )}

        {/* Plan Selection Modal - Full Screen Popup */}
        <AnimatePresence>
          {showPlanSelection && generatedPlan && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowPlanSelection(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className={`max-w-2xl w-full rounded-2xl shadow-2xl ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                <div className="p-6">
                  <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    Your Personalized {generatedPlan.issue} Plan
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {generatedPlan.description}
                  </p>
                  <div className="flex items-center justify-center space-x-4 mt-3">
                    <div className="text-center">
                      <p className="text-xl font-bold text-purple-500">{generatedPlan.planDuration}</p>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Days</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-blue-500">{generatedPlan.recommendations.length}</p>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Therapies</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xl font-bold ${
                        generatedPlan.severity === 'mild' ? 'text-green-500' :
                        generatedPlan.severity === 'moderate' ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {generatedPlan.severity}
                      </p>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Severity</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <h4 className={`font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    Recommended Therapies:
                  </h4>
                  {generatedPlan.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${rec.color} flex items-center justify-center`}>
                        <rec.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h5 className={`text-sm font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-800'
                        }`}>
                          {rec.title}
                        </h5>
                        <p className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {rec.description}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                      }`}>
                        Priority {rec.priority}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowPlanSelection(false)}
                    className={`flex-1 py-3 rounded-lg font-semibold ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Maybe Later
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={acceptPlan}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Start My Plan</span>
                  </motion.button>
                </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className={`p-4 border-t ${
          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message here..."
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`px-4 pb-4 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => startAssessment('anxiety')}
              className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
            >
              Start Assessment
            </button>
            <button
              onClick={() => navigate('/progress')}
              className="px-3 py-1 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full text-sm hover:from-green-600 hover:to-teal-600 transition-all duration-300"
            >
              View Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatbotPage;