// controllers/userController.js
const User = require('../models/User');

// GET /api/users/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshToken');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/users/me
exports.updateMe = async (req, res) => {
  const updates = {};
  const allowed = ['name', 'bio', 'city'];

  allowed.forEach(field => {
    if (req.body[field]) updates[field] = req.body[field];
  });

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
