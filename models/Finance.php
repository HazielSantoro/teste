<?php

class Finance extends Model
{
    public function registrar(array $data): bool
    {
        $stmt = $this->db->prepare('INSERT INTO financeiro (pedido_id, valor_total, sinal, restante, status_pagamento, metodo_pagamento)
        VALUES (:pedido_id, :valor_total, :sinal, :restante, :status_pagamento, :metodo_pagamento)');
        return $stmt->execute($data);
    }

    public function lucroMensal(): float
    {
        $stmt = $this->db->query('SELECT COALESCE(SUM(f.valor_total - (p.custo_material + p.custo_energia)),0) AS lucro
         FROM financeiro f JOIN producao p ON p.pedido_id = f.pedido_id');
        return (float) $stmt->fetch()['lucro'];
    }
}
