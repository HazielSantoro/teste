<div class="col-md-4 mx-auto p-4">
    <h2>Recuperação de senha</h2>
    <?php if (!empty($sucesso)): ?><div class="alert alert-success"><?= htmlspecialchars($sucesso) ?></div><?php endif; ?>
    <form method="post" action="/forgot-password">
        <input type="hidden" name="_csrf" value="<?= Csrf::token() ?>">
        <input class="form-control mb-2" name="email" type="email" placeholder="Seu e-mail" required>
        <button class="btn btn-primary w-100">Enviar link</button>
    </form>
</div>
