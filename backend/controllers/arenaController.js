const Arena = require('../models/Arena');
const Review = require('../models/Review');
const Booking = require('../models/Booking');

// GET /api/arenas - Get all arenas with filters
exports.getAllArenas = async (req, res) => {
  try {
    const {
      sport,
      city,
      minRating,
      maxPrice,
      available,
      date,
      time,
      page = 1,
      limit = 10,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query;

    const filter = { approved: true, isActive: true };

    // Sport filter
    if (sport) {
      filter.sports = { $in: [sport] };
    }

    // City filter
    if (city) {
      filter['location.city'] = { $regex: city, $options: 'i' };
    }

    // Rating filter
    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }

    // Price filter
    if (maxPrice) {
      filter.pricePerHour = { $lte: parseFloat(maxPrice) };
    }

    // Availability filter
    if (available === 'true' && date && time) {
      const targetDate = new Date(date);
      const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
      
      // Find arenas that have the specified time slot available
      const conflictingBookings = await Booking.find({
        date: targetDate,
        startTime: { $lte: time },
        endTime: { $gt: time },
        status: { $in: ['confirmed', 'pending'] }
      }).distinct('arena');

      filter._id = { $nin: conflictingBookings };
      filter['availability.day'] = dayOfWeek;
      filter['availability.slots'] = { $regex: time };
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const arenas = await Arena.find(filter)
      .populate('owner', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Arena.countDocuments(filter);

    res.json({
      arenas,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + arenas.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/arenas/:id - Get single arena
exports.getArenaById = async (req, res) => {
  try {
    const arena = await Arena.findById(req.params.id)
      .populate('owner', 'name email city')
      .populate({
        path: 'reviews',
        populate: { path: 'user', select: 'name profileImage' }
      });

    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    // Get reviews for this arena
    const reviews = await Review.find({ arena: req.params.id })
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get upcoming bookings
    const upcomingBookings = await Booking.find({
      arena: req.params.id,
      date: { $gte: new Date() },
      status: { $in: ['confirmed', 'pending'] }
    })
    .populate('user', 'name')
    .populate('team', 'name')
    .sort({ date: 1, startTime: 1 })
    .limit(5);

    res.json({
      arena,
      reviews,
      upcomingBookings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/arenas - Create new arena (arena owners only)
exports.createArena = async (req, res) => {
  try {
    if (req.user.role !== 'arena_owner' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only arena owners can create arenas' });
    }

    const arenaData = {
      ...req.body,
      owner: req.user._id,
      approved: req.user.role === 'admin' // auto-approve for admins
    };

    const arena = new Arena(arenaData);
    await arena.save();

    res.status(201).json(arena);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Arena with this name already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/arenas/:id - Update arena
exports.updateArena = async (req, res) => {
  try {
    const arena = await Arena.findById(req.params.id);

    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    // Check ownership or admin
    if (arena.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this arena' });
    }

    const updatedArena = await Arena.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedArena);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/arenas/:id - Delete arena
exports.deleteArena = async (req, res) => {
  try {
    const arena = await Arena.findById(req.params.id);

    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    // Check ownership or admin
    if (arena.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this arena' });
    }

    // Check if there are active bookings
    const activeBookings = await Booking.find({
      arena: req.params.id,
      status: { $in: ['pending', 'confirmed'] },
      date: { $gte: new Date() }
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete arena with active bookings' 
      });
    }

    await Arena.findByIdAndDelete(req.params.id);
    res.json({ message: 'Arena deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/arenas/my-arenas - Get arenas owned by current user
exports.getMyArenas = async (req, res) => {
  try {
    if (req.user.role !== 'arena_owner' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only arena owners can access this endpoint' });
    }

    const arenas = await Arena.find({ owner: req.user._id })
      .sort({ createdAt: -1 });

    res.json(arenas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/arenas/:id/approve - Approve arena (admin only)
exports.approveArena = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can approve arenas' });
    }

    const arena = await Arena.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );

    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    res.json(arena);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/arenas/search/nearby - Search arenas by location
exports.searchNearbyArenas = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000, sport } = req.query; // maxDistance in meters

    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'Longitude and latitude are required' });
    }

    const filter = {
      approved: true,
      isActive: true,
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    };

    if (sport) {
      filter.sports = { $in: [sport] };
    }

    const arenas = await Arena.find(filter)
      .populate('owner', 'name email')
      .limit(20);

    res.json(arenas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}; 