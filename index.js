import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';

dotenv.config();

console.log("🚀 Motor Zero-Erro v5 - Iniciando...");

// ATENÇÃO: Verifique se não há barras invertidas abaixo
const PHONE_NUMBER = process.env.PHONE_NUMBER;
const chromePath = "chromium"; // O Railway vai instalar este

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
            '--no-first-run',
            '--no-zygote',
            '--single-process'
        ]
    }
});

client.on('qr', (qr) => {
    console.log('⚠️ QR CODE GERADO:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ BOT CONECTADO COM SUCESSO!');
});

async function start() {
    try {
        console.log("1. Tentando abrir o Chromium...");
        await client.initialize();
        
        console.log("2. Navegador aberto! Aguardando 40s...");
        await new Promise(res => setTimeout(res, 40000));

        if (PHONE_NUMBER && !client.info) {
            console.log("3. Pedindo código para:", PHONE_NUMBER);
            const code = await client.requestPairingCode(PHONE_NUMBER);
            console.log('\n=========================================');
            console.log('👉 DIGITE NO WHATSAPP:', code);
            console.log('=========================================\n');
        }
    } catch (err) {
        console.error("❌ ERRO NO ARRANQUE:", err.message);
        console.log("DICA: Se o erro for ENOENT, o Railway falhou no download do Chromium.");
        // Tenta de novo em 1 minuto
        setTimeout(start, 60000);
    }
}

start();
