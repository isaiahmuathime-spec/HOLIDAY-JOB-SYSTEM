HJSData.initJobs();

const savedTheme = localStorage.getItem('adminTheme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('adminTheme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  document.getElementById('themeIcon').className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function logout() {
  HJSData.clearAdminSession();
  window.location.href = '../auth/index.html';
}

function renderStats() {
  const stats = HJSData.getStats();
  document.getElementById('statPending').textContent = stats.pendingApplications;
  document.getElementById('statActive').textContent = stats.activePlacements;
  document.getElementById('statBooked').textContent = stats.fullyBookedPlacements;
}

function renderJobs() {
  const jobs = HJSData.getJobs();
  const grid = document.getElementById('jobsGrid');
  document.getElementById('jobCountBadge').textContent = `${jobs.length} job${jobs.length !== 1 ? 's' : ''}`;

  if (!jobs.length) {
    grid.innerHTML = '<div class="col-12"><div class="empty-state"><i class="fas fa-briefcase fa-2x mb-2"></i><p>No jobs posted yet. Add one using the form.</p></div></div>';
    return;
  }

  grid.innerHTML = jobs.map(job => {
    const full = HJSData.isJobFull(job);
    const pct = Math.min(100, (job.filledSpots / job.totalSpots) * 100);
    return `
      <div class="col-md-6">
        <div class="glass-card job-card">
          <div class="d-flex justify-content-between align-items-start mb-1">
            <h6 class="mb-0 fw-bold">${escapeHtml(job.title)}</h6>
            <span class="badge rounded-pill ${full ? 'badge-full' : 'badge-open'}">${full ? 'Full' : 'Open'}</span>
          </div>
          <small class="text-muted"><i class="fas fa-map-marker-alt me-1"></i>${escapeHtml(job.organization)}</small>
          <small class="d-block text-muted mb-2"><i class="fas fa-calendar-alt me-1"></i>${escapeHtml(job.dates || 'Dates not set')}</small>
          <p class="small mt-2 mb-1">${escapeHtml(job.description)}</p>
          <div class="d-flex justify-content-between small mb-1">
            <span>Capacity</span>
            <strong>${job.filledSpots} / ${job.totalSpots}</strong>
          </div>
          <div class="capacity-bar">
            <div class="capacity-fill ${full ? 'full' : ''}" style="width:${pct}%"></div>
          </div>
          <div class="d-flex gap-2 mt-2 flex-column flex-sm-row">
            <button class="btn btn-sm btn-outline-secondary flex-fill" type="button" onclick="openEditJobModal('${job.id}')">
              <i class="fas fa-edit me-1"></i> Edit
            </button>
            <div class="input-group input-group-sm" style="max-width:180px;">
              <input
                type="number"
                class="form-control"
                id="spots-${job.id}"
                min="${job.filledSpots || 1}"
                value="${job.totalSpots}"
                aria-label="Total spots for ${escapeHtml(job.title)}"
              />
              <button class="btn btn-outline-primary" type="button" onclick="updateJobSpots('${job.id}')">
                Save
              </button>
            </div>
            <button class="btn btn-sm btn-outline-danger flex-fill" onclick="removeJob('${job.id}')">
              <i class="fas fa-trash-alt me-1"></i> Remove
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderReviewQueue() {
  const pending = HJSData.getPendingApplications();
  const container = document.getElementById('reviewQueue');
  document.getElementById('queueCountBadge').textContent = `${pending.length} pending`;

  if (!pending.length) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox fa-3x mb-3"></i>
        <h5>Queue is empty</h5>
        <p>New student applications will appear here for your review.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = pending.map(app => `
    <div class="queue-item" id="queue-${app.id}">
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-2">
        <div>
          <h6 class="mb-0 fw-bold">${escapeHtml(app.studentName)}</h6>
          <div class="applicant-meta">
            <span><i class="fas fa-id-card me-1"></i>${escapeHtml(app.admissionNumber)}</span>
            <span><i class="fas fa-graduation-cap me-1"></i>${escapeHtml(app.form || app.formClass || '—')}</span>
            <span><i class="fas fa-users me-1"></i>${escapeHtml(app.studentClass || '—')}</span>
            <span><i class="fas fa-briefcase me-1"></i>${escapeHtml(app.jobTitle)}</span>
            <span><i class="fas fa-clock me-1"></i>${escapeHtml(app.appliedAt)}</span>
          </div>
        </div>
      </div>
      <label class="form-label small fw-semibold mt-1">Conduct / Remarks</label>
      <div class="conduct-box">
        <i class="fas fa-clipboard-check me-1"></i>${escapeHtml(app.conductRecord)}
      </div>
      <textarea class="form-control form-control-sm mb-2" id="notes-${app.id}" rows="2" placeholder="Add notes to justify your decision (optional)...">${escapeHtml(app.adminNotes)}</textarea>
      <div class="d-flex gap-2">
        <button class="btn btn-approve flex-fill" onclick="approveApp('${app.id}')">
          <i class="fas fa-check me-1"></i> Approve
        </button>
        <button class="btn btn-decline flex-fill" onclick="declineApp('${app.id}')">
          <i class="fas fa-times me-1"></i> Decline
        </button>
      </div>
    </div>
  `).join('');
}

function renderHistory() {
  const processed = HJSData.getProcessedApplications();
  const tbody = document.getElementById('historyBody');

  if (!processed.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-4 text-muted">
          <i class="fas fa-history me-1"></i> No processed applications yet.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = processed.map(app => `
    <tr>
      <td>${escapeHtml(app.studentName)}</td>
      <td>${escapeHtml(app.admissionNumber)}</td>
      <td>${escapeHtml(app.form || app.formClass || '—')}</td>
      <td>${escapeHtml(app.studentClass || '—')}</td>
      <td>${escapeHtml(app.jobTitle)}</td>
      <td><span class="status-${app.status}">${app.status === 'approved' ? 'Approved' : 'Declined'}</span></td>
      <td>${escapeHtml(app.decidedAt || '—')}</td>
    </tr>
  `).join('');
}

function renderAll() {
  renderStats();
  renderJobs();
  renderReviewQueue();
  renderHistory();
}

document.getElementById('adminCredentialsForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const currentPassword = document.getElementById('currentAdminPassword').value;
  const newUsername = document.getElementById('newAdminUsername').value.trim();
  const newPassword = document.getElementById('newAdminPassword').value;
  const confirmPassword = document.getElementById('confirmAdminPassword').value;
  const message = document.getElementById('adminCredentialsMessage');
  const credentials = HJSData.getAdminCredentials();

  message.className = 'small text-danger';
  if (HJSData.hashValue(currentPassword) !== credentials.passwordHash) {
    message.textContent = 'Current password is incorrect.';
    return;
  }
  if (newUsername.length < 3) {
    message.textContent = 'Username must be at least 3 characters.';
    return;
  }
  if (newPassword.length < 6) {
    message.textContent = 'New password must be at least 6 characters.';
    return;
  }
  if (newPassword !== confirmPassword) {
    message.textContent = 'The new passwords do not match.';
    return;
  }

  HJSData.saveAdminCredentials(newUsername, newPassword);
  const session = HJSData.getAdminSession();
  if (session) {
    session.username = newUsername;
    HJSData.saveAdminSession(session);
  }
  event.target.reset();
  message.className = 'small text-success';
  message.textContent = 'Admin account updated successfully.';
});

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.getElementById('addJobForm').addEventListener('submit', (e) => {
  e.preventDefault();
  HJSData.addJob({
    title: document.getElementById('jobTitle').value,
    organization: document.getElementById('jobOrg').value,
    description: document.getElementById('jobDesc').value,
    dates: document.getElementById('jobDates').value,
    totalSpots: document.getElementById('jobSpots').value
  });
  e.target.reset();
  document.getElementById('jobSpots').value = 5;
  renderAll();
});

function removeJob(jobId) {
  if (!confirm('Remove this job from the active list?')) return;
  HJSData.removeJob(jobId);
  renderAll();
}

function openEditJobModal(jobId) {
  const job = HJSData.getJobs().find(j => j.id === jobId);
  if (!job) return;

  document.getElementById('editJobId').value = job.id;
  document.getElementById('editJobTitle').value = job.title;
  document.getElementById('editJobOrg').value = job.organization;
  document.getElementById('editJobDesc').value = job.description;
  document.getElementById('editJobDates').value = job.dates || '';
  document.getElementById('editJobSpots').value = job.totalSpots;

  const modal = new bootstrap.Modal(document.getElementById('editJobModal'));
  modal.show();
}

function updateJobSpots(jobId) {
  const input = document.getElementById(`spots-${jobId}`);
  if (!input) return;
  const result = HJSData.updateJobSpots(jobId, input.value);
  if (!result.ok) {
    alert(result.message);
    input.value = result.job ? result.job.totalSpots : input.getAttribute('min');
    return;
  }
  renderAll();
}

const editJobForm = document.getElementById('editJobForm');
if (editJobForm) {
  editJobForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const jobId = document.getElementById('editJobId').value;
    const result = HJSData.updateJob(jobId, {
      title: document.getElementById('editJobTitle').value,
      organization: document.getElementById('editJobOrg').value,
      description: document.getElementById('editJobDesc').value,
      dates: document.getElementById('editJobDates').value,
      totalSpots: document.getElementById('editJobSpots').value
    });

    if (!result.ok) {
      alert(result.message);
      return;
    }

    renderAll();
    const modalEl = document.getElementById('editJobModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  });
}

function approveApp(appId) {
  const notes = document.getElementById(`notes-${appId}`)?.value || '';
  const result = HJSData.approveApplication(appId, notes);
  if (!result.ok) {
    alert(result.message);
    return;
  }
  renderAll();
}

function declineApp(appId) {
  const notes = document.getElementById(`notes-${appId}`)?.value || '';
  const result = HJSData.declineApplication(appId, notes);
  if (!result.ok) {
    alert(result.message);
    return;
  }
  renderAll();
}

renderAll();