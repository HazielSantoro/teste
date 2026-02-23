<?php

return [
    'app' => [
        'name' => getenv('APP_NAME') ?: 'ERP Ateliê 3D Cosplay',
        'url' => getenv('APP_URL') ?: 'http://localhost:8000',
        'timezone' => getenv('APP_TIMEZONE') ?: 'America/Sao_Paulo',
        'session_timeout' => (int) (getenv('SESSION_TIMEOUT') ?: 120),
        'upload_limit_mb' => (int) (getenv('UPLOAD_LIMIT_MB') ?: 20),
    ],
    'security' => [
        'csrf_ttl' => 7200,
    ],
];
