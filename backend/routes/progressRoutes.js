const express = require('express');
const router = express.Router();
const {
  addProgress,
  getProgressByPatient,
  getProgressAnalytics
} = require('../controllers/progressController');
const { auth, authorize } = require('../middleware/auth');

// @route   POST /api/progress
router.post('/', auth, authorize('patient'), addProgress);

// @route   GET /api/progress/patient/:patientId
router.get('/patient/:patientId', auth, getProgressByPatient);

// @route   GET /api/progress/analytics/:patientId
router.get('/analytics/:patientId', auth, getProgressAnalytics);

module.exports = router;