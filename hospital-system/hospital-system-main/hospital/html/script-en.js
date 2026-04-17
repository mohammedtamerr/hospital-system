/* ============================================
   Al-Noor Specialist Hospital — script.js
   ============================================ */

// ===== HERO SLIDER =====
let currentSlide = 0;
const slides = document.querySelectorAll('.hero-slide');
const dotsContainer = document.getElementById('sliderDots');
let autoSlideTimer;

slides.forEach((_, i) => {
  const dot = document.createElement('div');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dot.onclick = () => goToSlide(i);
  dotsContainer.appendChild(dot);
});

function goToSlide(index) {
  slides[currentSlide].classList.remove('active');
  dotsContainer.children[currentSlide].classList.remove('active');
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  dotsContainer.children[currentSlide].classList.add('active');
  resetTimer();
}

function changeSlide(dir) { goToSlide(currentSlide + dir); }

function resetTimer() {
  clearInterval(autoSlideTimer);
  autoSlideTimer = setInterval(() => goToSlide(currentSlide + 1), 5000);
}
resetTimer();

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  document.getElementById('backToTop').classList.toggle('show', window.scrollY > 400);
});

// ===== MOBILE MENU =====
const navLinks = document.getElementById('navLinks');
const hamburger = document.getElementById('hamburger');

function toggleMenu() {
  navLinks.classList.toggle('open');
  hamburger.querySelector('i').className = navLinks.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
}

document.addEventListener('click', (e) => {
  if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
    navLinks.classList.remove('open');
    hamburger.querySelector('i').className = 'fas fa-bars';
  }
});

// ===== TESTIMONIALS SLIDER =====
let currentTest = 0;
const testimonials = document.querySelectorAll('.testimonial');

function changeTest(dir) {
  testimonials[currentTest].classList.remove('active');
  currentTest = (currentTest + dir + testimonials.length) % testimonials.length;
  testimonials[currentTest].classList.add('active');
}
setInterval(() => changeTest(1), 6500);

// ===== SMOOTH SCROLL =====
function scrollToSection(selector) {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = a.getAttribute('href');
    if (target.length > 1) {
      e.preventDefault();
      const el = document.querySelector(target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        navLinks.classList.remove('open');
        hamburger.querySelector('i').className = 'fas fa-bars';
      }
    }
  });
});

// ===== COUNTERS =====
function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = +el.getAttribute('data-target');
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        el.textContent = target >= 1000 ? target.toLocaleString('en-US') : target;
        clearInterval(timer);
      } else {
        const val = Math.floor(current);
        el.textContent = val >= 1000 ? val.toLocaleString('en-US') : val;
      }
    }, 16);
  });
}

const statsSection = document.querySelector('.about-stats');
let countersDone = false;
if (statsSection) {
  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !countersDone) {
      countersDone = true;
      animateCounters();
    }
  }, { threshold: 0.3 }).observe(statsSection);
}

// ===== FADE UP ANIMATIONS =====
const fadeEls = document.querySelectorAll(
  '.service-card, .doctor-card, .news-card, .dept-item, .action-card, .award-item'
);
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

fadeEls.forEach((el, i) => {
  el.classList.add('fade-up');
  el.style.transitionDelay = (i % 4 * 0.08) + 's';
  fadeObserver.observe(el);
});

// ===== MODAL =====
function openModal(type) {
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');

  const templates = {
    appointment: `
      <h3><i class="fas fa-calendar-check" style="color:var(--green)"></i> Book a New Appointment</h3>
      <form onsubmit="submitAppointment(event)" style="margin-top:6px">
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" placeholder="Enter your full name" required/>
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <input type="tel" placeholder="+966 5x xxx xxxx" required/>
        </div>
        <div class="form-group">
          <label>Medical Department</label>
          <select required>
            <option value="">Select Department</option>
            <option>Cardiology</option>
            <option>Neurology</option>
            <option>Orthopedics</option>
            <option>Pediatrics & NICU</option>
            <option>Ophthalmology</option>
            <option>Obstetrics & Gynecology</option>
          </select>
        </div>
        <div class="form-group">
          <label>Preferred Date</label>
          <input type="date" required/>
        </div>
        <button type="submit" class="btn-primary btn-full" style="margin-top:10px">
          <i class="fas fa-check"></i> Confirm Booking
        </button>
      </form>
    `,
    doctor: `
      <h3><i class="fas fa-search" style="color:var(--green)"></i> Find a Doctor</h3>
      <div class="form-group" style="margin-top:16px">
        <label>Name or Specialty</label>
        <input type="text" placeholder="e.g. cardiology, Dr. Ahmed..." oninput="searchDoctor(this.value)"/>
      </div>
      <div id="doctorResults" style="margin-top:14px;display:flex;flex-direction:column;gap:10px"></div>
    `,
    service: `
      <h3><i class="fas fa-clipboard-list" style="color:var(--green)"></i> Find a Service</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px">
        ${['Cardiology','Neurology','Orthopedics','Pediatrics','Ophthalmology','Dentistry','Obstetrics & Gynecology','Pulmonology','General Surgery','Oncology','Laboratory','Radiology']
          .map(s => `<div onclick="closeModal()" style="padding:13px;border:1.5px solid var(--border);border-radius:10px;cursor:pointer;font-size:13.5px;font-weight:600;font-family:var(--font);transition:all 0.2s" onmouseover="this.style.borderColor='var(--green)';this.style.color='var(--green)'" onmouseout="this.style.borderColor='var(--border)';this.style.color=''">${s}</div>`)
          .join('')}
      </div>
    `,
    dept: `
      <h3><i class="fas fa-hospital" style="color:var(--green)"></i> Department Info</h3>
      <p style="color:var(--text-light);line-height:1.8;margin-top:14px">This department is staffed by highly experienced specialists and equipped with the latest medical technology to deliver the highest level of patient care.</p>
      <div style="margin-top:22px;display:flex;gap:12px">
        <button class="btn-primary" onclick="closeModal();openModal('appointment')"><i class="fas fa-calendar"></i> Book Appointment</button>
        <button class="btn-ghost" onclick="closeModal()"><i class="fas fa-times"></i> Close</button>
      </div>
    `,
    tour: `
      <h3><i class="fas fa-play-circle" style="color:var(--green)"></i> Virtual Tour</h3>
      <p style="color:var(--text-light);margin-top:14px;line-height:1.8">Take an interactive virtual tour of Al-Noor Specialist Hospital's world-class facilities and experience our healing environment.</p>
      <div style="margin-top:22px;background:var(--bg);border-radius:12px;height:180px;display:flex;align-items:center;justify-content:center;color:var(--text-lighter);font-size:14px">
        <div style="text-align:center"><i class="fas fa-video" style="font-size:38px;color:var(--green);margin-bottom:12px;display:block"></i>Virtual tour coming soon</div>
      </div>
    `
  };

  content.innerHTML = templates[type] || '<p>Coming soon...</p>';
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ===== DOCTOR SEARCH =====
const doctors = [
  { name: 'Dr. Ahmed Al-Sayed', specialty: 'Consultant Cardiologist', rating: '4.9' },
  { name: 'Dr. Sarah Al-Omari', specialty: 'Consultant Neurologist', rating: '4.8' },
  { name: 'Dr. Mohammed Al-Zahrani', specialty: 'Consultant Orthopedic Surgeon', rating: '4.9' },
  { name: 'Dr. Layla Al-Ahmadi', specialty: 'Consultant Pediatrician & Neonatologist', rating: '5.0' },
  { name: 'Dr. Omar Al-Maliki', specialty: 'Consultant Ophthalmologist', rating: '4.7' },
  { name: 'Dr. Hind Al-Shammari', specialty: 'Consultant Gastroenterologist', rating: '4.8' },
];

function searchDoctor(query) {
  const container = document.getElementById('doctorResults');
  if (!container) return;
  const q = query.toLowerCase();
  const filtered = query.length >= 2
    ? doctors.filter(d => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q))
    : [];

  if (!filtered.length) {
    container.innerHTML = query.length >= 2
      ? '<p style="text-align:center;color:var(--text-lighter);padding:20px">No results found</p>'
      : '';
    return;
  }

  container.innerHTML = filtered.map(d => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:14px;border:1.5px solid var(--border);border-radius:10px;background:var(--bg)">
      <div>
        <strong style="display:block;font-size:14.5px;color:var(--dark);font-family:var(--font)">${d.name}</strong>
        <span style="font-size:12.5px;color:var(--green);font-weight:600">${d.specialty}</span>
        <span style="font-size:12px;color:var(--text-lighter);margin-left:8px">⭐ ${d.rating}</span>
      </div>
      <button class="btn-primary" style="padding:8px 14px;font-size:13px;flex-shrink:0" onclick="closeModal();openModal('appointment')">Book</button>
    </div>
  `).join('');
}

// ===== APPOINTMENT FORM =====
function submitAppointment(e) {
  e.preventDefault();
  closeModal();
  showToast('Appointment confirmed! We will contact you shortly.');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4200);
}

// ===== KEYBOARD ESC =====
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ===== ACTIVE NAV ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const scrollPos = window.scrollY + 120;
  sections.forEach(section => {
    const link = document.querySelector(`.nav-links a[href="#${section.id}"]`);
    if (link) {
      const active = scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight;
      link.style.color = active ? 'var(--green)' : '';
      link.style.background = active ? 'var(--green-bg)' : '';
    }
  });
});

// ===== APPOINTMENT SECTION FORM =====
const apptForm = document.querySelector('.appointment-section form');
if (apptForm) apptForm.addEventListener('submit', submitAppointment);

console.log('%c Al-Noor Specialist Hospital 🏥', 'color:#1a7a4a;font-size:18px;font-weight:bold');
console.log('%c Hospital Management System © 2026', 'color:#607080;font-size:12px');
