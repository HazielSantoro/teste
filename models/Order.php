<?php

class Order extends Model
{
    public function create(array $data): int
    {
        $stmt = $this->db->prepare('INSERT INTO pedidos (user_id, produto_id, status, valor_total, prazo, prioridade)
        VALUES (:user_id, :produto_id, :status, :valor_total, :prazo, :prioridade)');
        $stmt->execute($data);
        return (int) $this->db->lastInsertId();
    }

    public function byUser(int $userId): array
    {
        $stmt = $this->db->prepare('SELECT p.*, pr.nome AS produto FROM pedidos p JOIN produtos pr ON pr.id = p.produto_id WHERE p.user_id = :id ORDER BY p.created_at DESC');
        $stmt->execute(['id' => $userId]);
        return $stmt->fetchAll();
    }

    public function all(): array
    {
        return $this->db->query('SELECT p.*, u.nome AS cliente, pr.nome AS produto FROM pedidos p JOIN users u ON u.id = p.user_id JOIN produtos pr ON pr.id = p.produto_id ORDER BY p.created_at DESC')->fetchAll();
    }

    public function updateStatus(int $id, string $status): bool
    {
        $stmt = $this->db->prepare('UPDATE pedidos SET status = :status WHERE id = :id');
        return $stmt->execute(['status' => $status, 'id' => $id]);
    }

    public function resumoMensal(): array
    {
        $sql = 'SELECT DATE_FORMAT(created_at, "%Y-%m") AS mes, COUNT(*) AS pedidos, SUM(valor_total) AS faturamento
                FROM pedidos
                GROUP BY DATE_FORMAT(created_at, "%Y-%m")
                ORDER BY mes';
        return $this->db->query($sql)->fetchAll();
    }

    public function totalPedidos(): int
    {
        return (int) $this->db->query('SELECT COUNT(*) AS total FROM pedidos')->fetch()['total'];
    }
}
