const Team = require('../models/Team');
const User = require('../models/User');
const Match = require('../models/Match');

// GET /api/teams - Get all teams with filters
exports.getAllTeams = async (req, res) => {
  try {
    const {
      sport,
      city,
      page = 1,
      limit = 10,
      sortBy = 'wins',
      sortOrder = 'desc'
    } = req.query;

    const filter = { isActive: true };

    if (sport) {
      filter.sport = sport;
    }

    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const teams = await Team.find(filter)
      .populate('captain', 'name email profileImage')
      .populate('members', 'name email profileImage')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Team.countDocuments(filter);

    res.json({
      teams,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + teams.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/teams/:id - Get single team with stats
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('captain', 'name email profileImage city')
      .populate('members', 'name email profileImage city');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Get recent matches
    const recentMatches = await Match.find({
      $or: [{ homeTeam: req.params.id }, { awayTeam: req.params.id }],
      status: 'completed'
    })
    .populate('homeTeam', 'name')
    .populate('awayTeam', 'name')
    .populate('arena', 'name')
    .sort({ date: -1 })
    .limit(5);

    // Get upcoming matches
    const upcomingMatches = await Match.find({
      $or: [{ homeTeam: req.params.id }, { awayTeam: req.params.id }],
      status: 'scheduled',
      date: { $gte: new Date() }
    })
    .populate('homeTeam', 'name')
    .populate('awayTeam', 'name')
    .populate('arena', 'name')
    .sort({ date: 1 })
    .limit(5);

    // Calculate win percentage
    const winPercentage = team.total_matches > 0 
      ? ((team.wins / team.total_matches) * 100).toFixed(1) 
      : 0;

    res.json({
      team,
      recentMatches,
      upcomingMatches,
      stats: {
        winPercentage,
        totalMatches: team.total_matches,
        wins: team.wins,
        losses: team.losses,
        draws: team.draws
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/teams - Create new team
exports.createTeam = async (req, res) => {
  try {
    const { name, sport, city, members } = req.body;

    // Check if user is already a captain of another team in the same sport
    const existingTeam = await Team.findOne({
      captain: req.user._id,
      sport: sport,
      isActive: true
    });

    if (existingTeam) {
      return res.status(400).json({ 
        message: 'You are already a captain of a team in this sport' 
      });
    }

    const teamData = {
      name,
      captain: req.user._id,
      sport,
      city,
      members: members || [req.user._id] // include captain in members
    };

    const team = new Team(teamData);
    await team.save();

    // Populate the created team
    const populatedTeam = await Team.findById(team._id)
      .populate('captain', 'name email profileImage')
      .populate('members', 'name email profileImage');

    res.status(201).json(populatedTeam);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Team with this name already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/teams/:id - Update team
exports.updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is captain or admin
    if (team.captain.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only team captain can update team' });
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('captain', 'name email profileImage')
    .populate('members', 'name email profileImage');

    res.json(updatedTeam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/teams/:id - Delete team
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is captain or admin
    if (team.captain.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only team captain can delete team' });
    }

    // Check if there are upcoming matches
    const upcomingMatches = await Match.find({
      $or: [{ homeTeam: req.params.id }, { awayTeam: req.params.id }],
      status: 'scheduled',
      date: { $gte: new Date() }
    });

    if (upcomingMatches.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete team with upcoming matches' 
      });
    }

    await Team.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Team deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/teams/:id/members - Add member to team
exports.addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is captain or admin
    if (team.captain.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only team captain can add members' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a member
    if (team.members.includes(userId)) {
      return res.status(400).json({ message: 'User is already a member of this team' });
    }

    // Check if user is already in another team of the same sport
    const existingTeam = await Team.findOne({
      members: userId,
      sport: team.sport,
      isActive: true
    });

    if (existingTeam) {
      return res.status(400).json({ 
        message: 'User is already a member of another team in this sport' 
      });
    }

    team.members.push(userId);
    await team.save();

    const updatedTeam = await Team.findById(req.params.id)
      .populate('captain', 'name email profileImage')
      .populate('members', 'name email profileImage');

    res.json(updatedTeam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/teams/:id/members/:userId - Remove member from team
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is captain or admin
    if (team.captain.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only team captain can remove members' });
    }

    // Cannot remove captain
    if (team.captain.toString() === userId) {
      return res.status(400).json({ message: 'Cannot remove team captain' });
    }

    team.members = team.members.filter(member => member.toString() !== userId);
    await team.save();

    const updatedTeam = await Team.findById(req.params.id)
      .populate('captain', 'name email profileImage')
      .populate('members', 'name email profileImage');

    res.json(updatedTeam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/teams/my-teams - Get teams where user is captain or member
exports.getMyTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [
        { captain: req.user._id },
        { members: req.user._id }
      ],
      isActive: true
    })
    .populate('captain', 'name email profileImage')
    .populate('members', 'name email profileImage')
    .sort({ createdAt: -1 });

    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/teams/leaderboard - Get team leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { sport, city, limit = 20 } = req.query;

    const filter = { isActive: true };

    if (sport) {
      filter.sport = sport;
    }

    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }

    const teams = await Team.find(filter)
      .populate('captain', 'name')
      .sort({ wins: -1, total_matches: -1 })
      .limit(parseInt(limit));

    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}; 