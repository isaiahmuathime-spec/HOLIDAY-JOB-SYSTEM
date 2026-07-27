const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readData, saveData, ensureDataFile } = require('../utils/dataStore');
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

ensureDataFile();

router.post('/signup', asyncHandler(async (req, res) => {
  const { name, admissionNumber, form, studentClass, email, password } = req.body;
  if (!name || !admissionNumber || !form || !studentClass || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const data = readData();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedAdmission = admissionNumber.trim().toLowerCase();

  if (data.students.some((s) => s.email.toLowerCase() === normalizedEmail)) {
    return res.status(409).json({ message: 'Email already registered.' });
  }
  if (data.students.some((s) => s.admissionNumber.toLowerCase() === normalizedAdmission)) {
    return res.status(409).json({ message: 'Admission number already registered.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const student = {
    id: `student-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim(),
    admissionNumber: admissionNumber.trim(),
    form: form.trim(),
    studentClass: studentClass.trim(),
    email: normalizedEmail,
    passwordHash,
  };

  data.students.push(student);
  saveData(data);

  return res.status(201).json({ message: 'Student registered successfully.' });
});

router.post('/login', asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ message: 'Email/full name and password are required.' });
  }

  const data = readData();
  const normalized = identifier.trim().toLowerCase();
  const student = data.students.find((s) => s.email.toLowerCase() === normalized || s.name.toLowerCase() === normalized);
  if (!student) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const passwordMatch = await bcrypt.compare(password, student.passwordHash);
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = jwt.sign({ id: student.id, role: 'student' }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  return res.json({ token, student: { id: student.id, name: student.name, admissionNumber: student.admissionNumber, form: student.form, studentClass: student.studentClass, email: student.email } });
});

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

  const data = readData();
  const normalizedUsername = username.trim().toLowerCase();
  if (data.admins.some((admin) => admin.username.toLowerCase() === normalizedUsername)) {
    return res.status(409).json({ message: 'Admin username already registered.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = {
    id: `admin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    username: username.trim(),
    passwordHash,
    createdAt: new Date().toISOString()
  };
  data.admins.push(admin);
  saveData(data);
  return res.status(201).json({ message: 'Admin account created successfully.' });
});

router.post('/admin/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const data = readData();
  const normalized = username.trim().toLowerCase();
  const admin = data.admins.find((a) => a.username.toLowerCase() === normalized);
  if (!admin) {
    return res.status(401).json({ message: 'Invalid admin credentials.' });
  }

  const passwordMatch = await bcrypt.compare(password, admin.passwordHash);
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid admin credentials.' });
  }

  const token = jwt.sign({ role: 'admin', username: admin.username, id: admin.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  return res.json({ token });
});

router.get('/me', authenticateToken, (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
