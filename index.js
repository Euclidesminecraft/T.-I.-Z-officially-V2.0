import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';

dotenv.config();

console.log("🚀 Motor Zero-Erro v12 - Iniciando...");

const PHONE_NUMBER = process.env.PHONE_NUMBER;
// No Railway com Chromium, o caminho é este:
const chromePath = "/usr/bin/chromium";

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

client.on('qr', (qr) => {
    console.log('⚠️ QR CODE NO TERMINAL:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => console.log('✅ BOT CONECTADO!'));

async function start() {
    try {
        console.log("1. Ligando o navegador...");
        await client.initialize();
        
        console.log("2. Aguardando 40s para estabilizar...");
        await new Promise(res => setTimeout(res, 40000));

        if (PHONE_NUMBER && !client.info) {
            console.log("3. Solicitando código para:", PHONE_NUMBER);
            const code = await client.requestPairingCode(PHONE_NUMBER);
            console.log('\n=========================================');
            console.log('👉 SEU CÓDIGO NO WHATSAPP:', code);
            console.log('=========================================\n');
        }
    } catch (err) {
        console.error("❌ ERRO:", err.message);
        setTimeout(start, 60000); // Tenta de novo em 1 minuto
    }
}

start();
