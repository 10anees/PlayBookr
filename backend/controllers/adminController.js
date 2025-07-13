const User = require('../models/User');
const Arena = require('../models/Arena');
const Review = require('../models/Review');
const Team = require('../models/Team');
const Match = require('../models/Match');
const Tournament = require('../models/Tournament');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

// GET /api/admin/dashboard - Get admin dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // User stats
    const totalUsers = await User.countDocuments();
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thisMonth }
    });
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Arena stats
    const totalArenas = await Arena.countDocuments();
    const pendingArenas = await Arena.countDocuments({ approved: false });
    const approvedArenas = await Arena.countDocuments({ approved: true });

    // Booking stats
    const totalBookings = await Booking.countDocuments();
    const bookingsThisMonth = await Booking.countDocuments({
      createdAt: { $gte: thisMonth }
    });
    const activeBookings = await Booking.countDocuments({
      status: { $in: ['pending', 'confirmed'] },
      date: { $gte: now }
    });

    // Match stats
    const totalMatches = await Match.countDocuments();
    const completedMatches = await Match.countDocuments({ status: 'completed' });
    const upcomingMatches = await Match.countDocuments({
      status: 'scheduled',
      date: { $gte: now }
    });

    // Tournament stats
    const totalTournaments = await Tournament.countDocuments();
    const activeTournaments = await Tournament.countDocuments({
      status: { $in: ['open', 'in_progress'] }
    });

    // Revenue stats (if you have payment tracking)
    const revenueThisMonth = 0; // Placeholder - implement based on your payment system

    // Recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    const recentArenas = await Arena.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name owner approved createdAt');

    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('arena', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('user arena totalAmount status createdAt');

    res.json({
      stats: {
        users: {
          total: totalUsers,
          newThisMonth: newUsersThisMonth,
          byRole: usersByRole
        },
        arenas: {
          total: totalArenas,
          pending: pendingArenas,
          approved: approvedArenas
        },
        bookings: {
          total: totalBookings,
          thisMonth: bookingsThisMonth,
          active: activeBookings
        },
        matches: {
          total: totalMatches,
          completed: completedMatches,
          upcoming: upcomingMatches
        },
        tournaments: {
          total: totalTournaments,
          active: activeTournaments
        },
        revenue: {
          thisMonth: revenueThisMonth
        }
      },
      recentActivity: {
        users: recentUsers,
        arenas: recentArenas,
        bookings: recentBookings
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/users - Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const {
      role,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .select('-password -refreshToken')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + users.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/admin/users/:id - Update user (admin only)
exports.updateUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { role, isActive } = req.body;
    const updates = {};

    if (role) {
      updates.role = role;
    }

    if (isActive !== undefined) {
      updates.isActive = isActive;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/admin/users/:id - Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has active bookings, matches, etc.
    const activeBookings = await Booking.find({
      user: req.params.id,
      status: { $in: ['pending', 'confirmed'] },
      date: { $gte: new Date() }
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete user with active bookings' 
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/arenas - Get all arenas (admin only)
exports.getAllArenas = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const {
      approved,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (approved !== undefined) {
      filter.approved = approved === 'true';
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } }
      ];
    }

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

// POST /api/admin/arenas/:id/approve - Approve arena (admin only)
exports.approveArena = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const arena = await Arena.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    ).populate('owner', 'name email');

    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    // Create notification for arena owner
    await Notification.create({
      recipient: arena.owner._id,
      sender: req.user._id,
      type: 'admin_approval',
      title: 'Arena Approved',
      message: `Your arena "${arena.name}" has been approved`,
      arena: arena._id
    });

    res.json(arena);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/admin/arenas/:id/reject - Reject arena (admin only)
exports.rejectArena = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { reason } = req.body;
    const arena = await Arena.findByIdAndUpdate(
      req.params.id,
      { approved: false },
      { new: true }
    ).populate('owner', 'name email');

    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    // Create notification for arena owner
    await Notification.create({
      recipient: arena.owner._id,
      sender: req.user._id,
      type: 'admin_rejection',
      title: 'Arena Rejected',
      message: `Your arena "${arena.name}" has been rejected`,
      arena: arena._id,
      data: { reason }
    });

    res.json(arena);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/reviews - Get all reviews (admin only)
exports.getAllReviews = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const {
      reported,
      rating,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (reported !== undefined) {
      filter.reported = reported === 'true';
    }

    if (rating) {
      filter.rating = parseInt(rating);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find(filter)
      .populate('user', 'name email')
      .populate('arena', 'name')
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

// DELETE /api/admin/reviews/:id - Delete review (admin only)
exports.deleteReview = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
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

// GET /api/admin/leaderboard - Get leaderboard stats (admin only)
exports.getLeaderboardStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { sport, city, limit = 20 } = req.query;

    const filter = { isActive: true };

    if (sport) {
      filter.sport = sport;
    }

    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }

    // Top teams by wins
    const topTeams = await Team.find(filter)
      .populate('captain', 'name')
      .sort({ wins: -1, total_matches: -1 })
      .limit(parseInt(limit));

    // Top goal scorers (for futsal)
    const topGoalScorers = await Match.aggregate([
      { $match: { sport: 'futsal', status: 'completed' } },
      { $unwind: '$playerStats' },
      { $group: { _id: '$playerStats.player', totalGoals: { $sum: '$playerStats.goals' } } },
      { $sort: { totalGoals: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'player'
        }
      },
      { $unwind: '$player' },
      { $project: { player: 1, totalGoals: 1 } }
    ]);

    // Top run scorers (for cricket)
    const topRunScorers = await Match.aggregate([
      { $match: { sport: 'cricket', status: 'completed' } },
      { $unwind: '$playerStats' },
      { $group: { _id: '$playerStats.player', totalRuns: { $sum: '$playerStats.runs' } } },
      { $sort: { totalRuns: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'player'
        }
      },
      { $unwind: '$player' },
      { $project: { player: 1, totalRuns: 1 } }
    ]);

    // Top wicket takers (for cricket)
    const topWicketTakers = await Match.aggregate([
      { $match: { sport: 'cricket', status: 'completed' } },
      { $unwind: '$playerStats' },
      { $group: { _id: '$playerStats.player', totalWickets: { $sum: '$playerStats.wickets' } } },
      { $sort: { totalWickets: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'player'
        }
      },
      { $unwind: '$player' },
      { $project: { player: 1, totalWickets: 1 } }
    ]);

    res.json({
      topTeams,
      topGoalScorers,
      topRunScorers,
      topWicketTakers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/reports - Get system reports (admin only)
exports.getSystemReports = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { type, startDate, endDate } = req.query;

    const filter = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let reportData = {};

    switch (type) {
      case 'bookings':
        reportData = await Booking.aggregate([
          { $match: filter },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 },
              totalRevenue: { $sum: '$totalAmount' }
            }
          },
          { $sort: { _id: 1 } }
        ]);
        break;

      case 'users':
        reportData = await User.aggregate([
          { $match: filter },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]);
        break;

      case 'matches':
        reportData = await Match.aggregate([
          { $match: filter },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]);
        break;

      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    res.json(reportData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}; 