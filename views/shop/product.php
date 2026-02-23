<div class="col-12 p-4">
    <h2><?= htmlspecialchars($produto['nome']) ?></h2>
    <p><?= htmlspecialchars($produto['descricao']) ?></p>
    <p>Média: <?= number_format($produto['media_avaliacao'], 1) ?> ⭐</p>

    <form id="quoteForm" class="row g-3">
        <input type="hidden" name="_csrf" value="<?= Csrf::token() ?>">
        <input type="hidden" name="modelagem" value="<?= (float) $produto['preco_modelagem'] ?>">
        <input type="hidden" name="impressao" value="<?= (float) $produto['preco_impressao'] ?>">
        <input type="hidden" name="pintura" value="<?= (float) $produto['taxa_pintura'] ?>">
        <input type="hidden" name="peso" value="<?= (float) $produto['peso_estimado'] ?>">
        <input type="hidden" name="tempo_estimado" value="<?= (float) $produto['tempo_estimado'] ?>">
        <div class="col-md-4">
            <label class="form-label">Material</label>
            <select class="form-select" name="material"><option>PLA</option><option>PETG</option></select>
        </div>
        <div class="col-md-4">
            <label class="form-label">Acabamento</label>
            <select class="form-select" name="acabamento"><option>Básico</option><option>Premium</option></select>
        </div>
        <div class="col-md-4">
            <label class="form-label">Escala (%)</label>
            <input class="form-control" type="number" name="escala" value="100" min="50" max="200">
        </div>
        <div class="col-md-4">
            <label class="form-label">CEP</label>
            <input class="form-control" type="text" name="cep" required>
        </div>
        <div class="col-12"><button class="btn btn-success">Simular orçamento</button></div>
    </form>

    <pre id="quoteResult" class="bg-light p-3 mt-3 border rounded small"></pre>
</div>
