const Booking = require('../models/Booking');
const Arena = require('../models/Arena');
const User = require('../models/User');
const Team = require('../models/Team');
const Notification = require('../models/Notification');

// GET /api/bookings - Get all bookings (with filters)
exports.getAllBookings = async (req, res) => {
  try {
    const {
      status,
      arena,
      user,
      date,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (arena) {
      filter.arena = arena;
    }

    if (user) {
      filter.user = user;
    }

    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.date = { $gte: targetDate, $lt: nextDay };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(filter)
      .populate('arena', 'name location')
      .populate('user', 'name email')
      .populate('team', 'name')
      .sort({ date: -1, startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.json({
      bookings,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + bookings.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/bookings/:id - Get single booking
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('arena', 'name location pricePerHour owner')
      .populate('user', 'name email')
      .populate('team', 'name captain members')
      .populate('arena.owner', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/bookings - Create new booking
exports.createBooking = async (req, res) => {
  try {
    const {
      arenaId,
      date,
      startTime,
      endTime,
      teamId,
      advancePayment,
      notes
    } = req.body;

    // Validate arena
    const arena = await Arena.findById(arenaId);
    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    if (!arena.approved) {
      return res.status(400).json({ message: 'Arena is not approved yet' });
    }

    // Validate date and time
    const bookingDate = new Date(date);
    const now = new Date();
    
    if (bookingDate < now) {
      return res.status(400).json({ message: 'Cannot book for past dates' });
    }

    // Check if time slot is available
    const conflictingBooking = await Booking.findOne({
      arena: arenaId,
      date: bookingDate,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: 'Time slot is already booked' });
    }

    // Calculate duration and total amount
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const duration = (end - start) / (1000 * 60 * 60); // hours
    const totalAmount = duration * arena.pricePerHour;

    // Validate advance payment
    if (advancePayment && advancePayment > totalAmount) {
      return res.status(400).json({ message: 'Advance payment cannot exceed total amount' });
    }

    const bookingData = {
      arena: arenaId,
      user: req.user._id,
      team: teamId,
      date: bookingDate,
      startTime,
      endTime,
      duration,
      totalAmount,
      advancePayment: advancePayment || 0,
      notes
    };

    const booking = new Booking(bookingData);
    await booking.save();

    // Populate the created booking
    const populatedBooking = await Booking.findById(booking._id)
      .populate('arena', 'name location pricePerHour owner')
      .populate('user', 'name email')
      .populate('team', 'name');

    // Create notification for arena owner
    await Notification.create({
      recipient: arena.owner,
      sender: req.user._id,
      type: 'booking_confirmed',
      title: 'New Booking Request',
      message: `New booking request for ${arena.name} on ${date} at ${startTime}`,
      arena: arenaId,
      booking: booking._id,
      actions: [
        { label: 'View Booking', action: 'view', url: `/bookings/${booking._id}` },
        { label: 'Confirm', action: 'confirm', url: `/bookings/${booking._id}/confirm` },
        { label: 'Reject', action: 'reject', url: `/bookings/${booking._id}/reject` }
      ]
    });

    res.status(201).json(populatedBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/bookings/:id - Update booking
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user can update this booking
    const arena = await Arena.findById(booking.arena);
    const canUpdate = 
      booking.user.toString() === req.user._id.toString() ||
      arena.owner.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!canUpdate) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Prevent updates if booking is completed or cancelled
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot update completed or cancelled booking' });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('arena', 'name location pricePerHour')
    .populate('user', 'name email')
    .populate('team', 'name');

    res.json(updatedBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/bookings/:id - Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user can cancel this booking
    const arena = await Arena.findById(booking.arena);
    const canCancel = 
      booking.user.toString() === req.user._id.toString() ||
      arena.owner.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!canCancel) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Prevent cancellation if booking is completed
    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed booking' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    await booking.save();

    // Create notification
    const recipient = booking.user.toString() === req.user._id.toString() 
      ? arena.owner 
      : booking.user;

    await Notification.create({
      recipient,
      sender: req.user._id,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `Booking for ${arena.name} on ${booking.date.toDateString()} has been cancelled`,
      arena: booking.arena,
      booking: booking._id,
      data: { reason }
    });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/bookings/:id/confirm - Confirm booking (arena owner)
exports.confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const arena = await Arena.findById(booking.arena);
    if (arena.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only arena owner can confirm bookings' });
    }

    booking.status = 'confirmed';
    booking.ownerConfirmation = true;
    await booking.save();

    // Create notification for user
    await Notification.create({
      recipient: booking.user,
      sender: req.user._id,
      type: 'booking_confirmed',
      title: 'Booking Confirmed',
      message: `Your booking for ${arena.name} has been confirmed`,
      arena: booking.arena,
      booking: booking._id
    });

    res.json({ message: 'Booking confirmed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/bookings/:id/complete - Mark booking as completed
exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const arena = await Arena.findById(booking.arena);
    if (arena.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only arena owner can complete bookings' });
    }

    booking.status = 'completed';
    await booking.save();

    res.json({ message: 'Booking completed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/bookings/my-bookings - Get user's bookings
exports.getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { user: req.user._id };

    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(filter)
      .populate('arena', 'name location')
      .populate('team', 'name')
      .sort({ date: -1, startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.json({
      bookings,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + bookings.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/bookings/arena/:arenaId - Get bookings for specific arena (arena owner)
exports.getArenaBookings = async (req, res) => {
  try {
    const { arenaId } = req.params;
    const { status, date, page = 1, limit = 10 } = req.query;

    const arena = await Arena.findById(arenaId);
    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    if (arena.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view arena bookings' });
    }

    const filter = { arena: arenaId };

    if (status) {
      filter.status = status;
    }

    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.date = { $gte: targetDate, $lt: nextDay };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate('team', 'name')
      .sort({ date: 1, startTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.json({
      bookings,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + bookings.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}; 