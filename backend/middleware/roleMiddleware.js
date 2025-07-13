// Middleware to check if user has required role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Convert single role to array for easier handling
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${requiredRoles.join(', ')}` 
      });
    }

    next();
  };
};

// Specific role middlewares
const requireAdmin = requireRole('admin');
const requireArenaOwner = requireRole('arena_owner');
const requirePlayer = requireRole('player');

// Middleware to check if user is admin or arena owner
const requireAdminOrArenaOwner = requireRole(['admin', 'arena_owner']);

// Middleware to check if user is admin or player
const requireAdminOrPlayer = requireRole(['admin', 'player']);

// Middleware to check if user is admin or the resource owner
const requireAdminOrOwner = (resourceField = 'owner') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    // For arena owners, check if they own the resource
    if (req.user.role === 'arena_owner') {
      // This will be checked in the controller by comparing the resource owner
      return next();
    }

    return res.status(403).json({ message: 'Access denied. Admin or resource owner required' });
  };
};

// Middleware to check if user can access team resources
const requireTeamAccess = () => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    // For players, check if they are part of the team
    // This will be checked in the controller
    return next();
  };
};

// Middleware to check if user can access booking resources
const requireBookingAccess = () => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    // For users, check if they own the booking or are arena owner
    // This will be checked in the controller
    return next();
  };
};

// Middleware to check if user can access match resources
const requireMatchAccess = () => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    // For users, check if they are part of the teams in the match
    // This will be checked in the controller
    return next();
  };
};

// Middleware to check if user can access tournament resources
const requireTournamentAccess = () => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    // For users, check if they are organizer or participant
    // This will be checked in the controller
    return next();
  };
};

// Middleware to check if user can access chat resources
const requireChatAccess = () => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    // For users, check if they are participant or member of the chat
    // This will be checked in the controller
    return next();
  };
};

// Middleware to check if user can access review resources
const requireReviewAccess = () => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    // For users, check if they own the review
    // This will be checked in the controller
    return next();
  };
};

module.exports = {
  requireRole,
  requireAdmin,
  requireArenaOwner,
  requirePlayer,
  requireAdminOrArenaOwner,
  requireAdminOrPlayer,
  requireAdminOrOwner,
  requireTeamAccess,
  requireBookingAccess,
  requireMatchAccess,
  requireTournamentAccess,
  requireChatAccess,
  requireReviewAccess
};
