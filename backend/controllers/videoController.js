const VideoSession = require('../models/VideoSession');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Create video session
// @route   POST /api/video/create
// @access  Private (Patient or Therapist)
const createVideoSession = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: 'Appointment ID is required' });
    }

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId', 'name email')
      .populate('therapistId', 'name email');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user is part of this appointment
    const isPatient = appointment.patientId._id.toString() === req.user.id;
    const isTherapist = appointment.therapistId._id.toString() === req.user.id;

    if (!isPatient && !isTherapist) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if appointment is confirmed
    if (appointment.status !== 'confirmed') {
      return res.status(400).json({ message: 'Appointment must be confirmed to start video session' });
    }

    // Check if video session already exists
    let videoSession = await VideoSession.findOne({ appointmentId });
    
    if (!videoSession) {
      // Create new video session
      videoSession = new VideoSession({
        patientId: appointment.patientId._id,
        therapistId: appointment.therapistId._id,
        appointmentId
      });
      await videoSession.save();
    }

    // Add participant if not already added
    const existingParticipant = videoSession.participants.find(
      p => p.userId.toString() === req.user.id
    );

    if (!existingParticipant) {
      videoSession.participants.push({
        userId: req.user.id,
        joinedAt: new Date()
      });
      await videoSession.save();
    }

    res.json({
      message: 'Video session created/joined successfully',
      data: {
        roomId: videoSession.roomId,
        sessionId: videoSession._id,
        status: videoSession.status,
        participants: videoSession.participants.length
      }
    });
  } catch (error) {
    console.error('Create video session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get video session by room ID
// @route   GET /api/video/session/:roomId
// @access  Private
const getVideoSession = async (req, res) => {
  try {
    const { roomId } = req.params;

    const videoSession = await VideoSession.findOne({ roomId })
      .populate('patientId', 'name email profileDetails.profilePicture')
      .populate('therapistId', 'name email profileDetails.profilePicture')
      .populate('appointmentId', 'date time status amount');

    if (!videoSession) {
      return res.status(404).json({ message: 'Video session not found' });
    }

    // Check if user is part of this session
    const isPatient = videoSession.patientId._id.toString() === req.user.id;
    const isTherapist = videoSession.therapistId._id.toString() === req.user.id;

    if (!isPatient && !isTherapist && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      data: videoSession
    });
  } catch (error) {
    console.error('Get video session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update video session status
// @route   PUT /api/video/session/:roomId/status
// @access  Private
const updateSessionStatus = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { status, sessionNotes } = req.body;

    const videoSession = await VideoSession.findOne({ roomId });
    if (!videoSession) {
      return res.status(404).json({ message: 'Video session not found' });
    }

    // Check permissions
    const isPatient = videoSession.patientId.toString() === req.user.id;
    const isTherapist = videoSession.therapistId.toString() === req.user.id;

    if (!isPatient && !isTherapist) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update session
    videoSession.status = status;
    
    if (status === 'active' && !videoSession.startTime) {
      videoSession.startTime = new Date();
    }
    
    if (status === 'ended') {
      videoSession.endTime = new Date();
      if (videoSession.startTime) {
        videoSession.duration = Math.floor((videoSession.endTime - videoSession.startTime) / 1000);
      }
      
      // Update appointment status to completed
      await Appointment.findByIdAndUpdate(videoSession.appointmentId, {
        status: 'completed'
      });
    }

    if (sessionNotes) {
      if (req.user.role === 'therapist') {
        videoSession.sessionNotes.therapistNotes = sessionNotes;
      } else {
        videoSession.sessionNotes.patientFeedback = sessionNotes;
      }
    }

    await videoSession.save();

    res.json({
      message: 'Session status updated successfully',
      data: videoSession
    });
  } catch (error) {
    console.error('Update session status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Join video session
// @route   POST /api/video/join/:roomId
// @access  Private
const joinVideoSession = async (req, res) => {
  try {
    const { roomId } = req.params;

    const videoSession = await VideoSession.findOne({ roomId });
    if (!videoSession) {
      return res.status(404).json({ message: 'Video session not found' });
    }

    // Check permissions
    const isPatient = videoSession.patientId.toString() === req.user.id;
    const isTherapist = videoSession.therapistId.toString() === req.user.id;

    if (!isPatient && !isTherapist) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update participant info
    const participantIndex = videoSession.participants.findIndex(
      p => p.userId.toString() === req.user.id
    );

    if (participantIndex >= 0) {
      videoSession.participants[participantIndex].joinedAt = new Date();
    } else {
      videoSession.participants.push({
        userId: req.user.id,
        joinedAt: new Date()
      });
    }

    await videoSession.save();

    res.json({
      message: 'Joined video session successfully',
      data: {
        roomId: videoSession.roomId,
        status: videoSession.status,
        participants: videoSession.participants.length
      }
    });
  } catch (error) {
    console.error('Join video session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to check therapeutic relationship
const checkTherapeuticRelationship = async (userId1, userId2) => {
  const Appointment = require('../models/Appointment');
  
  const appointments = await Appointment.find({
    $or: [
      { patientId: userId1, therapistId: userId2 },
      { patientId: userId2, therapistId: userId1 }
    ]
  });

  return appointments.length > 0;
};

module.exports = {
  createVideoSession,
  getVideoSession,
  updateSessionStatus,
  joinVideoSession
};