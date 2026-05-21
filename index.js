import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';

dotenv.config();

console.log("🚀 Iniciando Motor Zero-Erro...");

const PHONE_NUMBER = process.env.PHONE_NUMBER;
// No Railway, usamos o Chrome que o Nixpacks instala
const chromePath = "/usr/bin/google-chrome";

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        headless: 'new',
        executablePath: chromePath,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote',
            '--single-process'
        ]
    }
});

// Evento de QR Code (Plano B)
client.on('qr', (qr) => {
    console.log('⚠️ QR CODE DISPONÍVEL NO TERMINAL:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ SUCESSO! Bot conectado e ativo.');
});

// Essa função é a que vai resolver o erro de 'evaluate'
async function iniciarConexao() {
    try {
        console.log("1. Ligando o navegador Chrome...");
        await client.initialize();
        
        console.log("2. Navegador ok! Aguardando 40 segundos para o WhatsApp carregar...");
        // Damos 40 segundos para o servidor gratuito processar tudo
        await new Promise(resolve => setTimeout(resolve, 40000));

        if (PHONE_NUMBER && !client.info) {
            console.log(`3. Solicitando código para: ${PHONE_NUMBER}`);
            const code = await client.requestPairingCode(PHONE_NUMBER);
            console.log('\n=========================================');
            console.log('👉 SEU CÓDIGO NO WHATSAPP:', code);
            console.log('=========================================\n');
        }
    } catch (err) {
        console.error("❌ Erro durante o arranque:", err.message);
        console.log("Reiniciando em 1 minuto...");
        setTimeout(iniciarConexao, 60000);
    }
}

iniciarConexao();
