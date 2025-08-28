const Notification = require('../models/Notification');

exports.notifyUser = async (userId, message, taskId = null) => {
  try {
    const notification = await Notification.create({
      user: userId,
      message,
      task: taskId
    });
    return notification;
  } catch (err) {
    console.error('Notify Error:', err.message);
  }
};
