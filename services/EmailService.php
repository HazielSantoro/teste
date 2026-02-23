<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailService
{
    private ConfigService $config;

    public function __construct()
    {
        $this->config = new ConfigService();
    }

    public function enviarEmail(string $para, string $assunto, string $mensagem): bool
    {
        $mailer = new PHPMailer(true);

        try {
            $mailer->isSMTP();
            $mailer->Host = (string) $this->config->get('smtp_host', 'localhost');
            $mailer->SMTPAuth = true;
            $mailer->Username = (string) $this->config->get('smtp_user', '');
            $mailer->Password = (string) $this->config->get('smtp_pass', '');
            $mailer->Port = (int) $this->config->get('smtp_port', '587');
            $mailer->SMTPSecure = $this->config->get('smtp_secure', PHPMailer::ENCRYPTION_STARTTLS);

            $from = (string) $this->config->get('smtp_from', 'no-reply@atelie.com');
            $name = (string) $this->config->get('nome_atelie', 'Ateliê 3D');
            $mailer->setFrom($from, $name);
            $mailer->addAddress($para);
            $mailer->isHTML(true);
            $mailer->Subject = $assunto;
            $mailer->Body = $mensagem;
            $mailer->send();
            return true;
        } catch (Exception $e) {
            error_log('Erro ao enviar e-mail: ' . $e->getMessage());
            return false;
        }
    }
}
