/**
 * CONFIGURATION FILE
 * This file contains sensitive credentials and configuration.
 * It is in .gitignore and will NOT be committed to version control.
 */

const CONFIG = {
  // Admin Credentials (stored as a hash, not plaintext)
  admin: {
    username: 'Admin',
    passwordHash: 'HolidayJob'
  },

  // Application Settings
  app: {
    name: 'Holiday Job Portal',
    version: '1.0.0'
  },

  // API Endpoints (for future backend integration)
  api: {
    baseUrl: 'http://localhost:3000',
    endpoints: {
      login: '/api/auth/login',
      signup: '/api/auth/signup',
      adminLogin: '/api/auth/admin/login',
      adminSignup: '/api/auth/admin/signup',
      creatorLogin: '/api/auth/creator/login',
      jobs: '/api/jobs'
    }
  }
};
