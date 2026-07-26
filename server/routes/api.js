const express = require('express');
const authRoutes = require('./auth');
const jobRoutes = require('./jobs');
const applicationRoutes = require('./applications');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);

module.exports = router;
