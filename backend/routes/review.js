const express = require('express');
const router = express.Router();

const {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
  reportReview,
  getArenaReviews,
  getMyReviews
} = require('../controllers/reviewController');

const auth = require('../middleware/authMiddleware');
const { requireReviewAccess } = require('../middleware/roleMiddleware');

// Public routes
router.get('/', getAllReviews);
router.get('/:id', getReviewById);
router.get('/arena/:arenaId', getArenaReviews);

// Protected routes
router.use(auth);

// Review management routes
router.get('/my-reviews', getMyReviews);
router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

// Review interaction routes
router.post('/:id/helpful', markHelpful);
router.post('/:id/report', reportReview);

module.exports = router; 