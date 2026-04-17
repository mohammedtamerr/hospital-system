<?php
// ============================================
//  API: Departments + Contact Messages + News
// ============================================

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/security.php';

setCORSHeaders();

$endpoint = $_GET['endpoint'] ?? '';
$method   = $_SERVER['REQUEST_METHOD'];
$id       = isset($_GET['id']) ? (int)$_GET['id'] : null;
$pdo      = getDB();

// ===== DEPARTMENTS =====
if ($endpoint === 'departments') {

    if ($method === 'GET') {
        if ($id) {
            $stmt = $pdo->prepare("SELECT * FROM departments WHERE id = ?");
            $stmt->execute([$id]);
            $dept = $stmt->fetch();
            if (!$dept) error('القسم غير موجود', 404);

            // أطباء القسم
            $dStmt = $pdo->prepare("SELECT id, name_ar, specialty_ar, rating, photo_url FROM doctors WHERE department_id = ? AND is_active = 1");
            $dStmt->execute([$id]);
            $dept['doctors'] = $dStmt->fetchAll();
            success($dept);
        }

        $stmt = $pdo->query("SELECT * FROM departments WHERE is_active = 1 ORDER BY name_ar");
        success($stmt->fetchAll());
    }

    elseif ($method === 'POST') {
        requireRole('admin');
        $body = getBody();
        validateRequired($body, ['name_ar', 'name_en']);

        $stmt = $pdo->prepare("INSERT INTO departments (name_ar, name_en, description_ar, icon, floor_number) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            sanitize($body['name_ar']),
            sanitize($body['name_en']),
            sanitize($body['description_ar'] ?? ''),
            sanitize($body['icon'] ?? ''),
            (int)($body['floor_number'] ?? 0),
        ]);
        success(['id' => $pdo->lastInsertId()], 'تم إضافة القسم', 201);
    }

    elseif ($method === 'PUT' && $id) {
        requireRole('admin');
        $body = getBody();
        $stmt = $pdo->prepare("UPDATE departments SET name_ar = COALESCE(?, name_ar), name_en = COALESCE(?, name_en), is_active = COALESCE(?, is_active) WHERE id = ?");
        $stmt->execute([
            sanitize($body['name_ar'] ?? null),
            sanitize($body['name_en'] ?? null),
            isset($body['is_active']) ? (int)$body['is_active'] : null,
            $id,
        ]);
        success([], 'تم تحديث القسم');
    }
}

// ===== CONTACT MESSAGES =====
elseif ($endpoint === 'contact') {

    if ($method === 'POST') {
        rateLimit('contact', 3, 300); // 3 رسائل كل 5 دقايق

        $body = getBody();
        validateRequired($body, ['name', 'message']);

        $stmt = $pdo->prepare("INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            sanitize($body['name']),
            sanitizeEmail($body['email'] ?? ''),
            sanitize($body['phone'] ?? ''),
            sanitize($body['subject'] ?? ''),
            sanitize($body['message']),
        ]);
        success([], 'تم إرسال رسالتك بنجاح. سنتواصل معك قريباً!', 201);
    }

    elseif ($method === 'GET') {
        requireRole('admin');
        $status = sanitize($_GET['status'] ?? '');
        $where  = $status ? "WHERE status = '$status'" : '';
        $stmt   = $pdo->query("SELECT * FROM contact_messages $where ORDER BY created_at DESC");
        success($stmt->fetchAll());
    }

    elseif ($method === 'PUT' && $id) {
        requireRole('admin');
        $body   = getBody();
        $status = sanitize($body['status'] ?? 'read');
        $pdo->prepare("UPDATE contact_messages SET status = ? WHERE id = ?")->execute([$status, $id]);
        success([], 'تم تحديث حالة الرسالة');
    }
}

// ===== NEWS =====
elseif ($endpoint === 'news') {

    if ($method === 'GET') {
        if ($id) {
            $stmt = $pdo->prepare("SELECT * FROM news WHERE id = ? AND is_published = 1");
            $stmt->execute([$id]);
            $news = $stmt->fetch();
            if (!$news) error('الخبر غير موجود', 404);
            success($news);
        }

        $stmt = $pdo->query("SELECT id, title_ar, title_en, image_url, category, published_at FROM news WHERE is_published = 1 ORDER BY published_at DESC LIMIT 20");
        success($stmt->fetchAll());
    }

    elseif ($method === 'POST') {
        $payload = requireRole('admin');
        $body    = getBody();
        validateRequired($body, ['title_ar', 'content_ar']);

        $isPublished = !empty($body['is_published']) ? 1 : 0;
        $stmt        = $pdo->prepare("
            INSERT INTO news (title_ar, title_en, content_ar, content_en, image_url, category, author_id, is_published, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            sanitize($body['title_ar']),
            sanitize($body['title_en'] ?? ''),
            sanitize($body['content_ar']),
            sanitize($body['content_en'] ?? ''),
            sanitize($body['image_url'] ?? ''),
            sanitize($body['category'] ?? ''),
            $payload['id'],
            $isPublished,
            $isPublished ? date('Y-m-d H:i:s') : null,
        ]);
        success(['id' => $pdo->lastInsertId()], 'تم إضافة الخبر', 201);
    }
}

// ===== STATS (dashboard) =====
elseif ($endpoint === 'stats') {
    requireRole('admin');

    $stats = [
        'total_patients'     => $pdo->query("SELECT COUNT(*) FROM patients")->fetchColumn(),
        'total_doctors'      => $pdo->query("SELECT COUNT(*) FROM doctors WHERE is_active = 1")->fetchColumn(),
        'today_appointments' => $pdo->query("SELECT COUNT(*) FROM appointments WHERE appointment_date = CURDATE()")->fetchColumn(),
        'pending_appointments' => $pdo->query("SELECT COUNT(*) FROM appointments WHERE status = 'pending'")->fetchColumn(),
        'occupied_rooms'     => $pdo->query("SELECT COUNT(*) FROM rooms WHERE status = 'occupied'")->fetchColumn(),
        'new_messages'       => $pdo->query("SELECT COUNT(*) FROM contact_messages WHERE status = 'new'")->fetchColumn(),
        'total_departments'  => $pdo->query("SELECT COUNT(*) FROM departments WHERE is_active = 1")->fetchColumn(),
    ];

    success($stats);
}

else {
    error('Endpoint not found', 404);
}
