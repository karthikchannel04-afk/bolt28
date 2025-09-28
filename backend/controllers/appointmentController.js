const Appointment = require('../models/Appointment');
const User = require('../models/User');
const VideoSession = require('../models/VideoSession');

// @desc    Book new appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
const bookAppointment = async (req, res) => {
  try {
    const { therapistId, date, time, sessionType, notes } = req.body;

    // Validation
    if (!therapistId || !date || !time) {
      return res.status(400).json({ message: 'Please provide therapist, date, and time' });
    }

    // Check if therapist exists and is active
    const therapist = await User.findOne({
      _id: therapistId,
      role: 'therapist',
      status: 'active'
    });

    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found or not available' });
    }

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      therapistId,
      date: new Date(date),
      time,
      status: { $in: ['pending_confirmation', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // Create appointment
    const appointment = new Appointment({
      patientId: req.user.id,
      therapistId,
      date: new Date(date),
      time,
      sessionType: sessionType || 'video',
      amount: therapist.profileDetails?.hourlyRate || 100,
      notes
    });

    await appointment.save();

    // Populate patient and therapist details
    await appointment.populate('patientId', 'name email');
    await appointment.populate('therapistId', 'name email profileDetails.specialization');

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get appointments by patient
// @route   GET /api/appointments/patient
// @access  Private (Patient only)
const getPatientAppointments = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let query = { patientId: req.user.id };
    
    if (status) {
      query.status = status;
    }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const appointments = await Appointment.find(query)
      .populate('therapistId', 'name email profileDetails.specialization profileDetails.profilePicture')
      .sort({ date: 1, time: 1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get appointments by therapist
// @route   GET /api/appointments/therapist
// @access  Private (Therapist only)
const getTherapistAppointments = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let query = { therapistId: req.user.id };
    
    if (status) {
      query.status = status;
    }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email profileDetails.age')
      .sort({ date: 1, time: 1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Get therapist appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Patient or Therapist)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, cancelReason } = req.body;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has permission to update this appointment
    const isPatient = appointment.patientId.toString() === req.user.id;
    const isTherapist = appointment.therapistId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isTherapist && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update appointment
    appointment.status = status;
    if (cancelReason) {
      appointment.cancelReason = cancelReason;
      appointment.cancelledBy = req.user.role;
    }

    await appointment.save();

    // If appointment is confirmed and it's a video session, create video session
    if (status === 'confirmed' && appointment.sessionType === 'video') {
      const existingVideoSession = await VideoSession.findOne({ appointmentId });
      if (!existingVideoSession) {
        const videoSession = new VideoSession({
          patientId: appointment.patientId,
          therapistId: appointment.therapistId,
          appointmentId: appointment._id
        });
        await videoSession.save();
      }
    }

    res.json({
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email profileDetails')
      .populate('therapistId', 'name email profileDetails');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has permission to view this appointment
    const isPatient = appointment.patientId._id.toString() === req.user.id;
    const isTherapist = appointment.therapistId._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isTherapist && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  bookAppointment,
  getPatientAppointments,
  getTherapistAppointments,
  updateAppointmentStatus,
  getAppointmentById
};