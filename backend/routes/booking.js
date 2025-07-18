const express = require('express');
const router = express.Router();

const {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
  confirmBooking,
  completeBooking,
  getMyBookings,
  getArenaBookings
} = require('../controllers/bookingController');

const auth = require('../middleware/authMiddleware');
const { requireBookingAccess } = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(auth);

// Booking management routes (specific routes first)
router.get('/', getAllBookings);
router.get('/my-bookings', getMyBookings);
router.get('/arena/:arenaId', getArenaBookings);
router.post('/', createBooking);

// Parameterized routes (after specific routes)
router.get('/:id', getBookingById);
router.put('/:id', updateBooking);
router.delete('/:id', cancelBooking);

// Arena owner routes
router.post('/:id/confirm', confirmBooking);
router.post('/:id/complete', completeBooking);

module.exports = router; 