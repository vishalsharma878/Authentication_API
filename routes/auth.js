const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const verifyToken = require('../middleware/verifyToken')
const User = require('../models/user');


const router = express.Router();

// Registration
router.post('/register', async (req, res) => {
  
    console.log(req.body);
  // Check if the user already exists
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) return res.status(400).json({ message: 'Email already exists' });

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword
  });

  try {
    const savedUser = await user.save();
    res.json({ user: savedUser._id });
  } catch (err) {
    console.log("ERor  " +  err);
    res.status(400).json({ message: err });
  }
});

// Login
router.post('/login', async (req, res) => {
  
  // Check if the email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json({ message: 'Email or password is wrong' });

  
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).json({ message: 'Invalid password' });

  const token = jwt.sign({ _id: user._id, role: user.role }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
  res.header('auth-token', token).json({ token });
});

router.post('/sign-out', verifyToken, (req, res) => {
  // The token will be invalidated on the client side by removing it from storage
  res.json({ message: 'Signed out successfully' });
});

// OAuth routes for Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/api/auth/login' }), (req, res) => {
 
  const token = jwt.sign({ _id: req.user._id, role: req.user.role }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
  res.header('auth-token', token).redirect('/api/profile');
});

module.exports = router;
