import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, Brush, Eraser, Download, Save, RotateCcw,
  Circle, Square, Triangle, Minus, Plus, Eye,
  Heart, Star, Smile, Sun, Flower, Camera, ArrowLeft, Target
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { updateStreak } from '../../utils/streakManager';

interface DrawingTool {
  type: 'brush' | 'eraser' | 'shape';
  size: number;
  color: string;
  opacity: number;
}

interface ColoringPage {
  id: string;
  title: string;
  description: string;
  category: string;
  complexity: 'Simple' | 'Medium' | 'Complex';
  therapeuticBenefit: string;
  svgPath: string;
}

function ArtTherapyModule() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<DrawingTool>({
    type: 'brush',
    size: 5,
    color: '#8B5CF6',
    opacity: 1
  });
  const [mode, setMode] = useState<'freeform' | 'coloring' | 'guided'>('freeform');
  const [selectedColoringPage, setSelectedColoringPage] = useState<ColoringPage | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const colors = [
    '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#84CC16',
    '#000000', '#6B7280', '#FFFFFF', '#FEE2E2', '#DBEAFE'
  ];

  const coloringPages: ColoringPage[] = [
    {
      id: '1',
      title: 'Mandala Peace',
      description: 'Intricate mandala design for deep focus and meditation',
      category: 'Mindfulness',
      complexity: 'Complex',
      therapeuticBenefit: 'Reduces anxiety, improves focus',
      svgPath: 'M50,10 C70,10 90,30 90,50 C90,70 70,90 50,90 C30,90 10,70 10,50 C10,30 30,10 50,10 Z'
    },
    {
      id: '2',
      title: 'Nature Garden',
      description: 'Peaceful garden scene with flowers and butterflies',
      category: 'Nature',
      complexity: 'Medium',
      therapeuticBenefit: 'Promotes calm, connects with nature',
      svgPath: 'M20,80 Q50,20 80,80 M30,70 Q50,50 70,70'
    },
    {
      id: '3',
      title: 'Positive Affirmations',
      description: 'Decorative text with uplifting messages',
      category: 'Self-Esteem',
      complexity: 'Simple',
      therapeuticBenefit: 'Builds confidence, positive thinking',
      svgPath: 'M10,50 L90,50 M50,10 L50,90'
    },
    {
      id: '4',
      title: 'Emotional Landscape',
      description: 'Abstract shapes representing different emotions',
      category: 'Emotional Processing',
      complexity: 'Medium',
      therapeuticBenefit: 'Emotional expression, self-awareness',
      svgPath: 'M10,10 Q50,50 90,10 Q50,90 10,10'
    }
  ];

  const guidedExercises = [
    {
      title: 'Draw Your Safe Space',
      prompt: 'Imagine a place where you feel completely safe and peaceful. Draw this space with as much detail as you can.',
      duration: '15 min',
      benefit: 'Creates mental refuge for stress relief'
    },
    {
      title: 'Emotion Color Mapping',
      prompt: 'Choose colors that represent your current emotions. Fill the canvas with these colors in any pattern.',
      duration: '10 min',
      benefit: 'Helps identify and process emotions'
    },
    {
      title: 'Future Self Portrait',
      prompt: 'Draw yourself as you want to be in the future - confident, healthy, and happy.',
      duration: '20 min',
      benefit: 'Visualizes goals and builds motivation'
    },
    {
      title: 'Gratitude Garden',
      prompt: 'Draw flowers, trees, or plants that represent things you\'re grateful for.',
      duration: '12 min',
      benefit: 'Cultivates positive mindset'
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = theme === 'dark' ? '#374151' : '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [theme]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    if (!isSessionActive) {
      setIsSessionActive(true);
      toast.success('Art therapy session started!');
    }
    draw(e);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalAlpha = tool.opacity;
    ctx.lineWidth = tool.size;
    ctx.lineCap = 'round';

    if (tool.type === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = tool.color;
    } else if (tool.type === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.beginPath();
      }
    }
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.fillStyle = theme === 'dark' ? '#374151' : '#FFFFFF';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const saveArtwork = () => {
    if (canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL();
      const link = document.createElement('a');
      link.download = `art-therapy-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
      
      // Save art therapy session
      const artSessions = JSON.parse(localStorage.getItem('mindcare_art_sessions') || '[]');
      const newSession = {
        id: Date.now().toString(),
        userId: user?.id,
        date: new Date().toISOString().split('T')[0],
        mode: mode,
        sessionTime: sessionTime,
        completed: true
      };
      artSessions.push(newSession);
      localStorage.setItem('mindcare_art_sessions', JSON.stringify(artSessions));
      
      // Update streak
      updateStreak();
      
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('mindcare-data-updated'));
      
      toast.success('Artwork saved successfully!');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            Art & Color Therapy
          </h1>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Express yourself through creative art and therapeutic coloring
          </p>
        </motion.div>

        {/* Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-4 p-4 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="flex space-x-2">
            {[
              { id: 'freeform', label: 'Free Drawing', icon: Brush },
              { id: 'coloring', label: 'Coloring Pages', icon: Palette },
              { id: 'guided', label: 'Guided Exercises', icon: Target }
            ].map((modeOption) => (
              <motion.button
                key={modeOption.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode(modeOption.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-all duration-200 ${
                  mode === modeOption.id
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <modeOption.icon className="w-4 h-4" />
                <span>{modeOption.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-4">
          {/* Tools Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Tools
            </h3>

            {/* Tool Selection */}
            <div className="space-y-3 mb-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setTool(prev => ({ ...prev, type: 'brush' }))}
                  className={`flex-1 p-2 rounded-lg transition-colors ${
                    tool.type === 'brush'
                      ? 'bg-purple-500 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Brush className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setTool(prev => ({ ...prev, type: 'eraser' }))}
                  className={`flex-1 p-2 rounded-lg transition-colors ${
                    tool.type === 'eraser'
                      ? 'bg-purple-500 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Eraser className="w-4 h-4 mx-auto" />
                </button>
              </div>

              {/* Brush Size */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Brush Size: {tool.size}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={tool.size}
                  onChange={(e) => setTool(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-purple-400 to-blue-400"
                />
              </div>

              {/* Color Palette */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Colors
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setTool(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 ${
                        tool.color === color ? 'border-gray-800 dark:border-white scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Session Timer */}
            {isSessionActive && (
              <div className={`p-3 rounded-lg mb-4 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Session Time
                  </span>
                  <span className={`text-lg font-bold text-purple-500`}>
                    {formatTime(sessionTime)}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={clearCanvas}
                className="w-full py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 font-medium flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveArtwork}
                className="w-full py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all duration-300 font-medium flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Save</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Canvas Area */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`lg:col-span-2 p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="text-center mb-4">
              <h3 className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {mode === 'freeform' ? 'Free Expression Canvas' :
                 mode === 'coloring' ? 'Therapeutic Coloring' :
                 'Guided Art Exercise'}
              </h3>
            </div>

            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                width={500}
                height={400}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className={`border-2 rounded-lg cursor-crosshair ${
                  theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                }`}
              />
            </div>

            {mode === 'guided' && (
              <div className={`mt-4 p-3 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <h4 className={`font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  Today's Exercise: Draw Your Safe Space
                </h4>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Imagine a place where you feel completely safe and peaceful. Draw this space with as much detail as you can. This exercise helps create a mental refuge for stress relief.
                </p>
              </div>
            )}
          </motion.div>

          {/* Content Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            {mode === 'coloring' && (
              <div className={`p-4 rounded-xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <h3 className={`text-lg font-semibold mb-3 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  Coloring Pages
                </h3>
                <div className="space-y-3">
                  {coloringPages.map((page) => (
                    <motion.div
                      key={page.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedColoringPage(page)}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedColoringPage?.id === page.id
                          ? 'bg-purple-100 dark:bg-purple-900/50 border border-purple-300 dark:border-purple-700'
                          : theme === 'dark'
                          ? 'bg-gray-700/50 hover:bg-gray-700'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <h4 className={`font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {page.title}
                      </h4>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {page.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          page.complexity === 'Simple' ? 'bg-green-100 text-green-800' :
                          page.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {page.complexity}
                        </span>
                        <span className={`text-xs ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {page.category}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {mode === 'guided' && (
              <div className={`p-4 rounded-xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <h3 className={`text-lg font-semibold mb-3 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  Guided Exercises
                </h3>
                <div className="space-y-3">
                  {guidedExercises.map((exercise, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        theme === 'dark' 
                          ? 'bg-gray-700/50 hover:bg-gray-700' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <h4 className={`font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {exercise.title}
                      </h4>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {exercise.benefit}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {exercise.duration}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Therapeutic Benefits */}
            <div className={`p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-semibold mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Benefits
              </h3>
              <div className="space-y-2">
                {[
                  'Reduces stress and anxiety',
                  'Improves emotional expression',
                  'Enhances mindfulness',
                  'Boosts self-esteem',
                  'Promotes relaxation'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-green-500" />
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ArtTherapyModule;