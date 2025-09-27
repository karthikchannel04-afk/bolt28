import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, ArrowDown, ArrowLeft, ArrowRight,
  RotateCw, Target, Award, TrendingUp, Zap, Brain, Star
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { updateStreak } from '../../utils/streakManager';

type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
type GameState = 'menu' | 'playing' | 'paused' | 'gameOver';

interface Position {
  x: number;
  y: number;
}

interface Tetromino {
  type: TetrominoType;
  shape: number[][];
  position: Position;
  color: string;
}

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const COLORS = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000'
};

const SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]]
};

function TetrisTherapyModule() {
  const { theme } = useTheme();
  const [gameState, setGameState] = useState<GameState>('menu');
  const [board, setBoard] = useState<string[][]>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(''))
  );
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [linesCleared, setLinesCleared] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [stressLevel, setStressLevel] = useState(5);
  const [focusScore, setFocusScore] = useState(0);

  const createRandomPiece = useCallback((): Tetromino => {
    const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    const type = types[Math.floor(Math.random() * types.length)];
    return {
      type,
      shape: SHAPES[type],
      position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
      color: COLORS[type]
    };
  }, []);

  const rotatePiece = (piece: Tetromino): Tetromino => {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    );
    return { ...piece, shape: rotated };
  };

  const isValidPosition = (piece: Tetromino, board: string[][]): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.position.x + x;
          const newY = piece.position.y + y;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }
          
          if (newY >= 0 && board[newY][newX]) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const placePiece = (piece: Tetromino, board: string[][]): string[][] => {
    const newBoard = board.map(row => [...row]);
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.position.y + y;
          const boardX = piece.position.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.color;
          }
        }
      }
    }
    
    return newBoard;
  };

  const clearLines = (board: string[][]): { newBoard: string[][]; linesCleared: number } => {
    const newBoard = board.filter(row => row.some(cell => !cell));
    const clearedLines = BOARD_HEIGHT - newBoard.length;
    
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(''));
    }
    
    return { newBoard, linesCleared: clearedLines };
  };

  const startGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill('')));
    setCurrentPiece(createRandomPiece());
    setScore(0);
    setLevel(1);
    setLinesCleared(0);
    setGameTime(0);
    setGameState('playing');
    toast.success('Tetris Therapy session started! Focus on the present moment.');
  };

  const pauseGame = () => {
    setGameState(gameState === 'paused' ? 'playing' : 'paused');
  };

  const endGame = () => {
    setGameState('gameOver');
    const stressReduction = Math.max(0, stressLevel - Math.floor(score / 1000));
    const newFocusScore = Math.min(100, focusScore + Math.floor(score / 100));
    setStressLevel(stressReduction);
    setFocusScore(newFocusScore);
    
    // Save tetris therapy session
    const tetrisSessions = JSON.parse(localStorage.getItem('mindcare_tetris_sessions') || '[]');
    const newSession = {
      id: Date.now().toString(),
      userId: user?.id,
      date: new Date().toISOString().split('T')[0],
      score: score,
      level: level,
      linesCleared: linesCleared,
      gameTime: gameTime,
      stressReduction: stressLevel - stressReduction,
      completed: true
    };
    tetrisSessions.push(newSession);
    localStorage.setItem('mindcare_tetris_sessions', JSON.stringify(tetrisSessions));
    
    // Update streak
    updateStreak();
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('mindcare-data-updated'));
    
    toast.success(`Session complete! Stress reduced by ${stressLevel - stressReduction} points.`);
  };

  const movePiece = (direction: 'left' | 'right' | 'down') => {
    if (!currentPiece || gameState !== 'playing') return;

    const newPosition = { ...currentPiece.position };
    
    switch (direction) {
      case 'left':
        newPosition.x -= 1;
        break;
      case 'right':
        newPosition.x += 1;
        break;
      case 'down':
        newPosition.y += 1;
        break;
    }

    const newPiece = { ...currentPiece, position: newPosition };
    
    if (isValidPosition(newPiece, board)) {
      setCurrentPiece(newPiece);
    } else if (direction === 'down') {
      // Piece has landed
      const newBoard = placePiece(currentPiece, board);
      const { newBoard: clearedBoard, linesCleared: cleared } = clearLines(newBoard);
      
      setBoard(clearedBoard);
      setLinesCleared(prev => prev + cleared);
      setScore(prev => prev + cleared * 100 * level);
      setCurrentPiece(createRandomPiece());
      
      if (cleared > 0) {
        toast.success(`${cleared} line${cleared > 1 ? 's' : ''} cleared!`);
      }
    }
  };

  const rotatePieceHandler = () => {
    if (!currentPiece || gameState !== 'playing') return;
    
    const rotated = rotatePiece(currentPiece);
    if (isValidPosition(rotated, board)) {
      setCurrentPiece(rotated);
    }
  };

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        movePiece('down');
        setGameTime(prev => prev + 1);
      }, Math.max(100, 1000 - (level - 1) * 100));
      
      return () => clearInterval(interval);
    }
  }, [gameState, level, currentPiece, board]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece('right');
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePiece('down');
          break;
        case 'ArrowUp':
        case ' ':
          e.preventDefault();
          rotatePieceHandler();
          break;
        case 'p':
        case 'P':
          pauseGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, currentPiece, board]);

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    // Add current piece to display board
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = currentPiece.position.y + y;
            const boardX = currentPiece.position.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }

    return displayBoard.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={x}
            className={`w-6 h-6 border border-gray-300 dark:border-gray-600 ${
              cell ? '' : theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            }`}
            style={{ backgroundColor: cell || undefined }}
          />
        ))}
      </div>
    ));
  };

  if (gameState === 'menu') {
    return (
      <div className={`h-screen flex flex-col items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50'
      }`}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className={`text-3xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Tetris Therapy
          </h1>
          <p className={`text-lg mb-6 max-w-md ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Gamified stress relief and cognitive enhancement through mindful puzzle-solving
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-6 rounded-2xl shadow-lg mb-8 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h3 className={`text-xl font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Therapeutic Benefits
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Brain, title: 'Cognitive Enhancement', desc: 'Improves spatial reasoning and problem-solving' },
              { icon: Zap, title: 'Stress Reduction', desc: 'Provides mindful distraction from anxiety' },
              { icon: Target, title: 'Focus Training', desc: 'Enhances concentration and present-moment awareness' },
              { icon: Award, title: 'Achievement', desc: 'Builds confidence through progressive challenges' }
            ].map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <benefit.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className={`font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {benefit.title}
                  </h4>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {benefit.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3"
        >
          <Play className="w-6 h-6" />
          <span>Start Therapy Session</span>
        </motion.button>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50'
    }`}>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="flex items-start space-x-6">
          {/* Game Board */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-4 rounded-2xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className={`border-2 ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
            } rounded-lg overflow-hidden`}>
              {renderBoard()}
            </div>
          </motion.div>

          {/* Game Info & Controls */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Score Panel */}
            <div className={`p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-semibold mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Session Stats
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Score:</span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {score.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Level:</span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {level}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Lines:</span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {linesCleared}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Time:</span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>

            {/* Therapeutic Metrics */}
            <div className={`p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-semibold mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Wellness Metrics
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Stress Level
                    </span>
                    <span className={`text-sm font-medium ${
                      stressLevel <= 3 ? 'text-green-500' : stressLevel <= 6 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {stressLevel}/10
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div
                      className={`h-full rounded-full ${
                        stressLevel <= 3 ? 'bg-green-500' : stressLevel <= 6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(10 - stressLevel) * 10}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Focus Score
                    </span>
                    <span className="text-sm font-medium text-purple-500">
                      {focusScore}/100
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                      style={{ width: `${focusScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className={`p-4 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-semibold mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Controls
              </h3>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={pauseGame}
                    className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 font-medium flex items-center justify-center space-x-2"
                  >
                    {gameState === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    <span>{gameState === 'paused' ? 'Resume' : 'Pause'}</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={endGame}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    End Session
                  </motion.button>
                </div>

                {/* Mobile Controls */}
                <div className="grid grid-cols-3 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => movePiece('left')}
                    className={`p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
                    } hover:bg-gray-600 dark:hover:bg-gray-600 transition-colors`}
                  >
                    <ArrowLeft className="w-5 h-5 mx-auto" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={rotatePieceHandler}
                    className={`p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
                    } hover:bg-gray-600 dark:hover:bg-gray-600 transition-colors`}
                  >
                    <RotateCw className="w-5 h-5 mx-auto" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => movePiece('right')}
                    className={`p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
                    } hover:bg-gray-600 dark:hover:bg-gray-600 transition-colors`}
                  >
                    <ArrowRight className="w-5 h-5 mx-auto" />
                  </motion.button>
                  <div></div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => movePiece('down')}
                    className={`p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
                    } hover:bg-gray-600 dark:hover:bg-gray-600 transition-colors`}
                  >
                    <ArrowDown className="w-5 h-5 mx-auto" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Game Over Modal */}
        <AnimatePresence>
          {gameState === 'gameOver' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`max-w-md w-full rounded-2xl shadow-2xl ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className={`text-2xl font-bold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    Session Complete!
                  </h3>
                  <div className="space-y-2 mb-6">
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Final Score: <span className="font-bold text-purple-500">{score.toLocaleString()}</span>
                    </p>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Lines Cleared: <span className="font-bold text-blue-500">{linesCleared}</span>
                    </p>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Session Time: <span className="font-bold text-green-500">
                        {Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}
                      </span>
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startGame}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                    >
                      Play Again
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setGameState('menu')}
                      className={`flex-1 py-3 rounded-xl font-semibold ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Main Menu
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default TetrisTherapyModule;