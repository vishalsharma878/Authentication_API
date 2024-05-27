const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const helmet = require('helmet')

require('./config/passport');

dotenv.config();

const app = express();
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
// Middleware setup
app.use(express.json());
app.use(passport.initialize());

// Database connection
mongoose.connect(process.env.MONGO_CLIENT, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB', err));;

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message });
});

const PORT = 3000 || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
