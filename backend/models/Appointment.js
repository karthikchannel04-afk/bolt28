const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 50 // minutes
  },
  sessionType: {
    type: String,
    enum: ['video', 'phone', 'in-person'],
    default: 'video'
  },
  status: {
    type: String,
    enum: ['pending_confirmation', 'confirmed', 'completed', 'cancelled', 'no_show'],
    default: 'pending_confirmation'
  },
  amount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  cancelReason: String,
  cancelledBy: {
    type: String,
    enum: ['patient', 'therapist', 'admin']
  },
  reminderSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ patientId: 1, date: 1 });
appointmentSchema.index({ therapistId: 1, date: 1 });
appointmentSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);