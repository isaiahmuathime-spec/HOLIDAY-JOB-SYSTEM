document.addEventListener('DOMContentLoaded', () => {
  HJSData.initJobs();
  renderJobs();
  renderStats();

  function renderStats() {
    const jobs = HJSData.getJobs();
    const applications = HJSData.getApplications();
    const profile = HJSData.getStudentProfile();
    
    const myApplications = applications.filter(a => a.admissionNumber === profile.admissionNumber);
    const approved = myApplications.filter(a => a.status === 'approved').length;

    document.getElementById('totalJobs').textContent = jobs.length;
    document.getElementById('totalApplications').textContent = myApplications.length;
    document.getElementById('approvedApplications').textContent = approved;
  }

  function renderJobs() {
    const jobs = HJSData.getJobs();
    const container = document.getElementById('jobsContainer');

    if (!jobs.length) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="fas fa-briefcase fa-3x mb-3" style="color: #cbd5e1;"></i>
          <p class="text-muted">No holiday jobs are available at the moment. Please check back later.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = jobs.map(job => {
      const full = HJSData.isJobFull(job);
      const imgSrc = HJSData.getJobImage(job.title);
      const pct = Math.min(100, (job.filledSpots / job.totalSpots) * 100);
      
      return `
        <div class="col-md-4">
          <div class="job-card">
            <div class="job-card-image">
               <img src="${imgSrc}" alt="${job.title}" onerror="this.src='../images/starehe logo.jpg'">
              <span class="job-card-badge ${full ? 'full' : 'open'}">
                <i class="fas ${full ? 'fa-times-circle' : 'fa-check-circle'} me-1"></i>
                ${full ? 'Fully Booked' : 'Open'}
              </span>
            </div>
            <div class="job-card-body">
              <h5 class="job-card-title">${job.title}</h5>
              <p class="job-card-org">
                <i class="fas fa-building"></i>
                ${job.organization}
              </p>
              <p class="job-card-dates">
                <i class="fas fa-calendar-alt"></i>
                ${job.dates || '04/04/2026 - 14/04/2026'}
              </p>
              <div class="spots-indicator">
                <span class="spots-text">${job.filledSpots}/${job.totalSpots} spots</span>
                <div class="spots-bar">
                  <div class="spots-fill" style="width: ${pct}%"></div>
                </div>
              </div>
              <button
                class="btn-apply"
                data-job-id="${job.id}"
                ${full ? 'disabled' : ''}
              >
                <i class="fas ${full ? 'fa-ban' : 'fa-paper-plane'} me-2"></i>
                ${full ? 'Fully Booked' : 'Apply Now'}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-apply:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        const result = HJSData.submitApplication(btn.dataset.jobId);
        alert(result.message);
        if (result.ok) {
          renderJobs();
          renderStats();
        }
      });
    });
  }
});