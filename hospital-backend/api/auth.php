<?php
// ============================================
//  API: Auth - تسجيل الدخول والخروج
//  POST /api/auth/login
//  POST /api/auth/register  (admin only)
//  GET  /api/auth/me
// ============================================

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/security.php';

setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// ===== LOGIN =====
if ($method === 'POST' && $action === 'login') {
    rateLimit('login', 5, 60); // 5 محاولات كل دقيقة

    $body = getBody();
    validateRequired($body, ['email', 'password']);

    $email    = sanitizeEmail($body['email']);
    $password = $body['password'];

    $pdo  = getDB();
    $stmt = $pdo->prepare("SELECT id, username, email, password_hash, role, is_active FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !verifyPassword($password, $user['password_hash'])) {
        error('البريد الإلكتروني أو كلمة المرور غير صحيحة', 401);
    }

    if (!$user['is_active']) {
        error('الحساب موقوف. تواصل مع الإدارة', 403);
    }

    // تحديث آخر تسجيل دخول
    $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?")->execute([$user['id']]);

    $token = generateJWT([
        'id'    => $user['id'],
        'email' => $user['email'],
        'role'  => $user['role'],
        'name'  => $user['username'],
    ]);

    success([
        'token' => $token,
        'user'  => [
            'id'       => $user['id'],
            'username' => $user['username'],
            'email'    => $user['email'],
            'role'     => $user['role'],
        ]
    ], 'تم تسجيل الدخول بنجاح');
}

// ===== REGISTER (admin only) =====
elseif ($method === 'POST' && $action === 'register') {
    requireRole('admin');

    $body = getBody();
    validateRequired($body, ['username', 'email', 'password', 'role']);

    $username = sanitize($body['username']);
    $email    = sanitizeEmail($body['email']);
    $password = $body['password'];
    $role     = sanitize($body['role']);

    if (strlen($password) < 8) {
        error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
    }

    if (!in_array($role, ['admin', 'doctor', 'nurse', 'receptionist'])) {
        error('الدور غير صالح');
    }

    $pdo = getDB();

    // التحقق من عدم التكرار
    $check = $pdo->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
    $check->execute([$email, $username]);
    if ($check->fetch()) {
        error('البريد الإلكتروني أو اسم المستخدم مستخدم بالفعل');
    }

    $hash = hashPassword($password);
    $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)");
    $stmt->execute([$username, $email, $hash, $role]);

    success(['id' => $pdo->lastInsertId()], 'تم إنشاء المستخدم بنجاح', 201);
}

// ===== ME (get current user) =====
elseif ($method === 'GET' && $action === 'me') {
    $payload = requireAuth();

    $pdo  = getDB();
    $stmt = $pdo->prepare("SELECT id, username, email, role, last_login, created_at FROM users WHERE id = ?");
    $stmt->execute([$payload['id']]);
    $user = $stmt->fetch();

    if (!$user) error('المستخدم غير موجود', 404);

    success($user);
}

// ===== CHANGE PASSWORD =====
elseif ($method === 'POST' && $action === 'change_password') {
    $payload = requireAuth();
    $body    = getBody();
    validateRequired($body, ['old_password', 'new_password']);

    if (strlen($body['new_password']) < 8) {
        error('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل');
    }

    $pdo  = getDB();
    $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = ?");
    $stmt->execute([$payload['id']]);
    $user = $stmt->fetch();

    if (!verifyPassword($body['old_password'], $user['password_hash'])) {
        error('كلمة المرور القديمة غير صحيحة', 401);
    }

    $newHash = hashPassword($body['new_password']);
    $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?")->execute([$newHash, $payload['id']]);

    success([], 'تم تغيير كلمة المرور بنجاح');
}

else {
    error('Endpoint not found', 404);
}
