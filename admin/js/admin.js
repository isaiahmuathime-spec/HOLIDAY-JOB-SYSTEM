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
  localStorage.removeItem('hjsAdminLoggedIn');
  window.location.href = '../LoginHJS.html';
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
          <p class="small mt-2 mb-1">${escapeHtml(job.description)}</p>
          <div class="d-flex justify-content-between small mb-1">
            <span>Capacity</span>
            <strong>${job.filledSpots} / ${job.totalSpots}</strong>
          </div>
          <div class="capacity-bar">
            <div class="capacity-fill ${full ? 'full' : ''}" style="width:${pct}%"></div>
          </div>
          <button class="btn btn-sm btn-outline-danger mt-2 w-100" onclick="removeJob('${job.id}')">
            <i class="fas fa-trash-alt me-1"></i> Remove
          </button>
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
setInterval(renderAll, 5000);