const User = require('../models/User');
const Appointment = require('../models/Appointment');

// @desc    Get all verified therapists
// @route   GET /api/therapists
// @access  Public
const getAllTherapists = async (req, res) => {
  try {
    const { specialization, minRating, maxRate, availability } = req.query;
    
    let query = {
      role: 'therapist',
      status: 'active',
      'profileDetails.verified': true
    };

    // Add filters
    if (specialization) {
      query['profileDetails.specialization'] = { $in: [specialization] };
    }

    const therapists = await User.find(query)
      .select('-passwordHash')
      .sort({ 'profileDetails.hourlyRate': 1 });

    // Calculate additional metrics for each therapist
    const therapistsWithMetrics = await Promise.all(
      therapists.map(async (therapist) => {
        const appointments = await Appointment.find({ 
          therapistId: therapist._id,
          status: 'completed'
        });

        const totalSessions = appointments.length;
        const uniquePatients = new Set(appointments.map(apt => apt.patientId.toString())).size;
        
        // Calculate average rating (mock for now)
        const averageRating = 4.5 + (Math.random() * 0.8); // 4.5-5.3 range

        return {
          id: therapist._id,
          name: therapist.name,
          email: therapist.email,
          specialization: therapist.profileDetails?.specialization || [],
          experience: therapist.profileDetails?.experience || '0 years',
          hourlyRate: therapist.profileDetails?.hourlyRate || 100,
          bio: therapist.profileDetails?.bio || '',
          languages: therapist.profileDetails?.languages || ['English'],
          availability: therapist.profileDetails?.availability || [],
          verified: therapist.profileDetails?.verified || false,
          profilePicture: therapist.profileDetails?.profilePicture || '',
          rating: Math.round(averageRating * 10) / 10,
          totalSessions,
          totalPatients: uniquePatients,
          location: therapist.profileDetails?.location || 'Online'
        };
      })
    );

    res.json({
      success: true,
      count: therapistsWithMetrics.length,
      data: therapistsWithMetrics
    });
  } catch (error) {
    console.error('Get therapists error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get therapist by ID
// @route   GET /api/therapists/:id
// @access  Public
const getTherapistById = async (req, res) => {
  try {
    const therapist = await User.findOne({
      _id: req.params.id,
      role: 'therapist',
      status: 'active'
    }).select('-passwordHash');

    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found' });
    }

    // Get therapist's appointment statistics
    const appointments = await Appointment.find({ 
      therapistId: therapist._id,
      status: 'completed'
    });

    const totalSessions = appointments.length;
    const uniquePatients = new Set(appointments.map(apt => apt.patientId.toString())).size;

    res.json({
      success: true,
      data: {
        id: therapist._id,
        name: therapist.name,
        email: therapist.email,
        specialization: therapist.profileDetails?.specialization || [],
        experience: therapist.profileDetails?.experience || '0 years',
        hourlyRate: therapist.profileDetails?.hourlyRate || 100,
        bio: therapist.profileDetails?.bio || '',
        languages: therapist.profileDetails?.languages || ['English'],
        availability: therapist.profileDetails?.availability || [],
        verified: therapist.profileDetails?.verified || false,
        profilePicture: therapist.profileDetails?.profilePicture || '',
        totalSessions,
        totalPatients: uniquePatients,
        joinedAt: therapist.createdAt
      }
    });
  } catch (error) {
    console.error('Get therapist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update therapist availability
// @route   PUT /api/therapists/availability
// @access  Private (Therapist only)
const updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    if (!Array.isArray(availability)) {
      return res.status(400).json({ message: 'Availability must be an array' });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'therapist') {
      return res.status(403).json({ message: 'Access denied. Therapists only.' });
    }

    user.profileDetails.availability = availability;
    await user.save();

    res.json({
      message: 'Availability updated successfully',
      availability: user.profileDetails.availability
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllTherapists,
  getTherapistById,
  updateAvailability
};