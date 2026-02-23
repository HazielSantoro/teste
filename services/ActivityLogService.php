<?php

class ActivityLogService extends Model
{
    public function registrar(?int $userId, string $acao, string $detalhes = ''): void
    {
        $stmt = $this->db->prepare('INSERT INTO activity_logs (user_id, acao, detalhes, ip) VALUES (:user_id, :acao, :detalhes, :ip)');
        $stmt->execute([
            'user_id' => $userId,
            'acao' => $acao,
            'detalhes' => $detalhes,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'cli',
        ]);
    }
}
