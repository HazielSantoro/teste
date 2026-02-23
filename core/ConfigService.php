<?php

class ConfigService extends Model
{
    private array $cache = [];

    public function get(string $key, ?string $default = null): ?string
    {
        if (isset($this->cache[$key])) {
            return $this->cache[$key];
        }

        $stmt = $this->db->prepare('SELECT valor FROM configuracoes WHERE chave = :chave LIMIT 1');
        $stmt->execute(['chave' => $key]);
        $row = $stmt->fetch();
        $value = $row['valor'] ?? $default;
        $this->cache[$key] = $value;

        return $value;
    }

    public function set(string $key, string $value): bool
    {
        $stmt = $this->db->prepare('INSERT INTO configuracoes (chave, valor) VALUES (:chave, :valor)
        ON DUPLICATE KEY UPDATE valor = VALUES(valor)');
        $this->cache[$key] = $value;

        return $stmt->execute(['chave' => $key, 'valor' => $value]);
    }
}
