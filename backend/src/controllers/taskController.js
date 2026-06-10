const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const { logActivity } = require('../services/activityLogService');

const getTasks = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;
    const filter = { owner: req.user._id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const skip = (Number(page) - 1) * Number(limit);
    const [tasks, total] = await Promise.all([
      Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Task.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, total, page: Number(page), tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch tasks.', error: err.message });
  }
};

const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, status, priority, dueDate } = req.body;
    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      owner: req.user._id,
    });

    await logActivity({
      userId: req.user._id,
      action: 'TASK_CREATED',
      description: `Task created: "${task.title}"`,
      metadata: { taskId: task._id, title: task.title },
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, message: 'Task created.', task });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create task.', error: err.message });
  }
};

const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    res.status(200).json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch task.', error: err.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Ownership enforced at DB query level — cannot be bypassed by frontend
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found or access denied.' });
    }

    await logActivity({
      userId: req.user._id,
      action: 'TASK_UPDATED',
      description: `Task updated: "${task.title}"`,
      metadata: { taskId: task._id, changes: req.body },
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: 'Task updated.', task });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update task.', error: err.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found or access denied.' });
    }

    await logActivity({
      userId: req.user._id,
      action: 'TASK_DELETED',
      description: `Task deleted: "${task.title}"`,
      metadata: { taskId: task._id, title: task.title },
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete task.', error: err.message });
  }
};

module.exports = { getTasks, createTask, getTask, updateTask, deleteTask };
