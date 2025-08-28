// src/utils/activityLogger.js
const ActivityLog = require('../models/ActivityLog');

async function logActivity(taskId, userId, action, details = '') {
  try {
    await ActivityLog.create({
      task: taskId,
      user: userId,
      action,
      details
    });
  } catch (err) {
    // logging failure should not crash the app
    console.error('Failed to log activity:', err.message || err);
  }
}

module.exports = { logActivity };
