# ERP Ateliê Impressão 3D Cosplay

Sistema web MVC para gestão de ateliê de impressão 3D (props, armas e acessórios para cosplay), com módulos de autenticação, loja, pedidos, produção, financeiro e dashboard.

## Requisitos
- PHP 8+
- MySQL 8+
- Composer
- Node.js 18+ (microserviço WhatsApp)
- XAMPP, Laragon ou servidor Linux (Nginx/Apache)

## Estrutura
- `config/` configurações de aplicação e banco
- `core/` kernel MVC (Router, Controller, Model, middlewares, CSRF)
- `controllers/`, `models/`, `views/` módulos de negócio
- `services/` orçamento, frete, e-mail, PDF, logs
- `public/` assets e uploads
- `whatsapp/` microserviço Node.js

## Instalação local
1. Clone o projeto e acesse a pasta.
2. Instale dependências PHP:
   ```bash
   composer install
   ```
3. Crie banco e tabelas:
   ```bash
   mysql -u root -p < database.sql
   ```
4. Configure variáveis de ambiente (Apache/Nginx ou shell):
   - `APP_NAME`, `APP_URL`, `APP_TIMEZONE`
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`
   - `SESSION_TIMEOUT`, `UPLOAD_LIMIT_MB`
5. Suba o app PHP:
   ```bash
   php -S localhost:8000
   ```
6. Acesse `http://localhost:8000`.

## Rodando microserviço WhatsApp
```bash
cd whatsapp
npm install
npm start
```
- Escaneie o QR code no terminal.
- Envio via endpoint: `POST http://localhost:3001/enviar`.

## Segurança implementada
- `password_hash` / `password_verify`
- Sessão com regeneração de ID no login
- CSRF token para formulários sensíveis
- PDO com prepared statements
- Middleware de autenticação e admin
- Estrutura para controle de permissões por role
- Log de atividades (`activity_logs`)

## Funcionalidades principais
- Cadastro, login, logout e recuperação de senha
- Loja com cards Bootstrap e detalhe do produto
- Simulador de frete e orçamento automático
- Pedidos com status completos de produção
- Dashboard admin com gráficos (Chart.js)
- Integração SMTP via PHPMailer dinâmica por banco
- Geração de PDF com dompdf (serviço pronto)
- Estrutura para API dos Correios e WhatsApp

## Observações
- O endpoint Correios está em modo *stub* para integração oficial posterior.
- Upload STL deve ser implementado com validação MIME, extensão e tamanho usando configuração dinâmica.
