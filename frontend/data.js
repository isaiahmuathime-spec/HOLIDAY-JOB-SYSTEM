const HJSData = (() => {
  const KEYS = {
    jobs: 'hjs_jobs',
    applications: 'hjs_applications',
    studentProfile: 'hjs_student_profile',
    students: 'hjs_students',
    adminCredentials: 'hjs_admin_credentials',
    adminSession: 'hjs_admin_session',
    studentSession: 'hjs_student_session'
  };

  const DEFAULT_JOBS = [
    { id: 'bungoma-county', title: 'Bungoma County Offices', organization: 'Bungoma County', description: 'Administrative support and public service experience at county offices.', totalSpots: 5, filledSpots: 0, image: '../images/Bungoma County Offices.jpg', dates: '04/04/2026 - 14/04/2026' },
    { id: 'kenyatta-hospital', title: 'Kenyatta Hospital', organization: 'Kenyatta National Hospital', description: 'Clinical and hospital support roles for aspiring medical professionals.', totalSpots: 5, filledSpots: 0, image: '../images/KNH.jpg', dates: '04/04/2026 - 14/04/2026' },
    { id: 'milimani-courts', title: 'Milimani Law Courts', organization: 'Milimani Law Courts', description: 'Observe legal proceedings and assist with court administration.', totalSpots: 5, filledSpots: 0, image: '../images/Milimani Law Courts.jpg', dates: '04/04/2026 - 14/04/2026' },
    { id: 'siaya-county', title: 'Siaya County Offices', organization: 'Siaya County', description: 'County government placement for civic and administrative learning.', totalSpots: 5, filledSpots: 0, image: '../images/Siaya County Offices.jpg', dates: '04/04/2026 - 14/04/2026' },
    { id: 'kajiado-hospital', title: 'Kajiado County Mission Hospital', organization: 'Kajiado County Mission Hospital', description: 'Healthcare support placement in a mission hospital setting.', totalSpots: 5, filledSpots: 0, image: '../images/KCMH.jpg', dates: '04/04/2026 - 14/04/2026' },
    { id: 'parliament', title: 'Parliament Of Kenya', organization: 'Parliament of Kenya', description: 'Legislative process exposure and parliamentary office support.', totalSpots: 5, filledSpots: 0, image: '../images/Parliament.jpg', dates: '04/04/2026 - 14/04/2026' },
    { id: 'archives', title: 'National Archives', organization: 'Kenya National Archives', description: 'Preservation and cataloguing of national historical records.', totalSpots: 5, filledSpots: 0, image: '../images/Archives.jpg', dates: '04/04/2026 - 14/04/2026' },
    { id: 'garissa-county', title: 'Garissa County Government Offices', organization: 'Garissa County', description: 'Public administration and community service at county level.', totalSpots: 5, filledSpots: 0, image: '../images/Garissa County.jpg', dates: '04/04/2026 - 14/04/2026' },
    { id: 'wilson-airport', title: 'Wilson Airport', organization: 'Wilson Airport', description: 'Aviation operations and airport administration experience.', totalSpots: 5, filledSpots: 0, image: '../images/wilson airrport.jpg', dates: '04/04/2026 - 14/04/2026' },
    { id: 'kisumu-court', title: 'Kisumu County Law Court', organization: 'Kisumu County Law Court', description: 'Judicial process observation and court clerk assistance.', totalSpots: 5, filledSpots: 0, image: '../images/kisumu.jpg', dates: '04/04/2026 - 14/04/2026' },
    { id: 'national-library', title: 'National Library', organization: 'Kenya National Library Service', description: 'Library science, cataloguing, and public information services.', totalSpots: 5, filledSpots: 0, image: '../images/National library.jpg', dates: '04/04/2026 - 14/04/2026' },
    { id: 'kws', title: 'Kenya Wild Life Offices', organization: 'Kenya Wildlife Service', description: 'Conservation, wildlife management, and environmental education.', totalSpots: 5, filledSpots: 0, image: '../images/KWS.jpg', dates: '04/04/2026 - 14/04/2026' }
  ];

  const ASSET_DICTIONARY = {
    'Bungoma County Offices': '../images/Bungoma County Offices.jpg',
    'Kenyatta Hospital': '../images/KNH.jpg',
    'Kenyatta National Hospital': '../images/KNH.jpg',
    'Milimani Law Courts': '../images/Milimani Law Courts.jpg',
    'Siaya County Offices': '../images/Siaya County Offices.jpg',
    'Kajiado County Mission Hospital': '../images/KCMH.jpg',
    'Parliament Of Kenya': '../images/Parliament.jpg',
    'Parliament of Kenya': '../images/Parliament.jpg',
    'National Archives': '../images/Archives.jpg',
    'Kenya National Archives': '../images/Archives.jpg',
    'Garissa County Government Offices': '../images/Garissa County.jpg',
    'Garissa County': '../images/Garissa County.jpg',
    'Wilson Airport': '../images/wilson airrport.jpg',
    'Kisumu County Law Court': '../images/kisumu.jpg',
    'National Library': '../images/National library.jpg',
    'Kenya National Library Service': '../images/National library.jpg',
    'Kenya Wild Life Offices': '../images/KWS.jpg',
    'Kenya Wildlife Service': '../images/KWS.jpg',
    'Safaricom': '../images/starehe logo.jpg',
    'Equity Bank': '../images/starehe logo.jpg',
    'KRA': '../images/starehe logo.jpg',
    'fallback': '../images/starehe logo.jpg'
  };

  let jobsInitialized = false;

  function getJobImage(companyName) {
    if (!companyName) return ASSET_DICTIONARY.fallback;
    const normalized = companyName.trim();
    return ASSET_DICTIONARY[normalized] || ASSET_DICTIONARY.fallback;
  }

  const MOCK_CONDUCT = [
    'No disciplinary incidents on record. Good standing.',
    'Minor lateness noted in Term 2 — resolved with form teacher.',
    'Excellent conduct throughout the year. Recommended for placement.',
    'One warning for uniform breach — no further issues since.',
    'Outstanding leadership in extracurricular activities.'
  ];

  function read(key) {
    return JSON.parse(localStorage.getItem(key) || 'null');
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function hashValue(value) {
    const str = String(value || '');
    let hash = 5381;
    for (let i = 0; i < str.length; i += 1) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
  }

  function getAdminCredentials() {
    const saved = read(KEYS.adminCredentials);
    if (saved && saved.username && saved.passwordHash) return saved;

    return {
      username: 'Admin',
      passwordHash: '185030e4'
    };
  }

  function saveAdminCredentials(username, password) {
    const credentials = {
      username: username.trim(),
      passwordHash: hashValue(password)
    };
    write(KEYS.adminCredentials, credentials);
    return credentials;
  }

  function getAdminSession() {
    return read(KEYS.adminSession);
  }

  function saveAdminSession(session) {
    write(KEYS.adminSession, session);
  }

  function clearAdminSession() {
    localStorage.removeItem(KEYS.adminSession);
  }

  function getStudentSession() {
    return read(KEYS.studentSession);
  }

  function saveStudentSession(session) {
    write(KEYS.studentSession, session);
  }

  function clearStudentSession() {
    localStorage.removeItem(KEYS.studentSession);
  }

  function isSessionValid(session) {
    return session && typeof session.token === 'string' && session.token && session.expiresAt && new Date(session.expiresAt) > new Date();
  }

  function migrateLegacyEnrollments() {
    const legacy = JSON.parse(localStorage.getItem('hjs_enrollments') || '[]');
    if (!legacy.length) return;

    const applications = getApplications();
    const jobs = getJobs();
    legacy.forEach((entry) => {
      const job = jobs.find(j => j.title === entry.job);
      const exists = applications.some(a =>
        a.jobTitle === entry.job && a.studentName === (entry.student || 'Student') && a.status === 'pending'
      );
      if (exists) return;

      applications.push({
        id: generateId('app'),
        jobId: job ? job.id : entry.job,
        jobTitle: entry.job,
        studentName: entry.studentName || entry.student || 'Student',
        admissionNumber: entry.admissionNumber || 'N/A',
        form: entry.form || entry.formClass || 'N/A',
        studentClass: entry.studentClass || '',
        conductRecord: MOCK_CONDUCT[Math.floor(Math.random() * MOCK_CONDUCT.length)],
        adminNotes: '',
        status: 'pending',
        appliedAt: entry.timestamp || new Date().toLocaleString(),
        decidedAt: null
      });
    });

    write(KEYS.applications, applications);
    localStorage.removeItem('hjs_enrollments');
  }

  function migrateJobImagePaths() {
    const jobs = getJobs();
    let needsUpdate = false;
    
    const updatedJobs = jobs.map(job => {
      if (job.image && job.image.startsWith('./images/')) {
        needsUpdate = true;
        return { ...job, image: job.image.replace('./images/', '../images/') };
      }
      return job;
    });
    
    if (needsUpdate) {
      saveJobs(updatedJobs);
      console.log('Job image paths migrated to new format');
    }
  }

  function initJobs() {
    if (jobsInitialized) return;
    jobsInitialized = true;
    if (!read(KEYS.jobs)) {
      write(KEYS.jobs, DEFAULT_JOBS);
    }
    migrateLegacyEnrollments();
    migrateJobImagePaths();
  }

  function getJobs() {
    initJobs();
    return read(KEYS.jobs) || [];
  }

  function saveJobs(jobs) {
    write(KEYS.jobs, jobs);
  }

  function getApplications() {
    initJobs();
    return read(KEYS.applications) || [];
  }

  function saveApplications(applications) {
    write(KEYS.applications, applications);
  }

  function getStudents() {
    return read(KEYS.students) || [];
  }

  function saveStudents(students) {
    write(KEYS.students, students);
  }

  function getStudentProfile() {
    return read(KEYS.studentProfile) || {
      name: 'Student',
      admissionNumber: 'ADM-0000',
      form: 'Form 4',
      studentClass: '',
      email: ''
    };
  }

  function saveStudentProfile(profile) {
    write(KEYS.studentProfile, profile);
  }

  function registerStudent({ name, admissionNumber, form, studentClass, email, password }) {
    const students = getStudents();
    const normalizedName = name.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedAdmission = admissionNumber.trim().toLowerCase();

    if (students.some(s => s.name.toLowerCase() === normalizedName)) {
      return { ok: false, message: 'An account with this full name already exists.' };
    }
    if (students.some(s => s.admissionNumber.toLowerCase() === normalizedAdmission)) {
      return { ok: false, message: 'That admission number is already registered.' };
    }
    if (students.some(s => s.email.toLowerCase() === normalizedEmail)) {
      return { ok: false, message: 'That email is already registered.' };
    }

    const student = {
      name: name.trim(),
      admissionNumber: admissionNumber.trim(),
      form: form.trim(),
      studentClass: studentClass.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hashValue(password)
    };

    students.push(student);
    saveStudents(students);
    saveStudentProfile({
      name: student.name,
      admissionNumber: student.admissionNumber,
      form: student.form,
      studentClass: student.studentClass,
      email: student.email
    });

    return { ok: true, message: 'Account created successfully! You can now log in.' };
  }

  function loginStudent(identifier, password) {
    const students = getStudents();
    const normalized = identifier.trim().toLowerCase();
    const hashedPassword = hashValue(password);
    const student = students.find(s =>
      (s.email && s.email.toLowerCase() === normalized) ||
      (s.name && s.name.toLowerCase() === normalized)
    );

    if (!student) {
      return { ok: false, message: 'Incorrect email or password. Please try again.' };
    }

    const legacyMatch = student.password && student.password === password;
    const secureMatch = student.passwordHash && student.passwordHash === hashedPassword;

    if (!secureMatch && !legacyMatch) {
      return { ok: false, message: 'Incorrect email or password. Please try again.' };
    }

    if (legacyMatch && !student.passwordHash) {
      student.passwordHash = hashedPassword;
      delete student.password;
      saveStudents(students);
    }

    saveStudentProfile({
      name: student.name,
      admissionNumber: student.admissionNumber,
      form: student.form,
      studentClass: student.studentClass,
      email: student.email
    });

    return { ok: true, student };
  }

  function addJob({ title, organization, description, dates, totalSpots }) {
    const jobs = getJobs();
    const job = {
      id: generateId('job'),
      title: title.trim(),
      organization: organization.trim(),
      description: description.trim(),
      dates: dates ? dates.trim() : '04/04/2026 - 14/04/2026',
      totalSpots: parseInt(totalSpots, 10) || 1,
      filledSpots: 0,
      image: ''
    };
    jobs.push(job);
    saveJobs(jobs);
    return job;
  }

  function removeJob(jobId) {
    const jobs = getJobs().filter(j => j.id !== jobId);
    saveJobs(jobs);
  }

  function updateJob(jobId, updates) {
    const jobs = getJobs();
    const job = jobs.find(j => j.id === jobId);
    if (!job) return { ok: false, message: 'Job not found.' };

    if (updates.title !== undefined) {
      job.title = updates.title.trim();
    }
    if (updates.organization !== undefined) {
      job.organization = updates.organization.trim();
    }
    if (updates.description !== undefined) {
      job.description = updates.description.trim();
    }
    if (updates.dates !== undefined) {
      job.dates = updates.dates.trim();
    }
    if (updates.totalSpots !== undefined) {
      const newTotal = parseInt(updates.totalSpots, 10);
      if (Number.isNaN(newTotal) || newTotal < 1) {
        return { ok: false, message: 'Total spots must be a positive number.' };
      }
      if (newTotal < job.filledSpots) {
        return { ok: false, message: `Total spots cannot be less than already filled spots (${job.filledSpots}).` };
      }
      job.totalSpots = newTotal;
    }

    saveJobs(jobs);
    return { ok: true, job };
  }

  function updateJobSpots(jobId, totalSpots) {
    return updateJob(jobId, { totalSpots });
  }

  function isJobFull(job) {
    return job.filledSpots >= job.totalSpots;
  }

  function getJobById(jobId) {
    return getJobs().find(j => j.id === jobId) || null;
  }

  function submitApplication(jobId) {
    const job = getJobById(jobId);
    if (!job) return { ok: false, message: 'Job not found.' };
    if (isJobFull(job)) return { ok: false, message: 'This placement is fully booked.' };

    const profile = getStudentProfile();
    const applications = getApplications();

    const duplicate = applications.some(a =>
      a.jobId === jobId &&
      a.admissionNumber === profile.admissionNumber &&
      (a.status === 'pending' || a.status === 'approved')
    );
    if (duplicate) return { ok: false, message: 'You have already applied for this placement.' };

    applications.push({
      id: generateId('app'),
      jobId: job.id,
      jobTitle: job.title,
      studentName: profile.name,
      admissionNumber: profile.admissionNumber,
      form: profile.form,
      studentClass: profile.studentClass,
      conductRecord: MOCK_CONDUCT[Math.floor(Math.random() * MOCK_CONDUCT.length)],
      adminNotes: '',
      status: 'pending',
      appliedAt: new Date().toLocaleString(),
      decidedAt: null
    });

    saveApplications(applications);
    return { ok: true, message: `Application submitted for ${job.title}!` };
  }

  function approveApplication(appId, adminNotes) {
    const applications = getApplications();
    const app = applications.find(a => a.id === appId);
    if (!app || app.status !== 'pending') return { ok: false, message: 'Application not found or already processed.' };

    const jobs = getJobs();
    const job = jobs.find(j => j.id === app.jobId);
    if (!job) return { ok: false, message: 'Associated job no longer exists.' };
    if (isJobFull(job)) return { ok: false, message: 'This placement is already fully booked.' };

    job.filledSpots += 1;
    app.status = 'approved';
    app.adminNotes = adminNotes || '';
    app.decidedAt = new Date().toLocaleString();

    saveJobs(jobs);
    saveApplications(applications);
    return { ok: true };
  }

  function declineApplication(appId, adminNotes) {
    const applications = getApplications();
    const app = applications.find(a => a.id === appId);
    if (!app || app.status !== 'pending') return { ok: false, message: 'Application not found or already processed.' };

    app.status = 'declined';
    app.adminNotes = adminNotes || '';
    app.decidedAt = new Date().toLocaleString();
    saveApplications(applications);
    return { ok: true };
  }

  function getStats() {
    const jobs = getJobs();
    const applications = getApplications();
    return {
      pendingApplications: applications.filter(a => a.status === 'pending').length,
      activePlacements: jobs.filter(j => !isJobFull(j)).length,
      fullyBookedPlacements: jobs.filter(j => isJobFull(j)).length
    };
  }

  function getPendingApplications() {
    return getApplications().filter(a => a.status === 'pending');
  }

  function getProcessedApplications() {
    return getApplications()
      .filter(a => a.status === 'approved' || a.status === 'declined')
      .sort((a, b) => new Date(b.decidedAt) - new Date(a.decidedAt));
  }

  return {
    initJobs,
    getJobs,
    saveJobs,
    getApplications,
    saveApplications,
    getStudentProfile,
    saveStudentProfile,
    registerStudent,
    loginStudent,
    addJob,
    removeJob,
    isJobFull,
    getJobById,
    submitApplication,
    approveApplication,
    declineApplication,
    getStats,
    getPendingApplications,
    getProcessedApplications,
    getAdminSession,
    saveAdminSession,
    clearAdminSession,
    getStudentSession,
    saveStudentSession,
    clearStudentSession,
    getAdminCredentials,
    saveAdminCredentials,
    isSessionValid,
    generateId,
    hashValue,
    updateJob,
    updateJobSpots,
    getJobImage
  };
})();
