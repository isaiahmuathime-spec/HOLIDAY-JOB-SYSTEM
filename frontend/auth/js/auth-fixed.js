// DOM Elements
const btnStudent = document.getElementById('btnStudent');
const btnAdmin = document.getElementById('btnAdmin');
const btnSignUp = document.getElementById('btnSignUp');
const btnLogIn = document.getElementById('btnLogIn');
const formTitle = document.getElementById('formTitle');
const studentSubnav = document.getElementById('studentSubnav');
const signupFields = document.getElementById('signupFields');
const studentLoginNameWrap = document.getElementById('studentLoginNameWrap');
const adminUsernameWrap = document.getElementById('adminUsernameWrap');
const confirmPasswordWrap = document.getElementById('confirmPasswordWrap');
const submitBtn = document.getElementById('submitBtn');
const signupFieldEls = document.querySelectorAll('.signup-field');
const confirmPasswordInput = document.getElementById('confirmPassword');
const loginFullNameInput = document.getElementById('loginFullName');
const adminUsernameInput = document.getElementById('adminUsername');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const passwordEyeIcon = document.getElementById('passwordEyeIcon');
const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
const confirmPasswordEyeIcon = document.getElementById('confirmPasswordEyeIcon');

const form = document.getElementById('authForm');
const messageBox = document.getElementById('formMessage');

let isAdminMode = false;
let isSignUpMode = true;

// Password visibility toggles
togglePasswordBtn.addEventListener('click', () => {
  const type = passwordInput.type === 'password' ? 'text' : 'password';
  passwordInput.type = type;
  passwordEyeIcon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
});

toggleConfirmPasswordBtn.addEventListener('click', () => {
  const type = confirmPasswordInput.type === 'password' ? 'text' : 'password';
  confirmPasswordInput.type = type;
  confirmPasswordEyeIcon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
});

// Mode switching functions
function setStudentAuthMode(signUp) {
  isSignUpMode = signUp;
  btnSignUp.classList.toggle('active', signUp);
  btnLogIn.classList.toggle('active', !signUp);
  signupFields.style.display = signUp ? 'block' : 'none';
  studentLoginNameWrap.style.display = signUp ? 'none' : 'block';
  adminUsernameWrap.style.display = 'none';
  confirmPasswordWrap.style.display = signUp ? 'block' : 'none';
  formTitle.textContent = signUp ? 'Student Sign Up' : 'Student Log In';
  submitBtn.textContent = signUp ? 'Create Account' : 'Log In';
  loginFullNameInput.required = !signUp;
  adminUsernameInput.required = false;
  
  // Set required fields
  signupFieldEls.forEach(input => { input.required = signUp; });
  confirmPasswordInput.required = signUp;
}

function setLoginMode(admin) {
  isAdminMode = admin;
  btnStudent.classList.toggle('active', !admin);
  btnAdmin.classList.toggle('active', admin);
  studentSubnav.style.display = admin ? 'none' : 'flex';

  if (admin) {
    formTitle.textContent = 'Admin Login';
    submitBtn.textContent = 'Log In';
    signupFields.style.display = 'none';
    studentLoginNameWrap.style.display = 'none';
    adminUsernameWrap.style.display = 'block';
    confirmPasswordWrap.style.display = 'none';
    loginFullNameInput.required = false;
    adminUsernameInput.required = true;
    signupFieldEls.forEach(input => { input.required = false; });
    confirmPasswordInput.required = false;
    return;
  }

  setStudentAuthMode(isSignUpMode);
}

// Button event listeners
btnStudent.addEventListener('click', () => setLoginMode(false));
btnAdmin.addEventListener('click', () => setLoginMode(true));
btnSignUp.addEventListener('click', () => setStudentAuthMode(true));
btnLogIn.addEventListener('click', () => setStudentAuthMode(false));

// Email validation
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Main form submission
form.addEventListener('submit', function(event) {
  event.preventDefault();
  messageBox.textContent = '';
  messageBox.className = 'message';

  const password = passwordInput.value;

  // ADMIN LOGIN
  if (isAdminMode) {
    const adminUsername = adminUsernameInput.value.trim();
    const password = passwordInput.value;

    if (!adminUsername || !password) {
      messageBox.textContent = 'Please enter both username and password.';
      messageBox.className = 'message error';
      return;
    }

    // Get admin credentials from config
    let configUsername = null;
    let configPasswordHash = null;
    
    if (typeof CONFIG !== 'undefined' && CONFIG && CONFIG.admin) {
      configUsername = CONFIG.admin.username;
      configPasswordHash = CONFIG.admin.passwordHash;
    }
    
    // Fallback to default credentials if config not loaded
    if (!configUsername || !configPasswordHash) {
      console.warn('CONFIG not loaded, using fallback credentials');
      configUsername = 'Admin';
      configPasswordHash = '185030e4'; // Hash of 'admin123'
    }

    console.log('Admin login config check:', { configUsername, configPasswordHash, CONFIG: typeof CONFIG });

    // Check credentials
    const usernameMatch = adminUsername.toLowerCase() === configUsername.toLowerCase();
    const passwordHash = HJSData.hashValue(password);
    const passwordMatch = passwordHash === configPasswordHash;

    console.log('Admin login attempt:', {
      username: adminUsername,
      passwordMatch,
      passwordHash,
      expectedHash: configPasswordHash
    });

    if (usernameMatch && passwordMatch) {
      HJSData.saveAdminSession({
        token: HJSData.generateId('admin'),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        username: adminUsername
      });
      messageBox.textContent = 'Admin login successful! Redirecting...';
      messageBox.className = 'message success';
      setTimeout(() => {
        window.location.href = './admin/index.html';
      }, 800);
      return;
    }

    messageBox.textContent = 'Incorrect username or password.';
    messageBox.className = 'message error';
    return;
  }

  // STUDENT SIGN UP
  if (isSignUpMode) {
    const name = document.getElementById('studentName').value.trim();
    const admissionNumber = document.getElementById('admissionNumber').value.trim();
    const studentForm = document.getElementById('studentForm').value.trim();
    const studentClass = document.getElementById('studentClass').value.trim();
    const email = document.getElementById('studentEmail').value.trim();
    const trimmedPassword = password.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    // Validation
    if (!name || !admissionNumber || !studentForm || !studentClass || !email || !trimmedPassword) {
      messageBox.textContent = 'Please fill in all fields.';
      messageBox.className = 'message error';
      return;
    }

    if (!isValidEmail(email)) {
      messageBox.textContent = 'Please enter a valid email address.';
      messageBox.className = 'message error';
      return;
    }

    if (trimmedPassword.length < 6) {
      messageBox.textContent = 'Password must be at least 6 characters.';
      messageBox.className = 'message error';
      return;
    }

    if (trimmedPassword !== confirmPassword) {
      messageBox.textContent = 'Passwords do not match. Please try again.';
      messageBox.className = 'message error';
      console.log('Password mismatch:', { password: trimmedPassword, confirm: confirmPassword });
      return;
    }

    // Register student
    const result = HJSData.registerStudent({
      name,
      admissionNumber,
      form: studentForm,
      studentClass,
      email,
      password: trimmedPassword
    });

    messageBox.textContent = result.message;
    messageBox.className = result.ok ? 'message success' : 'message error';

    if (result.ok) {
      form.reset();
      setTimeout(() => setStudentAuthMode(false), 1500);
    }
    return;
  }

  // STUDENT LOGIN
  const identifier = loginFullNameInput.value.trim();
  const loginPassword = passwordInput.value;

  if (!identifier || !loginPassword) {
    messageBox.textContent = 'Please enter your email/full name and password.';
    messageBox.className = 'message error';
    return;
  }

  const result = HJSData.loginStudent(identifier, loginPassword);
  if (!result.ok) {
    messageBox.textContent = result.message;
    messageBox.className = 'message error';
    return;
  }

  HJSData.saveStudentSession({
    token: HJSData.generateId('student'),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    admissionNumber: result.student.admissionNumber,
    email: result.student.email
  });

  messageBox.textContent = 'Login successful! Redirecting...';
  messageBox.className = 'message success';
  setTimeout(() => {
    window.location.href = './student/index.html';
  }, 800);
});

// Initialize
setStudentAuthMode(true);