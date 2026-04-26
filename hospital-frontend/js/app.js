/* ============================================
   app.js - مستشفى النور التخصصي
   Main Application Logic
   ============================================ */

/* ──────────────────────────────────────────
   STATE
────────────────────────────────────────── */
let currentUser      = JSON.parse(localStorage.getItem('hospital_user') || 'null');
let allAppointments  = [];
let allPatients      = [];
let allDoctors       = [];
let allDepts         = [];
let searchTimer      = null;
window._currentPage  = 'dashboard';

// Department image mapping
const deptImages = {
  'قلب وأوعية دموية': 'heart.png',
  'أعصاب': 'nerve-cell.png',
  'عظام ومفاصل': 'joint.png',
  'أطفال وحديثي الولادة': 'playing-kids.png',
  'عيون': 'information.png', // placeholder
  'نساء وولادة': 'witness.png', // placeholder
  'جراحة عامة': 'doctor.png',
  'مختبرات': 'Dr.png',
  'أشعة وتصوير': 'Medical-Specialty-Lungs--Streamline-Freehand.png',
  'طوارئ': 'call.png'
};

/* ──────────────────────────────────────────
   INIT
────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  I18n.init();

  if (HospitalAPI.auth.isLoggedIn() && currentUser) {
    showApp();
    loadDashboard();
  } else {
    showLogin();
  }

  // Close modal on overlay click
  document.querySelectorAll('.modal-overlay').forEach(o => {
    o.addEventListener('click', e => {
      if (e.target === o) o.classList.remove('active');
    });
  });

  // Escape key closes modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape')
      document.querySelectorAll('.modal-overlay.active')
        .forEach(m => m.classList.remove('active'));
    if (e.key === 'Enter' && !document.getElementById('loginPage').classList.contains('hidden'))
      doLogin();
  });
});

/* ──────────────────────────────────────────
   AUTH
────────────────────────────────────────── */
function showLogin() {
  document.getElementById('loginPage').style.display = '';
  document.getElementById('appPage').style.display = 'none';
}

function showApp() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('appPage').style.display = '';

  if (currentUser) {
    const name = currentUser.username || currentUser.name || '—';
    document.getElementById('userName').textContent = name;
    document.getElementById('userRole').textContent = roleLabel(currentUser.role);
    const av = name[0]?.toUpperCase() || 'U';
    document.getElementById('userAvatar').textContent = av;
    document.getElementById('topUserAvatar').textContent = av;
  }
}

async function doLogin() {
  const btn      = document.getElementById('loginBtn');
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const alertEl  = document.getElementById('loginAlert');

  if (!email || !password) {
    showAlert(alertEl, 'danger', t('loginRequired'));
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<div class="spinner" style="border-color:rgba(255,255,255,.4);border-top-color:white;width:18px;height:18px"></div> ${t('loggingIn')}`;
  alertEl.innerHTML = '';

  try {
    const data  = await HospitalAPI.auth.login(email, password);
    currentUser = data.user;
    localStorage.setItem('hospital_user', JSON.stringify(currentUser));
    toast(t('loginSuccess'), 'success');
    showApp();
    loadDashboard();
  } catch (err) {
    const msg = err.message.includes('Cannot connect') ? t('loginError') : err.message;
    showAlert(alertEl, 'danger', msg);
  }

  btn.disabled = false;
  btn.innerHTML = `<i class="fas fa-sign-in-alt"></i> <span data-ar="تسجيل الدخول" data-en="Sign In">${t('login')}</span>`;
}

function doLogout() {
  HospitalAPI.auth.logout();
  currentUser = null;
  localStorage.removeItem('hospital_user');
  showLogin();
  toast(t('loggedOut'), 'info');
}

function togglePw() {
  const inp = document.getElementById('loginPassword');
  const eye = document.getElementById('pwEye');
  inp.type  = inp.type === 'password' ? 'text' : 'password';
  eye.className = `fas fa-${inp.type === 'password' ? 'eye' : 'eye-slash'}`;
}

/* ──────────────────────────────────────────
   NAVIGATION
────────────────────────────────────────── */
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const page = document.getElementById('page-' + name);
  if (page) page.classList.add('active');

  document.querySelectorAll(`.nav-item[data-page="${name}"]`)
    .forEach(n => n.classList.add('active'));

  window._currentPage = name;

  const pageTitles = {
    dashboard:   'dashboard',
    appointments:'appointments',
    patients:    'patients',
    doctors:     'doctors',
    departments: 'departments',
    messages:    'messages',
    news:        'news'
  };

  document.getElementById('pageTitle').textContent    = t(pageTitles[name] || name);
  document.getElementById('pageSubtitle').textContent = t((pageTitles[name] || name) + 'Sub') || '';

  const loaders = {
    appointments: loadAppointments,
    patients:     loadPatients,
    doctors:      loadDoctors,
    departments:  loadDepartments,
    messages:     loadMessages,
    news:         loadNews
  };
  if (loaders[name]) loaders[name]();

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
}

function refreshCurrent() {
  const icon = document.getElementById('refreshIcon');
  icon.style.animation = 'spin 0.7s linear infinite';
  setTimeout(() => icon.style.animation = '', 900);
  showPage(window._currentPage);
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

/* ──────────────────────────────────────────
   DASHBOARD
────────────────────────────────────────── */
async function loadDashboard() {
  try {
    const s = await HospitalAPI.stats.get();
    document.getElementById('s-patients').textContent = s.total_patients      ?? '—';
    document.getElementById('s-doctors').textContent  = s.total_doctors       ?? '—';
    document.getElementById('s-today').textContent    = s.today_appointments  ?? '—';
    document.getElementById('s-pending').textContent  = s.pending_appointments?? '—';
    document.getElementById('s-rooms').textContent    = s.occupied_rooms      ?? '—';
    document.getElementById('s-msgs').textContent     = s.new_messages        ?? '—';
    document.getElementById('s-depts').textContent    = s.total_departments   ?? '—';

    if (s.pending_appointments > 0) {
      const pb = document.getElementById('pendingBadge');
      pb.textContent = s.pending_appointments;
      pb.style.display = '';
    }
    if (s.new_messages > 0) {
      const mb = document.getElementById('msgBadge');
      mb.textContent = s.new_messages;
      mb.style.display = '';
    }
  } catch (e) { /* stats might need admin role */ }

  loadDashAppts();
  loadDashDoctors();
  loadDashMsgs();
}

async function loadDashAppts() {
  const el = document.getElementById('dashAppts');
  try {
    const appts = await HospitalAPI.appointments.list();
    const slice = appts.slice(0, 6);
    if (!slice.length) { el.innerHTML = emptyState('fa-calendar-times', t('noAppts')); return; }

    el.innerHTML = slice.map(a => `
      <div class="dash-item">
        <div class="dash-item-icon" style="background:${statusBg(a.status)};color:${statusColor(a.status)}">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div class="dash-item-info">
          <div class="dash-item-name">${a.patient_name || a.guest_name || 'Guest'}</div>
          <div class="dash-item-sub">${a.doctor_name || '—'} · ${fmtDate(a.appointment_date)} ${(a.appointment_time||'').slice(0,5)}</div>
        </div>
        ${statusBadge(a.status)}
      </div>`).join('');
  } catch (e) {
    el.innerHTML = errorState(t('loadError'));
  }
}

async function loadDashDoctors() {
  const el = document.getElementById('dashDoctors');
  try {
    const docs = (allDoctors.length ? allDoctors : await HospitalAPI.doctors.list()).slice(0, 6);
    if (!docs.length) { el.innerHTML = emptyState('fa-user-md', t('noDoctors')); return; }

    el.innerHTML = docs.map(d => `
      <div class="dash-item">
        <div class="dash-item-icon" style="background:#e1f5ee;color:#0f6e56">
          <i class="fas fa-user-md"></i>
        </div>
        <div class="dash-item-info">
          <div class="dash-item-name">${d.name_ar}</div>
          <div class="dash-item-sub">${d.specialty_ar}</div>
        </div>
        <div class="stars" style="font-size:11px">★</div>
        <span style="font-size:11px;color:var(--text-muted)">${d.rating || 5}</span>
      </div>`).join('');
  } catch (e) { el.innerHTML = errorState(t('loadError')); }
}

async function loadDashMsgs() {
  const el = document.getElementById('dashMsgs');
  try {
    const msgs = await HospitalAPI.contact.list();
    const slice = msgs.slice(0, 5);
    if (!slice.length) { el.innerHTML = emptyState('fa-envelope-open', t('noMessages')); return; }

    el.innerHTML = `<div class="msg-list">${
      slice.map(m => `
        <div class="msg-item ${m.status === 'new' ? 'new' : ''}">
          <div class="msg-item-top">
            <span class="msg-item-name">${m.name}</span>
            <span class="msg-item-date">${fmtDate(m.created_at)}</span>
          </div>
          <div class="msg-item-subject">${m.subject || '—'}</div>
          <div class="msg-item-preview">${m.message}</div>
        </div>`).join('')
    }</div>`;
  } catch (e) { el.innerHTML = errorState(t('loadError')); }
}

/* ──────────────────────────────────────────
   APPOINTMENTS
────────────────────────────────────────── */
async function loadAppointments() {
  const status = document.getElementById('apptStatus')?.value || '';
  const date   = document.getElementById('apptDate')?.value   || '';
  const tbody  = document.getElementById('apptTable');
  tbody.innerHTML = loadingRow(9);

  try {
    const data = await HospitalAPI.appointments.list({ status, date });
    allAppointments = data;
    renderAppointments(allAppointments);
  } catch (e) {
    tbody.innerHTML = errorRow(9, t('loadError'));
  }

  loadApptSelects();
}

function filterAppointments() {
  const q = document.getElementById('apptSearch').value.toLowerCase();
  const filtered = allAppointments.filter(a =>
    (a.patient_name  || '').toLowerCase().includes(q) ||
    (a.guest_name    || '').toLowerCase().includes(q) ||
    (a.doctor_name   || '').toLowerCase().includes(q) ||
    (a.guest_phone   || '').includes(q)
  );
  renderAppointments(filtered);
}

function renderAppointments(appts) {
  const tbody = document.getElementById('apptTable');
  const countEl = document.getElementById('apptCount');
  const isEn = I18n.isEn();

  if (countEl) countEl.textContent = `(${appts.length})`;

  if (!appts.length) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state">
      <i class="fas fa-calendar-times"></i>
      <h3>${t('noAppts')}</h3>
    </div></td></tr>`;
    return;
  }

  tbody.innerHTML = appts.map(a => `
    <tr>
      <td style="color:var(--text-light);font-size:11px">${a.id}</td>
      <td>
        <strong>${a.patient_name || a.guest_name || (isEn ? 'Guest' : 'زائر')}</strong>
        ${a.guest_phone ? `<br><small style="color:var(--text-muted)">${a.guest_phone}</small>` : ''}
      </td>
      <td>
        ${a.doctor_name || '—'}
        ${a.specialty_ar ? `<br><small style="color:var(--text-muted)">${a.specialty_ar}</small>` : ''}
      </td>
      <td style="font-size:12px">${a.department_name || '—'}</td>
      <td style="white-space:nowrap">${fmtDate(a.appointment_date)}</td>
      <td style="white-space:nowrap">${(a.appointment_time || '—').slice(0,5)}</td>
      <td>${statusBadge(a.status)}</td>
      <td>${typeBadge(a.type)}</td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="btn btn-ghost btn-icon sm"
            onclick="openEditAppt(${a.id},'${a.status}','${(a.notes||'').replace(/'/g,'')}')"
            title="${t('edit')}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-ghost btn-icon sm"
            onclick="cancelAppt(${a.id})"
            style="color:var(--danger)"
            title="${t('cancel')}">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </td>
    </tr>`).join('');
}

async function createAppointment() {
  const doctorId  = document.getElementById('apptDoctorId').value;
  const date      = document.getElementById('apptDateNew').value;
  const time      = document.getElementById('apptTimeNew').value;
  const guestName = document.getElementById('apptGuestName').value.trim();
  const guestPhone= document.getElementById('apptGuestPhone').value.trim();

  if (!doctorId || !date || !time) { toast(t('fillRequired'), 'danger'); return; }
  if (!guestName || !guestPhone)   { toast(t('guestRequired'), 'danger'); return; }

  try {
    await HospitalAPI.appointments.book({
      doctor_id:        parseInt(doctorId),
      department_id:    document.getElementById('apptDeptId').value || undefined,
      appointment_date: date,
      appointment_time: time,
      type:             document.getElementById('apptType').value,
      notes:            document.getElementById('apptNotes').value,
      guest_name:       guestName,
      guest_phone:      guestPhone
    });
    toast(t('apptBooked'), 'success');
    closeModal('modalNewAppt');
    clearApptForm();
    loadAppointments();
  } catch (err) {
    toast(err.message, 'danger');
  }
}

function clearApptForm() {
  ['apptDoctorId','apptDeptId','apptDateNew','apptTimeNew','apptGuestName','apptGuestPhone','apptNotes']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

function openEditAppt(id, status, notes) {
  document.getElementById('editApptId').value     = id;
  document.getElementById('editApptStatus').value = status;
  document.getElementById('editApptNotes').value  = notes;
  openModal('modalEditAppt');
}

async function updateAppointment() {
  const id     = document.getElementById('editApptId').value;
  const status = document.getElementById('editApptStatus').value;
  const notes  = document.getElementById('editApptNotes').value;

  try {
    await HospitalAPI.appointments.updateStatus(id, status, notes);
    toast(t('apptUpdated'), 'success');
    closeModal('modalEditAppt');
    loadAppointments();
  } catch (err) {
    toast(err.message, 'danger');
  }
}

async function cancelAppt(id) {
  if (!confirm(t('cancelApptConfirm'))) return;
  try {
    await HospitalAPI.appointments.cancel(id);
    toast(t('apptCancelled'), 'success');
    loadAppointments();
  } catch (err) {
    toast(err.message, 'danger');
  }
}

async function loadApptSelects() {
  // Doctors select
  const docSel = document.getElementById('apptDoctorId');
  if (docSel && docSel.options.length <= 1) {
    try {
      const docs = await HospitalAPI.doctors.list();
      allDoctors = docs;
      docs.forEach(d => docSel.add(new Option(`${d.name_ar} — ${d.specialty_ar}`, d.id)));
    } catch (e) {}
  }

  // Depts select
  const deptSel = document.getElementById('apptDeptId');
  if (deptSel && deptSel.options.length <= 1) {
    try {
      if (!allDepts.length) allDepts = await HospitalAPI.departments.list();
      allDepts.forEach(d => deptSel.add(new Option(I18n.isEn() ? d.name_en : d.name_ar, d.id)));
    } catch (e) {}
  }
}

/* ──────────────────────────────────────────
   PATIENTS
────────────────────────────────────────── */
async function loadPatients() {
  const tbody = document.getElementById('patTable');
  tbody.innerHTML = loadingRow(8);

  try {
    const data = await HospitalAPI.patients.list();
    allPatients = data;
    renderPatients(allPatients);
  } catch (e) {
    tbody.innerHTML = errorRow(8, t('loadError'));
  }
}

function searchPatients() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    const q = document.getElementById('patSearch').value.trim();
    if (!q) { renderPatients(allPatients); return; }
    try {
      const data = await HospitalAPI.patients.list(q);
      renderPatients(data);
    } catch (e) {}
  }, 400);
}

function renderPatients(patients) {
  const tbody   = document.getElementById('patTable');
  const countEl = document.getElementById('patCount');
  const isEn    = I18n.isEn();
  if (countEl) countEl.textContent = `(${patients.length})`;

  if (!patients.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state">
      <i class="fas fa-user-slash"></i><h3>${t('noPatients')}</h3></div></td></tr>`;
    return;
  }

  tbody.innerHTML = patients.map(p => `
    <tr>
      <td style="color:var(--text-light);font-size:11px">${p.id}</td>
      <td>
        <strong style="cursor:pointer;color:var(--primary)" onclick="showPatientDetail(${p.id})">
          ${isEn && p.name_en ? p.name_en : p.name_ar}
        </strong>
      </td>
      <td>
        <span class="badge ${p.gender === 'male' ? 'badge-info' : 'badge-purple'}">
          ${p.gender === 'male' ? t('male') : t('female')}
        </span>
      </td>
      <td>${p.blood_type ? `<span class="badge badge-danger">${p.blood_type}</span>` : '—'}</td>
      <td>${p.phone}</td>
      <td style="font-size:12px">${p.date_of_birth ? fmtDate(p.date_of_birth) : '—'}</td>
      <td style="font-size:11px;color:var(--text-muted)">${fmtDate(p.created_at)}</td>
      <td>
        <button class="btn btn-ghost btn-icon sm" onclick="showPatientDetail(${p.id})" title="${t('actions')}">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    </tr>`).join('');
}

async function createPatient() {
  const body = {
    name_ar:                 document.getElementById('patNameAr').value,
    name_en:                 document.getElementById('patNameEn').value,
    gender:                  document.getElementById('patGender').value,
    national_id:             document.getElementById('patNationalId').value,
    phone:                   document.getElementById('patPhone').value,
    email:                   document.getElementById('patEmail').value,
    date_of_birth:           document.getElementById('patDOB').value,
    blood_type:              document.getElementById('patBlood').value || undefined,
    address:                 document.getElementById('patAddress').value,
    allergies:               document.getElementById('patAllergies').value,
    chronic_diseases:        document.getElementById('patChronic').value,
    emergency_contact_name:  document.getElementById('patEmergencyName').value,
    emergency_contact_phone: document.getElementById('patEmergencyPhone').value
  };

  if (!body.name_ar || !body.phone || !body.gender) {
    toast(t('fillRequired'), 'danger'); return;
  }

  try {
    await HospitalAPI.patients.create(body);
    toast(t('patientAdded'), 'success');
    closeModal('modalNewPatient');
    loadPatients();
  } catch (err) {
    toast(err.message, 'danger');
  }
}

async function showPatientDetail(id) {
  openModal('modalPatientDetail');
  const el = document.getElementById('patientDetailBody');
  el.innerHTML = `<div style="text-align:center;padding:48px"><div class="spinner"></div></div>`;

  try {
    const p = await HospitalAPI.patients.get(id);
    const records = p.medical_records || [];
    const isEn = I18n.isEn();

    el.innerHTML = `
      <div class="patient-profile">
        <div class="patient-ava ${p.gender}">
          <i class="fas fa-${p.gender === 'male' ? 'male' : 'female'}"></i>
        </div>
        <div style="flex:1">
          <div class="patient-full-name">${isEn && p.name_en ? p.name_en : p.name_ar}</div>
          ${p.name_en && !isEn ? `<div class="patient-en-name">${p.name_en}</div>` : ''}
          <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">
            <span class="badge ${p.gender === 'male' ? 'badge-info' : 'badge-purple'}">${p.gender === 'male' ? t('male') : t('female')}</span>
            ${p.blood_type ? `<span class="badge badge-danger">${p.blood_type}</span>` : ''}
          </div>
        </div>
      </div>

      <div class="info-grid">
        ${infoItem(t('phone'),       p.phone || '—',                          'fa-phone')}
        ${infoItem(t('emailLabel'),  p.email || '—',                          'fa-envelope')}
        ${infoItem(t('dob'),         p.date_of_birth ? fmtDate(p.date_of_birth) : '—', 'fa-birthday-cake')}
        ${infoItem(t('nationalId'),  p.national_id || '—',                   'fa-id-card')}
        ${infoItem(t('allergies'),   p.allergies || '—',                      'fa-allergies')}
        ${infoItem(t('chronic'),     p.chronic_diseases || '—',               'fa-heartbeat')}
        ${infoItem(t('address'),     p.address || '—',                        'fa-map-marker-alt')}
        ${infoItem(t('emergencyName') + ' / ' + t('emergencyPhone'),
          `${p.emergency_contact_name || '—'} / ${p.emergency_contact_phone || '—'}`, 'fa-phone-alt')}
      </div>

      <div class="records-title">
        <i class="fas fa-file-medical"></i>
        ${t('medicalRecords')} (${records.length})
      </div>

      ${records.length
        ? records.map(r => `
          <div class="record-card">
            <div class="record-header">
              <span class="record-doctor"><i class="fas fa-user-md" style="color:var(--accent)"></i> ${r.doctor_name || '—'}</span>
              <span class="record-date">${fmtDate(r.created_at)}</span>
            </div>
            ${r.diagnosis  ? `<div class="record-row"><strong>${t('diagnosis')}:</strong> ${r.diagnosis}</div>` : ''}
            ${r.treatment  ? `<div class="record-row"><strong>${t('treatment')}:</strong> ${r.treatment}</div>` : ''}
            ${r.prescription ? `<div class="record-row"><strong>${t('prescription')}:</strong> ${r.prescription}</div>` : ''}
          </div>`).join('')
        : `<div class="alert alert-info"><i class="fas fa-info-circle"></i> ${t('noRecords')}</div>`
      }`;
  } catch (err) {
    el.innerHTML = `<div class="alert alert-danger"><i class="fas fa-exclamation-circle"></i> ${err.message}</div>`;
  }
}

/* ──────────────────────────────────────────
   DOCTORS
────────────────────────────────────────── */
async function loadDoctors() {
  const grid   = document.getElementById('docGrid');
  const deptId = document.getElementById('docDeptFilter')?.value || '';
  grid.innerHTML = `<div class="empty-full"><div class="spinner"></div></div>`;

  try {
    const docs = await HospitalAPI.doctors.list({ department_id: deptId || undefined });
    allDoctors = deptId ? allDoctors : docs;
    renderDoctors(docs);
  } catch (e) {
    grid.innerHTML = `<div class="empty-full">${errorState(t('loadError'))}</div>`;
  }

  loadDocDeptFilter();
}

function searchDoctors() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    const q = document.getElementById('docSearch').value.trim();
    try {
      const docs = await HospitalAPI.doctors.list({ search: q || undefined });
      renderDoctors(docs);
    } catch (e) {}
  }, 400);
}

function renderDoctors(docs) {
  const grid = document.getElementById('docGrid');
  const isEn = I18n.isEn();

  if (!docs.length) {
    grid.innerHTML = `<div class="empty-full">${emptyState('fa-user-slash', t('noDoctors'))}</div>`;
    return;
  }

  grid.innerHTML = docs.map(d => `
    <div class="doc-card">
      <div class="doc-avatar">${d.photo_url ? `<img src="${d.photo_url}" alt="${d.name_ar}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` : getInitials(d.name_ar)}</div>
      <div class="doc-name">${isEn && d.name_en ? d.name_en : d.name_ar}</div>
      <div class="doc-specialty">${isEn && d.specialty_en ? d.specialty_en : d.specialty_ar}</div>
      <div class="doc-rating">
        <span class="stars">${'★'.repeat(Math.round(parseFloat(d.rating) || 5))}</span>
        <span class="rating-val">${d.rating || 5.0}</span>
      </div>
      <div class="doc-meta">
        ${d.department_name ? `<div class="doc-meta-row"><i class="fas fa-hospital-alt"></i> ${d.department_name}</div>` : ''}
        ${d.experience_years ? `<div class="doc-meta-row"><i class="fas fa-briefcase-medical"></i> ${d.experience_years} ${t('years')}</div>` : ''}
        ${d.available_days ? `<div class="doc-meta-row"><i class="fas fa-calendar-alt"></i> ${d.available_days}</div>` : ''}
        ${d.available_from ? `<div class="doc-meta-row"><i class="fas fa-clock"></i> ${d.available_from?.slice(0,5)} – ${d.available_to?.slice(0,5)}</div>` : ''}
      </div>
    </div>`).join('');
}

async function loadDocDeptFilter() {
  const sel = document.getElementById('docDeptFilter');
  if (!sel || sel.options.length > 1) return;
  try {
    if (!allDepts.length) allDepts = await HospitalAPI.departments.list();
    allDepts.forEach(d => sel.add(new Option(I18n.isEn() ? d.name_en : d.name_ar, d.id)));
  } catch (e) {}
}

/* ──────────────────────────────────────────
   DEPARTMENTS
────────────────────────────────────────── */
async function loadDepartments() {
  const grid = document.getElementById('deptGrid');
  grid.innerHTML = `<div class="empty-full"><div class="spinner"></div></div>`;

  try {
    const depts = await HospitalAPI.departments.list();
    allDepts = depts;
    const isEn = I18n.isEn();

    if (!depts.length) {
      grid.innerHTML = `<div class="empty-full">${emptyState('fa-hospital-alt', t('noDepts'))}</div>`;
      return;
    }

    grid.innerHTML = depts.map(d => `
      <div class="dept-card">
        <div class="dept-icon-wrap">
          <img src="img/${deptImages[d.name_ar] || 'doctor.png'}" alt="${d.name_ar}" style="width: 40px; height: 40px; object-fit: contain;">
        </div>
        <div class="dept-name">${isEn ? d.name_en : d.name_ar}</div>
        <div class="dept-name-en">${isEn ? d.name_ar : d.name_en}</div>
        <div class="dept-floor">
          <i class="fas fa-building" style="font-size:11px"></i>
          ${t('floor')}: ${d.floor_number == 0 ? t('ground') : d.floor_number}
        </div>
        ${d.description_ar ? `<div class="dept-desc">${isEn && d.description_en ? d.description_en : d.description_ar}</div>` : ''}
      </div>`).join('');
  } catch (e) {
    grid.innerHTML = `<div class="empty-full">${errorState(t('loadError'))}</div>`;
  }
}

/* ──────────────────────────────────────────
   MESSAGES
────────────────────────────────────────── */
async function loadMessages() {
  const status = document.getElementById('msgStatus')?.value || '';
  const tbody  = document.getElementById('msgTable');
  tbody.innerHTML = loadingRow(8);

  try {
    const msgs = await HospitalAPI.contact.list(status);
    if (!msgs.length) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state">
        <i class="fas fa-envelope-open"></i><h3>${t('noMessages')}</h3></div></td></tr>`;
      return;
    }

    tbody.innerHTML = msgs.map(m => `
      <tr>
        <td style="color:var(--text-light);font-size:11px">${m.id}</td>
        <td>
          <strong>${m.name}</strong>
          ${m.phone ? `<br><small style="color:var(--text-muted)">${m.phone}</small>` : ''}
        </td>
        <td style="font-size:12px">${m.email || '—'}</td>
        <td style="font-size:12px">${m.subject || '—'}</td>
        <td style="font-size:12px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${m.message}">
          ${m.message}
        </td>
        <td>${msgStatusBadge(m.status)}</td>
        <td style="font-size:11px;color:var(--text-muted);white-space:nowrap">${fmtDate(m.created_at)}</td>
        <td>
          ${m.status === 'new'
            ? `<button class="btn btn-ghost btn-sm" onclick="markRead(${m.id})">
                <i class="fas fa-check"></i> ${t('markRead')}
               </button>`
            : ''}
        </td>
      </tr>`).join('');
  } catch (e) {
    tbody.innerHTML = errorRow(8, t('loadError'));
  }
}

async function markRead(id) {
  try {
    await HospitalAPI.contact.updateStatus(id, 'read');
    toast(t('msgMarkedRead'), 'success');
    loadMessages();
  } catch (err) {
    toast(err.message, 'danger');
  }
}

/* ──────────────────────────────────────────
   NEWS
────────────────────────────────────────── */
async function loadNews() {
  const grid = document.getElementById('newsGrid');
  grid.innerHTML = `<div class="empty-full"><div class="spinner"></div></div>`;

  try {
    const articles = await HospitalAPI.news.list();
    const isEn = I18n.isEn();

    if (!articles.length) {
      grid.innerHTML = `<div class="empty-full">${emptyState('fa-newspaper', t('noNews'))}</div>`;
      return;
    }

    grid.innerHTML = articles.map(n => `
      <div class="news-card">
        ${n.image_url
          ? `<img src="${n.image_url}" class="news-img" alt="${n.title_ar}" onerror="this.parentElement.querySelector('.news-img-placeholder').style.display='flex';this.remove()">`
          : ''}
        <div class="news-img-placeholder" style="display:${n.image_url ? 'none' : 'flex'}">
          <i class="fas fa-newspaper"></i>
        </div>
        <div class="news-body">
          ${n.category ? `<div class="news-cat"><span class="badge badge-info">${n.category}</span></div>` : ''}
          <div class="news-title">${isEn && n.title_en ? n.title_en : n.title_ar}</div>
          <div class="news-date">
            <i class="fas fa-calendar-alt"></i>
            ${fmtDate(n.published_at || n.created_at)}
          </div>
        </div>
      </div>`).join('');
  } catch (e) {
    grid.innerHTML = `<div class="empty-full">${errorState(t('loadError'))}</div>`;
  }
}

async function createNews() {
  const body = {
    title_ar:    document.getElementById('newsTitleAr').value,
    title_en:    document.getElementById('newsTitleEn').value,
    content_ar:  document.getElementById('newsContent').value,
    category:    document.getElementById('newsCategory').value,
    image_url:   document.getElementById('newsImage').value,
    is_published:parseInt(document.getElementById('newsPublish').value)
  };

  if (!body.title_ar || !body.content_ar) {
    toast(t('newsRequired'), 'danger'); return;
  }

  try {
    await HospitalAPI.news.create(body);
    toast(t('newsPublished'), 'success');
    closeModal('modalNewNews');
    loadNews();
  } catch (err) {
    toast(err.message, 'danger');
  }
}

/* ──────────────────────────────────────────
   MODAL HELPERS
────────────────────────────────────────── */
function openModal(id)  { document.getElementById(id)?.classList.add('active'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }

/* ──────────────────────────────────────────
   UI HELPERS
────────────────────────────────────────── */
function roleLabel(r) {
  const m = { admin: t('admin'), doctor: t('doctor_role'), nurse: t('nurse'), receptionist: t('receptionist') };
  return m[r] || r;
}

function statusBadge(s) {
  const map = {
    pending:   ['badge-warning', t('pending')],
    confirmed: ['badge-info',    t('confirmed')],
    completed: ['badge-success', t('completed')],
    cancelled: ['badge-neutral', t('cancelled')]
  };
  const [cls, label] = map[s] || ['badge-neutral', s];
  return `<span class="badge ${cls}">${label}</span>`;
}

function typeBadge(type) {
  return `<span class="badge badge-teal">${type === 'follow_up' ? t('followUp') : t('newVisit')}</span>`;
}

function msgStatusBadge(s) {
  const map = {
    new:     ['badge-danger', t('newMsg')],
    read:    ['badge-info',   t('read')],
    replied: ['badge-success',t('replied')]
  };
  const [cls, label] = map[s] || ['badge-neutral', s];
  return `<span class="badge ${cls}">${label}</span>`;
}

function statusBg(s) {
  const m = { pending:'#faeeda', confirmed:'#e6f1fb', completed:'#e1f5ee', cancelled:'#f1efe8' };
  return m[s] || '#f1f5f9';
}
function statusColor(s) {
  const m = { pending:'#854f0b', confirmed:'#042c53', completed:'#085041', cancelled:'#2c2c2a' };
  return m[s] || '#64748b';
}

function fmtDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString(I18n.isEn() ? 'en-US' : 'ar-EG', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch { return d; }
}

function getInitials(name) {
  return (name || '').split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'D';
}

function infoItem(label, value, icon) {
  return `<div class="info-item">
    <div class="info-item-label"><i class="fas ${icon}"></i> ${label}</div>
    <div class="info-item-value">${value}</div>
  </div>`;
}

function loadingRow(cols) {
  return `<tr><td colspan="${cols}" class="loading-cell"><div class="spinner"></div></td></tr>`;
}

function errorRow(cols, msg) {
  return `<tr><td colspan="${cols}" style="text-align:center;padding:32px;color:var(--danger)">
    <i class="fas fa-exclamation-circle"></i> ${msg}
  </td></tr>`;
}

function emptyState(icon, msg) {
  return `<div class="empty-state"><i class="fas ${icon}"></i><h3>${msg}</h3></div>`;
}

function errorState(msg) {
  return `<div class="empty-state" style="color:var(--danger)"><i class="fas fa-exclamation-triangle"></i><h3>${msg}</h3></div>`;
}

function showAlert(el, type, msg) {
  el.innerHTML = `<div class="alert alert-${type}"><i class="fas fa-exclamation-circle"></i> ${msg}</div>`;
}

/* ──────────────────────────────────────────
   TOAST NOTIFICATIONS
────────────────────────────────────────── */
function toast(msg, type = 'info') {
  const container = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icons = { success:'fa-check-circle', danger:'fa-times-circle', warning:'fa-exclamation-triangle', info:'fa-info-circle' };
  el.innerHTML = `<i class="fas ${icons[type] || 'fa-info-circle'}"></i> ${msg}`;
  container.appendChild(el);

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = I18n.isEn() ? 'translateX(-100%)' : 'translateX(100%)';
    el.style.transition = 'all 0.3s';
    setTimeout(() => el.remove(), 300);
  }, 3500);
}
