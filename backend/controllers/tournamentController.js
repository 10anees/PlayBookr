const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const User = require('../models/User');
const Arena = require('../models/Arena');
const Match = require('../models/Match');
const Notification = require('../models/Notification');

// GET /api/tournaments - Get all tournaments with filters
exports.getAllTournaments = async (req, res) => {
  try {
    const {
      status,
      sport,
      arena,
      organizer,
      page = 1,
      limit = 10,
      sortBy = 'startDate',
      sortOrder = 'asc'
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

    if (organizer) {
      filter.organizer = organizer;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tournaments = await Tournament.find(filter)
      .populate('organizer', 'name email')
      .populate('arena', 'name location')
      .populate('winner', 'name')
      .populate('runnerUp', 'name')
      .populate('thirdPlace', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Tournament.countDocuments(filter);

    res.json({
      tournaments,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + tournaments.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/tournaments/:id - Get single tournament
exports.getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('arena', 'name location')
      .populate('invitedTeams', 'name logo captain')
      .populate('registeredTeams', 'name logo captain')
      .populate('matches', 'homeTeam awayTeam date startTime status')
      .populate('winner', 'name logo')
      .populate('runnerUp', 'name logo')
      .populate('thirdPlace', 'name logo');

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Populate match details
    if (tournament.matches.length > 0) {
      await Tournament.populate(tournament, {
        path: 'matches.homeTeam',
        select: 'name logo'
      });
      await Tournament.populate(tournament, {
        path: 'matches.awayTeam',
        select: 'name logo'
      });
    }

    res.json(tournament);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/tournaments - Create new tournament
exports.createTournament = async (req, res) => {
  try {
    const {
      name,
      arenaId,
      sport,
      description,
      startDate,
      endDate,
      registrationDeadline,
      maxTeams,
      entryFee,
      prizePool,
      format,
      rules,
      requirements,
      invitedTeams,
      isPublic
    } = req.body;

    // Validate arena
    const arena = await Arena.findById(arenaId);
    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    // Check if user is arena owner or admin
    if (arena.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only arena owners can create tournaments' });
    }

    // Validate dates
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const registration = new Date(registrationDeadline);

    if (start <= now) {
      return res.status(400).json({ message: 'Start date must be in the future' });
    }

    if (end <= start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    if (registration >= start) {
      return res.status(400).json({ message: 'Registration deadline must be before start date' });
    }

    const tournamentData = {
      name,
      organizer: req.user._id,
      arena: arenaId,
      sport,
      description,
      startDate: start,
      endDate: end,
      registrationDeadline: registration,
      maxTeams,
      entryFee: entryFee || 0,
      prizePool: prizePool || { first: 0, second: 0, third: 0 },
      format,
      rules: rules || [],
      requirements: requirements || [],
      invitedTeams: invitedTeams || [],
      isPublic: isPublic !== false // default to true
    };

    const tournament = new Tournament(tournamentData);
    await tournament.save();

    // Populate the created tournament
    const populatedTournament = await Tournament.findById(tournament._id)
      .populate('organizer', 'name email')
      .populate('arena', 'name location')
      .populate('invitedTeams', 'name logo');

    // Send notifications to invited teams
    if (invitedTeams && invitedTeams.length > 0) {
      const invitedTeamPromises = invitedTeams.map(async (teamId) => {
        const team = await Team.findById(teamId);
        if (team) {
          await Notification.create({
            recipient: team.captain,
            sender: req.user._id,
            type: 'tournament_invite',
            title: 'Tournament Invitation',
            message: `You have been invited to participate in ${name}`,
            tournament: tournament._id,
            team: teamId,
            actions: [
              { label: 'View Tournament', action: 'view', url: `/tournaments/${tournament._id}` },
              { label: 'Accept Invitation', action: 'accept', url: `/tournaments/${tournament._id}/accept` },
              { label: 'Decline', action: 'decline', url: `/tournaments/${tournament._id}/decline` }
            ]
          });
        }
      });

      await Promise.all(invitedTeamPromises);
    }

    res.status(201).json(populatedTournament);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/tournaments/:id - Update tournament
exports.updateTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Check if user can update this tournament
    if (tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this tournament' });
    }

    // Prevent updates if tournament has started
    if (['in_progress', 'completed'].includes(tournament.status)) {
      return res.status(400).json({ message: 'Cannot update tournament that has started' });
    }

    const updatedTournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('organizer', 'name email')
    .populate('arena', 'name location')
    .populate('invitedTeams', 'name logo');

    res.json(updatedTournament);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/tournaments/:id - Delete tournament
exports.deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Check if user can delete this tournament
    if (tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this tournament' });
    }

    // Prevent deletion if tournament has started
    if (['in_progress', 'completed'].includes(tournament.status)) {
      return res.status(400).json({ message: 'Cannot delete tournament that has started' });
    }

    await Tournament.findByIdAndDelete(req.params.id);

    res.json({ message: 'Tournament deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/tournaments/:id/register - Register team for tournament
exports.registerTeam = async (req, res) => {
  try {
    const { teamId } = req.body;
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.status !== 'open') {
      return res.status(400).json({ message: 'Tournament registration is not open' });
    }

    if (new Date() > tournament.registrationDeadline) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    // Validate team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is team captain
    if (team.captain.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only team captain can register for tournaments' });
    }

    // Check if team plays the same sport
    if (team.sport !== tournament.sport) {
      return res.status(400).json({ message: 'Team sport does not match tournament sport' });
    }

    // Check if team is already registered
    if (tournament.registeredTeams.includes(teamId)) {
      return res.status(400).json({ message: 'Team is already registered for this tournament' });
    }

    // Check if tournament is full
    if (tournament.registeredTeams.length >= tournament.maxTeams) {
      return res.status(400).json({ message: 'Tournament is full' });
    }

    // Check if team is invited (for private tournaments)
    if (!tournament.isPublic && !tournament.invitedTeams.includes(teamId)) {
      return res.status(403).json({ message: 'Team is not invited to this tournament' });
    }

    tournament.registeredTeams.push(teamId);
    await tournament.save();

    // Create notification for organizer
    await Notification.create({
      recipient: tournament.organizer,
      sender: req.user._id,
      type: 'tournament_application',
      title: 'Tournament Registration',
      message: `${team.name} has registered for ${tournament.name}`,
      tournament: tournament._id,
      team: teamId
    });

    res.json({ message: 'Team registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/tournaments/:id/accept - Accept team registration
exports.acceptTeam = async (req, res) => {
  try {
    const { teamId } = req.body;
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to accept teams' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Create notification for team captain
    await Notification.create({
      recipient: team.captain,
      sender: req.user._id,
      type: 'tournament_accepted',
      title: 'Tournament Registration Accepted',
      message: `Your registration for ${tournament.name} has been accepted`,
      tournament: tournament._id,
      team: teamId
    });

    res.json({ message: 'Team accepted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/tournaments/:id/reject - Reject team registration
exports.rejectTeam = async (req, res) => {
  try {
    const { teamId, reason } = req.body;
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to reject teams' });
    }

    // Remove team from registered teams
    tournament.registeredTeams = tournament.registeredTeams.filter(
      id => id.toString() !== teamId
    );
    await tournament.save();

    const team = await Team.findById(teamId);
    if (team) {
      // Create notification for team captain
      await Notification.create({
        recipient: team.captain,
        sender: req.user._id,
        type: 'tournament_rejected',
        title: 'Tournament Registration Rejected',
        message: `Your registration for ${tournament.name} has been rejected`,
        tournament: tournament._id,
        team: teamId,
        data: { reason }
      });
    }

    res.json({ message: 'Team rejected successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/tournaments/:id/start - Start tournament
exports.startTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to start tournament' });
    }

    if (tournament.status !== 'registration_closed') {
      return res.status(400).json({ message: 'Tournament must be in registration_closed status to start' });
    }

    if (tournament.registeredTeams.length < 2) {
      return res.status(400).json({ message: 'Need at least 2 teams to start tournament' });
    }

    tournament.status = 'in_progress';
    await tournament.save();

    // Create matches based on tournament format
    // This is a simplified version - you might want to implement more complex bracket generation
    const matches = [];
    const teams = tournament.registeredTeams;

    if (tournament.format === 'knockout') {
      // Simple knockout format - teams play in pairs
      for (let i = 0; i < teams.length; i += 2) {
        if (i + 1 < teams.length) {
          const match = new Match({
            homeTeam: teams[i],
            awayTeam: teams[i + 1],
            arena: tournament.arena,
            sport: tournament.sport,
            date: tournament.startDate,
            startTime: '10:00', // You might want to calculate this based on match number
            endTime: '11:00',
            status: 'scheduled'
          });
          await match.save();
          matches.push(match._id);
        }
      }
    }

    tournament.matches = matches;
    await tournament.save();

    res.json({ message: 'Tournament started successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/tournaments/my-tournaments - Get tournaments organized by user
exports.getMyTournaments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { organizer: req.user._id };

    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tournaments = await Tournament.find(filter)
      .populate('arena', 'name location')
      .populate('winner', 'name')
      .populate('runnerUp', 'name')
      .populate('thirdPlace', 'name')
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Tournament.countDocuments(filter);

    res.json({
      tournaments,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + tournaments.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/tournaments/participating - Get tournaments where user's teams are participating
exports.getParticipatingTournaments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Get teams where user is captain or member
    const userTeams = await Team.find({
      $or: [
        { captain: req.user._id },
        { members: req.user._id }
      ],
      isActive: true
    }).distinct('_id');

    const filter = {
      registeredTeams: { $in: userTeams }
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tournaments = await Tournament.find(filter)
      .populate('organizer', 'name')
      .populate('arena', 'name location')
      .populate('registeredTeams', 'name logo')
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Tournament.countDocuments(filter);

    res.json({
      tournaments,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + tournaments.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}; 