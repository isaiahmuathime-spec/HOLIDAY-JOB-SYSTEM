const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required.');
}
const TOKEN_EXPIRY = '1h';

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Student Signup
router.post('/signup', asyncHandler(async (req, res) => {
  const { name, admissionNumber, form, studentClass, email, password } = req.body;
  if (!name || !admissionNumber || !form || !studentClass || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedAdmission = admissionNumber.trim().toLowerCase();

  // Check if email already exists
  const existingEmail = await Student.findOne({ email: normalizedEmail });
  if (existingEmail) {
    return res.status(409).json({ message: 'Email already registered.' });
  }

  // Check if admission number already exists
  const existingAdmission = await Student.findOne({ admissionNumber: normalizedAdmission });
  if (existingAdmission) {
    return res.status(409).json({ message: 'Admission number already registered.' });
  }

  // Hash password and create student
  const passwordHash = await bcrypt.hash(password, 10);
  const student = new Student({
    name: name.trim(),
    admissionNumber: normalizedAdmission,
    form: form.trim(),
    studentClass: studentClass.trim(),
    email: normalizedEmail,
    passwordHash
  });

  await student.save();

  return res.status(201).json({ message: 'Student registered successfully.' });
}));

// Student Login
router.post('/login', asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ message: 'Email/full name and password are required.' });
  }

  const normalized = identifier.trim().toLowerCase();
  const student = await Student.findOne({
    $or: [
      { email: normalized },
      { name: { $regex: new RegExp('^' + normalized, 'i') } }
    ]
  });

  if (!student) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const passwordMatch = await student.comparePassword(password);
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = jwt.sign(
    { id: student._id, role: 'student' },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  return res.json({
    token,
    student: {
      id: student._id,
      name: student.name,
      admissionNumber: student.admissionNumber,
      form: student.form,
      studentClass: student.studentClass,
      email: student.email
    }
  });
}));

// Admin Signup
router.post('/admin/signup', asyncHandler(async (req, res) => {
  const { username, password, signupSecret } = req.body;
  const ADMIN_SIGNUP_SECRET = process.env.ADMIN_SIGNUP_SECRET;

  if (!ADMIN_SIGNUP_SECRET) {
    return res.status(500).json({ message: 'Admin signup secret is not configured.' });
  }

  if (!username || !password || !signupSecret) {
    return res.status(400).json({ message: 'Username, password, and signup secret are required.' });
  }

  if (signupSecret !== ADMIN_SIGNUP_SECRET) {
    return res.status(403).json({ message: 'Invalid admin signup secret.' });
  }

  const normalizedUsername = username.trim().toLowerCase();
  const existingAdmin = await Admin.findOne({ username: normalizedUsername });
  if (existingAdmin) {
    return res.status(409).json({ message: 'Admin username already registered.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = new Admin({
    username: username.trim(),
    passwordHash
  });

  await admin.save();
  return res.status(201).json({ message: 'Admin account created successfully.' });
}));

// Admin Login
router.post('/admin/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const normalized = username.trim().toLowerCase();
  const admin = await Admin.findOne({ username: normalized });

  if (!admin) {
    return res.status(401).json({ message: 'Invalid admin credentials.' });
  }

  const passwordMatch = await admin.comparePassword(password);
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid admin credentials.' });
  }

  const token = jwt.sign(
    { role: 'admin', username: admin.username, id: admin._id },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  return res.json({ token });
}));

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;