<?php

declare(strict_types=1);

session_set_cookie_params([
    'httponly' => true,
    'secure' => false,
    'samesite' => 'Lax',
]);
session_start();

$autoload = __DIR__ . '/vendor/autoload.php';
if (!file_exists($autoload)) {
    http_response_code(500);
    echo 'Dependências PHP não instaladas. Execute: composer install';
    exit;
}

require $autoload;

spl_autoload_register(static function ($class): void {
    $folders = ['core', 'controllers', 'models', 'services'];
    foreach ($folders as $folder) {
        $path = __DIR__ . '/' . $folder . '/' . $class . '.php';
        if (file_exists($path)) {
            require_once $path;
            return;
        }
    }
});

$config = require __DIR__ . '/config/config.php';
date_default_timezone_set($config['app']['timezone']);

$router = new Router();
$router->get('/', [HomeController::class, 'index']);
$router->get('/produto', [ProductController::class, 'show']);
$router->post('/orcamento', [ProductController::class, 'quote']);

$router->get('/login', [AuthController::class, 'showLogin']);
$router->post('/login', [AuthController::class, 'login']);
$router->get('/cadastro', [AuthController::class, 'showRegister']);
$router->post('/cadastro', [AuthController::class, 'register']);
$router->get('/logout', [AuthController::class, 'logout'], [AuthMiddleware::class]);
$router->get('/forgot-password', [AuthController::class, 'showForgotPassword']);
$router->post('/forgot-password', [AuthController::class, 'sendReset']);
$router->get('/reset-password', [AuthController::class, 'showResetPassword']);
$router->post('/reset-password', [AuthController::class, 'resetPassword']);

$router->post('/pedidos', [OrderController::class, 'create'], [AuthMiddleware::class]);
$router->get('/meus-pedidos', [OrderController::class, 'myOrders'], [AuthMiddleware::class]);
$router->post('/admin/pedidos/status', [OrderController::class, 'updateStatus'], [AdminMiddleware::class]);
$router->post('/admin/produtos', [ProductController::class, 'create'], [AdminMiddleware::class]);
$router->get('/admin', [AdminController::class, 'dashboard'], [AdminMiddleware::class]);

$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
