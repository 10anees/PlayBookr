const express = require('express');
const router = express.Router();

const {
  getAllTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  registerTeam,
  acceptTeam,
  rejectTeam,
  startTournament,
  getMyTournaments,
  getParticipatingTournaments
} = require('../controllers/tournamentController');

const auth = require('../middleware/authMiddleware');
const { requireAdminOrArenaOwner, requireTournamentAccess } = require('../middleware/roleMiddleware');

// Public routes
router.get('/', getAllTournaments);
router.get('/:id', getTournamentById);

// Protected routes
router.use(auth);

// Tournament management routes
router.get('/my-tournaments', requireAdminOrArenaOwner, getMyTournaments);
router.get('/participating', getParticipatingTournaments);
router.post('/', requireAdminOrArenaOwner, createTournament);
router.put('/:id', updateTournament);
router.delete('/:id', deleteTournament);

// Tournament participation routes
router.post('/:id/register', registerTeam);
router.post('/:id/accept', acceptTeam);
router.post('/:id/reject', rejectTeam);
router.post('/:id/start', startTournament);

module.exports = router; 