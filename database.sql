CREATE DATABASE IF NOT EXISTS erp_atelie CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE erp_atelie;

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (nome) VALUES ('admin'), ('cliente'), ('tecnico');

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    usuario VARCHAR(80) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(30) DEFAULT NULL,
    instagram VARCHAR(120) DEFAULT NULL,
    cidade VARCHAR(100) DEFAULT NULL,
    estado VARCHAR(2) DEFAULT NULL,
    role_id INT NOT NULL,
    reset_token VARCHAR(80) DEFAULT NULL,
    reset_expira DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

INSERT INTO users (nome, email, usuario, senha, telefone, instagram, cidade, estado, role_id) VALUES
('Administrador', 'admin@atelie.local', 'admin', '$2y$12$fgfyWYFVg/4o.1YM36h2fuC6/4Vpi6Oe37tm06ICcxdZEqcu28UVS', '', '', 'N/A', 'SP', 1);

CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT NOT NULL,
    categoria_id INT NOT NULL,
    preco_modelagem DECIMAL(10,2) NOT NULL DEFAULT 0,
    preco_impressao DECIMAL(10,2) NOT NULL DEFAULT 0,
    taxa_pintura DECIMAL(10,2) NOT NULL DEFAULT 0,
    peso_estimado DECIMAL(10,2) NOT NULL DEFAULT 0,
    tempo_estimado DECIMAL(10,2) NOT NULL DEFAULT 0,
    ativo TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_produtos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE imagens_produto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produto_id INT NOT NULL,
    caminho_imagem VARCHAR(255) NOT NULL,
    CONSTRAINT fk_imagens_produto FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

CREATE TABLE frete_faixas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cep_inicio VARCHAR(8) NOT NULL,
    cep_fim VARCHAR(8) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    prazo VARCHAR(60) NOT NULL
);

CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    produto_id INT NOT NULL,
    status ENUM('recebido','em_analise','orcamento_enviado','aguardando_aprovacao','em_impressao','pos_processamento','pintura','finalizado','enviado','concluido') NOT NULL DEFAULT 'recebido',
    valor_total DECIMAL(10,2) NOT NULL,
    prazo VARCHAR(80) DEFAULT NULL,
    prioridade VARCHAR(30) DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pedidos_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_pedidos_produto FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

CREATE TABLE producao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    impressora_id INT DEFAULT NULL,
    tempo_estimado DECIMAL(10,2) DEFAULT 0,
    tempo_real DECIMAL(10,2) DEFAULT 0,
    filamento_usado DECIMAL(10,2) DEFAULT 0,
    custo_material DECIMAL(10,2) DEFAULT 0,
    custo_energia DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'planejado',
    CONSTRAINT fk_producao_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
);

CREATE TABLE checklist_producao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    modelagem TINYINT(1) DEFAULT 0,
    fatiamento TINYINT(1) DEFAULT 0,
    impressao TINYINT(1) DEFAULT 0,
    lixamento TINYINT(1) DEFAULT 0,
    pintura TINYINT(1) DEFAULT 0,
    montagem TINYINT(1) DEFAULT 0,
    teste_final TINYINT(1) DEFAULT 0,
    CONSTRAINT fk_checklist_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
);

CREATE TABLE financeiro (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    sinal DECIMAL(10,2) DEFAULT 0,
    restante DECIMAL(10,2) DEFAULT 0,
    status_pagamento VARCHAR(50) NOT NULL,
    metodo_pagamento VARCHAR(50) DEFAULT NULL,
    CONSTRAINT fk_financeiro_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
);

CREATE TABLE configuracoes (
    chave VARCHAR(120) PRIMARY KEY,
    valor TEXT
);

CREATE TABLE avaliacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produto_id INT NOT NULL,
    user_id INT NOT NULL,
    nota INT NOT NULL,
    comentario TEXT,
    imagem VARCHAR(255) DEFAULT NULL,
    aprovado TINYINT(1) DEFAULT 0,
    CONSTRAINT fk_avaliacao_produto FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    CONSTRAINT fk_avaliacao_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    acao VARCHAR(100) NOT NULL,
    detalhes TEXT,
    ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE whatsapp_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(20) NOT NULL,
    mensagem TEXT NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categorias (nome) VALUES ('Armas'), ('Props'), ('Acessórios');

INSERT INTO configuracoes (chave, valor) VALUES
('nome_atelie', 'Ateliê Cosplay 3D'),
('margem_padrao', '30'),
('custo_hora', '25'),
('custo_por_grama', '0.30'),
('custo_energia', '0.80'),
('smtp_host', 'smtp.seuprovedor.com'),
('smtp_port', '587'),
('smtp_user', 'usuario'),
('smtp_pass', 'senha'),
('smtp_secure', 'tls'),
('smtp_from', 'no-reply@atelie.com'),
('tempo_sessao', '120'),
('limite_upload_stl', '20MB');
