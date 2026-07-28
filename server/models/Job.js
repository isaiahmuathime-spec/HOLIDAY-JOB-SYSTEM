const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  organization: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  dates: {
    type: String,
    required: true,
    trim: true
  },
  totalSpots: {
    type: Number,
    required: true,
    min: 1
  },
  filledSpots: {
    type: Number,
    default: 0,
    min: 0
  },
  image: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);