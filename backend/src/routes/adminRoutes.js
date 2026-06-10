const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');
const {
  getStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllTasks,
  deleteAnyTask,
  getActivityLogs,
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/tasks', getAllTasks);
router.delete('/tasks/:id', deleteAnyTask);
router.get('/activity-logs', getActivityLogs);

module.exports = router;
