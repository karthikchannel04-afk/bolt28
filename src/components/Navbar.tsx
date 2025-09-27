import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Moon, Sun, LogOut, User, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-900/80 border-gray-700' 
          : 'bg-white/80 border-purple-200'
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                theme === 'dark' ? 'bg-purple-600' : 'bg-gradient-to-r from-purple-500 to-blue-500'
              }`}
            >
              <Heart className="w-6 h-6 text-white" />
            </motion.div>
            <span className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              MindCare
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-purple-50 text-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
                {user.role === 'patient' && (
                  <>
                    <Link
                      to="/chatbot"
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'hover:bg-gray-700 text-gray-300'
                          : 'hover:bg-purple-50 text-gray-700'
                      }`}
                    >
                      AI Assistant
                    </Link>
                    <Link
                      to="/therapy-modules"
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'hover:bg-gray-700 text-gray-300'
                          : 'hover:bg-purple-50 text-gray-700'
                      }`}
                    >
                      Therapies
                    </Link>
                  </>
                )}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            {user ? (
              <div className="flex items-center space-x-3">
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-purple-50'
                }`}>
                  <User className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-purple-600'
                  }`} />
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {user.name}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-purple-50 text-gray-700'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;