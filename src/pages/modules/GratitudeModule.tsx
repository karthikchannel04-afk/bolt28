import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Star, Plus, Save, Calendar, Sparkles,
  Target, Award, TrendingUp, BookOpen, Smile,
  Sun, Gift, Users, Coffee, Music
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { updateStreak } from '../../utils/streakManager';

interface GratitudeEntry {
  id: string;
  date: string;
  entries: string[];
  mood: number;
  category: string;
}

interface GratitudePrompt {
  id: string;
  text: string;
  category: string;
  icon: any;
}

function GratitudeModule() {
  const { theme } = useTheme();
  const [currentEntries, setCurrentEntries] = useState<string[]>(['', '', '']);
  const [selectedMood, setSelectedMood] = useState<number>(5);
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  const [savedEntries, setSavedEntries] = useState<GratitudeEntry[]>([]);
  const [currentStreak, setCurrentStreak] = useState(7);
  const [showPrompts, setShowPrompts] = useState(false);

  const categories = [
    { id: 'general', name: 'General', icon: Heart, color: 'from-pink-500 to-rose-500' },
    { id: 'relationships', name: 'Relationships', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { id: 'achievements', name: 'Achievements', icon: Award, color: 'from-yellow-500 to-orange-500' },
    { id: 'nature', name: 'Nature', icon: Sun, color: 'from-green-500 to-teal-500' },
    { id: 'experiences', name: 'Experiences', icon: Gift, color: 'from-purple-500 to-pink-500' },
    { id: 'simple', name: 'Simple Pleasures', icon: Coffee, color: 'from-orange-500 to-red-500' }
  ];

  const gratitudePrompts: GratitudePrompt[] = [
    { id: '1', text: 'What made you smile today?', category: 'general', icon: Smile },
    { id: '2', text: 'Who are you grateful to have in your life?', category: 'relationships', icon: Users },
    { id: '3', text: 'What personal strength helped you today?', category: 'achievements', icon: Award },
    { id: '4', text: 'What in nature brought you peace?', category: 'nature', icon: Sun },
    { id: '5', text: 'What unexpected joy did you experience?', category: 'experiences', icon: Gift },
    { id: '6', text: 'What simple pleasure did you enjoy?', category: 'simple', icon: Coffee },
    { id: '7', text: 'What challenge helped you grow?', category: 'achievements', icon: Target },
    { id: '8', text: 'What sound, smell, or taste delighted you?', category: 'simple', icon: Music }
  ];

  const moodEmojis = [
    { value: 1, emoji: '😢', label: 'Very Sad' },
    { value: 2, emoji: '😔', label: 'Sad' },
    { value: 3, emoji: '😐', label: 'Neutral' },
    { value: 4, emoji: '😊', label: 'Happy' },
    { value: 5, emoji: '😍', label: 'Very Happy' }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('mindcare_gratitude_entries');
    if (saved) {
      setSavedEntries(JSON.parse(saved));
    }
  }, []);

  const handleEntryChange = (index: number, value: string) => {
    const newEntries = [...currentEntries];
    newEntries[index] = value;
    setCurrentEntries(newEntries);
  };

  const handleSaveEntry = () => {
    const filledEntries = currentEntries.filter(entry => entry.trim() !== '');
    
    if (filledEntries.length === 0) {
      toast.error('Please write at least one gratitude entry');
      return;
    }

    const newEntry: GratitudeEntry = {
      id: Date.now().toString(),
      userId: user?.id, // Add user ID to track entries per user
      date: new Date().toISOString().split('T')[0],
      entries: filledEntries,
      mood: selectedMood,
      category: selectedCategory
    };

    const updatedEntries = [...savedEntries, newEntry];
    setSavedEntries(updatedEntries);
    localStorage.setItem('mindcare_gratitude_entries', JSON.stringify(updatedEntries));
    
    // Update streak
    updateStreak();
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('mindcare-data-updated'));
    
    toast.success('Gratitude entry saved! Keep up the positive mindset.');
    setCurrentEntries(['', '', '']);
    setSelectedMood(5);
  };

  const usePrompt = (prompt: GratitudePrompt) => {
    const emptyIndex = currentEntries.findIndex(entry => entry.trim() === '');
    if (emptyIndex !== -1) {
      handleEntryChange(emptyIndex, prompt.text);
      setSelectedCategory(prompt.category);
      setShowPrompts(false);
    } else {
      toast.error('Please clear an entry first');
    }
  };

  const getSelectedCategory = () => {
    return categories.find(cat => cat.id === selectedCategory) || categories[0];
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
            Gratitude Journal
          </h1>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Cultivate positivity and improve mental well-being through daily gratitude practice
          </p>
        </motion.div>

        {/* Streak Counter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-4 p-4 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="flex items-center justify-center space-x-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <span className={`text-2xl font-bold text-yellow-500`}>
                  {currentStreak}
                </span>
              </div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Day Streak
              </p>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <BookOpen className="w-5 h-5 text-purple-500" />
                <span className={`text-2xl font-bold text-purple-500`}>
                  {savedEntries.length}
                </span>
              </div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Total Entries
              </p>
            </div>
          </div>
        </motion.div>

        {/* Category Selection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`mb-4 p-4 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-3 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Choose Your Focus
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  selectedCategory === category.id
                    ? `bg-gradient-to-r ${category.color} text-white`
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <category.icon className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs font-medium">{category.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Gratitude Entries */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`mb-4 p-4 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Today's Gratitude
            </h3>
            <button
              onClick={() => setShowPrompts(!showPrompts)}
              className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Get Inspired</span>
            </button>
          </div>

          {/* Prompts */}
          <AnimatePresence>
            {showPrompts && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="grid md:grid-cols-2 gap-2">
                  {gratitudePrompts.slice(0, 4).map((prompt) => (
                    <motion.button
                      key={prompt.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => usePrompt(prompt)}
                      className={`p-2 text-left rounded-lg border transition-all duration-200 ${
                        theme === 'dark' 
                          ? 'border-gray-600 bg-gray-700/50 hover:bg-gray-700 text-gray-300' 
                          : 'border-gray-200 bg-gray-50 hover:border-purple-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <prompt.icon className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">{prompt.text}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Entry Fields */}
          <div className="space-y-3 mb-4">
            {currentEntries.map((entry, index) => (
              <div key={index} className="relative">
                <div className="absolute left-3 top-3 flex items-center space-x-2">
                  <span className={`text-lg font-bold text-purple-500`}>
                    {index + 1}.
                  </span>
                  <Heart className="w-4 h-4 text-purple-500" />
                </div>
                <textarea
                  value={entry}
                  onChange={(e) => handleEntryChange(index, e.target.value)}
                  placeholder={`What are you grateful for? (Entry ${index + 1})`}
                  rows={2}
                  maxLength={200}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <div className={`text-xs mt-1 text-right ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {entry.length}/200
                </div>
              </div>
            ))}
          </div>

          {/* Mood Selection */}
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              How grateful do you feel right now?
            </label>
            <div className="flex justify-between items-center">
              {moodEmojis.map((mood) => (
                <motion.button
                  key={mood.value}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    selectedMood === mood.value
                      ? 'bg-purple-100 dark:bg-purple-900/50 ring-2 ring-purple-500'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-1">{mood.emoji}</div>
                  <div className={`text-xs font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {mood.label}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveEntry}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Save Today's Gratitude</span>
          </motion.button>
        </motion.div>

        {/* Recent Entries */}
        {savedEntries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-3 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Recent Gratitude Entries
            </h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {savedEntries.slice(-5).reverse().map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-1">
                      <span className="text-lg">
                        {moodEmojis.find(m => m.value === entry.mood)?.emoji}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {entry.entries.map((entryText, idx) => (
                      <p key={idx} className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        • {entryText}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default GratitudeModule;