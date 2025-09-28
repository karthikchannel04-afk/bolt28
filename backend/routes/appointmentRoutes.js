const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getPatientAppointments,
  getTherapistAppointments,
  updateAppointmentStatus,
  getAppointmentById
} = require('../controllers/appointmentController');
const { auth, authorize } = require('../middleware/auth');

// @route   POST /api/appointments
router.post('/', auth, authorize('patient'), bookAppointment);

// @route   GET /api/appointments/patient
router.get('/patient', auth, authorize('patient'), getPatientAppointments);

// @route   GET /api/appointments/therapist
router.get('/therapist', auth, authorize('therapist'), getTherapistAppointments);

// @route   PUT /api/appointments/:id/status
router.put('/:id/status', auth, updateAppointmentStatus);

// @route   GET /api/appointments/:id
router.get('/:id', auth, getAppointmentById);

module.exports = router;