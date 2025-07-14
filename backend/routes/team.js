const express = require('express');
const router = express.Router();

const {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
  getMyTeams,
  getLeaderboard
} = require('../controllers/teamController');

const auth = require('../middleware/authMiddleware');
const { requirePlayer, requireTeamAccess } = require('../middleware/roleMiddleware');

// Public routes
router.get('/', getAllTeams);
router.get('/leaderboard', getLeaderboard);

// Protected routes
router.use(auth);

// Player routes (specific routes first)
router.get('/my-teams', requirePlayer, getMyTeams);
router.post('/', requirePlayer, createTeam);

// Parameterized routes (after specific routes)
router.get('/:id', getTeamById);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);

// Team management routes
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

module.exports = router; 