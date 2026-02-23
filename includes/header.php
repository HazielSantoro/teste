<?php
$config = require __DIR__ . '/../config/config.php';
?>
<!doctype html>
<html lang="pt-br" data-bs-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($config['app']['name']) ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <link href="/public/css/style.css" rel="stylesheet">
</head>
<body>
<nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
    <div class="container-fluid">
        <a class="navbar-brand" href="/"><?= htmlspecialchars($config['app']['name']) ?></a>
        <div class="d-flex gap-2">
            <button class="btn btn-outline-light btn-sm" id="toggleTheme"><i class="bi bi-moon-stars"></i></button>
            <?php if (!empty($_SESSION['user'])): ?>
                <a class="btn btn-outline-light btn-sm" href="/meus-pedidos">Meus Pedidos</a>
                <?php if (($_SESSION['user']['role'] ?? '') === 'admin'): ?>
                    <a class="btn btn-warning btn-sm" href="/admin">Admin</a>
                <?php endif; ?>
                <a class="btn btn-danger btn-sm" href="/logout">Sair</a>
            <?php else: ?>
                <a class="btn btn-outline-light btn-sm" href="/login">Entrar</a>
            <?php endif; ?>
        </div>
    </div>
</nav>
<div class="container-fluid">
    <div class="row">
