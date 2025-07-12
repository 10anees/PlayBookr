// routes/user.js
const express = require('express');
const router = express.Router();

const { getMe, updateMe } = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

router.get('/me', auth, getMe);
router.put('/me', auth, updateMe);

module.exports = router;
