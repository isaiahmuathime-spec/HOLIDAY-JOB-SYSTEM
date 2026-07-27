const express = require('express');
const { readData, saveData, ensureDataFile } = require('../utils/dataStore');
const { authenticateToken, authorizeAdminOrCreator } = require('../middlewares/auth');
const { sendApplicationNotification } = require('../utils/email');

const router = express.Router();
ensureDataFile();

router.post('/', authenticateToken, (req, res) => {
  const { jobId } = req.body;
  if (!jobId) {
    return res.status(400).json({ message: 'Job ID is required.' });
  }

  const data = readData();
  const job = data.jobs.find((j) => j.id === jobId);
  if (!job) {
    return res.status(404).json({ message: 'Job not found.' });
  }
  if (job.filledSpots >= job.totalSpots) {
    return res.status(409).json({ message: 'This placement is fully booked.' });
  }

  const student = data.students.find((s) => s.id === req.user.id);
  if (!student) {
    return res.status(404).json({ message: 'Student account not found.' });
  }

  const existingApplication = data.applications.find((app) => app.jobId === jobId && app.studentId === student.id && (app.status === 'pending' || app.status === 'approved'));
  if (existingApplication) {
    return res.status(409).json({ message: 'You have already applied for this placement.' });
  }

  const application = {
    id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    jobId,
    studentId: student.id,
    jobTitle: job.title,
    studentName: student.name,
    admissionNumber: student.admissionNumber,
    form: student.form,
    studentClass: student.studentClass,
    conductRecord: '',
    adminNotes: '',
    status: 'pending',
    appliedAt: new Date().toISOString(),
    decidedAt: null
  };

  data.applications.push(application);
  saveData(data);
  return res.status(201).json({ application });
});

router.get('/', authenticateToken, (req, res) => {
  const data = readData();
  if (req.user.role === 'admin') {
    return res.json({ applications: data.applications });
  }
  const studentApplications = data.applications.filter((app) => app.studentId === req.user.id);
  return res.json({ applications: studentApplications });
});

router.put('/:applicationId/approve', authenticateToken, authorizeAdmin, (req, res) => {
  const { applicationId } = req.params;
  const data = readData();
  const application = data.applications.find((app) => app.id === applicationId);
  if (!application || application.status !== 'pending') {
    return res.status(404).json({ message: 'Pending application not found.' });
  }

  const job = data.jobs.find((j) => j.id === application.jobId);
  if (!job) {
    return res.status(404).json({ message: 'Associated job not found.' });
  }
  if (job.filledSpots >= job.totalSpots) {
    return res.status(409).json({ message: 'The job is fully booked.' });
  }

  job.filledSpots += 1;
  application.status = 'approved';
  application.adminNotes = req.body.adminNotes || application.adminNotes;
  application.decidedAt = new Date().toISOString();

  saveData(data);
  return res.json({ application });
});

router.put('/:applicationId/decline', authenticateToken, authorizeAdmin, (req, res) => {
  const { applicationId } = req.params;
  const data = readData();
  const application = data.applications.find((app) => app.id === applicationId);
  if (!application || application.status !== 'pending') {
    return res.status(404).json({ message: 'Pending application not found.' });
  }

  application.status = 'declined';
  application.adminNotes = req.body.adminNotes || application.adminNotes;
  application.decidedAt = new Date().toISOString();

  saveData(data);
  return res.json({ application });
});

module.exports = router;
