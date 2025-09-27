import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Filter, Plus, Eye, CreditCard as Edit, Trash2, Shield, UserCheck, UserX, Mail, Phone, Calendar, MoreVertical, Ban, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'therapist' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastLogin: string;
  sessionsCount?: number;
  patientsCount?: number;
  verified: boolean;
  age?: number;
  emergencyContactEmail?: string;
  emergencyContactRelation?: string;
  specialization?: string;
  licenseNumber?: string;
  hourlyRate?: number;
  experience?: string;
  phone?: string;
  bio?: string;
}

function UsersPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadUsers();
    
    // Set up interval to refresh data
    const interval = setInterval(loadUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadUsers = () => {
    // Load registered users
    const registeredUsers = JSON.parse(localStorage.getItem('mindcare_registered_users') || '[]');
    
    // Demo users
    const demoUsers = [
      {
        id: '1',
        name: 'John Doe',
        email: 'patient@example.com',
        role: 'patient' as const,
        status: 'active' as const,
        joinDate: '2023-06-15',
        lastLogin: '2024-01-15',
        sessionsCount: 24,
        verified: true,
        age: 28,
        emergencyContactEmail: 'emergency@example.com',
        emergencyContactRelation: 'parent'
      },
      {
        id: '2',
        name: 'Dr. Sarah Smith',
        email: 'therapist@example.com',
        role: 'therapist' as const,
        status: 'active' as const,
        joinDate: '2023-03-10',
        lastLogin: '2024-01-15',
        patientsCount: 28,
        verified: true,
        specialization: 'Cognitive Behavioral Therapy',
        licenseNumber: 'LIC123456',
        hourlyRate: 120
      },
      {
        id: '3',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin' as const,
        status: 'active' as const,
        joinDate: '2023-01-01',
        lastLogin: '2024-01-15',
        verified: true
      }
    ];

    // Combine demo users with registered users
    const allUsers = [...demoUsers];
    
    registeredUsers.forEach((regUser: any) => {
      // Don't duplicate demo users
      if (!demoUsers.some(demo => demo.email === regUser.email)) {
        const userData: User = {
          id: regUser.id,
          name: regUser.name,
          email: regUser.email,
          role: regUser.role,
          status: regUser.status === 'approved' ? 'active' : regUser.status === 'pending' ? 'inactive' : 'active',
          joinDate: regUser.joinDate || new Date().toISOString().split('T')[0],
          lastLogin: new Date().toISOString().split('T')[0],
          verified: regUser.verified || false,
          ...(regUser.age && { age: regUser.age }),
          ...(regUser.emergencyContactEmail && { emergencyContactEmail: regUser.emergencyContactEmail }),
          ...(regUser.emergencyContactRelation && { emergencyContactRelation: regUser.emergencyContactRelation }),
          ...(regUser.specialization && { specialization: regUser.specialization }),
          ...(regUser.licenseNumber && { licenseNumber: regUser.licenseNumber }),
          ...(regUser.hourlyRate && { hourlyRate: regUser.hourlyRate }),
          ...(regUser.role === 'patient' && { sessionsCount: 0 }),
          ...(regUser.role === 'therapist' && { patientsCount: 0 })
        };
        allUsers.push(userData);
      }
    });

    setUsers(allUsers);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'inactive': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
      case 'therapist': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'patient': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

  const handleUserAction = (userId: string, action: string) => {
    if (action === 'suspended' || action === 'activated') {
      const newStatus = action === 'suspended' ? 'suspended' : 'active';
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status: newStatus as any } : u
      ));
      
      // Update registered users in localStorage
      const registeredUsers = JSON.parse(localStorage.getItem('mindcare_registered_users') || '[]');
      const updatedUsers = registeredUsers.map((u: any) => 
        u.id === userId ? { ...u, status: newStatus } : u
      );
      localStorage.setItem('mindcare_registered_users', JSON.stringify(updatedUsers));
      
      // Update therapist services status
      const therapistServices = JSON.parse(localStorage.getItem('mindcare_therapist_services') || '[]');
      const updatedServices = therapistServices.map((s: any) => 
        s.therapistId === userId ? { ...s, status: newStatus === 'suspended' ? 'suspended' : 'approved' } : s
      );
      localStorage.setItem('mindcare_therapist_services', JSON.stringify(updatedServices));
      
      // Update available therapists for booking
      if (newStatus === 'suspended') {
        const availableTherapists = JSON.parse(localStorage.getItem('mindcare_therapists') || '[]');
        const updatedAvailableTherapists = availableTherapists.filter((t: any) => t.id !== userId);
        localStorage.setItem('mindcare_therapists', JSON.stringify(updatedAvailableTherapists));
      }
    } else if (action === 'deleted') {
      // Remove from local state
      setUsers(prev => prev.filter(u => u.id !== userId));
      
      // Remove from registered users
      const registeredUsers = JSON.parse(localStorage.getItem('mindcare_registered_users') || '[]');
      const updatedUsers = registeredUsers.filter((u: any) => u.id !== userId);
      localStorage.setItem('mindcare_registered_users', JSON.stringify(updatedUsers));
      
      // Remove therapist services
      const therapistServices = JSON.parse(localStorage.getItem('mindcare_therapist_services') || '[]');
      const updatedServices = therapistServices.filter((s: any) => s.therapistId !== userId);
      localStorage.setItem('mindcare_therapist_services', JSON.stringify(updatedServices));
      
      // Remove from available therapists for booking
      const availableTherapists = JSON.parse(localStorage.getItem('mindcare_therapists') || '[]');
      const updatedAvailableTherapists = availableTherapists.filter((t: any) => t.id !== userId);
      localStorage.setItem('mindcare_therapists', JSON.stringify(updatedAvailableTherapists));
    }
    
    toast.success(`User ${action} successfully`);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Active Users',
      value: users.filter(u => u.status === 'active').length,
      icon: UserCheck,
      color: 'from-green-500 to-teal-500'
    },
    {
      title: 'Therapists',
      value: users.filter(u => u.role === 'therapist').length,
      icon: Shield,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Patients',
      value: users.filter(u => u.role === 'patient').length,
      icon: Users,
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className={`h-screen flex flex-col ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50'
    }`}>
      <div className="flex-1 overflow-y-auto p-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                User Management
              </h1>
              <p className={`text-base ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Manage all platform users and their permissions
              </p>
            </div>
            <button
              onClick={() => setShowUserModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {stat.title}
                  </h3>
                  <p className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`mb-4 p-4 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="therapist">Therapist</option>
                <option value="patient">Patient</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`rounded-xl shadow-lg overflow-hidden ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <tr>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    User
                  </th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Role
                  </th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Status
                  </th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Join Date
                  </th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Last Login
                  </th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className={`font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-gray-800'
                            }`}>
                              {user.name}
                            </p>
                            {user.verified && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {new Date(user.joinDate).toLocaleDateString()}
                    </td>
                    <td className={`px-4 py-3 text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {user.status === 'active' ? (
                          <button
                            onClick={() => handleUserAction(user.id, 'suspended')}
                            className="p-2 text-gray-500 hover:text-yellow-600 transition-colors"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(user.id, 'activated')}
                            className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleUserAction(user.id, 'deleted')}
                          className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* User Detail Modal */}
        {showUserModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`max-w-2xl w-full rounded-2xl shadow-2xl ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    User Details
                  </h2>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    ×
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Name</label>
                        <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                          {selectedUser.name}
                        </p>
                      </div>
                      <div>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Email</label>
                        <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                          {selectedUser.email}
                        </p>
                      </div>
                      <div>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Role</label>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRoleColor(selectedUser.role)}`}>
                          {selectedUser.role}
                        </span>
                      </div>
                      <div>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Status</label>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedUser.status)}`}>
                          {selectedUser.status}
                        </span>
                      </div>
                      {selectedUser.age && (
                        <div>
                          <label className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>Age</label>
                          <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                            {selectedUser.age} years
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      Account Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Join Date</label>
                        <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                          {new Date(selectedUser.joinDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Last Login</label>
                        <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                          {new Date(selectedUser.lastLogin).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Verified</label>
                        <div className="flex items-center space-x-2">
                          {selectedUser.verified ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          )}
                          <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                            {selectedUser.verified ? 'Verified' : 'Not Verified'}
                          </span>
                        </div>
                      </div>
                      {selectedUser.role === 'patient' && selectedUser.sessionsCount !== undefined && (
                        <div>
                          <label className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>Total Sessions</label>
                          <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                            {selectedUser.sessionsCount}
                          </p>
                        </div>
                      )}
                      {selectedUser.role === 'therapist' && selectedUser.patientsCount !== undefined && (
                        <div>
                          <label className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>Total Patients</label>
                          <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                            {selectedUser.patientsCount}
                          </p>
                        </div>
                      )}
                      {selectedUser.role === 'therapist' && selectedUser.licenseNumber && (
                        <div>
                          <label className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>License Number</label>
                          <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                            {selectedUser.licenseNumber}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedUser.role === 'patient' && selectedUser.emergencyContactEmail && (
                  <div className="mt-6">
                    <h3 className={`text-lg font-semibold mb-4 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      Emergency Contact
                    </h3>
                    <div className={`p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        <strong>Email:</strong> {selectedUser.emergencyContactEmail}
                      </p>
                      {selectedUser.emergencyContactRelation && (
                        <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          <strong>Relationship:</strong> {selectedUser.emergencyContactRelation}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedUser.role === 'therapist' && selectedUser.specialization && (
                  <div className="mt-6">
                    <h3 className={`text-lg font-semibold mb-4 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      Professional Information
                    </h3>
                    <div className={`p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        <strong>Specialization:</strong> {Array.isArray(selectedUser.specialization) ? selectedUser.specialization.join(', ') : selectedUser.specialization}
                      </p>
                      {selectedUser.hourlyRate && (
                        <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          <strong>Hourly Rate:</strong> ${selectedUser.hourlyRate}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default UsersPage;