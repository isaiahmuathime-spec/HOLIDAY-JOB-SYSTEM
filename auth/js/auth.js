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

let isAdminMode = false;
let isSignUpMode = true;

function setSignupRequired(required) {
  signupFieldEls.forEach(input => { input.required = required; });
  confirmPasswordInput.required = required;
}

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
  setSignupRequired(signUp);
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
    setSignupRequired(false);
    return;
  }

  setStudentAuthMode(isSignUpMode);
}

btnStudent.addEventListener('click', () => setLoginMode(false));
btnAdmin.addEventListener('click', () => setLoginMode(true));
btnSignUp.addEventListener('click', () => setStudentAuthMode(true));
btnLogIn.addEventListener('click', () => setStudentAuthMode(false));

togglePasswordBtn.addEventListener('click', () => {
  const type = passwordInput.type === 'password' ? 'text' : 'password';
  passwordInput.type = type;
  passwordEyeIcon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
});

const form = document.getElementById('authForm');
const messageBox = document.getElementById('formMessage');

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

form.addEventListener('submit', function (event) {
  event.preventDefault();
  messageBox.textContent = '';
  messageBox.className = 'message';

  const password = document.getElementById('password').value;

  if (isAdminMode) {
    const adminUsername = adminUsernameInput.value.trim();
    const adminCredUsername = (typeof CONFIG !== 'undefined' && CONFIG.admin) ? CONFIG.admin.username : null;
    const adminPasswordHash = (typeof CONFIG !== 'undefined' && CONFIG.admin) ? CONFIG.admin.passwordHash : null;

    if (!adminUsername || !password) {
      messageBox.textContent = 'Please enter your admin username and password.';
      messageBox.className = 'message error';
      return;
    }

    // Debug logging
    console.log('Admin Login Attempt:', {
      inputUsername: adminUsername,
      configUsername: adminCredUsername,
      usernameMatch: adminUsername === adminCredUsername,
      inputPassword: password,
      inputHash: HJSData.hashValue(password),
      storedHash: adminPasswordHash,
      hashMatch: HJSData.hashValue(password) === adminPasswordHash
    });

    // Case-insensitive username comparison
    const usernameMatch = adminUsername.toLowerCase() === adminCredUsername.toLowerCase();
    const passwordMatch = HJSData.hashValue(password) === adminPasswordHash;

    if (usernameMatch && passwordMatch) {
      HJSData.saveAdminSession({
        token: HJSData.generateId('admin'),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        username: adminUsername
      });
      messageBox.textContent = 'Admin login successful. Redirecting...';
      messageBox.className = 'message success';
      window.location.href = '../admin/index.html';
      return;
    }

    messageBox.textContent = 'Incorrect admin username or password.';
    messageBox.className = 'message error';
    return;
  }

  if (isSignUpMode) {
    const name = document.getElementById('studentName').value.trim();
    const admissionNumber = document.getElementById('admissionNumber').value.trim();
    const studentForm = document.getElementById('studentForm').value.trim();
    const studentClass = document.getElementById('studentClass').value.trim();
    const email = document.getElementById('studentEmail').value.trim();
    const confirmPassword = confirmPasswordInput.value;

    if (!name || !admissionNumber || !studentForm || !studentClass || !email || !password) {
      messageBox.textContent = 'Please fill in your full name, admission number, form, class, email, and password.';
      messageBox.className = 'message error';
      return;
    }

    if (!isValidEmail(email)) {
      messageBox.textContent = 'Please enter a valid email address.';
      messageBox.className = 'message error';
      return;
    }

    if (password.length < 6) {
      messageBox.textContent = 'Password must be at least 6 characters long.';
      messageBox.className = 'message error';
      return;
    }

    if (password !== confirmPassword) {
      messageBox.textContent = 'Passwords do not match.';
      messageBox.className = 'message error';
      return;
    }

    const result = HJSData.registerStudent({
      name,
      admissionNumber,
      form: studentForm,
      studentClass,
      email,
      password
    });

    messageBox.textContent = result.message;
    messageBox.className = result.ok ? 'message success' : 'message error';

    if (result.ok) {
      form.reset();
      setTimeout(() => setStudentAuthMode(false), 1200);
    }
    return;
  }

  const identifier = loginFullNameInput.value.trim();
  if (!identifier || !password) {
    messageBox.textContent = 'Please enter your email or full name and password.';
    messageBox.className = 'message error';
    return;
  }

  const result = HJSData.loginStudent(identifier, password);
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
  messageBox.textContent = 'Login successful. Redirecting...';
  messageBox.className = 'message success';
  window.location.href = '../student/index.html';
});

setStudentAuthMode(true);