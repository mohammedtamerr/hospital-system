<?php
// ============================================
//  API: Appointments - المواعيد
//  GET    /api/appointments.php              → list (admin/doctor)
//  GET    /api/appointments.php?id=X         → single
//  POST   /api/appointments.php              → create (public + auth)
//  PUT    /api/appointments.php?id=X         → update status
//  DELETE /api/appointments.php?id=X         → cancel
// ============================================

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/security.php';

setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;
$pdo    = getDB();

// ===== GET =====
if ($method === 'GET') {
    $payload = requireAuth();

    if ($id) {
        // موعد واحد
        $stmt = $pdo->prepare("
            SELECT a.*, 
                   p.name_ar AS patient_name, p.phone AS patient_phone,
                   d.name_ar AS doctor_name, d.specialty_ar,
                   dep.name_ar AS department_name
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.id
            LEFT JOIN doctors d ON a.doctor_id = d.id
            LEFT JOIN departments dep ON a.department_id = dep.id
            WHERE a.id = ?
        ");
        $stmt->execute([$id]);
        $appt = $stmt->fetch();
        if (!$appt) error('الموعد غير موجود', 404);
        success($appt);
    }

    // فلاتر
    $where  = ['1=1'];
    $params = [];

    // الطبيب يشوف مواعيده بس
    if ($payload['role'] === 'doctor') {
        $docStmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id = ?");
        $docStmt->execute([$payload['id']]);
        $doc = $docStmt->fetch();
        if ($doc) {
            $where[]  = 'a.doctor_id = ?';
            $params[] = $doc['id'];
        }
    }

    if (!empty($_GET['status'])) {
        $where[]  = 'a.status = ?';
        $params[] = sanitize($_GET['status']);
    }
    if (!empty($_GET['date'])) {
        $where[]  = 'a.appointment_date = ?';
        $params[] = sanitize($_GET['date']);
    }
    if (!empty($_GET['doctor_id'])) {
        $where[]  = 'a.doctor_id = ?';
        $params[] = (int)$_GET['doctor_id'];
    }

    $whereStr = implode(' AND ', $where);
    $stmt     = $pdo->prepare("
        SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.type,
               a.guest_name, a.guest_phone,
               p.name_ar AS patient_name, p.phone AS patient_phone,
               d.name_ar AS doctor_name, d.specialty_ar,
               dep.name_ar AS department_name
        FROM appointments a
        LEFT JOIN patients p ON a.patient_id = p.id
        LEFT JOIN doctors d ON a.doctor_id = d.id
        LEFT JOIN departments dep ON a.department_id = dep.id
        WHERE $whereStr
        ORDER BY a.appointment_date ASC, a.appointment_time ASC
    ");
    $stmt->execute($params);
    success($stmt->fetchAll());
}

// ===== POST - Create (public endpoint for website booking) =====
elseif ($method === 'POST') {
    rateLimit('book_appointment', 5, 300); // 5 حجوزات كل 5 دقايق

    $body = getBody();
    validateRequired($body, ['doctor_id', 'appointment_date', 'appointment_time']);

    $doctorId = (int)$body['doctor_id'];
    $date     = sanitize($body['appointment_date']);
    $time     = sanitize($body['appointment_time']);
    $notes    = sanitize($body['notes'] ?? '');
    $type     = in_array($body['type'] ?? '', ['new', 'follow_up']) ? $body['type'] : 'new';

    // التحقق من وجود الطبيب
    $docCheck = $pdo->prepare("SELECT id FROM doctors WHERE id = ? AND is_active = 1");
    $docCheck->execute([$doctorId]);
    if (!$docCheck->fetch()) error('الطبيب غير موجود');

    // التحقق من عدم تعارض المواعيد
    $conflict = $pdo->prepare("
        SELECT id FROM appointments 
        WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? 
        AND status NOT IN ('cancelled')
    ");
    $conflict->execute([$doctorId, $date, $time]);
    if ($conflict->fetch()) error('هذا الوقت محجوز بالفعل. اختر وقتاً آخر.');

    // حجز كزائر أو مريض مسجل
    $patientId   = null;
    $guestName   = null;
    $guestPhone  = null;

    // لو في توكن → مريض مسجل
    $authHeader = getallheaders()['Authorization'] ?? '';
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $m)) {
        $payload   = verifyJWT($m[1]);
        $patientId = $payload ? ($payload['patient_id'] ?? null) : null;
    }

    if (!$patientId) {
        // حجز بدون حساب
        validateRequired($body, ['guest_name', 'guest_phone']);
        $guestName  = sanitize($body['guest_name']);
        $guestPhone = sanitize($body['guest_phone']);
    }

    $deptId = !empty($body['department_id']) ? (int)$body['department_id'] : null;

    $stmt = $pdo->prepare("
        INSERT INTO appointments 
        (patient_id, doctor_id, department_id, appointment_date, appointment_time, type, notes, guest_name, guest_phone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$patientId, $doctorId, $deptId, $date, $time, $type, $notes, $guestName, $guestPhone]);

    success(['id' => $pdo->lastInsertId()], 'تم حجز الموعد بنجاح! سنتواصل معك قريباً', 201);
}

// ===== PUT - Update status =====
elseif ($method === 'PUT' && $id) {
    $payload = requireRole(['admin', 'doctor', 'receptionist']);

    $body   = getBody();
    $status = sanitize($body['status'] ?? '');

    if (!in_array($status, ['pending', 'confirmed', 'completed', 'cancelled'])) {
        error('حالة غير صالحة');
    }

    $stmt = $pdo->prepare("UPDATE appointments SET status = ?, notes = COALESCE(?, notes) WHERE id = ?");
    $stmt->execute([$status, $body['notes'] ?? null, $id]);

    if ($stmt->rowCount() === 0) error('الموعد غير موجود', 404);

    success([], 'تم تحديث الموعد');
}

// ===== DELETE - Cancel =====
elseif ($method === 'DELETE' && $id) {
    requireRole(['admin', 'receptionist']);

    $stmt = $pdo->prepare("UPDATE appointments SET status = 'cancelled' WHERE id = ?");
    $stmt->execute([$id]);

    success([], 'تم إلغاء الموعد');
}

else {
    error('Endpoint not found', 404);
}
