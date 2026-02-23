<?php

class ProductController extends Controller
{
    private Product $products;
    private FreteService $frete;

    public function __construct()
    {
        $this->products = new Product();
        $this->frete = new FreteService();
    }

    public function show(): void
    {
        $id = (int) ($_GET['id'] ?? 0);
        $produto = $this->products->find($id);
        if (!$produto) {
            http_response_code(404);
            $this->view('errors/404');
            return;
        }
        $this->view('shop/product', ['produto' => $produto]);
    }

    public function quote(): void
    {
        if (!Csrf::verify($_POST['_csrf'] ?? null)) {
            $this->json(['error' => 'CSRF inválido'], 422);
            return;
        }

        $config = new ConfigService();
        $frete = $this->frete->calcularPorFaixa($_POST['cep'] ?? '');
        $orcamento = OrcamentoService::calcularOrcamento(
            (float) $_POST['modelagem'],
            (float) $_POST['impressao'],
            (float) $_POST['pintura'],
            (float) $_POST['peso'],
            (float) $config->get('custo_por_grama', '0.30'),
            (float) $_POST['tempo_estimado'],
            (float) $config->get('custo_hora', '25'),
            (float) $config->get('margem_padrao', '30'),
            (float) $frete['valor']
        );

        $this->json(['orcamento' => $orcamento, 'prazo_frete' => $frete['prazo']]);
    }

    public function create(): void
    {
        $this->products->create([
            'nome' => $_POST['nome'] ?? '',
            'descricao' => $_POST['descricao'] ?? '',
            'categoria_id' => (int) ($_POST['categoria_id'] ?? 1),
            'preco_modelagem' => (float) ($_POST['preco_modelagem'] ?? 0),
            'preco_impressao' => (float) ($_POST['preco_impressao'] ?? 0),
            'taxa_pintura' => (float) ($_POST['taxa_pintura'] ?? 0),
            'peso_estimado' => (float) ($_POST['peso_estimado'] ?? 0),
            'tempo_estimado' => (float) ($_POST['tempo_estimado'] ?? 0),
            'ativo' => isset($_POST['ativo']) ? 1 : 0,
        ]);

        $this->redirect('/admin');
    }
}
