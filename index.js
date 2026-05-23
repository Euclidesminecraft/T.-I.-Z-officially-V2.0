import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';

dotenv.config();

console.log("🚀 Motor Zero-Erro v8 - Moçambique no topo!");

const PHONE_NUMBER = process.env.PHONE_NUMBER;
// NO RAILWAY COM NIXPACKS, O NOME É ESTE:
const chromePath = "chromium"; 

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
    console.log('⚠️ QR CODE DISPONÍVEL (Caso o código de 8 dígitos falhe):');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅✅ CONECTADO COM SUCESSO! O BOT ESTÁ VIVO! ✅✅');
});

async function start() {
    try {
        console.log(`1. Abrindo navegador: ${chromePath}`);
        await client.initialize();
        
        console.log("2. Navegador OK! Aguardando 40 segundos para o WhatsApp carregar...");
        await new Promise(res => setTimeout(res, 40000));

        if (PHONE_NUMBER && !client.info) {
            console.log(`3. Solicitando código para: ${PHONE_NUMBER}`);
            const code = await client.requestPairingCode(PHONE_NUMBER);
            console.log('\n=========================================');
            console.log('👉 DIGITE ESTE CÓDIGO NO WHATSAPP:', code);
            console.log('=========================================\n');
        }
    } catch (err) {
        console.error("❌ ERRO NO ARRANQUE:", err.message);
        console.log("DICA: Reiniciando em 1 minuto...");
        setTimeout(start, 60000);
    }
}

start();
