# مستشفى النور التخصصي - دليل التشغيل

## هيكل المشروع
```
htdocs/
├── hospital-system-main/
│   └── hospital/
│       ├── html/
│       │   ├── index.html
│       │   ├── script.js
│       │   └── api.js          ← ملف جديد (ربط API)
│       └── css/
└── hospital-backend/
    ├── .htaccess
    ├── config/
    │   ├── db.php
    │   └── security.php
    ├── api/
    │   ├── auth.php
    │   ├── appointments.php
    │   ├── doctors.php
    │   ├── patients.php
    │   └── general.php
    └── sql/
        └── hospital_db.sql
```

---

## خطوات التشغيل

### 1. تثبيت XAMPP
حمّل من: https://www.apachefriends.org
شغّل Apache + MySQL

### 2. قاعدة البيانات
- افتح: http://localhost:8080/phpmyadmin
- اضغط "New" → اسمها `hospital_db`
- اضغط "Import" → اختار ملف `sql/hospital_db.sql`
- اضغط "Go"

### 3. نسخ الملفات
انسخ المجلدين جوه `C:\xampp\htdocs\`:
```
hospital-system-main/
hospital-backend/
```

### 4. ربط api.js بالـ Frontend
في `index.html` قبل `</body>` أضف السطر ده:
```html
<script src="api.js"></script>
```

### 5. تجربة
- الموقع: http://localhost:8080/hospital-system-main/hospital/html/index.html
- API: http://localhost:8080/hospital-backend/api/auth.php?action=login

---

## API Endpoints

| Method | Endpoint | الوصف | Auth |
|--------|----------|-------|------|
| POST | /api/auth?action=login | تسجيل دخول | ❌ |
| GET | /api/auth?action=me | بياناتي | ✅ |
| POST | /api/auth?action=register | إضافة مستخدم | Admin |
| GET | /api/appointments | كل المواعيد | ✅ |
| POST | /api/appointments | حجز موعد | ❌ (زوار) |
| PUT | /api/appointments?id=X | تحديث موعد | ✅ |
| GET | /api/doctors | كل الأطباء | ❌ |
| GET | /api/doctors?search=X | بحث أطباء | ❌ |
| POST | /api/doctors | إضافة طبيب | Admin |
| GET | /api/patients | كل المرضى | ✅ |
| POST | /api/patients | إضافة مريض | ✅ |
| GET | /api/departments | الأقسام | ❌ |
| POST | /api/contact | رسالة تواصل | ❌ |
| GET | /api/news | الأخبار | ❌ |
| GET | /api/stats | إحصائيات | Admin |

---

## بيانات الدخول التجريبية
- **Email:** admin@hospital.com
- **Password:** password

---

## قاعدة البيانات - الجداول (13 جدول)

| # | الجدول | الوصف |
|---|--------|-------|
| 1 | users | المستخدمين والصلاحيات |
| 2 | departments | الأقسام الطبية |
| 3 | doctors | الأطباء |
| 4 | patients | المرضى |
| 5 | appointments | المواعيد |
| 6 | medical_records | السجلات الطبية |
| 7 | rooms | الغرف والأسرّة |
| 8 | admissions | الدخول والإقامة |
| 9 | staff | الطاقم الطبي |
| 10 | services | الخدمات الطبية |
| 11 | bills | الفواتير |
| 12 | news | الأخبار |
| 13 | contact_messages | رسائل التواصل |

---

## Security Features
- JWT Authentication (بدون session)
- bcrypt password hashing (cost 12)
- PDO Prepared Statements (منع SQL Injection)
- Input Sanitization (منع XSS)
- Rate Limiting (منع Spam)
- CORS Headers
- Security Headers (X-Frame-Options, XSS-Protection, etc.)
- Soft Delete (مش بنحذف من DB)
- Role-Based Access Control (admin / doctor / nurse / receptionist)
