<?php

class FreteService extends Model
{
    public function calcularPorFaixa(string $cep): array
    {
        $cepNum = preg_replace('/\D/', '', $cep);
        $stmt = $this->db->prepare('SELECT valor, prazo FROM frete_faixas WHERE :cep BETWEEN cep_inicio AND cep_fim LIMIT 1');
        $stmt->execute(['cep' => $cepNum]);
        $faixa = $stmt->fetch();

        if (!$faixa) {
            return ['valor' => 0.0, 'prazo' => 'A consultar'];
        }

        return ['valor' => (float) $faixa['valor'], 'prazo' => $faixa['prazo']];
    }

    public function calcularViaCorreios(string $cepOrigem, string $cepDestino, float $peso): array
    {
        return [
            'provider' => 'correios_stub',
            'cep_origem' => $cepOrigem,
            'cep_destino' => $cepDestino,
            'peso' => $peso,
            'valor' => 0.0,
            'prazo' => 'Integração pendente',
        ];
    }
}
