import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';

dotenv.config();

console.log("🚀 Motor Ultra-Light v15 - Economizando RAM...");

const PHONE_NUMBER = process.env.PHONE_NUMBER;

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        headless: 'new',
        executablePath: '/usr/bin/chromium',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // Essencial para economizar RAM
            '--disable-gpu',
            '--disable-extensions'
        ]
    }
});

client.on('qr', (qr) => {
    console.log('⚠️ QR CODE:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => console.log('✅ CONECTADO!'));

async function start() {
    try {
        console.log("1. Iniciando navegador leve...");
        await client.initialize();
        
        await new Promise(res => setTimeout(res, 30000));

        if (PHONE_NUMBER && !client.info) {
            console.log("2. Pedindo código para:", PHONE_NUMBER);
            const code = await client.requestPairingCode(PHONE_NUMBER);
            console.log('\n👉 SEU CÓDIGO:', code, '\n');
        }
    } catch (err) {
        console.error("❌ Erro:", err.message);
        setTimeout(start, 60000);
    }
}

start();
