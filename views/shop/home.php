<div class="col-12 p-4">
    <h1 class="mb-4">Produtos para Cosplay</h1>
    <div class="row g-3">
        <?php foreach ($produtos as $produto): ?>
            <div class="col-md-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title"><?= htmlspecialchars($produto['nome']) ?></h5>
                        <p class="card-text small text-muted"><?= htmlspecialchars(mb_strimwidth($produto['descricao'], 0, 120, '...')) ?></p>
                        <p class="fw-bold">R$ <?= number_format($produto['preco_impressao'], 2, ',', '.') ?></p>
                        <a href="/produto?id=<?= (int) $produto['id'] ?>" class="btn btn-primary">Ver produto</a>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>
