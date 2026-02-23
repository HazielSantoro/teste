<?php

class OrcamentoService
{
    public static function calcularOrcamento(
        float $modelagem,
        float $impressao,
        float $pintura,
        float $peso,
        float $custoPorGrama,
        float $tempoEstimado,
        float $custoHora,
        float $margem,
        float $frete
    ): array {
        $custoMaterial = $peso * $custoPorGrama;
        $custoTempo = $tempoEstimado * $custoHora;
        $subtotal = $modelagem + $impressao + $pintura + $custoMaterial + $custoTempo;
        $valorMargem = $subtotal * ($margem / 100);
        $total = $subtotal + $valorMargem + $frete;

        return [
            'modelagem' => $modelagem,
            'impressao' => $impressao,
            'pintura' => $pintura,
            'custo_material' => $custoMaterial,
            'custo_tempo' => $custoTempo,
            'subtotal' => $subtotal,
            'margem_percentual' => $margem,
            'valor_margem' => $valorMargem,
            'frete' => $frete,
            'total' => $total,
        ];
    }
}
