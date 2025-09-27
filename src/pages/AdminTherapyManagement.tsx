import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Heart, Moon, Music, Palette, Gamepad2, BookOpen, 
  Target, Users, Shield, Video, Star, Plus, Edit, Trash2,
  Save, X, Upload, Play, Volume2, Eye, Settings, Search,
  Clock, Award, CheckCircle, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface TherapyModule {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  techniques: number;
  progress: number;
  streak: number;
  active: boolean;
  subTechniques: SubTechnique[];
}

interface SubTechnique {
  id: string;
  title: string;
  description: string;
  type: 'form' | 'exercise' | 'guide' | 'tracker';
  fields?: FormField[];
  steps?: string[];
  instructions?: string[];
}

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'range' | 'checkbox' | 'radio';
  options?: string[];
  required: boolean;
}

interface AudioFile {
  id: string;
  title: string;
  artist: string;
  duration: string;
  category: string;
  description: string;
  thumbnail: string;
  audioUrl: string;
  active: boolean;
}

interface VideoFile {
  id: string;
  title: string;
  therapist: string;
  duration: string;
  category: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  difficulty: string;
  active: boolean;
}

function AdminTherapyManagement() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState<'modules' | 'audio' | 'video'>('modules');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingType, setEditingType] = useState<'module' | 'audio' | 'video'>('module');

  // Default therapy modules data
  const [therapyModules, setTherapyModules] = useState<TherapyModule[]>([
    {
      id: '1',
      title: 'CBT Journaling',
      description: 'Cognitive Behavioral Therapy techniques to identify and change negative thought patterns',
      category: 'CBT',
      icon: 'BookOpen',
      color: 'from-purple-500 to-pink-500',
      duration: '15-30 min',
      difficulty: 'Beginner',
      techniques: 3,
      progress: 0,
      streak: 0,
      active: true,
      subTechniques: [
        {
          id: 't1',
          title: 'Thought Record',
          description: 'Track and challenge negative thoughts',
          type: 'form',
          fields: [
            { id: 'f1', label: 'Situation', type: 'textarea', required: true },
            { id: 'f2', label: 'Automatic Thought', type: 'textarea', required: true },
            { id: 'f3', label: 'Emotion', type: 'select', options: ['Anxious', 'Sad', 'Angry', 'Worried'], required: true },
            { id: 'f4', label: 'Intensity', type: 'range', required: true }
          ]
        }
      ]
    },
    {
      id: '2',
      title: 'Guided Meditation',
      description: 'Mindfulness and meditation sessions for stress relief and emotional balance',
      category: 'Meditation',
      icon: 'Brain',
      color: 'from-blue-500 to-cyan-500',
      duration: '10-25 min',
      difficulty: 'Beginner',
      techniques: 6,
      progress: 0,
      streak: 0,
      active: true,
      subTechniques: [
        {
          id: 't2',
          title: 'Breathing Exercise',
          description: 'Guided breathing for relaxation',
          type: 'exercise',
          steps: ['Find comfortable position', 'Breathe in for 4 counts', 'Hold for 4 counts', 'Exhale for 6 counts']
        }
      ]
    },
    {
      id: '3',
      title: 'Stress Management',
      description: 'Learn effective coping strategies for managing daily stress and pressure',
      category: 'Stress',
      icon: 'Target',
      color: 'from-orange-500 to-red-500',
      duration: '10-20 min',
      difficulty: 'Intermediate',
      techniques: 3,
      progress: 0,
      streak: 0,
      active: true,
      subTechniques: []
    },
    {
      id: '4',
      title: 'Sleep Therapy',
      description: 'Improve sleep quality with proven techniques and sleep hygiene practices',
      category: 'Sleep',
      icon: 'Moon',
      color: 'from-indigo-500 to-purple-500',
      duration: '20-30 min',
      difficulty: 'Beginner',
      techniques: 4,
      progress: 0,
      streak: 0,
      active: true,
      subTechniques: []
    },
    {
      id: '5',
      title: 'Gratitude Journal',
      description: 'Daily gratitude practices to cultivate positivity and appreciation',
      category: 'Positive Psychology',
      icon: 'Heart',
      color: 'from-pink-500 to-rose-500',
      duration: '5-15 min',
      difficulty: 'Beginner',
      techniques: 3,
      progress: 0,
      streak: 0,
      active: true,
      subTechniques: []
    },
    {
      id: '6',
      title: 'Addiction Support',
      description: 'Evidence-based strategies for overcoming addiction and maintaining sobriety',
      category: 'Addiction',
      icon: 'Shield',
      color: 'from-red-500 to-pink-500',
      duration: '20-40 min',
      difficulty: 'Advanced',
      techniques: 5,
      progress: 0,
      streak: 0,
      active: true,
      subTechniques: []
    },
    {
      id: '7',
      title: 'Relaxation Music',
      description: 'Curated audio library for relaxation, focus, and better sleep',
      category: 'Music Therapy',
      icon: 'Music',
      color: 'from-green-500 to-teal-500',
      duration: 'Variable',
      difficulty: 'Beginner',
      techniques: 4,
      progress: 0,
      streak: 0,
      active: true,
      subTechniques: []
    },
    {
      id: '8',
      title: 'Tetris Therapy',
      description: 'Gamified stress relief and cognitive enhancement through mindful puzzle-solving',
      category: 'Game Therapy',
      icon: 'Gamepad2',
      color: 'from-cyan-500 to-blue-500',
      duration: '10-20 min',
      difficulty: 'Beginner',
      techniques: 2,
      progress: 0,
      streak: 0,
      active: true,
      subTechniques: []
    },
    {
      id: '9',
      title: 'Art & Color Therapy',
      description: 'Creative expression through digital art and therapeutic coloring',
      category: 'Art Therapy',
      icon: 'Palette',
      color: 'from-pink-500 to-purple-500',
      duration: '15-45 min',
      difficulty: 'Beginner',
      techniques: 3,
      progress: 0,
      streak: 0,
      active: true,
      subTechniques: []
    },
    {
      id: '10',
      title: 'Exposure Therapy',
      description: 'Gradual exposure techniques for anxiety and phobias with safety protocols',
      category: 'Exposure',
      icon: 'Eye',
      color: 'from-yellow-500 to-orange-500',
      duration: '20-60 min',
      difficulty: 'Advanced',
      techniques: 4,
      progress: 0,
      streak: 0,
      active: true,
      subTechniques: []
    },
    {
      id: '11',
      title: 'Video Therapy',
      description: 'Professional therapeutic video content with licensed therapists',
      category: 'Video Therapy',
      icon: 'Video',
      color: 'from-blue-500 to-indigo-500',
      duration: '15-45 min',
      difficulty: 'Intermediate',
      techniques: 6,
      progress: 0,
      streak: 0,
      active: true,
      subTechniques: []
    },
    {
      id: '12',
      title: 'Acceptance & Commitment Therapy',
      description: 'ACT principles for psychological flexibility and values-based living',
      category: 'ACT',
      icon: 'Star',
      color: 'from-teal-500 to-cyan-500',
      duration: '20-35 min',
      difficulty: 'Intermediate',
      techniques: 6,
      progress: 0,
      streak: 0,
      active: true,
      subTechniques: []
    }
  ]);

  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([
    {
      id: '1',
      title: 'Deep Sleep Waves',
      artist: 'Sleep Institute',
      duration: '45 min',
      category: 'nature',
      description: 'Gentle ocean waves for deep relaxation and sleep',
      thumbnail: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=300',
      audioUrl: '/audio/deep-sleep-waves.mp3',
      active: true
    },
    {
      id: '2',
      title: 'Rain on Forest',
      artist: 'Nature Sounds',
      duration: '60 min',
      category: 'nature',
      description: 'Peaceful rainfall sounds in a quiet forest setting',
      thumbnail: 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=300',
      audioUrl: '/audio/rain-forest.mp3',
      active: true
    }
  ]);

  const [videoFiles, setVideoFiles] = useState<VideoFile[]>([
    {
      id: '1',
      title: 'Understanding Anxiety',
      therapist: 'Dr. Sarah Johnson',
      duration: '20 min',
      category: 'Anxiety',
      description: 'Learn about anxiety, its causes, and coping strategies',
      thumbnail: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=300',
      videoUrl: '/videos/anxiety-intro.mp4',
      difficulty: 'Beginner',
      active: true
    }
  ]);

  const [newModule, setNewModule] = useState<Partial<TherapyModule>>({
    title: '',
    description: '',
    category: '',
    icon: 'Brain',
    color: 'from-purple-500 to-blue-500',
    duration: '',
    difficulty: 'Beginner',
    techniques: 0,
    active: true,
    subTechniques: []
  });

  const [newAudio, setNewAudio] = useState<Partial<AudioFile>>({
    title: '',
    artist: '',
    duration: '',
    category: 'nature',
    description: '',
    thumbnail: '',
    audioUrl: '',
    active: true
  });

  const [newVideo, setNewVideo] = useState<Partial<VideoFile>>({
    title: '',
    therapist: '',
    duration: '',
    category: 'Anxiety',
    description: '',
    thumbnail: '',
    videoUrl: '',
    difficulty: 'Beginner',
    active: true
  });

  const iconOptions = [
    { value: 'Brain', label: 'Brain', component: Brain },
    { value: 'Heart', label: 'Heart', component: Heart },
    { value: 'Moon', label: 'Moon', component: Moon },
    { value: 'Music', label: 'Music', component: Music },
    { value: 'Palette', label: 'Palette', component: Palette },
    { value: 'Gamepad2', label: 'Game', component: Gamepad2 },
    { value: 'BookOpen', label: 'Book', component: BookOpen },
    { value: 'Target', label: 'Target', component: Target },
    { value: 'Users', label: 'Users', component: Users },
    { value: 'Shield', label: 'Shield', component: Shield },
    { value: 'Video', label: 'Video', component: Video },
    { value: 'Star', label: 'Star', component: Star },
    { value: 'Eye', label: 'Eye', component: Eye }
  ];

  const colorOptions = [
    { value: 'from-purple-500 to-pink-500', label: 'Purple to Pink' },
    { value: 'from-blue-500 to-cyan-500', label: 'Blue to Cyan' },
    { value: 'from-green-500 to-teal-500', label: 'Green to Teal' },
    { value: 'from-orange-500 to-red-500', label: 'Orange to Red' },
    { value: 'from-pink-500 to-rose-500', label: 'Pink to Rose' },
    { value: 'from-indigo-500 to-purple-500', label: 'Indigo to Purple' },
    { value: 'from-teal-500 to-cyan-500', label: 'Teal to Cyan' },
    { value: 'from-yellow-500 to-orange-500', label: 'Yellow to Orange' },
    { value: 'from-red-500 to-pink-500', label: 'Red to Pink' },
    { value: 'from-cyan-500 to-blue-500', label: 'Cyan to Blue' }
  ];

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(opt => opt.value === iconName);
    return iconOption ? iconOption.component : Brain;
  };

  const handleEditModule = (module: TherapyModule) => {
    setEditingItem(module);
    setEditingType('module');
    setShowEditModal(true);
  };

  const handleEditAudio = (audio: AudioFile) => {
    setEditingItem(audio);
    setEditingType('audio');
    setShowEditModal(true);
  };

  const handleEditVideo = (video: VideoFile) => {
    setEditingItem(video);
    setEditingType('video');
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (editingType === 'module') {
      setTherapyModules(prev => 
        prev.map(module => 
          module.id === editingItem.id ? editingItem : module
        )
      );
      toast.success('Therapy module updated successfully!');
    } else if (editingType === 'audio') {
      setAudioFiles(prev => 
        prev.map(audio => 
          audio.id === editingItem.id ? editingItem : audio
        )
      );
      toast.success('Audio file updated successfully!');
    } else if (editingType === 'video') {
      setVideoFiles(prev => 
        prev.map(video => 
          video.id === editingItem.id ? editingItem : video
        )
      );
      toast.success('Video file updated successfully!');
    }
    
    setShowEditModal(false);
    setEditingItem(null);
  };

  const handleDeleteModule = (moduleId: string) => {
    setTherapyModules(prev => prev.filter(module => module.id !== moduleId));
    toast.success('Therapy module deleted successfully!');
  };

  const handleDeleteAudio = (audioId: string) => {
    setAudioFiles(prev => prev.filter(audio => audio.id !== audioId));
    toast.success('Audio file deleted successfully!');
  };

  const handleDeleteVideo = (videoId: string) => {
    setVideoFiles(prev => prev.filter(video => video.id !== videoId));
    toast.success('Video file deleted successfully!');
  };

  const handleCreateModule = () => {
    if (!newModule.title || !newModule.description) {
      toast.error('Please fill in required fields');
      return;
    }

    const module: TherapyModule = {
      id: Date.now().toString(),
      title: newModule.title!,
      description: newModule.description!,
      category: newModule.category!,
      icon: newModule.icon!,
      color: newModule.color!,
      duration: newModule.duration!,
      difficulty: newModule.difficulty!,
      techniques: 0,
      progress: 0,
      streak: 0,
      active: true,
      subTechniques: []
    };

    setTherapyModules(prev => [...prev, module]);
    setNewModule({
      title: '',
      description: '',
      category: '',
      icon: 'Brain',
      color: 'from-purple-500 to-blue-500',
      duration: '',
      difficulty: 'Beginner',
      techniques: 0,
      active: true,
      subTechniques: []
    });
    setShowCreateModal(false);
    toast.success('New therapy module created successfully!');
  };

  const handleCreateAudio = () => {
    if (!newAudio.title || !newAudio.artist) {
      toast.error('Please fill in required fields');
      return;
    }

    const audio: AudioFile = {
      id: Date.now().toString(),
      ...newAudio as AudioFile
    };

    setAudioFiles(prev => [...prev, audio]);
    setNewAudio({
      title: '',
      artist: '',
      duration: '',
      category: 'nature',
      description: '',
      thumbnail: '',
      audioUrl: '',
      active: true
    });
    setShowCreateModal(false);
    toast.success('New audio file added successfully!');
  };

  const handleCreateVideo = () => {
    if (!newVideo.title || !newVideo.therapist) {
      toast.error('Please fill in required fields');
      return;
    }

    const video: VideoFile = {
      id: Date.now().toString(),
      ...newVideo as VideoFile
    };

    setVideoFiles(prev => [...prev, video]);
    setNewVideo({
      title: '',
      therapist: '',
      duration: '',
      category: 'Anxiety',
      description: '',
      thumbnail: '',
      videoUrl: '',
      difficulty: 'Beginner',
      active: true
    });
    setShowCreateModal(false);
    toast.success('New video file added successfully!');
  };

  const filteredModules = therapyModules.filter(module =>
    module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAudio = audioFiles.filter(audio =>
    audio.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    audio.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    audio.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVideo = videoFiles.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.therapist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Therapy Management
            </h1>
            <p className="text-purple-100">
              Create, edit, and manage therapy modules, audio files, and video content
            </p>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-xl">
            {[
              { id: 'modules', label: 'Therapy Modules', icon: Brain },
              { id: 'audio', label: 'Audio Files', icon: Music },
              { id: 'video', label: 'Video Files', icon: Video }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  selectedTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Content Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold">
              {selectedTab === 'modules' && `Therapy Modules (${filteredModules.length})`}
              {selectedTab === 'audio' && `Audio Files (${filteredAudio.length})`}
              {selectedTab === 'video' && `Video Files (${filteredVideo.length})`}
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            <span>
              {selectedTab === 'modules' && 'Create Module'}
              {selectedTab === 'audio' && 'Add Audio'}
              {selectedTab === 'video' && 'Add Video'}
            </span>
          </motion.button>
        </div>

        {/* Content Grid */}
        <AnimatePresence mode="wait">
          {selectedTab === 'modules' && (
            <motion.div
              key="modules"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredModules.map((module, index) => {
                const IconComponent = getIconComponent(module.icon);
                return (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${module.color} flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEditModule(module)}
                          className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteModule(module.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">
                      {module.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      {module.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                        {module.category}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {module.techniques} techniques
                      </span>
                    </div>

                    <div className="text-gray-500 text-sm">
                      Progress: {module.progress}/3 • Streak: {module.streak}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {selectedTab === 'audio' && (
            <motion.div
              key="audio"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredAudio.map((audio, index) => (
                <motion.div
                  key={audio.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-300"
                >
                  <div className="relative h-48">
                    <img
                      src={audio.thumbnail}
                      alt={audio.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute top-3 right-3 flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditAudio(audio)}
                        className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteAudio(audio.id)}
                        className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                      {audio.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-1">
                      {audio.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2">
                      by {audio.artist}
                    </p>
                    <p className="text-gray-500 text-sm mb-3">
                      {audio.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 bg-teal-900 text-teal-300 rounded text-xs">
                        {audio.category}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {audio.duration}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {selectedTab === 'video' && (
            <motion.div
              key="video"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredVideo.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-300"
                >
                  <div className="relative h-48">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute top-3 right-3 flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditVideo(video)}
                        className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteVideo(video.id)}
                        className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-1">
                      {video.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2">
                      with {video.therapist}
                    </p>
                    <p className="text-gray-500 text-sm mb-3">
                      {video.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-xs">
                        {video.category}
                      </span>
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                        {video.difficulty}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-96 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">
                    {selectedTab === 'modules' && 'Create New Therapy Module'}
                    {selectedTab === 'audio' && 'Add New Audio File'}
                    {selectedTab === 'video' && 'Add New Video File'}
                  </h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {selectedTab === 'modules' && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Module Title *
                        </label>
                        <input
                          type="text"
                          value={newModule.title}
                          onChange={(e) => setNewModule(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Enter module title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Category *
                        </label>
                        <input
                          type="text"
                          value={newModule.category}
                          onChange={(e) => setNewModule(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g., CBT, Mindfulness"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={newModule.description}
                        onChange={(e) => setNewModule(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        placeholder="Describe what this module does..."
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Icon
                        </label>
                        <select
                          value={newModule.icon}
                          onChange={(e) => setNewModule(prev => ({ ...prev, icon: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {iconOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Color Gradient
                        </label>
                        <select
                          value={newModule.color}
                          onChange={(e) => setNewModule(prev => ({ ...prev, color: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {colorOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={newModule.duration}
                          onChange={(e) => setNewModule(prev => ({ ...prev, duration: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g., 15-30 min"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Difficulty Level
                        </label>
                        <select
                          value={newModule.difficulty}
                          onChange={(e) => setNewModule(prev => ({ ...prev, difficulty: e.target.value as any }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex space-x-4 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCreateModule}
                        className="flex-1 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-300"
                      >
                        Create Module
                      </motion.button>
                      <button
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1 py-3 bg-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {selectedTab === 'audio' && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Song Title *
                        </label>
                        <input
                          type="text"
                          value={newAudio.title}
                          onChange={(e) => setNewAudio(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Enter song title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Artist Name *
                        </label>
                        <input
                          type="text"
                          value={newAudio.artist}
                          onChange={(e) => setNewAudio(prev => ({ ...prev, artist: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Enter artist name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={newAudio.description}
                        onChange={(e) => setNewAudio(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        placeholder="Describe the audio content..."
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={newAudio.duration}
                          onChange={(e) => setNewAudio(prev => ({ ...prev, duration: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g., 45 min"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Category
                        </label>
                        <select
                          value={newAudio.category}
                          onChange={(e) => setNewAudio(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="nature">Nature</option>
                          <option value="meditation">Meditation</option>
                          <option value="sleep">Sleep</option>
                          <option value="focus">Focus</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Thumbnail URL
                        </label>
                        <input
                          type="url"
                          value={newAudio.thumbnail}
                          onChange={(e) => setNewAudio(prev => ({ ...prev, thumbnail: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="https://example.com/thumbnail.jpg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Audio URL
                        </label>
                        <input
                          type="url"
                          value={newAudio.audioUrl}
                          onChange={(e) => setNewAudio(prev => ({ ...prev, audioUrl: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="https://example.com/audio.mp3"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-4 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCreateAudio}
                        className="flex-1 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-300"
                      >
                        Add Audio
                      </motion.button>
                      <button
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1 py-3 bg-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {selectedTab === 'video' && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Video Title *
                        </label>
                        <input
                          type="text"
                          value={newVideo.title}
                          onChange={(e) => setNewVideo(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Enter video title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Therapist Name *
                        </label>
                        <input
                          type="text"
                          value={newVideo.therapist}
                          onChange={(e) => setNewVideo(prev => ({ ...prev, therapist: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Enter therapist name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={newVideo.description}
                        onChange={(e) => setNewVideo(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        placeholder="Describe the video content..."
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={newVideo.duration}
                          onChange={(e) => setNewVideo(prev => ({ ...prev, duration: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g., 20 min"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Category
                        </label>
                        <select
                          value={newVideo.category}
                          onChange={(e) => setNewVideo(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="Anxiety">Anxiety</option>
                          <option value="Depression">Depression</option>
                          <option value="PTSD">PTSD</option>
                          <option value="Mindfulness">Mindfulness</option>
                          <option value="CBT">CBT</option>
                          <option value="Sleep">Sleep</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Thumbnail URL
                        </label>
                        <input
                          type="url"
                          value={newVideo.thumbnail}
                          onChange={(e) => setNewVideo(prev => ({ ...prev, thumbnail: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="https://example.com/thumbnail.jpg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Video URL
                        </label>
                        <input
                          type="url"
                          value={newVideo.videoUrl}
                          onChange={(e) => setNewVideo(prev => ({ ...prev, videoUrl: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="https://example.com/video.mp4"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-4 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCreateVideo}
                        className="flex-1 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-300"
                      >
                        Add Video
                      </motion.button>
                      <button
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1 py-3 bg-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Modal */}
        <AnimatePresence>
          {showEditModal && editingItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowEditModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-96 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">
                    Edit {editingType === 'module' ? 'Therapy Module' : editingType === 'audio' ? 'Audio File' : 'Video File'}
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {editingType === 'module' && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Module Title
                        </label>
                        <input
                          type="text"
                          value={editingItem.title}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Category
                        </label>
                        <input
                          type="text"
                          value={editingItem.category}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={editingItem.description}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Icon
                        </label>
                        <select
                          value={editingItem.icon}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, icon: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {iconOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Color Gradient
                        </label>
                        <select
                          value={editingItem.color}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, color: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {colorOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={editingItem.duration}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, duration: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Difficulty
                        </label>
                        <select
                          value={editingItem.difficulty}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, difficulty: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {editingType === 'audio' && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Song Title
                        </label>
                        <input
                          type="text"
                          value={editingItem.title}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Artist Name
                        </label>
                        <input
                          type="text"
                          value={editingItem.artist}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, artist: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={editingItem.description}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={editingItem.duration}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, duration: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Category
                        </label>
                        <select
                          value={editingItem.category}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="nature">Nature</option>
                          <option value="meditation">Meditation</option>
                          <option value="sleep">Sleep</option>
                          <option value="focus">Focus</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Thumbnail URL
                        </label>
                        <input
                          type="url"
                          value={editingItem.thumbnail}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, thumbnail: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Audio URL
                        </label>
                        <input
                          type="url"
                          value={editingItem.audioUrl}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, audioUrl: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {editingType === 'video' && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Video Title
                        </label>
                        <input
                          type="text"
                          value={editingItem.title}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Therapist Name
                        </label>
                        <input
                          type="text"
                          value={editingItem.therapist}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, therapist: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={editingItem.description}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={editingItem.duration}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, duration: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Category
                        </label>
                        <select
                          value={editingItem.category}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="Anxiety">Anxiety</option>
                          <option value="Depression">Depression</option>
                          <option value="PTSD">PTSD</option>
                          <option value="Mindfulness">Mindfulness</option>
                          <option value="CBT">CBT</option>
                          <option value="Sleep">Sleep</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Thumbnail URL
                        </label>
                        <input
                          type="url"
                          value={editingItem.thumbnail}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, thumbnail: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Video URL
                        </label>
                        <input
                          type="url"
                          value={editingItem.videoUrl}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, videoUrl: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Difficulty
                      </label>
                      <select
                        value={editingItem.difficulty}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, difficulty: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex space-x-4 pt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveEdit}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </motion.button>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3 bg-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Cancel
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

export default AdminTherapyManagement;