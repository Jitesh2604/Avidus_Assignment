const User = require('../models/User');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const { logActivity } = require('../services/activityLogService');

const serverError = (res, message, err) =>
  res.status(500).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { error: err.message }),
  });

// GET /admin/stats
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalTasks, completedTasks, pendingTasks, inProgressTasks] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Task.countDocuments(),
      Task.countDocuments({ status: 'completed' }),
      Task.countDocuments({ status: 'pending' }),
      Task.countDocuments({ status: 'in-progress' }),
    ]);

    res.status(200).json({
      success: true,
      stats: { totalUsers, totalTasks, completedTasks, pendingTasks, inProgressTasks },
    });
  } catch (err) {
    serverError(res, 'Failed to fetch stats.', err);
  }
};

// GET /admin/users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, role } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (role) filter.role = role;

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, total, page: Number(page), users });
  } catch (err) {
    serverError(res, 'Failed to fetch users.', err);
  }
};

// PATCH /admin/users/:id/status
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot change your own status.' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await logActivity({
      userId: req.user._id,
      action: 'USER_STATUS_UPDATED',
      description: `Admin updated status of ${user.name} (${user.email}) to ${status}`,
      metadata: { targetUserId: user._id, newStatus: status },
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: `User status updated to ${status}.`, user });
  } catch (err) {
    serverError(res, 'Failed to update user status.', err);
  }
};

// DELETE /admin/users/:id
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Cascade delete user's tasks
    await Task.deleteMany({ owner: user._id });
    await user.deleteOne();

    await logActivity({
      userId: req.user._id,
      action: 'USER_DELETED',
      description: `Admin deleted user: ${user.name} (${user.email})`,
      metadata: { deletedUserId: user._id, deletedUserEmail: user.email },
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: 'User and their tasks deleted.' });
  } catch (err) {
    serverError(res, 'Failed to delete user.', err);
  }
};

// GET /admin/tasks
const getAllTasks = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const skip = (Number(page) - 1) * Number(limit);
    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('owner', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Task.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, total, page: Number(page), tasks });
  } catch (err) {
    serverError(res, 'Failed to fetch tasks.', err);
  }
};

// DELETE /admin/tasks/:id
const deleteAnyTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await task.deleteOne();

    await logActivity({
      userId: req.user._id,
      action: 'TASK_DELETED',
      description: `Admin deleted task: "${task.title}"`,
      metadata: { taskId: task._id, taskOwner: task.owner },
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: 'Task deleted by admin.' });
  } catch (err) {
    serverError(res, 'Failed to delete task.', err);
  }
};

// GET /admin/activity-logs
const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, userId } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (userId) filter.user = userId;

    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate('user', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ActivityLog.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, total, page: Number(page), logs });
  } catch (err) {
    serverError(res, 'Failed to fetch activity logs.', err);
  }
};

module.exports = { getStats, getAllUsers, updateUserStatus, deleteUser, getAllTasks, deleteAnyTask, getActivityLogs };
