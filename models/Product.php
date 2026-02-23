<?php

class Product extends Model
{
    public function allAtivos(): array
    {
        return $this->db->query('SELECT * FROM produtos WHERE ativo = 1 ORDER BY created_at DESC')->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM produtos WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $produto = $stmt->fetch();
        if (!$produto) {
            return null;
        }

        $imgStmt = $this->db->prepare('SELECT caminho_imagem FROM imagens_produto WHERE produto_id = :id');
        $imgStmt->execute(['id' => $id]);
        $produto['imagens'] = $imgStmt->fetchAll();

        $avgStmt = $this->db->prepare('SELECT AVG(nota) AS media FROM avaliacoes WHERE produto_id = :id AND aprovado = 1');
        $avgStmt->execute(['id' => $id]);
        $produto['media_avaliacao'] = (float) ($avgStmt->fetch()['media'] ?? 0);

        return $produto;
    }

    public function create(array $data): bool
    {
        $stmt = $this->db->prepare('INSERT INTO produtos (nome, descricao, categoria_id, preco_modelagem, preco_impressao, taxa_pintura, peso_estimado, tempo_estimado, ativo)
        VALUES (:nome, :descricao, :categoria_id, :preco_modelagem, :preco_impressao, :taxa_pintura, :peso_estimado, :tempo_estimado, :ativo)');

        return $stmt->execute($data);
    }

    public function addImage(int $produtoId, string $path): bool
    {
        $stmt = $this->db->prepare('INSERT INTO imagens_produto (produto_id, caminho_imagem) VALUES (:produto_id, :caminho)');
        return $stmt->execute(['produto_id' => $produtoId, 'caminho' => $path]);
    }
}
