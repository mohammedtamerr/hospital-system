<?php
// ============================================
//  API: Doctors - الأطباء
//  GET    /api/doctors.php           → all doctors (public)
//  GET    /api/doctors.php?id=X      → single doctor
//  GET    /api/doctors.php?search=X  → search
//  POST   /api/doctors.php           → add (admin)
//  PUT    /api/doctors.php?id=X      → edit (admin)
//  DELETE /api/doctors.php?id=X      → delete (admin)
// ============================================

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/security.php';

setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;
$pdo    = getDB();

// ===== GET =====
if ($method === 'GET') {

    if ($id) {
        $stmt = $pdo->prepare("
            SELECT d.*, dep.name_ar AS department_name
            FROM doctors d
            LEFT JOIN departments dep ON d.department_id = dep.id
            WHERE d.id = ? AND d.is_active = 1
        ");
        $stmt->execute([$id]);
        $doctor = $stmt->fetch();
        if (!$doctor) error('الطبيب غير موجود', 404);
        success($doctor);
    }

    $where  = ["d.is_active = 1"];
    $params = [];

    if (!empty($_GET['search'])) {
        $s        = '%' . sanitize($_GET['search']) . '%';
        $where[]  = "(d.name_ar LIKE ? OR d.specialty_ar LIKE ? OR d.name_en LIKE ?)";
        $params   = array_merge($params, [$s, $s, $s]);
    }

    if (!empty($_GET['department_id'])) {
        $where[]  = 'd.department_id = ?';
        $params[] = (int)$_GET['department_id'];
    }

    $whereStr = implode(' AND ', $where);
    $stmt     = $pdo->prepare("
        SELECT d.id, d.name_ar, d.name_en, d.specialty_ar, d.specialty_en,
               d.rating, d.experience_years, d.photo_url, d.available_days,
               d.available_from, d.available_to,
               dep.name_ar AS department_name
        FROM doctors d
        LEFT JOIN departments dep ON d.department_id = dep.id
        WHERE $whereStr
        ORDER BY d.rating DESC
    ");
    $stmt->execute($params);
    success($stmt->fetchAll());
}

// ===== POST =====
elseif ($method === 'POST') {
    requireRole('admin');

    $body = getBody();
    validateRequired($body, ['name_ar', 'specialty_ar', 'department_id']);

    $stmt = $pdo->prepare("
        INSERT INTO doctors (name_ar, name_en, specialty_ar, specialty_en, department_id,
            qualification, experience_years, phone, email, bio_ar, available_days,
            available_from, available_to, photo_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        sanitize($body['name_ar']),
        sanitize($body['name_en'] ?? ''),
        sanitize($body['specialty_ar']),
        sanitize($body['specialty_en'] ?? ''),
        (int)$body['department_id'],
        sanitize($body['qualification'] ?? ''),
        (int)($body['experience_years'] ?? 0),
        sanitize($body['phone'] ?? ''),
        sanitizeEmail($body['email'] ?? ''),
        sanitize($body['bio_ar'] ?? ''),
        sanitize($body['available_days'] ?? ''),
        $body['available_from'] ?? null,
        $body['available_to'] ?? null,
        sanitize($body['photo_url'] ?? ''),
    ]);

    success(['id' => $pdo->lastInsertId()], 'تم إضافة الطبيب بنجاح', 201);
}

// ===== PUT =====
elseif ($method === 'PUT' && $id) {
    requireRole('admin');

    $body = getBody();

    $stmt = $pdo->prepare("
        UPDATE doctors SET
            name_ar = COALESCE(?, name_ar),
            name_en = COALESCE(?, name_en),
            specialty_ar = COALESCE(?, specialty_ar),
            department_id = COALESCE(?, department_id),
            experience_years = COALESCE(?, experience_years),
            phone = COALESCE(?, phone),
            available_days = COALESCE(?, available_days),
            is_active = COALESCE(?, is_active)
        WHERE id = ?
    ");
    $stmt->execute([
        sanitize($body['name_ar'] ?? null),
        sanitize($body['name_en'] ?? null),
        sanitize($body['specialty_ar'] ?? null),
        isset($body['department_id']) ? (int)$body['department_id'] : null,
        isset($body['experience_years']) ? (int)$body['experience_years'] : null,
        sanitize($body['phone'] ?? null),
        sanitize($body['available_days'] ?? null),
        isset($body['is_active']) ? (int)$body['is_active'] : null,
        $id,
    ]);

    success([], 'تم تحديث بيانات الطبيب');
}

// ===== DELETE =====
elseif ($method === 'DELETE' && $id) {
    requireRole('admin');

    // soft delete
    $pdo->prepare("UPDATE doctors SET is_active = 0 WHERE id = ?")->execute([$id]);
    success([], 'تم حذف الطبيب');
}

else {
    error('Endpoint not found', 404);
}
