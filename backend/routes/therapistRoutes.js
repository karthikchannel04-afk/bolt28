const express = require('express');
const router = express.Router();
const { 
  getAllTherapists, 
  getTherapistById, 
  updateAvailability 
} = require('../controllers/therapistController');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/therapists
router.get('/', getAllTherapists);

// @route   GET /api/therapists/:id
router.get('/:id', getTherapistById);

// @route   PUT /api/therapists/availability
router.put('/availability', auth, authorize('therapist'), updateAvailability);

module.exports = router;