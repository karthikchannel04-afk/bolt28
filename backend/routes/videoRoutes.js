const express = require('express');
const router = express.Router();
const {
  createVideoSession,
  getVideoSession,
  updateSessionStatus,
  joinVideoSession
} = require('../controllers/videoController');
const { auth, authorize } = require('../middleware/auth');

// @route   POST /api/video/create
router.post('/create', auth, authorize('patient', 'therapist'), createVideoSession);

// @route   GET /api/video/session/:roomId
router.get('/session/:roomId', auth, getVideoSession);

// @route   PUT /api/video/session/:roomId/status
router.put('/session/:roomId/status', auth, updateSessionStatus);

// @route   POST /api/video/join/:roomId
router.post('/join/:roomId', auth, joinVideoSession);

module.exports = router;