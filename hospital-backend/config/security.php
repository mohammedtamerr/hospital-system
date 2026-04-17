<?php
// ============================================
//  Security & Auth Helpers
// ============================================

define('JWT_SECRET', 'H0sp1t@l_S3cr3t_K3y_2026_Ch@ng3_M3');
define('JWT_EXPIRY', 3600); // 1 hour

// ===== JWT =====
function generateJWT($payload) {
    $header  = base64url_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload['iat'] = time();
    $payload['exp'] = time() + JWT_EXPIRY;
    $payload_enc = base64url_encode(json_encode($payload));
    $signature   = base64url_encode(hash_hmac('sha256', "$header.$payload_enc", JWT_SECRET, true));
    return "$header.$payload_enc.$signature";
}

function verifyJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;

    [$header, $payload, $signature] = $parts;
    $expected = base64url_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));

    if (!hash_equals($expected, $signature)) return false;

    $data = json_decode(base64url_decode($payload), true);
    if ($data['exp'] < time()) return false;

    return $data;
}

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
}

// ===== AUTH MIDDLEWARE =====
function requireAuth() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        http_response_code(401);
        die(json_encode(['success' => false, 'message' => 'Unauthorized - No token']));
    }

    $payload = verifyJWT($matches[1]);
    if (!$payload) {
        http_response_code(401);
        die(json_encode(['success' => false, 'message' => 'Unauthorized - Invalid or expired token']));
    }

    return $payload;
}

function requireRole($roles) {
    $payload = requireAuth();
    if (!in_array($payload['role'], (array)$roles)) {
        http_response_code(403);
        die(json_encode(['success' => false, 'message' => 'Forbidden - Insufficient permissions']));
    }
    return $payload;
}

// ===== PASSWORD =====
function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}

function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// ===== INPUT SANITIZATION =====
function sanitize($input) {
    if (is_array($input)) {
        return array_map('sanitize', $input);
    }
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

function sanitizeEmail($email) {
    return filter_var(trim($email), FILTER_SANITIZE_EMAIL);
}

function validateRequired($data, $fields) {
    $missing = [];
    foreach ($fields as $field) {
        if (empty($data[$field])) {
            $missing[] = $field;
        }
    }
    if (!empty($missing)) {
        http_response_code(400);
        die(json_encode(['success' => false, 'message' => 'Missing required fields: ' . implode(', ', $missing)]));
    }
}

// ===== RATE LIMITING (بسيط باستخدام ملفات مؤقتة) =====
function rateLimit($action = 'default', $maxRequests = 10, $window = 60) {
    $ip      = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $key     = md5($ip . $action);
    $tmpFile = sys_get_temp_dir() . "/rl_$key.json";

    $data = file_exists($tmpFile) ? json_decode(file_get_contents($tmpFile), true) : ['count' => 0, 'reset_at' => time() + $window];

    if (time() > $data['reset_at']) {
        $data = ['count' => 0, 'reset_at' => time() + $window];
    }

    $data['count']++;
    file_put_contents($tmpFile, json_encode($data));

    if ($data['count'] > $maxRequests) {
        http_response_code(429);
        die(json_encode(['success' => false, 'message' => 'Too many requests. Please wait.']));
    }
}

// ===== CORS & HEADERS =====
function setCORSHeaders() {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// ===== RESPONSE HELPERS =====
function success($data = [], $message = 'OK', $code = 200) {
    http_response_code($code);
    echo json_encode(['success' => true, 'message' => $message, 'data' => $data]);
    exit();
}

function error($message = 'Error', $code = 400) {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit();
}

// ===== GET JSON BODY =====
function getBody() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}
