import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import puppeteer from 'puppeteer'; 
import dotenv from 'dotenv';

dotenv.config();

console.log("🚀 Motor Zero-Erro v16 - Localização Automática...");

const PHONE_NUMBER = process.env.PHONE_NUMBER;

async function start() {
    try {
        // O GPS: Ele descobre sozinho onde o Chrome foi instalado
        const autoPath = puppeteer.executablePath();
        console.log(`📂 Navegador localizado em: ${autoPath}`);

        const client = new Client({
            authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
            puppeteer: {
                headless: 'new',
                executablePath: autoPath,
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
            console.log('⚠️ QR CODE:');
            qrcode.generate(qr, { small: true });
        });

        client.on('ready', () => console.log('✅ BOT CONECTADO!'));

        console.log("1. Tentando abrir o navegador detectado...");
        await client.initialize();
        
        console.log("2. Aguardando 40s para o WhatsApp carregar...");
        await new Promise(res => setTimeout(res, 40000));

        if (PHONE_NUMBER && !client.info) {
            console.log("3. Pedindo código para:", PHONE_NUMBER);
            const code = await client.requestPairingCode(PHONE_NUMBER);
            console.log('\n👉 SEU CÓDIGO NO WHATSAPP:', code, '\n');
        }
    } catch (err) {
        console.error("❌ ERRO:", err.message);
        console.log("DICA: Se o erro for ENOENT, o download no postinstall falhou.");
        setTimeout(start, 60000);
    }
}

start();
