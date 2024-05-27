const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String,  default: null },
  photo: { type: String },
  bio: { type: String },
  phone: { type: String },
  isPublic: { type: Boolean, default: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

module.exports = mongoose.model('User', UserSchema);
