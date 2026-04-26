# مستشفى النور التخصصي — نظام إدارة المستشفى
# Al-Nour Specialist Hospital — Hospital Management System

---

## 📁 هيكل الملفات / File Structure

```
hospital-frontend/
├── html/
│   └── index.html          ← الصفحة الرئيسية / Main App
├── css/
│   ├── style.css           ← الأنماط الرئيسية / Main Styles
│   ├── components.css      ← مكونات UI / UI Components
│   └── rtl.css             ← دعم RTL/LTR / RTL & LTR Support
├── js/
│   ├── api.js              ← عميل API الكامل / Full API Client
│   ├── i18n.js             ← نظام الترجمة ثنائي اللغة / Bilingual i18n
│   └── app.js              ← منطق التطبيق الرئيسي / App Logic
└── sql/
    └── hospital_db.sql     ← قاعدة البيانات / Database Schema + Sample Data
```

---

## 🚀 خطوات التشغيل / Setup Instructions

### 1. XAMPP
- حمّل وثبّت XAMPP من: https://www.apachefriends.org
- شغّل **Apache** و **MySQL** من XAMPP Control Panel

### 2. قاعدة البيانات / Database
- افتح: http://localhost:8080/phpmyadmin
- اضغط **New** → اسمها `hospital_db`
- اضغط **Import** → اختار ملف `sql/hospital_db.sql`
- اضغط **Go**

### 3. نسخ ملفات الباك اند / Backend Files
انسخ مجلد `hospital-backend/` الخاص بك داخل:
```
C:\xampp\htdocs\hospital-backend\
```

### 4. نسخ ملفات الفرونت اند / Frontend Files
انسخ مجلد `hospital-frontend/` داخل:
```
C:\xampp\htdocs\hospital-frontend\
```

### 5. تشغيل / Run
- افتح المتصفح: **http://localhost:8080/hospital-frontend/index.html**

---

## 🔐 بيانات الدخول / Login Credentials

| الحقل / Field | القيمة / Value |
|---|---|
| Email | admin@hospital.com |
| Password | password |

---

## 🌍 دعم اللغتين / Bilingual Support

- اضغط زر **EN / عربي** في أي وقت للتبديل
- النظام يحفظ اختيارك في المتصفح
- RTL للعربية — LTR للإنجليزية تلقائياً

---

## 📋 الصفحات / Pages

| الصفحة / Page | الوصف / Description |
|---|---|
| لوحة التحكم / Dashboard | إحصائيات + آخر المواعيد والرسائل |
| المواعيد / Appointments | جدول + حجز + تحديث + إلغاء |
| المرضى / Patients | سجلات المرضى + السجلات الطبية |
| الأطباء / Doctors | بطاقات الأطباء + بحث + فلتر |
| الأقسام / Departments | كل الأقسام الطبية |
| الرسائل / Messages | رسائل التواصل + تحديث الحالة |
| الأخبار / News | أخبار المستشفى + إضافة خبر |

---

## 🔧 API Endpoints

| Method | Endpoint | الوصف / Description | Auth |
|--------|----------|---|---|
| POST | /api/auth.php?action=login | تسجيل دخول / Login | ❌ |
| GET  | /api/auth.php?action=me | بياناتي / My Info | ✅ |
| GET  | /api/appointments.php | المواعيد / Appointments | ✅ |
| POST | /api/appointments.php | حجز / Book | ❌ Guests |
| PUT  | /api/appointments.php?id=X | تحديث / Update | ✅ |
| GET  | /api/patients.php | المرضى / Patients | ✅ |
| POST | /api/patients.php | إضافة مريض / Add Patient | ✅ |
| GET  | /api/doctors.php | الأطباء / Doctors | ❌ |
| GET  | /api/general.php?endpoint=departments | الأقسام / Depts | ❌ |
| POST | /api/general.php?endpoint=contact | رسالة / Contact | ❌ |
| GET  | /api/general.php?endpoint=news | الأخبار / News | ❌ |
| GET  | /api/general.php?endpoint=stats | إحصائيات / Stats | Admin |

---

## 🛠️ HospitalAPI — JavaScript Client

```javascript
// Login
const { token, user } = await HospitalAPI.auth.login(email, password);

// Get Stats
const stats = await HospitalAPI.stats.get();

// Book Appointment (guest)
await HospitalAPI.appointments.book({
  doctor_id: 1,
  appointment_date: '2026-05-01',
  appointment_time: '10:00',
  guest_name: 'محمد أحمد',
  guest_phone: '0501234567'
});

// Add Patient
await HospitalAPI.patients.create({
  name_ar: 'فاطمة علي', gender: 'female', phone: '0507654321'
});

// Send Contact Message (no auth)
await HospitalAPI.contact.send({
  name: 'أحمد', message: 'أريد الاستفسار...'
});
```

---

## ✅ Security Features
- JWT Authentication (no sessions)
- bcrypt password hashing (cost 12)
- PDO Prepared Statements (SQL Injection protection)
- Input Sanitization (XSS protection)
- Rate Limiting (Spam protection)
- CORS Headers
- Soft Delete (data preserved in DB)
- Role-Based Access Control (admin/doctor/nurse/receptionist)
