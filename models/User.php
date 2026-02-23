<?php

class User extends Model
{
    public function create(array $data): bool
    {
        $sql = 'INSERT INTO users (nome, email, usuario, senha, telefone, instagram, cidade, estado, role_id)
                VALUES (:nome, :email, :usuario, :senha, :telefone, :instagram, :cidade, :estado, :role_id)';

        $stmt = $this->db->prepare($sql);
        return $stmt->execute($data);
    }

    public function findByEmailOrUsuario(string $login): ?array
    {
        $stmt = $this->db->prepare('SELECT u.*, r.nome AS role FROM users u JOIN roles r ON r.id = u.role_id WHERE u.email = :login OR u.usuario = :login LIMIT 1');
        $stmt->execute(['login' => $login]);
        $user = $stmt->fetch();

        return $user ?: null;
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT u.*, r.nome AS role FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        return $stmt->fetch() ?: null;
    }

    public function storeResetToken(int $id, string $token): bool
    {
        $stmt = $this->db->prepare('UPDATE users SET reset_token = :token, reset_expira = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = :id');
        return $stmt->execute(['token' => $token, 'id' => $id]);
    }

    public function findByResetToken(string $token): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE reset_token = :token AND reset_expira > NOW() LIMIT 1');
        $stmt->execute(['token' => $token]);
        return $stmt->fetch() ?: null;
    }

    public function updatePassword(int $id, string $hash): bool
    {
        $stmt = $this->db->prepare('UPDATE users SET senha = :senha, reset_token = NULL, reset_expira = NULL WHERE id = :id');
        return $stmt->execute(['senha' => $hash, 'id' => $id]);
    }

    public function totalClientes(): int
    {
        $stmt = $this->db->query("SELECT COUNT(*) AS total FROM users u JOIN roles r ON r.id=u.role_id WHERE r.nome='cliente'");
        return (int) $stmt->fetch()['total'];
    }
}
