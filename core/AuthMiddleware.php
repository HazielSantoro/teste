<?php

class AuthMiddleware
{
    public function handle(): void
    {
        if (empty($_SESSION['user'])) {
            header('Location: /login');
            exit;
        }
    }
}
