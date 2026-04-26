/* ============================================
   مستشفى النور التخصصي - ملف JavaScript
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

function changeSlide(dir) {
  goToSlide(currentSlide + dir);
}

function resetTimer() {
  clearInterval(autoSlideTimer);
  autoSlideTimer = setInterval(() => goToSlide(currentSlide + 1), 5000);
}

resetTimer();

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  const btn = document.getElementById('backToTop');
  if (window.scrollY > 400) btn.classList.add('show');
  else btn.classList.remove('show');
});

// ===== MOBILE MENU =====
const navLinks = document.getElementById('navLinks');
const hamburger = document.getElementById('hamburger');

function toggleMenu() {
  navLinks.classList.toggle('open');
  const icon = hamburger.querySelector('i');
  icon.className = navLinks.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
}

// إغلاق القائمة عند النقر خارجها
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

setInterval(() => changeTest(1), 6000);

// ===== SMOOTH SCROLL =====
function scrollTo(selector) {
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

// ===== COUNTERS ANIMATION =====
function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = +el.getAttribute('data-target');
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        el.textContent = target.toLocaleString('ar-EG');
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current).toLocaleString('ar-EG');
      }
    }, 16);
  });
}

const statsSection = document.querySelector('.about-stats');
let countersDone = false;
if (statsSection) {
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !countersDone) {
      countersDone = true;
      animateCounters();
    }
  }, { threshold: 0.3 });
  observer.observe(statsSection);
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
      <h3><i class="fas fa-calendar-check" style="color:var(--green)"></i> حجز موعد جديد</h3>
      <form onsubmit="submitAppointment(event)" style="margin-top:4px">
        <div class="form-group">
          <label>الاسم الكامل</label>
          <input type="text" placeholder="أدخل اسمك الكامل" required/>
        </div>
        <div class="form-group">
          <label>رقم الجوال</label>
          <input type="tel" placeholder="05xxxxxxxx" required/>
        </div>
        <div class="form-group">
          <label>القسم الطبي</label>
          <select required>
            <option value="">اختر القسم</option>
            <option>قلب وأوعية دموية</option>
            <option>أعصاب</option>
            <option>عظام ومفاصل</option>
            <option>أطفال وحديثي الولادة</option>
            <option>عيون</option>
            <option>نساء وولادة</option>
          </select>
        </div>
        <div class="form-group">
          <label>التاريخ المفضل</label>
          <input type="date" required/>
        </div>
        <button type="submit" class="btn-primary btn-full" style="margin-top:8px">
          <i class="fas fa-check"></i> تأكيد الحجز
        </button>
      </form>
    `,
    doctor: `
      <h3><i class="fas fa-search" style="color:var(--green)"></i> البحث عن طبيب</h3>
      <div class="form-group" style="margin-top:16px">
        <label>اسم الطبيب أو التخصص</label>
        <input type="text" placeholder="مثال: قلب، أعصاب، د. أحمد..." oninput="searchDoctor(this.value)"/>
      </div>
      <div id="doctorResults" style="margin-top:16px;display:flex;flex-direction:column;gap:10px"></div>
    `,
    service: `
      <h3><i class="fas fa-clipboard-list" style="color:var(--green)"></i> البحث عن خدمة</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px">
        ${['قلب وأوعية','أعصاب','عظام','أطفال','عيون','أسنان','نساء وولادة','صدر وتنفس','جراحة عامة','أورام','مختبرات','أشعة']
          .map(s => `<div onclick="closeModal()" style="padding:14px;border:1.5px solid var(--border);border-radius:10px;cursor:pointer;font-size:14px;font-weight:600;text-align:center;transition:all 0.2s" onmouseover="this.style.borderColor='var(--green)';this.style.color='var(--green)'" onmouseout="this.style.borderColor='var(--border)';this.style.color=''">${s}</div>`)
          .join('')}
      </div>
    `,
    dept: `
      <h3><i class="fas fa-hospital" style="color:var(--green)"></i> معلومات القسم</h3>
      <p style="color:var(--text-light);line-height:1.8;margin-top:14px">يضم هذا القسم نخبة من المتخصصين ذوي الخبرة الواسعة، مزودًا بأحدث التجهيزات الطبية لتقديم أعلى مستويات الرعاية الصحية.</p>
      <div style="margin-top:20px;display:flex;gap:12px">
        <button class="btn-primary" onclick="closeModal();openModal('appointment')"><i class="fas fa-calendar"></i> احجز موعداً</button>
        <button class="btn-ghost" onclick="closeModal()"><i class="fas fa-times"></i> إغلاق</button>
      </div>
    `,
    tour: `
      <h3><i class="fas fa-play-circle" style="color:var(--green)"></i> جولة افتراضية</h3>
      <p style="color:var(--text-light);margin-top:14px;line-height:1.8">استمتع بجولة افتراضية تفاعلية داخل مرافق مستشفى النور التخصصي وتعرّف على بيئة العلاج والرعاية الحديثة.</p>
      <div style="margin-top:20px;background:var(--bg);border-radius:12px;height:180px;display:flex;align-items:center;justify-content:center;color:var(--text-lighter);font-size:14px">
        <div style="text-align:center"><i class="fas fa-video" style="font-size:40px;color:var(--green);margin-bottom:12px;display:block"></i>سيتم تفعيل الجولة الافتراضية قريباً</div>
      </div>
    `
  };

  content.innerHTML = templates[type] || '<p>قريباً...</p>';
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ===== DOCTOR SEARCH =====
const doctors = [
  { name: 'د. أحمد السيد', specialty: 'استشاري أمراض القلب', rating: '4.9' },
  { name: 'د. سارة العمري', specialty: 'استشارية أمراض الأعصاب', rating: '4.8' },
  { name: 'د. محمد الزهراني', specialty: 'استشاري جراحة العظام', rating: '4.9' },
  { name: 'د. ليلى الأحمدي', specialty: 'استشارية أطفال وحديثي الولادة', rating: '5.0' },
  { name: 'د. عمر المالكي', specialty: 'استشاري طب العيون', rating: '4.7' },
  { name: 'د. هند الشمري', specialty: 'استشارية أمراض الجهاز الهضمي', rating: '4.8' },
];

function searchDoctor(query) {
  const container = document.getElementById('doctorResults');
  if (!container) return;

  const filtered = query.length >= 2
    ? doctors.filter(d => d.name.includes(query) || d.specialty.includes(query))
    : [];

  if (filtered.length === 0) {
    container.innerHTML = query.length >= 2
      ? '<p style="text-align:center;color:var(--text-lighter);padding:20px">لا يوجد نتائج</p>'
      : '';
    return;
  }

  container.innerHTML = filtered.map(d => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:14px;border:1.5px solid var(--border);border-radius:10px;background:var(--bg)">
      <div>
        <strong style="display:block;font-size:15px;color:var(--dark)">${d.name}</strong>
        <span style="font-size:13px;color:var(--green)">${d.specialty}</span>
        <span style="font-size:12px;color:var(--text-lighter);margin-right:8px">⭐ ${d.rating}</span>
      </div>
      <button class="btn-primary" style="padding:8px 14px;font-size:13px" onclick="closeModal();openModal('appointment')">حجز</button>
    </div>
  `).join('');
}

// ===== APPOINTMENT FORM =====
function submitAppointment(e) {
  e.preventDefault();
  closeModal();
  showToast('✅ تم الحجز بنجاح! سنتواصل معك قريباً');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  toastMsg.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// ===== LANGUAGE TOGGLE =====
function toggleLang() {
  const isAr = document.documentElement.lang === 'ar';
  if (isAr) {
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
    showToast('Switched to English mode');
  } else {
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
    showToast('تم التبديل إلى اللغة العربية');
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const scrollPos = window.scrollY + 120;
  sections.forEach(section => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const link = document.querySelector(`.nav-links a[href="#${section.id}"]`);
    if (link) {
      if (scrollPos >= top && scrollPos < bottom) {
        link.style.color = 'var(--green)';
        link.style.background = 'var(--green-bg)';
      } else {
        link.style.color = '';
        link.style.background = '';
      }
    }
  });
});

const apptSectionForm = document.querySelector('.appointment-section form');
if (apptSectionForm) {
  apptSectionForm.addEventListener('submit', submitAppointment);
}

console.log('%c مستشفى النور التخصصي 🏥', 'color:#2e8b57;font-size:20px;font-weight:bold');
console.log('%c نظام إدارة الموقع الطبي - جميع الحقوق محفوظة © 2026', 'color:#666;font-size:12px');
