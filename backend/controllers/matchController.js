const Match = require('../models/Match');
const Team = require('../models/Team');
const Arena = require('../models/Arena');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Notification = require('../models/Notification');

// GET /api/matches - Get all matches with filters
exports.getAllMatches = async (req, res) => {
  try {
    const {
      status,
      sport,
      arena,
      team,
      date,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (sport) {
      filter.sport = sport;
    }

    if (arena) {
      filter.arena = arena;
    }

    if (team) {
      filter.$or = [{ homeTeam: team }, { awayTeam: team }];
    }

    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.date = { $gte: targetDate, $lt: nextDay };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const matches = await Match.find(filter)
      .populate('homeTeam', 'name logo')
      .populate('awayTeam', 'name logo')
      .populate('arena', 'name location')
      .populate('booking', 'startTime endTime')
      .sort({ date: -1, startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Match.countDocuments(filter);

    res.json({
      matches,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + matches.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/matches/:id - Get single match
exports.getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('homeTeam', 'name logo captain members')
      .populate('awayTeam', 'name logo captain members')
      .populate('arena', 'name location')
      .populate('booking', 'startTime endTime totalAmount')
      .populate('challengedBy', 'name')
      .populate('winner', 'name')
      .populate('playerStats.player', 'name profileImage')
      .populate('playerStats.team', 'name')
      .populate('feedback.player', 'name profileImage');

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    res.json(match);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/matches - Create match from booking
exports.createMatch = async (req, res) => {
  try {
    const {
      bookingId,
      awayTeamId,
      challengeMessage
    } = req.body;

    // Validate booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Booking must be confirmed to create a match' });
    }

    // Validate away team
    const awayTeam = await Team.findById(awayTeamId);
    if (!awayTeam) {
      return res.status(404).json({ message: 'Away team not found' });
    }

    // Get home team from booking
    const homeTeam = await Team.findById(booking.team);
    if (!homeTeam) {
      return res.status(400).json({ message: 'Booking must be associated with a team' });
    }

    // Check if teams are different
    if (homeTeam._id.toString() === awayTeam._id.toString()) {
      return res.status(400).json({ message: 'Home and away teams must be different' });
    }

    // Check if teams play the same sport
    if (homeTeam.sport !== awayTeam.sport) {
      return res.status(400).json({ message: 'Teams must play the same sport' });
    }

    // Check if there's already a match for this booking
    const existingMatch = await Match.findOne({ booking: bookingId });
    if (existingMatch) {
      return res.status(400).json({ message: 'Match already exists for this booking' });
    }

    const matchData = {
      homeTeam: homeTeam._id,
      awayTeam: awayTeam._id,
      arena: booking.arena,
      booking: bookingId,
      sport: homeTeam.sport,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      challengedBy: homeTeam._id,
      challengeMessage
    };

    const match = new Match(matchData);
    await match.save();

    // Populate the created match
    const populatedMatch = await Match.findById(match._id)
      .populate('homeTeam', 'name logo captain')
      .populate('awayTeam', 'name logo captain')
      .populate('arena', 'name location')
      .populate('booking', 'startTime endTime');

    // Create notification for away team captain
    await Notification.create({
      recipient: awayTeam.captain,
      sender: homeTeam.captain,
      type: 'match_request',
      title: 'Match Challenge',
      message: `${homeTeam.name} has challenged ${awayTeam.name} to a match`,
      match: match._id,
      team: homeTeam._id,
      actions: [
        { label: 'View Challenge', action: 'view', url: `/matches/${match._id}` },
        { label: 'Accept', action: 'accept', url: `/matches/${match._id}/accept` },
        { label: 'Reject', action: 'reject', url: `/matches/${match._id}/reject` }
      ]
    });

    res.status(201).json(populatedMatch);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/matches/:id/accept - Accept match challenge
exports.acceptMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const awayTeam = await Team.findById(match.awayTeam);
    if (awayTeam.captain.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only away team captain can accept match' });
    }

    match.challengeAccepted = true;
    await match.save();

    // Create notification for home team captain
    const homeTeam = await Team.findById(match.homeTeam);
    await Notification.create({
      recipient: homeTeam.captain,
      sender: req.user._id,
      type: 'match_accepted',
      title: 'Match Accepted',
      message: `${awayTeam.name} has accepted your match challenge`,
      match: match._id,
      team: awayTeam._id
    });

    res.json({ message: 'Match accepted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/matches/:id/reject - Reject match challenge
exports.rejectMatch = async (req, res) => {
  try {
    const { reason } = req.body;
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const awayTeam = await Team.findById(match.awayTeam);
    if (awayTeam.captain.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only away team captain can reject match' });
    }

    match.status = 'cancelled';
    await match.save();

    // Create notification for home team captain
    const homeTeam = await Team.findById(match.homeTeam);
    await Notification.create({
      recipient: homeTeam.captain,
      sender: req.user._id,
      type: 'match_rejected',
      title: 'Match Rejected',
      message: `${awayTeam.name} has rejected your match challenge`,
      match: match._id,
      team: awayTeam._id,
      data: { reason }
    });

    res.json({ message: 'Match rejected successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/matches/:id - Update match
exports.updateMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Check if user can update this match
    const homeTeam = await Team.findById(match.homeTeam);
    const awayTeam = await Team.findById(match.awayTeam);
    const canUpdate = 
      homeTeam.captain.toString() === req.user._id.toString() ||
      awayTeam.captain.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!canUpdate) {
      return res.status(403).json({ message: 'Not authorized to update this match' });
    }

    const updatedMatch = await Match.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('homeTeam', 'name logo')
    .populate('awayTeam', 'name logo')
    .populate('arena', 'name location');

    res.json(updatedMatch);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/matches/:id/start - Start match
exports.startMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (match.status !== 'scheduled') {
      return res.status(400).json({ message: 'Match must be scheduled to start' });
    }

    match.status = 'in_progress';
    await match.save();

    res.json({ message: 'Match started successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/matches/:id/complete - Complete match with results
exports.completeMatch = async (req, res) => {
  try {
    const {
      homeTeamScore,
      awayTeamScore,
      playerStats,
      mvpPlayerId
    } = req.body;

    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (match.status !== 'in_progress') {
      return res.status(400).json({ message: 'Match must be in progress to complete' });
    }

    // Update match results
    match.homeTeamScore = homeTeamScore;
    match.awayTeamScore = awayTeamScore;
    match.winner = homeTeamScore > awayTeamScore ? match.homeTeam : match.awayTeam;
    match.status = 'completed';
    match.playerStats = playerStats;

    // Set MVP
    if (mvpPlayerId) {
      match.playerStats.forEach(stat => {
        stat.isMVP = stat.player.toString() === mvpPlayerId;
      });
    }

    // Update sport-specific stats
    if (match.sport === 'futsal') {
      match.matchStats.homeTeamGoals = homeTeamScore;
      match.matchStats.awayTeamGoals = awayTeamScore;
    } else if (match.sport === 'cricket') {
      // For cricket, you might want to handle runs and wickets separately
      match.matchStats.homeTeamRuns = homeTeamScore;
      match.matchStats.awayTeamRuns = awayTeamScore;
    }

    await match.save();

    // Update team statistics
    const homeTeam = await Team.findById(match.homeTeam);
    const awayTeam = await Team.findById(match.awayTeam);

    homeTeam.total_matches += 1;
    awayTeam.total_matches += 1;

    if (match.winner.toString() === homeTeam._id.toString()) {
      homeTeam.wins += 1;
      awayTeam.losses += 1;
    } else {
      awayTeam.wins += 1;
      homeTeam.losses += 1;
    }

    // Update sport-specific team stats
    if (match.sport === 'futsal') {
      homeTeam.totalGoals += match.matchStats.homeTeamGoals;
      awayTeam.totalGoals += match.matchStats.awayTeamGoals;
    } else if (match.sport === 'cricket') {
      homeTeam.totalRuns += match.matchStats.homeTeamRuns;
      awayTeam.totalRuns += match.matchStats.awayTeamRuns;
      homeTeam.totalWickets += match.matchStats.homeTeamWickets;
      awayTeam.totalWickets += match.matchStats.awayTeamWickets;
    }

    await homeTeam.save();
    await awayTeam.save();

    res.json({ message: 'Match completed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/matches/:id/feedback - Add match feedback
exports.addMatchFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (match.status !== 'completed') {
      return res.status(400).json({ message: 'Can only add feedback to completed matches' });
    }

    // Check if user participated in this match
    const homeTeam = await Team.findById(match.homeTeam);
    const awayTeam = await Team.findById(match.awayTeam);
    
    const userParticipated = 
      homeTeam.members.includes(req.user._id) ||
      awayTeam.members.includes(req.user._id) ||
      homeTeam.captain.toString() === req.user._id.toString() ||
      awayTeam.captain.toString() === req.user._id.toString();

    if (!userParticipated) {
      return res.status(403).json({ message: 'Only match participants can add feedback' });
    }

    // Check if user already gave feedback
    const existingFeedback = match.feedback.find(
      f => f.player.toString() === req.user._id.toString()
    );

    if (existingFeedback) {
      return res.status(400).json({ message: 'You have already given feedback for this match' });
    }

    match.feedback.push({
      player: req.user._id,
      rating,
      comment
    });

    await match.save();

    res.json({ message: 'Feedback added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/matches/my-matches - Get user's matches
exports.getMyMatches = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Get teams where user is captain or member
    const userTeams = await Team.find({
      $or: [
        { captain: req.user._id },
        { members: req.user._id }
      ],
      isActive: true
    }).distinct('_id');

    const filter = {
      $or: [
        { homeTeam: { $in: userTeams } },
        { awayTeam: { $in: userTeams } }
      ]
    };

    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const matches = await Match.find(filter)
      .populate('homeTeam', 'name logo')
      .populate('awayTeam', 'name logo')
      .populate('arena', 'name location')
      .populate('booking', 'startTime endTime')
      .sort({ date: -1, startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Match.countDocuments(filter);

    res.json({
      matches,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + matches.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}; 