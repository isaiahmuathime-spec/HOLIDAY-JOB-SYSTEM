const express = require('express');
const { readData, saveData, ensureDataFile } = require('../utils/dataStore');
const { authenticateToken, authorizeAdmin } = require('../middlewares/auth');

const router = express.Router();
ensureDataFile();

router.get('/', (req, res) => {
  const data = readData();
  return res.json({ jobs: data.jobs });
});

router.post('/', authenticateToken, authorizeAdmin, (req, res) => {
  const { title, organization, description, dates, totalSpots } = req.body;
  if (!title || !organization || !description || !dates || !totalSpots) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const data = readData();
  const job = {
    id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim(),
    organization: organization.trim(),
    description: description.trim(),
    dates: dates.trim(),
    totalSpots: Number(totalSpots),
    filledSpots: 0,
    image: ''
  };

  data.jobs.push(job);
  saveData(data);
  return res.status(201).json({ job });
});

router.put('/:jobId', authenticateToken, authorizeAdmin, (req, res) => {
  const { jobId } = req.params;
  const { title, organization, description, dates, totalSpots } = req.body;
  const data = readData();
  const job = data.jobs.find((j) => j.id === jobId);
  if (!job) {
    return res.status(404).json({ message: 'Job not found.' });
  }

  if (title !== undefined) job.title = title.trim();
  if (organization !== undefined) job.organization = organization.trim();
  if (description !== undefined) job.description = description.trim();
  if (dates !== undefined) job.dates = dates.trim();
  if (totalSpots !== undefined) {
    const spots = Number(totalSpots);
    if (Number.isNaN(spots) || spots < 1) {
      return res.status(400).json({ message: 'Total spots must be a positive number.' });
    }
    if (spots < job.filledSpots) {
      return res.status(400).json({ message: 'Total spots cannot be less than filled spots.' });
    }
    job.totalSpots = spots;
  }

  saveData(data);
  return res.json({ job });
});

router.delete('/:jobId', authenticateToken, authorizeAdmin, (req, res) => {
  const { jobId } = req.params;
  const data = readData();
  const existing = data.jobs.find((j) => j.id === jobId);
  if (!existing) {
    return res.status(404).json({ message: 'Job not found.' });
  }

  data.jobs = data.jobs.filter((j) => j.id !== jobId);
  saveData(data);
  return res.status(204).send();
});

module.exports = router;
