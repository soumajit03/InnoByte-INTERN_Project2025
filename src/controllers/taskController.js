const mongoose = require('mongoose');
const Task = require('../models/Task');
const { logActivity } = require('../utils/activityLogger'); 
const { notifyUser } = require('../utils/notify');

exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, assignedTo } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    const task = await Task.create({
      title,
      description,
      dueDate,
      assignedTo,
      createdBy: req.user._id
    });

    await logActivity(task._id, req.user._id, 'Task Created', `Task "${task.title}" created`);
    if (task.assignedTo) {
      await notifyUser(task.assignedTo, `You have been assigned a new task: ${task.title}`, task._id);
    }

    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { status, title, dueDate, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (dueDate) filter.dueDate = new Date(dueDate);

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Task.countDocuments(filter);
    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Task ID' });
    }
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Task ID' });
    }
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (
      task.createdBy.toString() !== req.user._id.toString() &&
      (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
    }

    const old = {
      status: task.status,
      assignedTo: task.assignedTo ? task.assignedTo.toString() : null,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      title: task.title,
      description: task.description
    };

    Object.assign(task, req.body);
    await task.save();

    if (old.status !== task.status) {
      await logActivity(task._id, req.user._id, 'Status Updated', `${old.status} → ${task.status}`);
      if (task.assignedTo) {
        await notifyUser(task.assignedTo, `Task "${task.title}" status changed to ${task.status}`, task._id);
      }
    }
    const newAssigned = task.assignedTo ? task.assignedTo.toString() : null;
    if (old.assignedTo !== newAssigned) {
      await logActivity(task._id, req.user._id, 'Assigned Changed', `${old.assignedTo || 'unassigned'} → ${newAssigned || 'unassigned'}`);
    }
    const newDue = task.dueDate ? task.dueDate.toISOString() : null;
    if (old.dueDate !== newDue) {
      await logActivity(task._id, req.user._id, 'DueDate Updated', `${old.dueDate || 'none'} → ${newDue || 'none'}`);
      if (task.assignedTo) {
        await notifyUser(task.assignedTo, `Task "${task.title}" due date updated`, task._id);
      }
    }
    if (old.title !== task.title) {
      await logActivity(task._id, req.user._id, 'Title Updated', `Title changed`);
    }
    if (old.description !== task.description) {
      await logActivity(task._id, req.user._id, 'Description Updated', `Description changed`);
    }

    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Task ID' });
    }
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only creator can delete this task' });
    }
    await task.deleteOne();
    await logActivity(task._id, req.user._id, 'Task Deleted', `Task "${task.title}" deleted`);
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('createdBy', 'name email')
      .lean();
    res.json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.uploadAttachment = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (
      task.createdBy.toString() !== req.user._id.toString() &&
      (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const webPath = `/uploads/${req.file.filename}`;
    task.attachments.push(webPath);
    await task.save();
    await logActivity(task._id, req.user._id, 'File Uploaded', req.file.filename);
    if (task.createdBy.toString() !== req.user._id.toString()) {
      await notifyUser(task.createdBy, `A file was uploaded to task "${task.title}"`, task._id);
    }
    if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
      await notifyUser(task.assignedTo, `A file was uploaded to task "${task.title}"`, task._id);
    }
    const absoluteUrl = `${req.protocol}://${req.get('host')}${webPath}`;
    res.json({ success: true, message: 'File uploaded', file: webPath, fileUrl: absoluteUrl, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    const comment = { user: req.user._id, text: req.body.text };
    task.comments.push(comment);
    await task.save();
    await logActivity(task._id, req.user._id, 'Comment Added', req.body.text);
    if (task.createdBy.toString() !== req.user._id.toString()) {
      await notifyUser(task.createdBy, `New comment on your task "${task.title}"`, task._id);
    }
    if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
      await notifyUser(task.assignedTo, `New comment on task "${task.title}"`, task._id);
    }
    res.json({ success: true, message: 'Comment added', comments: task.comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const taskWithComment = await Task.findOne(
      { _id: taskId, 'comments._id': commentId },
      { 'comments.$': 1 }
    );
    if (!taskWithComment || !taskWithComment.comments || !taskWithComment.comments.length) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    const comment = taskWithComment.comments[0];
    if (String(comment.user) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }
    await Task.updateOne({ _id: taskId }, { $pull: { comments: { _id: commentId } } });
    await logActivity(taskId, req.user._id, 'Comment Deleted', comment.text || '');
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
