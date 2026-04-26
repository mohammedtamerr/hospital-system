<?php
// ============================================
//  API: Patients - المرضى
//  GET  /api/patients.php?id=X  → single
//  GET  /api/patients.php?search=X
//  POST /api/patients.php       → add
//  PUT  /api/patients.php?id=X  → edit
// ============================================

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/security.php';

setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;
$pdo    = getDB();

if ($method === 'GET') {
    requireRole(['admin', 'doctor', 'nurse', 'receptionist']);

    if ($id) {
        $stmt = $pdo->prepare("SELECT * FROM patients WHERE id = ?");
        $stmt->execute([$id]);
        $patient = $stmt->fetch();
        if (!$patient) error('المريض غير موجود', 404);

        // السجلات الطبية
        $rStmt = $pdo->prepare("
            SELECT mr.*, d.name_ar AS doctor_name
            FROM medical_records mr
            LEFT JOIN doctors d ON mr.doctor_id = d.id
            WHERE mr.patient_id = ?
            ORDER BY mr.created_at DESC
        ");
        $rStmt->execute([$id]);
        $patient['medical_records'] = $rStmt->fetchAll();

        success($patient);
    }

    $where  = ['1=1'];
    $params = [];

    if (!empty($_GET['search'])) {
        $s        = '%' . sanitize($_GET['search']) . '%';
        $where[]  = "(name_ar LIKE ? OR phone LIKE ? OR national_id LIKE ?)";
        $params   = array_merge($params, [$s, $s, $s]);
    }

    $whereStr = implode(' AND ', $where);
    $stmt     = $pdo->prepare("SELECT id, name_ar, gender, phone, blood_type, date_of_birth, created_at FROM patients WHERE $whereStr ORDER BY created_at DESC LIMIT 100");
    $stmt->execute($params);
    success($stmt->fetchAll());
}

elseif ($method === 'POST') {
    // تسجيل مريض جديد - متاح للجميع (public)
    // بدون حاجة لـ authentication

    $body = getBody();
    validateRequired($body, ['name_ar', 'gender', 'phone']);

    $stmt = $pdo->prepare("
        INSERT INTO patients (national_id, name_ar, name_en, gender, date_of_birth, phone, email, address, blood_type, allergies, chronic_diseases, emergency_contact_name, emergency_contact_phone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        sanitize($body['national_id'] ?? null),
        sanitize($body['name_ar']),
        sanitize($body['name_en'] ?? ''),
        sanitize($body['gender']),
        $body['date_of_birth'] ?? null,
        sanitize($body['phone']),
        sanitizeEmail($body['email'] ?? ''),
        sanitize($body['address'] ?? ''),
        sanitize($body['blood_type'] ?? null),
        sanitize($body['allergies'] ?? ''),
        sanitize($body['chronic_diseases'] ?? ''),
        sanitize($body['emergency_contact_name'] ?? ''),
        sanitize($body['emergency_contact_phone'] ?? ''),
    ]);

    success(['id' => $pdo->lastInsertId()], 'تم إضافة المريض', 201);
}

elseif ($method === 'PUT' && $id) {
    requireRole(['admin', 'receptionist', 'nurse']);

    $body = getBody();

    $stmt = $pdo->prepare("
        UPDATE patients SET
            name_ar = COALESCE(?, name_ar),
            phone = COALESCE(?, phone),
            email = COALESCE(?, email),
            address = COALESCE(?, address),
            blood_type = COALESCE(?, blood_type),
            allergies = COALESCE(?, allergies),
            chronic_diseases = COALESCE(?, chronic_diseases)
        WHERE id = ?
    ");
    $stmt->execute([
        sanitize($body['name_ar'] ?? null),
        sanitize($body['phone'] ?? null),
        sanitizeEmail($body['email'] ?? null),
        sanitize($body['address'] ?? null),
        sanitize($body['blood_type'] ?? null),
        sanitize($body['allergies'] ?? null),
        sanitize($body['chronic_diseases'] ?? null),
        $id,
    ]);

    success([], 'تم تحديث بيانات المريض');
}

else {
    error('Endpoint not found', 404);
}
