import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Repeat, Shuffle, Music, Waves, Wind, Leaf, Moon,
  Heart, Clock, Download, Star, Headphones, ArrowLeft,
  Circle, Zap, Target
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { updateStreak } from '../../utils/streakManager';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  category: string;
  description: string;
  benefits: string[];
  url: string;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  tracks: Track[];
  icon: any;
  color: string;
}

function RelaxationMusicModule() {
  const { theme } = useTheme();
  const [musicTracks, setMusicTracks] = useState<any[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>('nature');
  const [visualizationStyle, setVisualizationStyle] = useState<'waveform' | 'particles' | 'orb'>('orb');
  const [audioData, setAudioData] = useState<number[]>(Array(64).fill(0));

  const playlists: Playlist[] = [
    {
      id: 'nature',
      name: 'Nature Sounds',
      description: 'Calming sounds from the natural world',
      icon: Leaf,
      color: 'from-green-500 to-teal-500',
      tracks: [
        {
          id: '1',
          title: 'Forest Rain',
          artist: 'Nature Collective',
          duration: 600,
          category: 'nature',
          description: 'Gentle rainfall in a peaceful forest setting',
          benefits: ['Reduces anxiety', 'Improves focus', 'Promotes sleep'],
          url: '/audio/forest-rain.mp3'
        },
        {
          id: '2',
          title: 'Ocean Waves',
          artist: 'Coastal Sounds',
          duration: 720,
          category: 'nature',
          description: 'Rhythmic ocean waves on a quiet beach',
          benefits: ['Stress relief', 'Meditation aid', 'Deep relaxation'],
          url: '/audio/ocean-waves.mp3'
        }
      ]
    },
    {
      id: 'meditation',
      name: 'Meditation Music',
      description: 'Ambient music designed for mindfulness practice',
      icon: Heart,
      color: 'from-purple-500 to-pink-500',
      tracks: [
        {
          id: '3',
          title: 'Tibetan Bowls',
          artist: 'Meditation Masters',
          duration: 900,
          category: 'meditation',
          description: 'Traditional singing bowls for deep meditation',
          benefits: ['Chakra balancing', 'Deep meditation', 'Spiritual connection'],
          url: '/audio/tibetan-bowls.mp3'
        },
        {
          id: '4',
          title: 'Ambient Harmony',
          artist: 'Zen Collective',
          duration: 1200,
          category: 'meditation',
          description: 'Ethereal ambient tones for mindfulness',
          benefits: ['Mental clarity', 'Emotional balance', 'Inner peace'],
          url: '/audio/ambient-harmony.mp3'
        }
      ]
    },
    {
      id: 'sleep',
      name: 'Sleep Sounds',
      description: 'Soothing audio to help you fall asleep',
      icon: Moon,
      color: 'from-blue-500 to-indigo-500',
      tracks: [
        {
          id: '5',
          title: 'White Noise',
          artist: 'Sleep Institute',
          duration: 3600,
          category: 'sleep',
          description: 'Consistent white noise for better sleep',
          benefits: ['Blocks distractions', 'Improves sleep quality', 'Reduces insomnia'],
          url: '/audio/white-noise.mp3'
        },
        {
          id: '6',
          title: 'Night Crickets',
          artist: 'Nature Sounds',
          duration: 2400,
          category: 'sleep',
          description: 'Peaceful cricket sounds on a summer night',
          benefits: ['Natural sleep aid', 'Reduces anxiety', 'Creates calm environment'],
          url: '/audio/night-crickets.mp3'
        }
      ]
    },
    {
      id: 'focus',
      name: 'Focus & Concentration',
      description: 'Background music to enhance productivity',
      icon: Target,
      color: 'from-orange-500 to-red-500',
      tracks: [
        {
          id: '7',
          title: 'Binaural Beats',
          artist: 'Focus Lab',
          duration: 1800,
          category: 'focus',
          description: 'Alpha waves for enhanced concentration',
          benefits: ['Improves focus', 'Enhances creativity', 'Reduces mental fatigue'],
          url: '/audio/binaural-beats.mp3'
        },
        {
          id: '8',
          title: 'Instrumental Flow',
          artist: 'Productivity Sounds',
          duration: 2700,
          category: 'focus',
          description: 'Gentle instrumental music for work',
          benefits: ['Maintains concentration', 'Reduces stress', 'Boosts productivity'],
          url: '/audio/instrumental-flow.mp3'
        }
      ]
    }
  ];

  // Simulate audio data for visualization
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setAudioData(Array(64).fill(0).map(() => Math.random() * 100));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    // Load admin-managed music content
    const adminContent = localStorage.getItem('mindcare_therapy_content');
    if (adminContent) {
      const parsedData = JSON.parse(adminContent);
      const therapyData = Array.isArray(parsedData) ? parsedData : [];
      const musicModule = therapyData.find((m: any) => m.id === 'music');
      if (musicModule && musicModule.content.length > 0) {
        const adminTracks = musicModule.content.map((content: any) => ({
          id: content.id,
          title: content.title,
          artist: content.artist || 'Unknown Artist',
          duration: content.duration * 60, // Convert minutes to seconds
          category: content.category,
          description: content.description,
          benefits: content.benefits || [],
          url: content.audioUrl || '/audio/placeholder.mp3'
        }));
        
        // Update playlists with admin content
        const updatedPlaylists = playlists.map(playlist => ({
          ...playlist,
          tracks: [
            ...playlist.tracks,
            ...adminTracks.filter((track: any) => 
              track.category.toLowerCase().includes(playlist.id) ||
              playlist.id === 'nature' && ['nature', 'ambient'].includes(track.category.toLowerCase())
            )
          ]
        }));
        
        setMusicTracks(adminTracks);
      }
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setCurrentTime(0);
    
    // Save music session start
    const musicSessions = JSON.parse(localStorage.getItem('mindcare_music_sessions') || '[]');
    const newSession = {
      id: Date.now().toString(),
      userId: user?.id,
      date: new Date().toISOString().split('T')[0],
      trackId: track.id,
      trackTitle: track.title,
      category: track.category,
      startTime: new Date().toISOString()
    };
    musicSessions.push(newSession);
    localStorage.setItem('mindcare_music_sessions', JSON.stringify(musicSessions));
    
    // Update streak for starting a relaxation session
    updateStreak();
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('mindcare-data-updated'));
    
    toast.success(`Now playing: ${track.title}`);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    const currentPlaylist = playlists.find(p => p.id === selectedPlaylist);
    if (currentPlaylist && currentTrack) {
      const currentIndex = currentPlaylist.tracks.findIndex(t => t.id === currentTrack.id);
      const nextIndex = (currentIndex + 1) % currentPlaylist.tracks.length;
      playTrack(currentPlaylist.tracks[nextIndex]);
    }
  };

  const previousTrack = () => {
    const currentPlaylist = playlists.find(p => p.id === selectedPlaylist);
    if (currentPlaylist && currentTrack) {
      const currentIndex = currentPlaylist.tracks.findIndex(t => t.id === currentTrack.id);
      const prevIndex = currentIndex === 0 ? currentPlaylist.tracks.length - 1 : currentIndex - 1;
      playTrack(currentPlaylist.tracks[prevIndex]);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTrack) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= currentTrack.duration) {
            if (isRepeat) {
              return 0;
            } else {
              nextTrack();
              return 0;
            }
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, isRepeat, selectedPlaylist]);

  const renderVisualization = () => {
    switch (visualizationStyle) {
      case 'waveform':
        return (
          <div className="flex items-end justify-center space-x-1 h-32">
            {audioData.slice(0, 32).map((value, index) => (
              <motion.div
                key={index}
                animate={{ height: isPlaying ? `${value}%` : '10%' }}
                transition={{ duration: 0.1 }}
                className="w-2 bg-gradient-to-t from-purple-500 to-blue-500 rounded-t"
                style={{ minHeight: '4px' }}
              />
            ))}
          </div>
        );
      case 'particles':
        return (
          <div className="relative h-32 overflow-hidden">
            {audioData.slice(0, 20).map((value, index) => (
              <motion.div
                key={index}
                animate={{
                  x: isPlaying ? [0, Math.random() * 200, 0] : 0,
                  y: isPlaying ? [0, Math.random() * 100, 0] : 50,
                  scale: isPlaying ? [1, value / 50, 1] : 1,
                  opacity: isPlaying ? [0.3, 0.8, 0.3] : 0.3
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-teal-400 to-blue-400"
                style={{
                  left: `${(index / 20) * 100}%`,
                  top: '50%'
                }}
              />
            ))}
          </div>
        );
      case 'orb':
        return (
          <div className="flex items-center justify-center h-32">
            <motion.div
              animate={{
                scale: isPlaying ? [1, 1.5, 1] : 1,
                opacity: isPlaying ? [0.6, 1, 0.6] : 0.6
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400 flex items-center justify-center"
            >
              <motion.div
                animate={{
                  rotate: isPlaying ? 360 : 0,
                  scale: isPlaying ? [1, 1.2, 1] : 1
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-white/30 to-white/10 flex items-center justify-center"
              >
                <Music className="w-8 h-8 text-white" />
              </motion.div>
            </motion.div>
          </div>
        );
      default:
        return null;
    }
  };

  const currentPlaylistData = playlists.find(p => p.id === selectedPlaylist);

  return (
    <div className={`h-screen flex flex-col ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50'
    }`}>
      <div className="flex-1 overflow-y-auto p-4">
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.history.back()}
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
            Relaxation Music
          </h1>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Curated audio library for relaxation, focus, and better sleep
          </p>
        </motion.div>

        {/* Playlist Selection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {playlists.map((playlist) => (
              <motion.button
                key={playlist.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPlaylist(playlist.id)}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  selectedPlaylist === playlist.id
                    ? `bg-gradient-to-r ${playlist.color} text-white`
                    : theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:shadow-lg'
                } shadow-lg`}
              >
                <playlist.icon className="w-6 h-6 mx-auto mb-2" />
                <h3 className="text-sm font-semibold">{playlist.name}</h3>
                <p className="text-xs opacity-80 mt-1">{playlist.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Visualization Area */}
        {currentTrack && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-6 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="text-center mb-4">
              <h3 className={`text-lg font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {currentTrack.title}
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                by {currentTrack.artist}
              </p>
            </div>

            {/* Visualization Style Selector */}
            <div className="flex justify-center space-x-2 mb-4">
              {[
                { id: 'waveform', label: 'Waveform', icon: Waves },
                { id: 'particles', label: 'Particles', icon: Circle },
                { id: 'orb', label: 'Glowing Orb', icon: Zap }
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => setVisualizationStyle(style.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                    visualizationStyle === style.id
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <style.icon className="w-3 h-3 inline mr-1" />
                  {style.label}
                </button>
              ))}
            </div>

            {/* Audio Visualization */}
            <div className={`rounded-lg p-4 mb-4 ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-100 to-blue-100'
            }`}>
              {renderVisualization()}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className={`w-full h-2 rounded-full ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${(currentTime / currentTrack.duration) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {formatTime(currentTime)}
                </span>
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {formatTime(currentTrack.duration)}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-4 mb-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-2 rounded-lg transition-colors ${
                  isShuffle
                    ? 'bg-purple-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Shuffle className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={previousTrack}
                className={`p-2 rounded-lg ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
              >
                <SkipBack className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePlayPause}
                className="p-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextTrack}
                className={`p-2 rounded-lg ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
              >
                <SkipForward className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsRepeat(!isRepeat)}
                className={`p-2 rounded-lg transition-colors ${
                  isRepeat
                    ? 'bg-purple-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Repeat className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 h-1 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-purple-400 to-blue-400"
              />
              <span className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </motion.div>
        )}

        {/* Track List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-4 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            {currentPlaylistData?.name}
          </h3>
          
          <div className="space-y-3">
            {currentPlaylistData?.tracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5 }}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  currentTrack?.id === track.id
                    ? 'bg-purple-100 dark:bg-purple-900/50 border border-purple-300 dark:border-purple-700'
                    : theme === 'dark'
                    ? 'bg-gray-700/50 hover:bg-gray-700'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => playTrack(track)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${
                    currentPlaylistData.color
                  } flex items-center justify-center`}>
                    {currentTrack?.id === track.id && isPlaying ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Waves className="w-5 h-5 text-white" />
                      </motion.div>
                    ) : (
                      <Play className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      {track.title}
                    </h4>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {track.artist} • {formatTime(track.duration)}
                    </p>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {track.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Benefits */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {track.benefits.slice(0, 3).map((benefit, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Session Timer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-4 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-3 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Relaxation Session Timer
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 15, 30].map((minutes) => (
              <motion.button
                key={minutes}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
               onClick={() => {
                 // Update streak for completing a relaxation session
                 updateStreak();
                 
                 // Dispatch custom event for real-time updates
                 window.dispatchEvent(new CustomEvent('mindcare-data-updated'));
                 
                 toast.success(`${minutes}-minute session started`);
               }}
                className="p-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-all duration-300 text-sm font-medium"
              >
                <Clock className="w-4 h-4 mx-auto mb-1" />
                {minutes} min
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default RelaxationMusicModule;