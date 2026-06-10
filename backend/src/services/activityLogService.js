const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ userId, action, description, metadata = {}, ipAddress }) => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      description,
      metadata,
      ipAddress,
    });
  } catch (err) {
    // Logging failure should never crash the main request
    console.error('ActivityLog write error:', err.message);
  }
};

module.exports = { logActivity };
