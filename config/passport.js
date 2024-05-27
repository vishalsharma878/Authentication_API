const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
require('dotenv').config()

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (token, tokenSecret, profile, done) => {
  try {
   
    let user = await User.findOne({ googleId: profile.id });
    console.log(profile);
    if (!user) {
      user = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        photo: profile.photos[0].value,
        isPublic: true
      });
      await user.save();
    }
    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
}));

module.exports = passport;
