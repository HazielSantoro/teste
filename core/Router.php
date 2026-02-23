<?php

class Router
{
    private array $routes = [];

    public function get(string $path, array $action, array $middlewares = []): void
    {
        $this->addRoute('GET', $path, $action, $middlewares);
    }

    public function post(string $path, array $action, array $middlewares = []): void
    {
        $this->addRoute('POST', $path, $action, $middlewares);
    }

    private function addRoute(string $method, string $path, array $action, array $middlewares): void
    {
        $this->routes[$method][$path] = ['action' => $action, 'middlewares' => $middlewares];
    }

    public function dispatch(string $method, string $uri): void
    {
        $path = parse_url($uri, PHP_URL_PATH) ?: '/';
        $route = $this->routes[$method][$path] ?? null;

        if (!$route) {
            http_response_code(404);
            require __DIR__ . '/../views/errors/404.php';
            return;
        }

        foreach ($route['middlewares'] as $middleware) {
            (new $middleware())->handle();
        }

        [$controller, $handler] = $route['action'];
        (new $controller())->$handler();
    }
}
