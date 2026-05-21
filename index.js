import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';

dotenv.config();

console.log("🚀 Iniciando sistema ultra-resiliente...");

const PHONE_NUMBER = process.env.PHONE_NUMBER;
const chromePath = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium';

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        headless: 'new',
        executablePath: chromePath,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process',
            '--no-zygote'
        ]
    }
});

// Se o código de pareamento falhar, ele vai gerar um QR Code no terminal como Plano B
client.on('qr', (qr) => {
    console.log('⚠️ QR CODE DISPONÍVEL (Caso o código de 8 dígitos falhe):');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ CONECTADO! O bot já pode receber mensagens.');
});

// Função para pedir o código com repetição automática
async function requestPairingCodeWithRetry() {
    if (!PHONE_NUMBER) {
        console.log("❌ ERRO: PHONE_NUMBER não configurado nas variáveis.");
        return;
    }

    let codeSent = false;
    while (!codeSent) {
        try {
            console.log(`⏳ Tentando gerar código para: ${PHONE_NUMBER}...`);
            const code = await client.requestPairingCode(PHONE_NUMBER);
            console.log('\n=========================================');
            console.log('👉 SEU CÓDIGO NO WHATSAPP:', code);
            console.log('=========================================\n');
            codeSent = true;
        } catch (err) {
            console.log(`❌ Erro temporário: ${err.message}. Tentando novamente em 20s...`);
            await new Promise(res => setTimeout(res, 20000)); // Espera 20 segundos
        }
    }
}

client.initialize();

// Inicia a tentativa de pareamento
requestPairingCodeWithRetry();
