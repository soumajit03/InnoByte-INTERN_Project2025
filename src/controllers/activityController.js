const ActivityLog = require('../models/ActivityLog');

exports.getTaskLogs = async (req, res) => {
  try {
    const { taskId } = req.params;
    const logs = await ActivityLog.find({ task: taskId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find({ user: req.user._id })
      .populate('task', 'title')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
