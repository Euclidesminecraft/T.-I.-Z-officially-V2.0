import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';

dotenv.config();

console.log("🚀 Motor Zero-Erro v6 - Localizando Navegador...");

const PHONE_NUMBER = process.env.PHONE_NUMBER;

// Tenta encontrar o Chrome em qualquer lugar do sistema Railway
const chromePath = process.env.PUPPETEER_EXECUTABLE_PATH || "google-chrome-stable";

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        headless: 'new',
        executablePath: chromePath, // Agora vai usar o Chrome estável do Nix
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

client.on('qr', (qr) => {
    console.log('⚠️ QR CODE DISPONÍVEL:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ BOT CONECTADO COM SUCESSO!');
});

async function start() {
    try {
        console.log(`1. Tentando abrir o Chrome em: ${chromePath}`);
        await client.initialize();
        
        console.log("2. Navegador aberto! Aguardando 40s...");
        await new Promise(res => setTimeout(res, 40000));

        if (PHONE_NUMBER && !client.info) {
            console.log("3. Pedindo código para:", PHONE_NUMBER);
            const code = await client.requestPairingCode(PHONE_NUMBER);
            console.log('\n=========================================');
            console.log('👉 SEU CÓDIGO NO WHATSAPP:', code);
            console.log('=========================================\n');
        }
    } catch (err) {
        console.error("❌ ERRO NO ARRANQUE:", err.message);
        console.log("DICA: Se o erro for ENOENT, precisamos ajustar o caminho nas Variables do Railway.");
        setTimeout(start, 60000);
    }
}

start();
