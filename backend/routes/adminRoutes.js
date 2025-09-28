const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  approveTherapist
} = require('../controllers/adminController');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/admin/analytics
router.get('/analytics', auth, authorize('admin'), getAnalytics);

// @route   GET /api/admin/users
router.get('/users', auth, authorize('admin'), getAllUsers);

// @route   PUT /api/admin/users/:id/status
router.put('/users/:id/status', auth, authorize('admin'), updateUserStatus);

// @route   DELETE /api/admin/users/:id
router.delete('/users/:id', auth, authorize('admin'), deleteUser);

// @route   PUT /api/admin/therapists/:id/approve
router.put('/therapists/:id/approve', auth, authorize('admin'), approveTherapist);

module.exports = router;