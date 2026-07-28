require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDatabase = require('./config/database');
const apiRouter = require('./routes/api');

const requiredEnv = ['JWT_SECRET', 'ADMIN_SIGNUP_SECRET', 'MONGODB_URI'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnv.join(', ')}`);
}

const app = express();
const PORT = process.env.PORT || 3000;
const corsOptions = process.env.CORS_ORIGIN ? { origin: process.env.CORS_ORIGIN } : undefined;

// Connect to MongoDB
connectDatabase();

app.disable('x-powered-by');
app.use(cors(corsOptions));
app.use(express.json({ limit: '200kb' }));

app.use((req, res, next) => {
  const forbiddenPaths = [
    '/server',
    '/server/',
    '/node_modules',
    '/node_modules/',
    '/data',
    '/data/',
    '/config.js',
    '/package.json',
    '/package-lock.json',
    '/README.md',
    '/.env'
  ];
  if (forbiddenPaths.some((prefix) => req.path === prefix || req.path.startsWith(prefix + '/'))) {
    return res.status(404).end();
  }
  next();
});

app.use('/api', apiRouter);
app.use(express.static(path.join(__dirname, '..', 'frontend'), { dotfiles: 'ignore', index: false }));

// Serve auth page for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'auth', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Holiday Job backend listening on http://localhost:${PORT}`);
});
