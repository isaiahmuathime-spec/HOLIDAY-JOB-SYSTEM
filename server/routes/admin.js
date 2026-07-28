const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const Job = require('../models/Job');
const Application = require('../models/Application');

router.post('/reset', async (req, res) => {
  try {
    await Promise.all([
      Student.deleteMany({}),
      Admin.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({})
    ]);
    return res.json({ message: 'Database reset successfully.' });
  } catch (error) {
    console.error('Reset error:', error);
    return res.status(500).json({ message: 'Failed to reset database.' });
  }
});

module.exports = router;
