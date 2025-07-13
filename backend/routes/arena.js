const express = require('express');
const router = express.Router();

const {
  getAllArenas,
  getArenaById,
  createArena,
  updateArena,
  deleteArena,
  getMyArenas,
  approveArena,
  searchNearbyArenas
} = require('../controllers/arenaController');

const auth = require('../middleware/authMiddleware');
const { requireAdminOrArenaOwner, requireAdmin } = require('../middleware/roleMiddleware');

// Public routes
router.get('/', getAllArenas);
router.get('/search/nearby', searchNearbyArenas);
router.get('/:id', getArenaById);

// Protected routes
router.use(auth);

// Arena owner routes
router.get('/my-arenas', requireAdminOrArenaOwner, getMyArenas);
router.post('/', requireAdminOrArenaOwner, createArena);
router.put('/:id', updateArena);
router.delete('/:id', deleteArena);

// Admin routes
router.post('/:id/approve', requireAdmin, approveArena);

module.exports = router; 