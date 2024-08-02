const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  adminId: {
    type: Number,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  telegramUsername: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline'
  }
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
