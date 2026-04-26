/* ============================================
   api.js - مستشفى النور التخصصي
   Complete API Client for all endpoints
   ============================================ */

const HospitalAPI = (() => {

const BASE = 'http://localhost:8080/hospital-backend/api';
  let _token = localStorage.getItem('hospital_token') || '';

  // ============================================
  // SECTION 1: AUTHENTICATION AND CORE
  // ============================================

  // ─────────────────────────────────────────
  //  CORE REQUEST
  // ─────────────────────────────────────────
  async function req(endpoint, method = 'GET', body = null, publicRoute = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (_token && !publicRoute) headers['Authorization'] = `Bearer ${_token}`;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    try {
      const res  = await fetch(`${BASE}/${endpoint}`, opts);
      const data = await res.json();

      if (res.status === 401) {
        _token = '';
        localStorage.removeItem('hospital_token');
        window.location.reload();
        return null;
      }

      if (!data.success) throw new Error(data.message || 'API Error');
      return data.data;
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Make sure XAMPP is running.');
      }
      throw err;
    }
  }

  // ─────────────────────────────────────────
  //  AUTH
  // ─────────────────────────────────────────
  const auth = {

    async login(email, password) {
      const res = await fetch(`${BASE}/auth.php?action=login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      _token = data.data.token;
      localStorage.setItem('hospital_token', _token);
      return data.data; // { token, user: { id, username, email, role } }
    },

    async me() {
      return req('auth.php?action=me');
    },

    async register({ username, email, password, role }) {
      return req('auth.php?action=register', 'POST', { username, email, password, role });
    },

    async changePassword(oldPassword, newPassword) {
      return req('auth.php?action=change_password', 'POST', {
        old_password: oldPassword,
        new_password: newPassword
      });
    },

    logout() {
      _token = '';
      localStorage.removeItem('hospital_token');
      localStorage.removeItem('hospital_user');
    },

    isLoggedIn()    { return !!_token; },
    getToken()      { return _token; },
    setToken(t)     { _token = t; localStorage.setItem('hospital_token', t); }
  };

  // ============================================
  // SECTION 2: API MODULES
  // ============================================

  // ─────────────────────────────────────────
  //  APPOINTMENTS
  // ─────────────────────────────────────────
  const appointments = {

    async list(filters = {}) {
      const qs = new URLSearchParams();
      if (filters.status)    qs.set('status',    filters.status);
      if (filters.date)      qs.set('date',      filters.date);
      if (filters.doctor_id) qs.set('doctor_id', filters.doctor_id);
      return req(`appointments.php?${qs}`);
    },

    async get(id) {
      return req(`appointments.php?id=${id}`);
    },

    /**
     * Book an appointment (guest or patient)
     * @param {object} data - { doctor_id, appointment_date, appointment_time,
     *                          guest_name?, guest_phone?, type?, notes?, department_id? }
     */
    async book(data) {
      return req('appointments.php', 'POST', data);
    },

    async updateStatus(id, status, notes = '') {
      return req(`appointments.php?id=${id}`, 'PUT', { status, notes });
    },

    async cancel(id) {
      return req(`appointments.php?id=${id}`, 'DELETE');
    }
  };

  // ─────────────────────────────────────────
  //  PATIENTS
  // ─────────────────────────────────────────
  const patients = {

    async list(search = '') {
      const qs = search ? `?search=${encodeURIComponent(search)}` : '';
      return req(`patients.php${qs}`);
    },

    async get(id) {
      return req(`patients.php?id=${id}`);
      // Returns patient + patient.medical_records[]
    },

    async create(data) {
      // Required: name_ar, gender, phone
      return req('patients.php', 'POST', data);
    },

    async update(id, data) {
      return req(`patients.php?id=${id}`, 'PUT', data);
    }
  };

  // ─────────────────────────────────────────
  //  DOCTORS
  // ─────────────────────────────────────────
  const doctors = {

    async list(filters = {}) {
      const qs = new URLSearchParams();
      if (filters.search)        qs.set('search',        filters.search);
      if (filters.department_id) qs.set('department_id', filters.department_id);
      return req(`doctors.php?${qs}`);
    },

    async get(id) {
      return req(`doctors.php?id=${id}`);
    },

    async create(data) {
      // Required: name_ar, specialty_ar, department_id
      return req('doctors.php', 'POST', data);
    },

    async update(id, data) {
      return req(`doctors.php?id=${id}`, 'PUT', data);
    },

    async delete(id) {
      return req(`doctors.php?id=${id}`, 'DELETE');
    }
  };

  // ─────────────────────────────────────────
  //  DEPARTMENTS
  // ─────────────────────────────────────────
  const departments = {

    async list() {
      return req('general.php?endpoint=departments');
    },

    async get(id) {
      // Returns dept + dept.doctors[]
      return req(`general.php?endpoint=departments&id=${id}`);
    },

    async create({ name_ar, name_en, description_ar = '', icon = '', floor_number = 0 }) {
      return req('general.php?endpoint=departments', 'POST',
        { name_ar, name_en, description_ar, icon, floor_number });
    },

    async update(id, data) {
      return req(`general.php?endpoint=departments&id=${id}`, 'PUT', data);
    }
  };

  // ─────────────────────────────────────────
  //  CONTACT MESSAGES
  // ─────────────────────────────────────────
  const contact = {

    /**
     * Send a contact message (public - no auth needed)
     * @param {{ name, email?, phone?, subject?, message }} data
     */
    async send(data) {
      const res = await fetch(`${BASE}/general.php?endpoint=contact`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data)
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      return result;
    },

    async list(status = '') {
      const qs = status ? `&status=${status}` : '';
      return req(`general.php?endpoint=contact${qs}`);
    },

    async updateStatus(id, status = 'read') {
      return req(`general.php?endpoint=contact&id=${id}`, 'PUT', { status });
    }
  };

  // ─────────────────────────────────────────
  //  NEWS
  // ─────────────────────────────────────────
  const news = {

    async list() {
      return req('general.php?endpoint=news');
    },

    async get(id) {
      return req(`general.php?endpoint=news&id=${id}`);
    },

    async create(data) {
      // Required: title_ar, content_ar
      return req('general.php?endpoint=news', 'POST', data);
    }
  };

  // ─────────────────────────────────────────
  //  STATS (Admin only)
  // ─────────────────────────────────────────
  const stats = {
    async get() {
      return req('general.php?endpoint=stats');
      // Returns: { total_patients, total_doctors, today_appointments,
      //            pending_appointments, occupied_rooms, new_messages, total_departments }
    }
  };

  // ─────────────────────────────────────────
  //  PUBLIC API
  // ─────────────────────────────────────────
  return { auth, appointments, patients, doctors, departments, contact, news, stats };

})();


/* ─────────────────────────────────────────
   USAGE EXAMPLES
   ─────────────────────────────────────────

// LOGIN
const { token, user } = await HospitalAPI.auth.login('admin@hospital.com', 'password');

// STATS (admin)
const s = await HospitalAPI.stats.get();
console.log(s.total_patients, s.today_appointments);

// LIST APPOINTMENTS with filters
const appts = await HospitalAPI.appointments.list({ status: 'pending' });

// BOOK (guest, no account)
await HospitalAPI.appointments.book({
  doctor_id:        1,
  appointment_date: '2026-05-01',
  appointment_time: '10:00',
  guest_name:       'محمد أحمد',
  guest_phone:      '0501234567',
  type:             'new'
});

// UPDATE STATUS
await HospitalAPI.appointments.updateStatus(5, 'confirmed', 'Confirmed by receptionist');

// ADD PATIENT
await HospitalAPI.patients.create({
  name_ar: 'فاطمة علي',
  gender:  'female',
  phone:   '0507654321',
  blood_type: 'O+'
});

// GET PATIENT DETAIL + MEDICAL RECORDS
const patient = await HospitalAPI.patients.get(1);
console.log(patient.medical_records);

// SEARCH DOCTORS
const docs = await HospitalAPI.doctors.list({ search: 'قلب' });

// SEND CONTACT MESSAGE (no auth)
await HospitalAPI.contact.send({
  name:    'أحمد',
  email:   'ahmed@example.com',
  message: 'أريد الاستفسار عن مواعيد القسم'
});

// ADD NEWS
await HospitalAPI.news.create({
  title_ar:    'افتتاح وحدة القلب الجديدة',
  content_ar:  'يسعد مستشفى النور...',
  is_published: 1
});

*/
