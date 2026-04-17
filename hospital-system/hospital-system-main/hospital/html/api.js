/* ============================================
   مستشفى النور - API Connector
   اربطه في آخر الـ HTML قبل script.js
   ============================================ */

const API_BASE = 'http://localhost:8080/hospital-backend/api';
// ===== HTTP Helper =====
async function apiCall(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('hospital_token');
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  };
  const res = await fetch(`${API_BASE}/${endpoint}`, opts);
  return res.json();
}

// ===== APPOINTMENTS =====
// ربط فورم الحجز الموجود في script.js
async function submitAppointment(e) {
  e.preventDefault();

  const form   = e.target;
  const inputs = form.querySelectorAll('input, select');
  const data   = {};

  inputs.forEach(inp => {
    if (inp.type === 'text' || inp.type === 'tel')  {
      if (inp.placeholder?.includes('اسم')) data.guest_name  = inp.value;
      if (inp.placeholder?.includes('05'))  data.guest_phone = inp.value;
    }
    if (inp.type === 'date')        data.appointment_date = inp.value;
    if (inp.tagName === 'SELECT')   data.department_name  = inp.value;
  });

  // الوقت الافتراضي 09:00 لو مش محدد
  data.appointment_time = data.appointment_time || '09:00';

  // نجيب أول دكتور في القسم المختار
  if (data.department_name) {
    try {
      const depts = await apiCall('departments');
      if (depts.success) {
        const dept = depts.data.find(d => d.name_ar === data.department_name);
        if (dept) {
          const docs = await apiCall(`doctors?department_id=${dept.id}`);
          if (docs.success && docs.data.length > 0) {
            data.doctor_id = docs.data[0].id;
            data.department_id = dept.id;
          }
        }
      }
    } catch (_) {}
  }

  if (!data.doctor_id) {
    showToast('⚠️ اختر قسماً للمتابعة');
    return;
  }

  try {
    const result = await apiCall('appointments', 'POST', data);
    closeModal?.();
    showToast(result.success
      ? '✅ تم الحجز بنجاح! سنتواصل معك قريباً'
      : '❌ ' + (result.message || 'حدث خطأ'));
  } catch (err) {
    showToast('❌ تعذر الاتصال بالخادم');
  }
}

// ===== DOCTOR SEARCH =====
// يستبدل البيانات الثابتة في script.js بجلب حقيقي من DB
async function searchDoctor(query) {
  const container = document.getElementById('doctorResults');
  if (!container) return;

  if (query.length < 2) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = '<p style="text-align:center;padding:20px;color:var(--text-lighter)">جاري البحث...</p>';

  try {
    const res = await apiCall(`doctors?search=${encodeURIComponent(query)}`);
    if (!res.success || res.data.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:var(--text-lighter);padding:20px">لا يوجد نتائج</p>';
      return;
    }

    container.innerHTML = res.data.map(d => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px;
                  border:1.5px solid var(--border);border-radius:10px;background:var(--bg)">
        <div>
          <strong style="display:block;font-size:15px;color:var(--dark)">${d.name_ar}</strong>
          <span style="font-size:13px;color:var(--green)">${d.specialty_ar}</span>
          <span style="font-size:12px;color:var(--text-lighter);margin-right:8px">⭐ ${d.rating}</span>
        </div>
        <button class="btn-primary" style="padding:8px 14px;font-size:13px"
          onclick="closeModal();openModal('appointment')">حجز</button>
      </div>
    `).join('');
  } catch (_) {
    container.innerHTML = '<p style="text-align:center;color:red;padding:20px">تعذر الاتصال بالخادم</p>';
  }
}

// ===== CONTACT FORM =====
async function submitContactForm(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    name:    form.querySelector('[name="name"]')?.value    || '',
    email:   form.querySelector('[name="email"]')?.value   || '',
    phone:   form.querySelector('[name="phone"]')?.value   || '',
    subject: form.querySelector('[name="subject"]')?.value || '',
    message: form.querySelector('[name="message"]')?.value || '',
  };

  try {
    const res = await apiCall('contact', 'POST', data);
    showToast(res.success ? '✅ ' + res.message : '❌ ' + res.message);
    if (res.success) form.reset();
  } catch (_) {
    showToast('❌ تعذر إرسال الرسالة');
  }
}

// ===== LOAD DEPARTMENTS DYNAMICALLY =====
async function loadDepartmentsIntoSelect() {
  const selects = document.querySelectorAll('select[data-depts]');
  if (!selects.length) return;

  try {
    const res = await apiCall('departments');
    if (!res.success) return;

    selects.forEach(sel => {
      const placeholder = sel.querySelector('option[value=""]');
      sel.innerHTML = '';
      if (placeholder) sel.appendChild(placeholder);
      res.data.forEach(dept => {
        const opt = document.createElement('option');
        opt.value      = dept.id;
        opt.textContent = dept.name_ar;
        sel.appendChild(opt);
      });
    });
  } catch (_) {}
}

// شغّل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  loadDepartmentsIntoSelect();

  // ربط فورم التواصل لو موجود
  const contactForm = document.querySelector('.contact-form, form[data-contact]');
  if (contactForm) contactForm.addEventListener('submit', submitContactForm);
});
