const express = require('express');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const app = express();
app.use(express.json());

const client = new Client({ authStrategy: new LocalAuth() });

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  console.log('Escaneie o QR Code para autenticar o WhatsApp.');
});

client.on('ready', () => {
  console.log('WhatsApp conectado.');
});

app.post('/enviar', async (req, res) => {
  const { numero, mensagem } = req.body;

  if (!numero || !mensagem) {
    return res.status(400).json({ error: 'numero e mensagem são obrigatórios' });
  }

  try {
    const chatId = `${numero}@c.us`;
    await client.sendMessage(chatId, mensagem);
    console.log(`Mensagem enviada para ${numero}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Falha no envio:', error.message);
    res.status(500).json({ error: 'Falha ao enviar mensagem' });
  }
});

client.initialize();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Microserviço WhatsApp rodando em http://localhost:${PORT}`);
});
