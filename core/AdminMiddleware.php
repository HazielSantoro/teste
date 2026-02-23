<?php

class AdminMiddleware
{
    public function handle(): void
    {
        if (empty($_SESSION['user']) || ($_SESSION['user']['role'] ?? '') !== 'admin') {
            http_response_code(403);
            echo 'Acesso negado.';
            exit;
        }
    }
}
