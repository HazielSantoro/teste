<?php

class OrderController extends Controller
{
    private Order $orders;

    public function __construct()
    {
        $this->orders = new Order();
    }

    public function create(): void
    {
        $userId = (int) ($_SESSION['user']['id'] ?? 0);
        $orderId = $this->orders->create([
            'user_id' => $userId,
            'produto_id' => (int) $_POST['produto_id'],
            'status' => 'recebido',
            'valor_total' => (float) $_POST['valor_total'],
            'prazo' => $_POST['prazo'] ?? '10 dias',
            'prioridade' => $_POST['prioridade'] ?? 'normal',
        ]);

        (new EmailService())->enviarEmail($_SESSION['user']['email'], 'Pedido criado', "Seu pedido #{$orderId} foi criado.");
        $this->redirect('/meus-pedidos');
    }

    public function myOrders(): void
    {
        $pedidos = $this->orders->byUser((int) $_SESSION['user']['id']);
        $this->view('orders/my_orders', ['pedidos' => $pedidos]);
    }

    public function updateStatus(): void
    {
        $id = (int) $_POST['pedido_id'];
        $status = $_POST['status'];
        $this->orders->updateStatus($id, $status);
        $this->redirect('/admin');
    }
}
