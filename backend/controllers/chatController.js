const Chat = require('../models/Chat');
const User = require('../models/User');

// @desc    Send message
// @route   POST /api/chat/send
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message, messageType = 'text' } = req.body;

    // Validation
    if (!receiverId || !message) {
      return res.status(400).json({ message: 'Please provide receiver ID and message' });
    }

    if (message.length > 1000) {
      return res.status(400).json({ message: 'Message too long (max 1000 characters)' });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Check if users have a therapeutic relationship (patient-therapist)
    const isTherapeuticRelationship = await checkTherapeuticRelationship(req.user.id, receiverId);
    if (!isTherapeuticRelationship && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only message your assigned therapist/patients' });
    }

    // Create message
    const chat = new Chat({
      senderId: req.user.id,
      receiverId,
      message,
      messageType
    });

    await chat.save();

    // Populate sender and receiver details
    await chat.populate('senderId', 'name profileDetails.profilePicture');
    await chat.populate('receiverId', 'name profileDetails.profilePicture');

    res.status(201).json({
      message: 'Message sent successfully',
      data: chat
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get conversation between two users
// @route   GET /api/chat/conversation/:userId
// @access  Private
const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if users have a therapeutic relationship
    const isTherapeuticRelationship = await checkTherapeuticRelationship(req.user.id, userId);
    if (!isTherapeuticRelationship && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const conversationId = [req.user.id, userId].sort().join('_');

    const messages = await Chat.find({ conversationId })
      .populate('senderId', 'name profileDetails.profilePicture')
      .populate('receiverId', 'name profileDetails.profilePicture')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Mark messages as read
    await Chat.updateMany(
      { 
        conversationId,
        receiverId: req.user.id,
        isRead: false
      },
      { 
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      data: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: messages.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all conversations for a user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    // Get all conversations where user is sender or receiver
    const conversations = await Chat.aggregate([
      {
        $match: {
          $or: [
            { senderId: req.user._id },
            { receiverId: req.user._id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', req.user._id] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Populate user details for each conversation
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await Chat.findById(conv.lastMessage._id)
          .populate('senderId', 'name profileDetails.profilePicture')
          .populate('receiverId', 'name profileDetails.profilePicture');

        const otherUserId = lastMessage.senderId._id.toString() === req.user.id 
          ? lastMessage.receiverId._id 
          : lastMessage.senderId._id;

        const otherUser = await User.findById(otherUserId)
          .select('name email role profileDetails.profilePicture');

        return {
          conversationId: conv._id,
          otherUser,
          lastMessage: {
            message: lastMessage.message,
            timestamp: lastMessage.createdAt,
            senderId: lastMessage.senderId._id
          },
          unreadCount: conv.unreadCount
        };
      })
    );

    res.json({
      success: true,
      data: populatedConversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/read/:conversationId
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    await Chat.updateMany(
      { 
        conversationId,
        receiverId: req.user.id,
        isRead: false
      },
      { 
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to check therapeutic relationship
const checkTherapeuticRelationship = async (userId1, userId2) => {
  const user1 = await User.findById(userId1);
  const user2 = await User.findById(userId2);

  if (!user1 || !user2) return false;

  // Admin can message anyone
  if (user1.role === 'admin' || user2.role === 'admin') return true;

  // Check if one is patient and other is therapist
  if ((user1.role === 'patient' && user2.role === 'therapist') ||
      (user1.role === 'therapist' && user2.role === 'patient')) {
    
    // Check if they have appointments together
    const Appointment = require('../models/Appointment');
    const appointments = await Appointment.find({
      $or: [
        { patientId: userId1, therapistId: userId2 },
        { patientId: userId2, therapistId: userId1 }
      ]
    });

    return appointments.length > 0;
  }

  return false;
};

module.exports = {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead
};