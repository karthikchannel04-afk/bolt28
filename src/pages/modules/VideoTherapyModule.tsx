import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, SkipForward, SkipBack,
  Maximize, Minimize, Settings, BookOpen, Heart,
  Clock, Star, CheckCircle, Target, Brain, Award
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { updateStreak } from '../../utils/streakManager';

interface VideoSession {
  id: string;
  title: string;
  description: string;
  therapist: string;
  duration: number;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  topics: string[];
  thumbnail: string;
  videoUrl: string;
  completed: boolean;
  rating: number;
  exercises: string[];
}

interface WatchProgress {
  videoId: string;
  watchTime: number;
  completed: boolean;
  notes: string;
  rating: number;
}

function VideoTherapyModule() {
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoSession | null>(null);
  const [videoSessions, setVideoSessions] = useState<VideoSession[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [watchProgress, setWatchProgress] = useState<WatchProgress[]>([]);

  const defaultVideoSessions: VideoSession[] = [
    {
      id: '1',
      title: 'Understanding Anxiety: A Gentle Introduction',
      description: 'Learn about anxiety, its causes, and how it affects your mind and body',
      therapist: 'Dr. Sarah Johnson',
      duration: 1200, // 20 minutes
      category: 'Anxiety',
      difficulty: 'Beginner',
      topics: ['What is anxiety?', 'Physical symptoms', 'Thought patterns', 'Coping basics'],
      thumbnail: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=300',
      videoUrl: '/videos/anxiety-intro.mp4',
      completed: false,
      rating: 4.8,
      exercises: ['Breathing exercise', 'Thought identification', 'Body scan']
    },
    {
      id: '2',
      title: 'Mindfulness for Daily Life',
      description: 'Practical mindfulness techniques you can use anywhere',
      therapist: 'Dr. Michael Chen',
      duration: 900, // 15 minutes
      category: 'Mindfulness',
      difficulty: 'Beginner',
      topics: ['Present moment awareness', 'Mindful breathing', 'Daily mindfulness'],
      thumbnail: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=300',
      videoUrl: '/videos/mindfulness-daily.mp4',
      completed: true,
      rating: 4.9,
      exercises: ['5-minute meditation', 'Mindful walking', 'Eating meditation']
    },
    {
      id: '3',
      title: 'Cognitive Behavioral Therapy Fundamentals',
      description: 'Understanding the connection between thoughts, feelings, and behaviors',
      therapist: 'Dr. Emily Rodriguez',
      duration: 1800, // 30 minutes
      category: 'CBT',
      difficulty: 'Intermediate',
      topics: ['Thought-feeling connection', 'Cognitive distortions', 'Behavioral experiments'],
      thumbnail: 'https://images.pexels.com/photos/5327647/pexels-photo-5327647.jpeg?auto=compress&cs=tinysrgb&w=300',
      videoUrl: '/videos/cbt-fundamentals.mp4',
      completed: false,
      rating: 4.7,
      exercises: ['Thought record', 'Mood tracking', 'Behavioral activation']
    },
    {
      id: '4',
      title: 'Trauma-Informed Self-Care',
      description: 'Gentle approaches to healing and self-compassion',
      therapist: 'Dr. James Wilson',
      duration: 1500, // 25 minutes
      category: 'Trauma',
      difficulty: 'Advanced',
      topics: ['Understanding trauma', 'Safety and grounding', 'Self-compassion'],
      thumbnail: 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=300',
      videoUrl: '/videos/trauma-care.mp4',
      completed: false,
      rating: 4.9,
      exercises: ['Grounding techniques', 'Safe space visualization', 'Self-compassion practice']
    },
    {
      id: '5',
      title: 'Building Healthy Relationships',
      description: 'Communication skills and boundary setting for better relationships',
      therapist: 'Dr. Lisa Brown',
      duration: 1350, // 22.5 minutes
      category: 'Relationships',
      difficulty: 'Intermediate',
      topics: ['Communication styles', 'Setting boundaries', 'Conflict resolution'],
      thumbnail: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=300',
      videoUrl: '/videos/relationships.mp4',
      completed: false,
      rating: 4.6,
      exercises: ['Communication practice', 'Boundary worksheet', 'Conflict scenarios']
    },
    {
      id: '6',
      title: 'Sleep Hygiene and Insomnia Relief',
      description: 'Evidence-based strategies for better sleep quality',
      therapist: 'Dr. Robert Kim',
      duration: 1080, // 18 minutes
      category: 'Sleep',
      difficulty: 'Beginner',
      topics: ['Sleep science', 'Sleep hygiene', 'Relaxation techniques'],
      thumbnail: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=300',
      videoUrl: '/videos/sleep-hygiene.mp4',
      completed: false,
      rating: 4.8,
      exercises: ['Sleep diary', 'Relaxation routine', 'Bedroom optimization']
    }
  ];

  const categories = ['All', 'Anxiety', 'Mindfulness', 'CBT', 'Trauma', 'Relationships', 'Sleep'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const saved = localStorage.getItem('mindcare_video_progress');
    if (saved) {
      setWatchProgress(JSON.parse(saved));
    }
    
    // Load admin-managed content
    const adminContent = localStorage.getItem('mindcare_therapy_content');
    if (adminContent) {
      const parsedData = JSON.parse(adminContent);
      const therapyData = Array.isArray(parsedData) ? parsedData : [];
      const videoModule = therapyData.find((m: any) => m.id === 'video');
      if (videoModule && videoModule.content.length > 0) {
        const adminVideos = videoModule.content.map((content: any) => ({
          id: content.id,
          title: content.title,
          description: content.description,
          therapist: content.therapist || 'Professional Therapist',
          duration: content.duration * 60, // Convert minutes to seconds
          category: content.category,
          difficulty: content.difficulty,
          topics: content.instructions || [],
          thumbnail: content.thumbnail || 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=300',
          videoUrl: content.videoUrl || '/videos/placeholder.mp4',
          completed: false,
          rating: content.rating,
          exercises: content.benefits || []
        }));
        setVideoSessions([...defaultVideoSessions, ...adminVideos]);
      } else {
        setVideoSessions(defaultVideoSessions);
      }
    } else {
      setVideoSessions(defaultVideoSessions);
    }
  }, []);

  const filteredVideos = videoSessions.filter(video => 
    selectedCategory === 'All' || video.category === selectedCategory
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playVideo = (video: VideoSession) => {
    setSelectedVideo(video);
    setCurrentTime(0);
    setIsPlaying(true);
    toast.success(`Starting: ${video.title}`);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const completeVideo = () => {
    if (!selectedVideo) return;

    const progress: WatchProgress = {
      userId: user?.id, // Add user ID to track progress per user
      videoId: selectedVideo.id,
      watchTime: currentTime,
      completed: true,
      notes: sessionNotes,
      rating: 5
    };

    const updatedProgress = [...watchProgress, progress];
    setWatchProgress(updatedProgress);
    localStorage.setItem('mindcare_video_progress', JSON.stringify(updatedProgress));
    
    // Update streak
    updateStreak();
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('mindcare-data-updated'));
    
    toast.success('Video session completed! Great job engaging with the content.');
    setSelectedVideo(null);
    setSessionNotes('');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (selectedVideo) {
    return (
      <div className={`h-screen flex flex-col ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50'
      }`}>
        <div className="flex-1 p-4">
          <div className="grid lg:grid-cols-3 gap-4 h-full">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={`h-full rounded-xl shadow-lg overflow-hidden ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <div className="relative h-64 bg-gray-900 flex items-center justify-center">
                  <img
                    src={selectedVideo.thumbnail}
                    alt={selectedVideo.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={togglePlayPause}
                      className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center"
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8 text-gray-800" />
                      ) : (
                        <Play className="w-8 h-8 text-gray-800 ml-1" />
                      )}
                    </motion.button>
                  </div>
                </div>

                <div className="p-4">
                  <h2 className={`text-xl font-bold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {selectedVideo.title}
                  </h2>
                  <p className={`text-sm mb-3 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    with {selectedVideo.therapist}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className={`w-full h-2 rounded-full ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                        style={{ width: `${(currentTime / selectedVideo.duration) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        {formatTime(currentTime)}
                      </span>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        {formatTime(selectedVideo.duration)}
                      </span>
                    </div>
                  </div>

                  {/* Video Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}>
                        <SkipBack className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                      </button>
                      <button onClick={togglePlayPause}>
                        {isPlaying ? (
                          <Pause className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`} />
                        ) : (
                          <Play className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`} />
                        )}
                      </button>
                      <button onClick={() => setCurrentTime(Math.min(selectedVideo.duration, currentTime + 10))}>
                        <SkipForward className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                      </button>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => setIsMuted(!isMuted)}>
                        {isMuted ? (
                          <VolumeX className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                        ) : (
                          <Volume2 className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                        )}
                      </button>
                      <button onClick={() => setIsFullscreen(!isFullscreen)}>
                        {isFullscreen ? (
                          <Minimize className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                        ) : (
                          <Maximize className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Session Info & Notes */}
            <div className="space-y-4">
              {/* Session Details */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className={`p-4 rounded-xl shadow-lg ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <h3 className={`text-lg font-semibold mb-3 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  Session Details
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Duration:
                    </span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      {formatTime(selectedVideo.duration)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Category:
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {selectedVideo.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Difficulty:
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedVideo.difficulty)}`}>
                      {selectedVideo.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Rating:
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        {selectedVideo.rating}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Topics Covered */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={`p-4 rounded-xl shadow-lg ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <h3 className={`text-lg font-semibold mb-3 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  Topics Covered
                </h3>
                <div className="space-y-2">
                  {selectedVideo.topics.map((topic, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {topic}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Session Notes */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className={`p-4 rounded-xl shadow-lg ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <h3 className={`text-lg font-semibold mb-3 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  Session Notes
                </h3>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  rows={4}
                  placeholder="Write down key insights, questions, or reflections..."
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </motion.div>

              {/* Complete Session */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={completeVideo}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Complete Session</span>
              </motion.button>
            </div>
          </div>
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
            Video Therapy Sessions
          </h1>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Professional therapeutic content with licensed therapists
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-4 p-4 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Video Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => playVideo(video)}
              className={`rounded-xl shadow-lg cursor-pointer transition-all duration-300 overflow-hidden ${
                theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-xl'
              }`}
            >
              {/* Thumbnail */}
              <div className="relative h-32 overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                  {formatTime(video.duration)}
                </div>
                {video.completed && (
                  <div className="absolute top-2 left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(video.difficulty)}`}>
                    {video.difficulty}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {video.rating}
                    </span>
                  </div>
                </div>

                <h3 className={`font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {video.title}
                </h3>
                
                <p className={`text-sm mb-3 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {video.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    {video.therapist}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {video.category}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VideoTherapyModule;