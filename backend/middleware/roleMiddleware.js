// middleware/roleMiddleware.js
exports.isPlayer = (req, res, next) => {
  if (req.user?.role !== "player") {
    return res.status(403).json({ message: "Only players are allowed" });
  }
  next();
};

exports.isOwner = (req, res, next) => {
  if (req.user?.role !== "arena_owner") {
    return res.status(403).json({ message: "Only arena owners are allowed" });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Only admins are allowed" });
  }
  next();
};
