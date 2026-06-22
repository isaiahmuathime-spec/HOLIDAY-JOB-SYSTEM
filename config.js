/**
 * CONFIGURATION FILE
 * This file contains sensitive credentials and configuration.
 * It is in .gitignore and will NOT be committed to version control.
 */

const CONFIG = {
  // Admin Credentials
  admin: {
    username: 'admin',
    password: 'admin123'
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
      jobs: '/api/jobs'
    }
  }
};
