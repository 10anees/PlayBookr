const express = require('express');
const router = express.Router();

const {
  getAllMatches,
  getMatchById,
  createMatch,
  acceptMatch,
  rejectMatch,
  updateMatch,
  startMatch,
  completeMatch,
  addMatchFeedback,
  getMyMatches
} = require('../controllers/matchController');

const auth = require('../middleware/authMiddleware');
const { requireMatchAccess } = require('../middleware/roleMiddleware');

// Public routes
router.get('/', getAllMatches);

// Protected routes
router.use(auth);

// Match management routes (specific routes first)
router.get('/my-matches', getMyMatches);
router.post('/', createMatch);

// Parameterized routes (after specific routes)
router.get('/:id', getMatchById);
router.put('/:id', updateMatch);

// Match challenge routes
router.post('/:id/accept', acceptMatch);
router.post('/:id/reject', rejectMatch);

// Match gameplay routes
router.post('/:id/start', startMatch);
router.post('/:id/complete', completeMatch);
router.post('/:id/feedback', addMatchFeedback);

module.exports = router; 