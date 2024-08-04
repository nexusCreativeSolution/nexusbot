const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  feedback: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
