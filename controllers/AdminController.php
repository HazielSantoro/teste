<?php

class AdminController extends Controller
{
    public function dashboard(): void
    {
        $userModel = new User();
        $orderModel = new Order();
        $finance = new Finance();
        $resumo = $orderModel->resumoMensal();

        $this->view('admin/dashboard', [
            'totalClientes' => $userModel->totalClientes(),
            'totalPedidos' => $orderModel->totalPedidos(),
            'faturamentoMensal' => array_sum(array_map(static fn($r) => (float) $r['faturamento'], $resumo)),
            'lucroMensal' => $finance->lucroMensal(),
            'resumo' => $resumo,
            'pedidos' => $orderModel->all(),
        ]);
    }
}
