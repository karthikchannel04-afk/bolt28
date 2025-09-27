import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, MessageCircle, Brain, Video, BarChart3, 
  Users, Calendar, FileText, Shield, TrendingUp, User, Heart,
  Settings, LogOut, Moon, Sun
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  if (!user) return null;

  const patientMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: MessageCircle, label: 'AI Assistant', path: '/chatbot' },
    { icon: Brain, label: 'Therapies', path: '/therapy-modules' },
    { icon: Video, label: 'Video Chat', path: '/booking' },
    { icon: Heart, label: 'Mood Tracker', path: '/mood-tracker' },
    { icon: BarChart3, label: 'Progress', path: '/progress' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const therapistMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'List Service', path: '/list-service' },
    { icon: Calendar, label: 'Appointments', path: '/appointments' },
    { icon: Users, label: 'Patients', path: '/patients' },
    { icon: FileText, label: 'Reports', path: '/reports' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: Shield, label: 'Therapists', path: '/therapists' },
    { icon: Brain, label: 'Therapy Content', path: '/admin/therapy-management' },
    { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const getMenuItems = () => {
    switch (user.role) {
      case 'patient':
        return patientMenuItems;
      case 'therapist':
        return therapistMenuItems;
      case 'admin':
        return adminMenuItems;
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className={`fixed left-0 top-0 h-full w-56 z-40 ${
        theme === 'dark' 
          ? 'bg-gray-900 border-r border-gray-700' 
          : 'bg-white border-r border-gray-200'
      } shadow-lg`}
    >
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${
              theme === 'dark' ? 'bg-purple-400' : 'bg-purple-300'
            } opacity-30`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -40, -20],
              x: [-10, 10, -10],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="flex flex-col h-full">
        {/* Logo/Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                MindCare
              </h2>
              <p className={`text-xs capitalize ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {user.role}
              </p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <User className={`w-4 h-4 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium truncate ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {user.name}
              </p>
              <p className={`text-xs truncate ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {user.email.split('@')[0]}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3">
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={index}>
                  <Link to={item.path}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                          : theme === 'dark'
                          ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </motion.div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleTheme}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 mb-2 ${
              theme === 'dark'
                ? 'text-yellow-400 hover:bg-gray-800'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={logout}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              theme === 'dark'
                ? 'text-red-400 hover:bg-red-900/20'
                : 'text-red-600 hover:bg-red-50'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default Sidebar;