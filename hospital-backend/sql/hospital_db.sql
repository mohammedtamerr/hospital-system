-- ============================================
--  مستشفى النور التخصصي - قاعدة البيانات
--  Hospital Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS hospital_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hospital_db;

-- ============================================
-- 1. USERS (المستخدمين - admins & staff login)
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'doctor', 'nurse', 'receptionist') NOT NULL DEFAULT 'receptionist',
    is_active TINYINT(1) DEFAULT 1,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 2. DEPARTMENTS (الأقسام الطبية)
-- ============================================
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    icon VARCHAR(50),
    floor_number TINYINT,
    phone_extension VARCHAR(10),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. DOCTORS (الأطباء)
-- ============================================
CREATE TABLE doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    specialty_ar VARCHAR(100) NOT NULL,
    specialty_en VARCHAR(100),
    department_id INT,
    qualification VARCHAR(255),
    experience_years TINYINT,
    rating DECIMAL(2,1) DEFAULT 5.0,
    phone VARCHAR(20),
    email VARCHAR(100),
    bio_ar TEXT,
    bio_en TEXT,
    photo_url VARCHAR(255),
    available_days VARCHAR(50), -- مثال: "Sun,Mon,Tue,Wed"
    available_from TIME,
    available_to TIME,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ============================================
-- 4. PATIENTS (المرضى)
-- ============================================
CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    national_id VARCHAR(20) UNIQUE,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    gender ENUM('male', 'female') NOT NULL,
    date_of_birth DATE,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    blood_type ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-'),
    allergies TEXT,
    chronic_diseases TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 5. APPOINTMENTS (المواعيد)
-- ============================================
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    doctor_id INT NOT NULL,
    department_id INT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    type ENUM('new', 'follow_up') DEFAULT 'new',
    notes TEXT,
    -- للحجز بدون حساب (زوار الموقع)
    guest_name VARCHAR(100),
    guest_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ============================================
-- 6. MEDICAL RECORDS (السجلات الطبية)
-- ============================================
CREATE TABLE medical_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_id INT,
    diagnosis TEXT NOT NULL,
    treatment TEXT,
    prescription TEXT,
    notes TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);

-- ============================================
-- 7. ROOMS (الغرف والأسرّة)
-- ============================================
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(10) NOT NULL UNIQUE,
    room_type ENUM('single', 'double', 'icu', 'emergency', 'operation') NOT NULL,
    department_id INT,
    floor_number TINYINT,
    capacity TINYINT DEFAULT 1,
    current_occupancy TINYINT DEFAULT 0,
    price_per_day DECIMAL(10,2),
    status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ============================================
-- 8. ADMISSIONS (الدخول والإقامة)
-- ============================================
CREATE TABLE admissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    room_id INT NOT NULL,
    doctor_id INT NOT NULL,
    admission_date DATE NOT NULL,
    discharge_date DATE,
    reason TEXT,
    status ENUM('admitted', 'discharged') DEFAULT 'admitted',
    total_cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- ============================================
-- 9. STAFF (الطاقم الطبي - ممرضين وإداريين)
-- ============================================
CREATE TABLE staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    role ENUM('nurse', 'receptionist', 'technician', 'admin_staff') NOT NULL,
    department_id INT,
    phone VARCHAR(20),
    email VARCHAR(100),
    shift ENUM('morning', 'evening', 'night'),
    hire_date DATE,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ============================================
-- 10. SERVICES (الخدمات الطبية)
-- ============================================
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    department_id INT,
    description_ar TEXT,
    description_en TEXT,
    price DECIMAL(10,2),
    duration_minutes SMALLINT,
    icon VARCHAR(50),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ============================================
-- 11. BILLS (الفواتير)
-- ============================================
CREATE TABLE bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    appointment_id INT,
    admission_id INT,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    status ENUM('pending', 'partial', 'paid') DEFAULT 'pending',
    payment_method ENUM('cash', 'card', 'insurance') DEFAULT 'cash',
    notes TEXT,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at DATETIME,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    FOREIGN KEY (admission_id) REFERENCES admissions(id) ON DELETE SET NULL
);

-- ============================================
-- 12. NEWS (الأخبار والمستجدات)
-- ============================================
CREATE TABLE news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title_ar VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    content_ar TEXT,
    content_en TEXT,
    image_url VARCHAR(255),
    category VARCHAR(50),
    author_id INT,
    is_published TINYINT(1) DEFAULT 0,
    published_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- 13. CONTACT MESSAGES (رسائل التواصل)
-- ============================================
CREATE TABLE contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES للأداء
-- ============================================
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);

-- ============================================
-- SAMPLE DATA - بيانات تجريبية
-- ============================================

-- Admin user (password: Admin@1234)
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@hospital.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('dr_ahmed', 'ahmed@hospital.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor');

-- Departments
INSERT INTO departments (name_ar, name_en, icon, floor_number) VALUES
('قلب وأوعية دموية', 'Cardiology', 'fa-heart', 2),
('أعصاب', 'Neurology', 'fa-brain', 3),
('عظام ومفاصل', 'Orthopedics', 'fa-bone', 2),
('أطفال وحديثي الولادة', 'Pediatrics', 'fa-baby', 1),
('عيون', 'Ophthalmology', 'fa-eye', 1),
('نساء وولادة', 'Gynecology', 'fa-female', 4),
('جراحة عامة', 'General Surgery', 'fa-scalpel', 3),
('مختبرات', 'Laboratory', 'fa-flask', 0),
('أشعة وتصوير', 'Radiology', 'fa-x-ray', 0),
('طوارئ', 'Emergency', 'fa-ambulance', 0);

-- Doctors
INSERT INTO doctors (user_id, name_ar, specialty_ar, department_id, experience_years, rating, phone) VALUES
(2, 'د. أحمد السيد', 'استشاري أمراض القلب', 1, 15, 4.9, '0501234567'),
(NULL, 'د. سارة العمري', 'استشارية أمراض الأعصاب', 2, 10, 4.8, '0507654321'),
(NULL, 'د. محمد الزهراني', 'استشاري جراحة العظام', 3, 12, 4.9, '0509876543'),
(NULL, 'د. ليلى الأحمدي', 'استشارية أطفال', 4, 8, 5.0, '0505551234'),
(NULL, 'د. عمر المالكي', 'استشاري طب العيون', 5, 9, 4.7, '0504445678');

-- Rooms
INSERT INTO rooms (room_number, room_type, department_id, floor_number, capacity, price_per_day, status) VALUES
('101', 'single', 1, 1, 1, 500.00, 'available'),
('102', 'double', 1, 1, 2, 350.00, 'available'),
('201', 'single', 2, 2, 1, 500.00, 'occupied'),
('ICU-1', 'icu', NULL, 0, 1, 1500.00, 'occupied'),
('OP-1', 'operation', NULL, 0, 1, 0.00, 'available'),
('ER-1', 'emergency', NULL, 0, 4, 0.00, 'available');
