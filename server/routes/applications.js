const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

// Submit application (student)
router.post('/apply/:jobId', authenticateToken, async (req, res) => {
  const { jobId } = req.params;
  const studentId = req.user.id;
  const studentRole = req.user.role;

  if (studentRole !== 'student') {
    return res.status(403).json({ message: 'Only students can apply for jobs.' });
  }

  try {
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    // Check if job is full
    if (job.filledSpots >= job.totalSpots) {
      return res.status(400).json({ message: 'This placement is fully booked.' });
    }

    // Get student details
    const Student = require('../models/Student');
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // Check for duplicate application
    const existingApplication = await Application.findOne({
      jobId,
      admissionNumber: student.admissionNumber,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this placement.' });
    }

    // Create application
    const application = new Application({
      jobId,
      jobTitle: job.title,
      studentName: student.name,
      admissionNumber: student.admissionNumber,
      form: student.form,
      studentClass: student.studentClass,
      appliedAt: new Date().toLocaleString()
    });

    await application.save();

    // Increment filled spots
    job.filledSpots += 1;
    await job.save();

    return res.status(201).json({ message: `Application submitted for ${job.title}!` });
  } catch (error) {
    console.error('Error submitting application:', error);
    return res.status(500).json({ message: 'Failed to submit application.' });
  }
});

// Get pending applications (admin)
router.get('/pending', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  try {
    const applications = await Application.find({ status: 'pending' }).sort({ createdAt: -1 });
    return res.json({ applications });
  } catch (error) {
    console.error('Error fetching pending applications:', error);
    return res.status(500).json({ message: 'Failed to fetch applications.' });
  }
});

// Get processed applications (admin)
router.get('/processed', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  try {
    const applications = await Application.find({
      status: { $in: ['approved', 'declined'] }
    }).sort({ createdAt: -1 });

    return res.json({ applications });
  } catch (error) {
    console.error('Error fetching processed applications:', error);
    return res.status(500).json({ message: 'Failed to fetch applications.' });
  }
});

// Approve application (admin)
router.post('/approve/:appId', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  const { appId } = req.params;
  const { adminNotes } = req.body;

  try {
    const application = await Application.findById(appId);
    if (!application || application.status !== 'pending') {
      return res.status(404).json({ message: 'Application not found or already processed.' });
    }

    application.status = 'approved';
    application.adminNotes = adminNotes || '';
    application.decidedAt = new Date().toLocaleString();
    await application.save();

    return res.json({ message: 'Application approved successfully.' });
  } catch (error) {
    console.error('Error approving application:', error);
    return res.status(500).json({ message: 'Failed to approve application.' });
  }
});

// Decline application (admin)
router.post('/decline/:appId', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  const { appId } = req.params;
  const { adminNotes } = req.body;

  try {
    const application = await Application.findById(appId);
    if (!application || application.status !== 'pending') {
      return res.status(404).json({ message: 'Application not found or already processed.' });
    }

    application.status = 'declined';
    application.adminNotes = adminNotes || '';
    application.decidedAt = new Date().toLocaleString();
    await application.save();

    return res.json({ message: 'Application declined.' });
  } catch (error) {
    console.error('Error declining application:', error);
    return res.status(500).json({ message: 'Failed to decline application.' });
  }
});

// Get my applications (student)
router.get('/my-applications', authenticateToken, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Student access required.' });
  }

  try {
    const Student = require('../models/Student');
    const student = await Student.findById(req.user.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const applications = await Application.find({ admissionNumber: student.admissionNumber }).sort({ createdAt: -1 });
    return res.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({ message: 'Failed to fetch applications.' });
  }
});

module.exports = router;