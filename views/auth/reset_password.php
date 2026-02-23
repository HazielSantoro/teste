<div class="col-md-4 mx-auto p-4">
    <h2>Redefinir senha</h2>
    <?php if (!empty($erro)): ?><div class="alert alert-danger"><?= htmlspecialchars($erro) ?></div><?php endif; ?>
    <form method="post" action="/reset-password">
        <input type="hidden" name="_csrf" value="<?= Csrf::token() ?>">
        <input type="hidden" name="token" value="<?= htmlspecialchars($token ?? '') ?>">
        <input class="form-control mb-2" name="senha" type="password" placeholder="Nova senha" required>
        <button class="btn btn-success w-100">Atualizar</button>
    </form>
</div>
