const mongoose = require('mongoose');

const videoSessionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'ended', 'cancelled'],
    default: 'waiting'
  },
  startTime: Date,
  endTime: Date,
  duration: Number, // in seconds
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: Date,
    leftAt: Date,
    connectionQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    }
  }],
  sessionNotes: {
    therapistNotes: String,
    patientFeedback: String,
    technicalIssues: [String]
  },
  recording: {
    enabled: {
      type: Boolean,
      default: false
    },
    url: String,
    consent: {
      patient: Boolean,
      therapist: Boolean
    }
  }
}, {
  timestamps: true
});

// Generate unique room ID
videoSessionSchema.pre('save', function(next) {
  if (!this.roomId) {
    this.roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Index for efficient queries
videoSessionSchema.index({ roomId: 1 });
videoSessionSchema.index({ patientId: 1, createdAt: -1 });
videoSessionSchema.index({ therapistId: 1, createdAt: -1 });
videoSessionSchema.index({ appointmentId: 1 });

module.exports = mongoose.model('VideoSession', videoSessionSchema);