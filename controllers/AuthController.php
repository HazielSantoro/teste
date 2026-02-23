<?php

class AuthController extends Controller
{
    private User $users;
    private ActivityLogService $log;

    public function __construct()
    {
        $this->users = new User();
        $this->log = new ActivityLogService();
    }

    public function showLogin(): void
    {
        $this->view('auth/login');
    }

    public function login(): void
    {
        if (!Csrf::verify($_POST['_csrf'] ?? null)) {
            $this->json(['error' => 'CSRF inválido'], 422);
            return;
        }

        $user = $this->users->findByEmailOrUsuario(trim($_POST['login'] ?? ''));
        if (!$user || !password_verify($_POST['senha'] ?? '', $user['senha'])) {
            $this->view('auth/login', ['erro' => 'Credenciais inválidas']);
            return;
        }

        $_SESSION['user'] = [
            'id' => $user['id'],
            'nome' => $user['nome'],
            'email' => $user['email'],
            'role' => $user['role'],
        ];
        session_regenerate_id(true);
        $this->log->registrar((int) $user['id'], 'login', 'Login realizado com sucesso');
        $this->redirect('/');
    }

    public function showRegister(): void
    {
        $this->view('auth/register');
    }

    public function register(): void
    {
        if (!Csrf::verify($_POST['_csrf'] ?? null)) {
            $this->json(['error' => 'CSRF inválido'], 422);
            return;
        }

        $ok = $this->users->create([
            'nome' => trim($_POST['nome'] ?? ''),
            'email' => trim($_POST['email'] ?? ''),
            'usuario' => trim($_POST['usuario'] ?? ''),
            'senha' => password_hash($_POST['senha'] ?? '', PASSWORD_DEFAULT),
            'telefone' => trim($_POST['telefone'] ?? ''),
            'instagram' => trim($_POST['instagram'] ?? ''),
            'cidade' => trim($_POST['cidade'] ?? ''),
            'estado' => trim($_POST['estado'] ?? ''),
            'role_id' => 2,
        ]);

        if (!$ok) {
            $this->view('auth/register', ['erro' => 'Não foi possível cadastrar']);
            return;
        }

        $this->redirect('/login');
    }

    public function logout(): void
    {
        $userId = $_SESSION['user']['id'] ?? null;
        $_SESSION = [];
        session_destroy();
        $this->log->registrar($userId, 'logout', 'Logout');
        $this->redirect('/login');
    }

    public function showForgotPassword(): void
    {
        $this->view('auth/forgot_password');
    }

    public function sendReset(): void
    {
        $user = $this->users->findByEmailOrUsuario(trim($_POST['email'] ?? ''));
        if ($user) {
            $token = bin2hex(random_bytes(16));
            $this->users->storeResetToken((int) $user['id'], $token);
            $link = (require __DIR__ . '/../config/config.php')['app']['url'] . '/reset-password?token=' . $token;
            (new EmailService())->enviarEmail($user['email'], 'Recuperação de senha', "Use o link: <a href='$link'>$link</a>");
        }
        $this->view('auth/forgot_password', ['sucesso' => 'Se o e-mail existir, enviaremos instruções.']);
    }

    public function showResetPassword(): void
    {
        $this->view('auth/reset_password', ['token' => $_GET['token'] ?? '']);
    }

    public function resetPassword(): void
    {
        $token = $_POST['token'] ?? '';
        $user = $this->users->findByResetToken($token);

        if (!$user) {
            $this->view('auth/reset_password', ['erro' => 'Token inválido', 'token' => $token]);
            return;
        }

        $this->users->updatePassword((int) $user['id'], password_hash($_POST['senha'] ?? '', PASSWORD_DEFAULT));
        $this->redirect('/login');
    }
}
