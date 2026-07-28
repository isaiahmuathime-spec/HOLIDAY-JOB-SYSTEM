const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  admissionNumber: {
    type: String,
    required: true,
    trim: true
  },
  form: {
    type: String,
    default: 'N/A',
    trim: true
  },
  studentClass: {
    type: String,
    default: '',
    trim: true
  },
  conductRecord: {
    type: String,
    default: 'No disciplinary incidents on record. Good standing.'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined'],
    default: 'pending'
  },
  appliedAt: {
    type: String,
    required: true
  },
  decidedAt: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema);