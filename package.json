import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

dotenv.config();

console.log("🚀 Motor Zero-Erro v14 - Usando Chrome Interno...");

const PHONE_NUMBER = process.env.PHONE_NUMBER;

async function start() {
    try {
        console.log("1. Localizando navegador baixado no cache...");
        
        // Esta linha pega o caminho do Chrome que foi baixado no 'postinstall'
        const chromePath = puppeteer.executablePath();
        console.log(`📂 Caminho detectado: ${chromePath}`);

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
                    '--single-process'
                ]
            }
        });

        client.on('qr', (qr) => {
            console.log('⚠️ QR CODE GERADO:');
            qrcode.generate(qr, { small: true });
        });

        client.on('ready', () => console.log('✅✅ BOT ONLINE! ✅✅'));

        console.log("2. Inicializando navegador...");
        await client.initialize();
        
        console.log("3. Aguardando 40s para estabilizar...");
        await new Promise(res => setTimeout(res, 40000));

        if (PHONE_NUMBER && !client.info) {
            console.log("4. Solicitando código para:", PHONE_NUMBER);
            const code = await client.requestPairingCode(PHONE_NUMBER);
            console.log('\n=========================================');
            console.log('👉 SEU CÓDIGO NO WHATSAPP:', code);
            console.log('=========================================\n');
        }

    } catch (err) {
        console.error("❌ ERRO FATAL:", err.message);
        console.log("Reiniciando em 1 minuto...");
        setTimeout(start, 60000);
    }
}

start();
