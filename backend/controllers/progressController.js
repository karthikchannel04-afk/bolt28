const Progress = require('../models/Progress');
const User = require('../models/User');

// @desc    Add patient progress
// @route   POST /api/progress
// @access  Private (Patient only)
const addProgress = async (req, res) => {
  try {
    const {
      sessionId,
      therapyModule,
      activityType,
      progressScore,
      moodBefore,
      moodAfter,
      notes,
      completionTime
    } = req.body;

    // Validation
    if (!therapyModule || !activityType || progressScore === undefined) {
      return res.status(400).json({ 
        message: 'Please provide therapy module, activity type, and progress score' 
      });
    }

    if (progressScore < 0 || progressScore > 100) {
      return res.status(400).json({ message: 'Progress score must be between 0 and 100' });
    }

    // Calculate streak
    const lastProgress = await Progress.findOne({ 
      patientId: req.user.id 
    }).sort({ createdAt: -1 });

    let streakDay = 1;
    if (lastProgress) {
      const lastDate = new Date(lastProgress.createdAt).toDateString();
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      
      if (lastDate === yesterday) {
        streakDay = lastProgress.streakDay + 1;
      } else if (lastDate === today) {
        streakDay = lastProgress.streakDay;
      }
    }

    // Create progress entry
    const progress = new Progress({
      patientId: req.user.id,
      sessionId,
      therapyModule,
      activityType,
      progressScore,
      moodBefore,
      moodAfter,
      notes,
      completionTime,
      streakDay
    });

    await progress.save();

    // Check for achievements
    const achievements = await checkAchievements(req.user.id, progress);
    if (achievements.length > 0) {
      progress.achievements = achievements;
      await progress.save();
    }

    res.status(201).json({
      message: 'Progress recorded successfully',
      progress,
      achievements
    });
  } catch (error) {
    console.error('Add progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get progress by patient ID
// @route   GET /api/progress/patient/:patientId
// @access  Private (Patient, their therapist, or admin)
const getProgressByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { therapyModule, startDate, endDate, limit = 50 } = req.query;

    // Check permissions
    const isOwnProgress = req.user.id === patientId;
    const isAdmin = req.user.role === 'admin';
    
    // Check if requesting user is patient's therapist
    let isTherapist = false;
    if (req.user.role === 'therapist') {
      const appointments = await Appointment.find({
        patientId,
        therapistId: req.user.id
      });
      isTherapist = appointments.length > 0;
    }

    if (!isOwnProgress && !isTherapist && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let query = { patientId };
    
    if (therapyModule) {
      query.therapyModule = therapyModule;
    }
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const progressEntries = await Progress.find(query)
      .populate('sessionId', 'date time status')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Calculate summary statistics
    const totalEntries = progressEntries.length;
    const averageScore = totalEntries > 0 
      ? progressEntries.reduce((sum, entry) => sum + entry.progressScore, 0) / totalEntries 
      : 0;
    
    const currentStreak = progressEntries.length > 0 ? progressEntries[0].streakDay : 0;
    
    const moduleProgress = {};
    progressEntries.forEach(entry => {
      if (!moduleProgress[entry.therapyModule]) {
        moduleProgress[entry.therapyModule] = 0;
      }
      moduleProgress[entry.therapyModule]++;
    });

    res.json({
      success: true,
      data: {
        entries: progressEntries,
        summary: {
          totalEntries,
          averageScore: Math.round(averageScore * 10) / 10,
          currentStreak,
          moduleProgress
        }
      }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get progress analytics
// @route   GET /api/progress/analytics/:patientId
// @access  Private (Patient, their therapist, or admin)
const getProgressAnalytics = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { period = '30' } = req.query; // days

    // Check permissions (same as getProgressByPatient)
    const isOwnProgress = req.user.id === patientId;
    const isAdmin = req.user.role === 'admin';
    
    let isTherapist = false;
    if (req.user.role === 'therapist') {
      const appointments = await Appointment.find({
        patientId,
        therapistId: req.user.id
      });
      isTherapist = appointments.length > 0;
    }

    if (!isOwnProgress && !isTherapist && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const progressEntries = await Progress.find({
      patientId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    // Generate analytics
    const analytics = {
      totalSessions: progressEntries.length,
      averageScore: progressEntries.length > 0 
        ? Math.round((progressEntries.reduce((sum, entry) => sum + entry.progressScore, 0) / progressEntries.length) * 10) / 10
        : 0,
      moodImprovement: calculateMoodImprovement(progressEntries),
      moduleBreakdown: calculateModuleBreakdown(progressEntries),
      weeklyTrends: calculateWeeklyTrends(progressEntries),
      achievements: getAllAchievements(progressEntries)
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get progress analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to check achievements
const checkAchievements = async (patientId, currentProgress) => {
  const achievements = [];
  
  // Get all progress for this patient
  const allProgress = await Progress.find({ patientId }).sort({ createdAt: -1 });
  
  // 7-day streak achievement
  if (currentProgress.streakDay === 7) {
    achievements.push({
      name: '7-Day Streak',
      earnedAt: new Date()
    });
  }
  
  // Module completion achievements
  const moduleCount = allProgress.filter(p => p.therapyModule === currentProgress.therapyModule).length;
  if (moduleCount === 10) {
    achievements.push({
      name: `${currentProgress.therapyModule.toUpperCase()} Master`,
      earnedAt: new Date()
    });
  }
  
  // High score achievement
  if (currentProgress.progressScore >= 90) {
    achievements.push({
      name: 'Excellence Award',
      earnedAt: new Date()
    });
  }
  
  return achievements;
};

// Helper functions for analytics
const calculateMoodImprovement = (entries) => {
  const entriesWithMood = entries.filter(e => e.moodBefore && e.moodAfter);
  if (entriesWithMood.length === 0) return 0;
  
  const totalImprovement = entriesWithMood.reduce((sum, entry) => 
    sum + (entry.moodAfter - entry.moodBefore), 0
  );
  
  return Math.round((totalImprovement / entriesWithMood.length) * 10) / 10;
};

const calculateModuleBreakdown = (entries) => {
  const breakdown = {};
  entries.forEach(entry => {
    if (!breakdown[entry.therapyModule]) {
      breakdown[entry.therapyModule] = 0;
    }
    breakdown[entry.therapyModule]++;
  });
  return breakdown;
};

const calculateWeeklyTrends = (entries) => {
  const weeks = {};
  entries.forEach(entry => {
    const week = getWeekKey(entry.createdAt);
    if (!weeks[week]) {
      weeks[week] = { sessions: 0, totalScore: 0 };
    }
    weeks[week].sessions++;
    weeks[week].totalScore += entry.progressScore;
  });
  
  return Object.keys(weeks).map(week => ({
    week,
    sessions: weeks[week].sessions,
    averageScore: Math.round((weeks[week].totalScore / weeks[week].sessions) * 10) / 10
  }));
};

const getAllAchievements = (entries) => {
  const achievements = [];
  entries.forEach(entry => {
    if (entry.achievements && entry.achievements.length > 0) {
      achievements.push(...entry.achievements);
    }
  });
  return achievements;
};

const getWeekKey = (date) => {
  const d = new Date(date);
  const week = Math.ceil((d.getDate() - d.getDay()) / 7);
  return `${d.getFullYear()}-${d.getMonth() + 1}-W${week}`;
};

module.exports = {
  addProgress,
  getProgressByPatient,
  getProgressAnalytics
};