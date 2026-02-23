<?php require __DIR__ . '/../../includes/sidebar.php'; ?>
<div class="col-md-10 p-4">
    <h2>Dashboard</h2>
    <div class="row g-3 mb-3">
        <div class="col-md-3"><div class="card p-3"><small>Clientes</small><h4><?= (int) $totalClientes ?></h4></div></div>
        <div class="col-md-3"><div class="card p-3"><small>Pedidos</small><h4><?= (int) $totalPedidos ?></h4></div></div>
        <div class="col-md-3"><div class="card p-3"><small>Faturamento</small><h4>R$ <?= number_format($faturamentoMensal, 2, ',', '.') ?></h4></div></div>
        <div class="col-md-3"><div class="card p-3"><small>Lucro</small><h4>R$ <?= number_format($lucroMensal, 2, ',', '.') ?></h4></div></div>
    </div>

    <div class="card p-3 mb-3">
        <canvas id="ordersChart"></canvas>
    </div>

    <h4>Pedidos recentes</h4>
    <table class="table table-sm table-bordered bg-white">
        <thead><tr><th>#</th><th>Cliente</th><th>Produto</th><th>Status</th></tr></thead>
        <tbody>
        <?php foreach ($pedidos as $pedido): ?>
            <tr>
                <td><?= (int) $pedido['id'] ?></td>
                <td><?= htmlspecialchars($pedido['cliente']) ?></td>
                <td><?= htmlspecialchars($pedido['produto']) ?></td>
                <td><?= htmlspecialchars($pedido['status']) ?></td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
</div>
<script>
window.dashboardData = <?= json_encode($resumo, JSON_UNESCAPED_UNICODE) ?>;
</script>
