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

// Protected routes
router.use(auth);

// Arena owner routes (specific routes first)
router.get('/my-arenas', requireAdminOrArenaOwner, getMyArenas);
router.post('/', requireAdminOrArenaOwner, createArena);

// Parameterized routes (after specific routes)
router.get('/:id', getArenaById);
router.put('/:id', updateArena);
router.delete('/:id', deleteArena);

// Admin routes
router.post('/:id/approve', requireAdmin, approveArena);

module.exports = router; 