import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, Lock, Eye, EyeOff, User, UserPlus, 
  Briefcase, DollarSign, Clock, FileText, Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient' as 'patient' | 'therapist', 
    emergencyContactEmail: '',
    emergencyContactRelation: '',
    age: '',
    specialization: '',
    experience: '',
    hourlyRate: '',
    licenseNumber: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    
    const success = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      ...(formData.emergencyContactEmail && { emergencyContactEmail: formData.emergencyContactEmail }),
      ...(formData.emergencyContactRelation && { emergencyContactRelation: formData.emergencyContactRelation }),
      ...(formData.age && { age: parseInt(formData.age) }),
      ...(formData.specialization && { specialization: formData.specialization }),
      ...(formData.experience && { experience: formData.experience }),
      ...(formData.hourlyRate && { hourlyRate: parseInt(formData.hourlyRate) }),
      ...(formData.licenseNumber && { licenseNumber: formData.licenseNumber })
    });
    
    if (success) {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50'
    }`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="mx-auto h-12 w-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center"
          >
            <UserPlus className="h-6 w-6 text-white" />
          </motion.div>
          <h2 className={`mt-6 text-3xl font-extrabold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Join MindCare
          </h2>
          <p className={`mt-2 text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Start your mental wellness journey today
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
        >
          {/* Role Selection */}
          <div className="flex space-x-4">
            {(['patient', 'therapist'] as const).map((role) => (
              <motion.button
                key={role}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFormData(prev => ({ ...prev, role }))}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                  formData.role === role
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {role === 'patient' ? 'I need support' : 'I\'m a therapist'}
              </motion.button>
            ))}
          </div>

          <div className="space-y-4">
            {/* Basic Information */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                }`} />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className={`appearance-none relative block w-full px-12 py-3 border rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Full name"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                }`} />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`appearance-none relative block w-full px-12 py-3 border rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Email address"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                }`} />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleInputChange}
                className={`appearance-none relative block w-full px-12 py-3 border rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Password (min. 8 characters)"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className={`h-5 w-5 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                ) : (
                  <Eye className={`h-5 w-5 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                )}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                }`} />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`appearance-none relative block w-full px-12 py-3 border rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Confirm password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className={`h-5 w-5 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                ) : (
                  <Eye className={`h-5 w-5 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                )}
              </button>
            </div>

            {/* Role-specific fields */}
            {formData.role === 'patient' && (
              <>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    id="emergencyContactEmail"
                    name="emergencyContactEmail"
                    type="email"
                    required
                    value={formData.emergencyContactEmail}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full px-12 py-3 border rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Emergency contact email"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                  </div>
                  <select
                    id="emergencyContactRelation"
                    name="emergencyContactRelation"
                    required
                    value={formData.emergencyContactRelation}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full px-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Select relationship</option>
                    <option value="parent">Parent</option>
                    <option value="spouse">Spouse</option>
                    <option value="sibling">Sibling</option>
                    <option value="child">Child</option>
                    <option value="friend">Friend</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    required
                    min="18"
                    max="120"
                    value={formData.age}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full px-12 py-3 border rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Age"
                  />
                </div>
              </>
            )}

            {formData.role === 'therapist' && (
              <>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    id="licenseNumber"
                    name="licenseNumber"
                    type="text"
                    required
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full px-12 py-3 border rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="License number"
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                'Create Account'
              )}
            </motion.button>
          </div>

          <div className="text-center">
            <span className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
              >
                Sign in
              </Link>
            </span>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
}

export default RegisterPage;