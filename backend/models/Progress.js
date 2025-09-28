const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: false // Can be null for self-directed progress
  },
  therapyModule: {
    type: String,
    enum: ['cbt', 'mindfulness', 'stress', 'gratitude', 'music', 'tetris', 'art', 'exposure', 'video', 'act'],
    required: true
  },
  activityType: {
    type: String,
    required: true // e.g., 'thought_record', 'meditation', 'mood_entry'
  },
  progressScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  moodBefore: {
    type: Number,
    min: 1,
    max: 10
  },
  moodAfter: {
    type: Number,
    min: 1,
    max: 10
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  completionTime: {
    type: Number // in seconds
  },
  streakDay: {
    type: Number,
    default: 1
  },
  achievements: [{
    name: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
progressSchema.index({ patientId: 1, createdAt: -1 });
progressSchema.index({ patientId: 1, therapyModule: 1 });
progressSchema.index({ sessionId: 1 });

module.exports = mongoose.model('Progress', progressSchema);