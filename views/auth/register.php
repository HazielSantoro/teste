<div class="col-md-6 mx-auto p-4">
    <h2>Cadastro</h2>
    <?php if (!empty($erro)): ?><div class="alert alert-danger"><?= htmlspecialchars($erro) ?></div><?php endif; ?>
    <form method="post" action="/cadastro" class="row g-2">
        <input type="hidden" name="_csrf" value="<?= Csrf::token() ?>">
        <div class="col-md-6"><input class="form-control" name="nome" placeholder="Nome" required></div>
        <div class="col-md-6"><input class="form-control" name="usuario" placeholder="Usuário" required></div>
        <div class="col-md-6"><input class="form-control" name="email" type="email" placeholder="E-mail" required></div>
        <div class="col-md-6"><input class="form-control" name="senha" type="password" placeholder="Senha" required></div>
        <div class="col-md-6"><input class="form-control" name="telefone" placeholder="Telefone"></div>
        <div class="col-md-6"><input class="form-control" name="instagram" placeholder="Instagram"></div>
        <div class="col-md-6"><input class="form-control" name="cidade" placeholder="Cidade"></div>
        <div class="col-md-6"><input class="form-control" name="estado" placeholder="Estado"></div>
        <div class="col-12"><button class="btn btn-success w-100">Cadastrar</button></div>
    </form>
</div>
