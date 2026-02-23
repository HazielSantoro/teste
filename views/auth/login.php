<div class="col-md-4 mx-auto p-4">
    <h2>Login</h2>
    <?php if (!empty($erro)): ?><div class="alert alert-danger"><?= htmlspecialchars($erro) ?></div><?php endif; ?>
    <form method="post" action="/login">
        <input type="hidden" name="_csrf" value="<?= Csrf::token() ?>">
        <input class="form-control mb-2" name="login" placeholder="E-mail ou usuário" required>
        <input class="form-control mb-2" type="password" name="senha" placeholder="Senha" required>
        <button class="btn btn-primary w-100">Entrar</button>
    </form>
    <a href="/cadastro">Criar conta</a> · <a href="/forgot-password">Esqueci a senha</a>
</div>
