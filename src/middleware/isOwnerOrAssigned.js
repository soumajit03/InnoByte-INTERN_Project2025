const Task = require('../models/Task');

const isOwnerOrAssigned = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const userId = req.user._id.toString();

    if (
      task.createdBy.toString() === userId ||
      (task.assignedTo && task.assignedTo.toString() === userId)
    ) {
      req.task = task; // attach task to request for controller use
      return next();
    }

    return res.status(403).json({ success: false, message: 'Not authorized for this task' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = isOwnerOrAssigned;
