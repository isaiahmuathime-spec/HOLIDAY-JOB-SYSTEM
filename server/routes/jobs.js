const express = require('express');
const Job = require('../models/Job');
const { authenticateToken, authorizeAdminOrCreator } = require('../middlewares/auth');

const router = express.Router();

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    return res.json({ jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return res.status(500).json({ message: 'Failed to fetch jobs.' });
  }
});

// Create job (admin only)
router.post('/', authenticateToken, authorizeAdminOrCreator, async (req, res) => {
  const { title, organization, description, dates, totalSpots } = req.body;
  
  if (!title || !organization || !description || !dates || !totalSpots) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const job = new Job({
      title: title.trim(),
      organization: organization.trim(),
      description: description.trim(),
      dates: dates.trim(),
      totalSpots: Number(totalSpots),
      filledSpots: 0
    });

    await job.save();
    return res.status(201).json({ job });
  } catch (error) {
    console.error('Error creating job:', error);
    return res.status(500).json({ message: 'Failed to create job.' });
  }
});

// Update job (admin only)
router.put('/:jobId', authenticateToken, authorizeAdminOrCreator, async (req, res) => {
  const { jobId } = req.params;
  const { title, organization, description, dates, totalSpots } = req.body;

  try {
    const job = await Job.findById(jobId);
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

    await job.save();
    return res.json({ job });
  } catch (error) {
    console.error('Error updating job:', error);
    return res.status(500).json({ message: 'Failed to update job.' });
  }
});

// Delete job (admin only)
router.delete('/:jobId', authenticateToken, authorizeAdminOrCreator, async (req, res) => {
  const { jobId } = req.params;

  try {
    const job = await Job.findByIdAndDelete(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting job:', error);
    return res.status(500).json({ message: 'Failed to delete job.' });
  }
});

module.exports = router;