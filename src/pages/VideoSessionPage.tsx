import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Video, VideoOff, Mic, MicOff, Phone, Settings,
  MessageSquare, Users, Clock, Monitor, Camera,
  Volume2, VolumeX, Maximize, Minimize, RotateCcw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { trackSessionComplete } from '../utils/analyticsManager';

function VideoSessionPage() {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState<any>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [participants, setParticipants] = useState<any[]>([]);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Load session data
    const allBookings = JSON.parse(localStorage.getItem('mindcare_bookings') || '[]');
    const session = allBookings.find((booking: any) => 
      booking.id === sessionId && 
      (booking.status === 'confirmed' || booking.status === 'pending_confirmation') &&
      (booking.patientId === user?.id || booking.therapistId === user?.id || booking.therapistName === user?.name)
    );
    
    if (session) {
      setSessionData(session);
      setIsSessionActive(true);
      
      // Set up participants
      setParticipants([
        { id: session.patientId, name: session.patientName, role: 'patient' },
        { id: session.therapistId || session.therapistName, name: session.therapistName, role: 'therapist' }
      ]);
      
      toast.success('Video session started!');
    } else {
      toast.error('Session not found');
      navigate('/dashboard');
    }
  }, [sessionId, navigate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    toast.success(isVideoOn ? 'Camera turned off' : 'Camera turned on');
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    toast.success(isAudioOn ? 'Microphone muted' : 'Microphone unmuted');
  };

  const endSession = () => {
    setIsSessionActive(false);
    
    // Update session status
    const allBookings = JSON.parse(localStorage.getItem('mindcare_bookings') || '[]');
    const updatedBookings = allBookings.map((booking: any) => 
      booking.id === sessionId ? { ...booking, status: 'completed', sessionDuration: sessionTime } : booking
    );
    localStorage.setItem('mindcare_bookings', JSON.stringify(updatedBookings));
    
    // Track session completion
    if (sessionData) {
      trackSessionComplete({
        patientId: sessionData.patientId,
        therapistId: sessionData.therapistId,
        sessionType: sessionData.sessionType || 'video',
        duration: sessionTime,
        rating: 5 // Default rating
      });
    }
    
    toast.success('Session ended successfully!');
    navigate('/dashboard');
  };

  const sendChatMessage = () => {
    if (!chatMessage.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      sender: user?.name,
      message: chatMessage,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setChatMessage('');
  };

  const otherParticipant = participants.find(p => p.id !== user?.id);
  if (!sessionData) {
    return (
      <div className={`h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>
            Loading session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      {/* Header */}
      <div className={`p-4 border-b ${
        theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      } shadow-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Video Therapy Session
            </h1>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {user?.role === 'patient' ? `with ${sessionData.therapistName}` : `with ${sessionData.patientName}`}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full ${
              theme === 'dark' ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
            }`}>
              <Clock className="w-4 h-4 inline mr-1" />
              {formatTime(sessionTime)}
            </div>
            <button
              onClick={endSession}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              End Session
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Remote Video */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative rounded-2xl overflow-hidden shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
              }`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-12 h-12 text-purple-600" />
                  </div>
                  <p className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {otherParticipant?.name || 'Other Participant'}
                  </p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Video will appear here
                  </p>
                </div>
              </div>
              <div className="absolute top-4 left-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  theme === 'dark' ? 'bg-gray-900/80 text-white' : 'bg-white/80 text-gray-800'
                }`}>
                  {otherParticipant?.role === 'therapist' ? 'Therapist' : 'Patient'}
                </span>
              </div>
            </motion.div>

            {/* Local Video */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className={`relative rounded-2xl overflow-hidden shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
              }`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Camera className="w-10 h-10 text-blue-600" />
                  </div>
                  <p className={`font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    You
                  </p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {isVideoOn ? 'Camera On' : 'Camera Off'}
                  </p>
                </div>
              </div>
              <div className="absolute top-4 left-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  theme === 'dark' ? 'bg-gray-900/80 text-white' : 'bg-white/80 text-gray-800'
                }`}>
                  You
                </span>
              </div>
            </motion.div>
          </div>

          {/* Video Controls */}
          <div className="flex items-center justify-center space-x-4 mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleAudio}
              className={`p-4 rounded-full shadow-lg transition-all duration-300 ${
                isAudioOn
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleVideo}
              className={`p-4 rounded-full shadow-lg transition-all duration-300 ${
                isVideoOn
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={endSession}
              className="p-4 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-all duration-300"
            >
              <Phone className="w-6 h-6" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`p-4 rounded-full shadow-lg transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className={`w-80 border-l ${
          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        } flex flex-col`}>
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className={`font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Session Chat
            </h3>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.sender === user?.name
                    ? 'bg-purple-500 text-white ml-4'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-200 mr-4'
                    : 'bg-gray-100 text-gray-800 mr-4'
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 opacity-70`}>
                  {message.sender} • {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Type a message..."
                className={`flex-1 px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              <button
                onClick={sendChatMessage}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoSessionPage;