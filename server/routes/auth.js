const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readData, saveData, ensureDataFile } = require('../utils/dataStore');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'holiday-job-secret';
const TOKEN_EXPIRY = '1h';

ensureDataFile();

router.post('/signup', async (req, res) => {
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

router.post('/login', async (req, res) => {
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

router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'Admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '11223344';

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Invalid admin credentials.' });
  }

  const token = jwt.sign({ role: 'admin', username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  return res.json({ token });
});

router.get('/me', authenticateToken, (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
