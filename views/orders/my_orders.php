<div class="col-12 p-4">
    <h2>Meus pedidos</h2>
    <table class="table table-striped">
        <thead><tr><th>#</th><th>Produto</th><th>Status</th><th>Valor</th><th>Data</th></tr></thead>
        <tbody>
        <?php foreach ($pedidos as $pedido): ?>
            <tr>
                <td><?= (int) $pedido['id'] ?></td>
                <td><?= htmlspecialchars($pedido['produto']) ?></td>
                <td><span class="badge bg-info"><?= htmlspecialchars($pedido['status']) ?></span></td>
                <td>R$ <?= number_format($pedido['valor_total'], 2, ',', '.') ?></td>
                <td><?= htmlspecialchars($pedido['created_at']) ?></td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
</div>
