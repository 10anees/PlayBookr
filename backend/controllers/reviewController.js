const Review = require('../models/Review');
const Arena = require('../models/Arena');
const User = require('../models/User');
const Booking = require('../models/Booking');

// GET /api/reviews - Get all reviews with filters
exports.getAllReviews = async (req, res) => {
  try {
    const {
      arena,
      user,
      rating,
      sport,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (arena) {
      filter.arena = arena;
    }

    if (user) {
      filter.user = user;
    }

    if (rating) {
      filter.rating = parseInt(rating);
    }

    if (sport) {
      filter.sport = sport;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find(filter)
      .populate('user', 'name profileImage')
      .populate('arena', 'name location')
      .populate('booking', 'date startTime')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(filter);

    res.json({
      reviews,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + reviews.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/reviews/:id - Get single review
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'name profileImage city')
      .populate('arena', 'name location owner')
      .populate('booking', 'date startTime endTime');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/reviews - Create new review
exports.createReview = async (req, res) => {
  try {
    const {
      arenaId,
      rating,
      comment,
      photos,
      sport,
      bookingId
    } = req.body;

    // Validate arena
    const arena = await Arena.findById(arenaId);
    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    if (!arena.approved) {
      return res.status(400).json({ message: 'Cannot review unapproved arena' });
    }

    // Check if user already reviewed this arena
    const existingReview = await Review.findOne({
      arena: arenaId,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this arena' });
    }

    // Validate booking if provided
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      if (booking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to review this booking' });
      }

      if (booking.status !== 'completed') {
        return res.status(400).json({ message: 'Can only review completed bookings' });
      }
    }

    const reviewData = {
      arena: arenaId,
      user: req.user._id,
      booking: bookingId,
      rating,
      comment,
      photos: photos || [],
      sport,
      isVerified: !!bookingId // verified if linked to a booking
    };

    const review = new Review(reviewData);
    await review.save();

    // Update arena rating
    const allReviews = await Review.find({ arena: arenaId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allReviews.length;

    await Arena.findByIdAndUpdate(arenaId, {
      rating: Math.round(averageRating * 10) / 10, // round to 1 decimal
      totalReviews: allReviews.length
    });

    // Populate the created review
    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name profileImage')
      .populate('arena', 'name location')
      .populate('booking', 'date startTime');

    res.status(201).json(populatedReview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/reviews/:id - Update review
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user can update this review
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('user', 'name profileImage')
    .populate('arena', 'name location')
    .populate('booking', 'date startTime');

    // Update arena rating if rating changed
    if (req.body.rating && req.body.rating !== review.rating) {
      const allReviews = await Review.find({ arena: review.arena });
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / allReviews.length;

      await Arena.findByIdAndUpdate(review.arena, {
        rating: Math.round(averageRating * 10) / 10
      });
    }

    res.json(updatedReview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/reviews/:id - Delete review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user can delete this review
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.id);

    // Update arena rating
    const allReviews = await Review.find({ arena: review.arena });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

    await Arena.findByIdAndUpdate(review.arena, {
      rating: Math.round(averageRating * 10) / 10,
      totalReviews: allReviews.length
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/reviews/:id/helpful - Mark review as helpful
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const helpfulIndex = review.helpful.indexOf(req.user._id);
    
    if (helpfulIndex > -1) {
      // Remove from helpful
      review.helpful.splice(helpfulIndex, 1);
    } else {
      // Add to helpful
      review.helpful.push(req.user._id);
    }

    await review.save();

    res.json({ 
      message: helpfulIndex > -1 ? 'Removed from helpful' : 'Marked as helpful',
      helpfulCount: review.helpful.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/reviews/:id/report - Report review
exports.reportReview = async (req, res) => {
  try {
    const { reason } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot report your own review' });
    }

    review.reported = true;
    review.reportReason = reason;
    await review.save();

    res.json({ message: 'Review reported successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/reviews/arena/:arenaId - Get reviews for specific arena
exports.getArenaReviews = async (req, res) => {
  try {
    const { arenaId } = req.params;
    const { rating, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filter = { arena: arenaId };

    if (rating) {
      filter.rating = parseInt(rating);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find(filter)
      .populate('user', 'name profileImage')
      .populate('booking', 'date startTime')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(filter);

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { arena: arenaId } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    res.json({
      reviews,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + reviews.length < total,
        hasPrev: parseInt(page) > 1
      },
      ratingDistribution
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/reviews/my-reviews - Get user's reviews
exports.getMyReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ user: req.user._id })
      .populate('arena', 'name location')
      .populate('booking', 'date startTime')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ user: req.user._id });

    res.json({
      reviews,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + reviews.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}; 