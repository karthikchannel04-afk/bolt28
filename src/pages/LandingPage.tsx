import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Heart, Brain, MessageCircle, Video, BarChart3, Shield, 
  Users, Clock, Star, CheckCircle, ArrowRight, Sparkles,
  Leaf, Sun, Moon as MoonIcon, Waves
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function LandingPage() {
  const { theme } = useTheme();

  const features = [
    {
      icon: MessageCircle,
      title: 'AI Mental Health Assistant',
      description: 'Get 24/7 support with our intelligent chatbot that understands your needs',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Brain,
      title: '12 Therapy Modules',
      description: 'Evidence-based therapeutic approaches including CBT, mindfulness, and more',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Video,
      title: 'Video Chat with Therapists',
      description: 'Connect with licensed professionals for personalized therapy sessions',
      color: 'from-teal-500 to-green-500'
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Monitor your mental health journey with detailed analytics and insights',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Users', icon: Users },
    { number: '500+', label: 'Licensed Therapists', icon: Shield },
    { number: '24/7', label: 'Support Available', icon: Clock },
    { number: '4.9/5', label: 'User Rating', icon: Star }
  ];

  const therapyModules = [
    'CBT Journaling', 'Guided Meditation', 'Stress Management', 'Mindfulness Exercises', 
    'Gratitude Journal', 'Relaxation Music',
    'Tetris Therapy', 'Art & Color Therapy', 'Exposure Therapy', 'Acceptance & Commitment Therapy'
  ];

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 via-white to-cyan-50'
    }`}>
      {/* Hero Section with Floating Elements */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating Leaves */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`leaf-${i}`}
              className={`absolute opacity-20 ${
                theme === 'dark' ? 'text-teal-400' : 'text-green-400'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-30, 30, -30],
                x: [-20, 20, -20],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Leaf className="w-8 h-8" />
            </motion.div>
          ))}
          
          {/* Floating Hearts */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`heart-${i}`}
              className={`absolute opacity-15 ${
                theme === 'dark' ? 'text-pink-400' : 'text-pink-300'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-40, 40, -40],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 8 + Math.random() * 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Heart className="w-6 h-6" />
            </motion.div>
          ))}

          {/* Gentle Waves */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1200 120" className={`w-full h-24 ${
              theme === 'dark' ? 'text-gray-800' : 'text-blue-50'
            }`}>
              <motion.path
                d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z"
                fill="currentColor"
                animate={{
                  d: [
                    "M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z",
                    "M0,80 C300,40 900,100 1200,40 L1200,120 L0,120 Z",
                    "M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z"
                  ]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </svg>
          </div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Gentle Badge */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <motion.div
                animate={{ 
                  y: [-5, 5, -5],
                  rotate: [-1, 1, -1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className={`inline-flex items-center space-x-3 px-6 py-3 rounded-full mb-8 backdrop-blur-sm ${
                  theme === 'dark' 
                    ? 'bg-teal-900/30 text-teal-300 border border-teal-700/50' 
                    : 'bg-white/70 text-teal-700 border border-teal-200/50'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium">Your peaceful journey to wellness begins here</span>
                <Heart className="w-4 h-4" />
              </motion.div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`text-5xl md:text-7xl font-light mb-8 leading-tight ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}
              style={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
            >
              Find Your
              <motion.span 
                className="block bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 bg-clip-text text-transparent font-medium"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                Inner Peace
              </motion.span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className={`text-xl md:text-2xl mb-12 leading-relaxed font-light ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
              style={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
            >
              A gentle, comprehensive approach to mental wellness with AI-powered support,
              <br className="hidden md:block" />
              professional guidance, and mindful progress tracking.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16"
            >
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-full font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                >
                  <span>Begin Your Journey</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>

              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-8 py-4 rounded-full font-medium text-lg border-2 transition-all duration-300 backdrop-blur-sm ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-800/50'
                      : 'border-teal-300 text-teal-700 hover:bg-white/50'
                  }`}
                >
                  Sign In
                </motion.button>
              </Link>
            </motion.div>

            {/* Floating Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className={`text-center p-4 rounded-2xl backdrop-blur-sm ${
                    theme === 'dark' 
                      ? 'bg-gray-800/30 border border-gray-700/50' 
                      : 'bg-white/50 border border-white/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center mx-auto mb-3`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-2xl font-bold mb-1 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {stat.number}
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-24 ${
        theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/80'
      } backdrop-blur-sm`}>
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className={`text-4xl md:text-5xl font-light mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}
            style={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
            >
              Gentle Tools for
              <span className="block text-teal-600 font-medium">Mindful Healing</span>
            </h2>
            <p className={`text-xl font-light max-w-3xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
            style={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
            >
              Discover a comprehensive suite of wellness tools designed to support your mental health journey with compassion and understanding.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`p-8 rounded-3xl shadow-lg transition-all duration-300 backdrop-blur-sm ${
                  theme === 'dark' 
                    ? 'bg-gray-700/50 border border-gray-600/50' 
                    : 'bg-white/70 border border-white/50'
                }`}
              >
                <motion.div 
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className={`text-xl font-medium mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {feature.title}
                </h3>
                <p className={`font-light leading-relaxed ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Therapy Modules Section */}
      <section className={`py-24 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-r from-teal-50 to-blue-50'
      }`}>
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl md:text-5xl font-light mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}
            style={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
            >
              12 Mindful Therapy
              <span className="block text-teal-600 font-medium">Pathways</span>
            </h2>
            <p className={`text-xl font-light max-w-3xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
            style={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
            >
              Evidence-based therapeutic approaches crafted with care to guide you toward inner balance and emotional well-being.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {therapyModules.map((module, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`p-6 rounded-2xl shadow-md transition-all duration-300 backdrop-blur-sm ${
                  theme === 'dark' 
                    ? 'bg-gray-700/50 border border-gray-600/50' 
                    : 'bg-white/70 border border-white/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-teal-500" />
                  <span className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                    {module}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className={`py-24 relative overflow-hidden ${
        theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-teal-600 to-blue-600'
      }`}>
        {/* Floating Elements */}
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute opacity-10"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-30, 30, -30],
                rotate: [0, 360],
              }}
              transition={{
                duration: 10 + Math.random() * 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Heart className="w-12 h-12 text-white" />
            </motion.div>
          ))}
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-light text-white mb-8"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
            >
              Ready to Embrace
              <span className="block font-medium">Your Wellness Journey?</span>
            </h2>
            <p className="text-xl text-teal-100 mb-10 max-w-2xl mx-auto font-light leading-relaxed"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
            >
              Join thousands of people who have found peace, balance, and healing through our gentle, comprehensive approach to mental wellness.
            </p>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-white text-teal-600 rounded-full font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3 mx-auto"
              >
                <span>Start Your Peaceful Journey</span>
                <Heart className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;