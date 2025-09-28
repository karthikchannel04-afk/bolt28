const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Progress = require('../models/Progress');
const Chat = require('../models/Chat');
const VideoSession = require('../models/VideoSession');

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
const getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // User metrics
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
    const activeTherapists = await User.countDocuments({ 
      role: 'therapist', 
      status: 'active',
      'profileDetails.verified': true
    });
    const pendingTherapists = await User.countDocuments({ 
      role: 'therapist', 
      status: 'pending'
    });

    // Appointment metrics
    const totalAppointments = await Appointment.countDocuments();
    const completedSessions = await Appointment.countDocuments({ status: 'completed' });
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending_confirmation' });
    
    // Revenue metrics
    const revenueData = await Appointment.aggregate([
      { $match: { status: 'completed', paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    // Progress metrics
    const totalProgressEntries = await Progress.countDocuments();
    const avgProgressScore = await Progress.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$progressScore' } } }
    ]);

    // Recent activity
    const recentUsers = await User.find({ createdAt: { $gte: startDate } })
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentAppointments = await Appointment.find({ createdAt: { $gte: startDate } })
      .populate('patientId', 'name')
      .populate('therapistId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          newUsers,
          activeTherapists,
          pendingTherapists,
          totalAppointments,
          completedSessions,
          pendingAppointments,
          totalRevenue,
          totalProgressEntries,
          averageProgressScore: avgProgressScore[0]?.avgScore || 0
        },
        recentActivity: {
          users: recentUsers,
          appointments: recentAppointments
        }
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { role, status, page = 1, limit = 20, search } = req.query;
    
    let query = {};
    
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalUsers = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalUsers,
        pages: Math.ceil(totalUsers / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User status updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Soft delete by updating status
    user.status = 'inactive';
    await user.save();

    // Cancel all future appointments
    await Appointment.updateMany(
      { 
        $or: [{ patientId: id }, { therapistId: id }],
        date: { $gte: new Date() },
        status: { $in: ['pending_confirmation', 'confirmed'] }
      },
      { 
        status: 'cancelled',
        cancelReason: 'Account deactivated',
        cancelledBy: 'admin'
      }
    );

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve therapist
// @route   PUT /api/admin/therapists/:id/approve
// @access  Private (Admin only)
const approveTherapist = async (req, res) => {
  try {
    const { id } = req.params;

    const therapist = await User.findOne({ _id: id, role: 'therapist' });
    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found' });
    }

    therapist.status = 'active';
    therapist.profileDetails.verified = true;
    await therapist.save();

    res.json({
      message: 'Therapist approved successfully',
      therapist
    });
  } catch (error) {
    console.error('Approve therapist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAnalytics,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  approveTherapist
};