const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  conversationId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Create conversation ID from sender and receiver IDs
chatSchema.pre('save', function(next) {
  if (!this.conversationId) {
    const ids = [this.senderId.toString(), this.receiverId.toString()].sort();
    this.conversationId = ids.join('_');
  }
  next();
});

// Index for efficient queries
chatSchema.index({ conversationId: 1, createdAt: -1 });
chatSchema.index({ senderId: 1, receiverId: 1 });
chatSchema.index({ receiverId: 1, isRead: 1 });

module.exports = mongoose.model('Chat', chatSchema);