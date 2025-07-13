const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllArenas,
  approveArena,
  rejectArena,
  getAllReviews,
  deleteReview,
  getLeaderboardStats,
  getSystemReports
} = require('../controllers/adminController');

const auth = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

// All admin routes require authentication and admin role
router.use(auth);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Arena management
router.get('/arenas', getAllArenas);
router.post('/arenas/:id/approve', approveArena);
router.post('/arenas/:id/reject', rejectArena);

// Review management
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

// Statistics and reports
router.get('/leaderboard', getLeaderboardStats);
router.get('/reports', getSystemReports);

module.exports = router; 