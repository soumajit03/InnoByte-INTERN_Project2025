// src/routes/activity.routes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');

// Get logs for a task (most recent first)
router.get('/task/:taskId', protect, async (req, res) => {
  try {
    const logs = await ActivityLog.find({ task: req.params.taskId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
