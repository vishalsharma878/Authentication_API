const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const verifyToken = require('../middleware/verifyToken');
const checkAdmin = require('../middleware/checkAdmin');

const router = express.Router();

// Get profile
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isPublic || req.user._id == req.params.id || req.user.role == 'admin') {
      res.json(user);
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Edit profile
router.put('/edit/:id', verifyToken, async (req, res) => {
  if (req.user._id != req.params.id && req.user.role != 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const updates = req.body;
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// List public profiles
router.get('/', verifyToken, async (req, res) => {
  try {
    const users = await User.find({ isPublic: true }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Route to make profile public
router.put('/make-public', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isPublic) {
      return res.status(400).json({ message: 'Profile is already public' });
    }

    user.isPublic = true;
    await user.save();

    res.json({ message: 'Profile is now public' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to make profile private
router.put('/make-private', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isPublic) {
      return res.status(400).json({ message: 'Profile is already private' });
    }

    user.isPublic = false;
    await user.save();

    res.json({ message: 'Profile is now private' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/all-profiles/private', verifyToken, checkAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
