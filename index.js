import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import puppeteer from 'puppeteer'; // Importamos o puppeteer puro para achar o path
import dotenv from 'dotenv';

dotenv.config();

console.log("🚀 Motor Zero-Erro v10 - Baixando e Iniciando...");

const PHONE_NUMBER = process.env.PHONE_NUMBER;

async function start() {
    try {
        console.log("1. Localizando navegador baixado...");
        
        // Esta linha encontra o Chrome que o 'postinstall' baixou
        const browserFetcher = puppeteer.createBrowserFetcher();
        const executablePath = puppeteer.executablePath();

        console.log(`📂 Chrome encontrado em: ${executablePath}`);

        const client = new Client({
            authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
            puppeteer: {
                headless: 'new',
                executablePath: executablePath,
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
            console.log('⚠️ QR CODE NO TERMINAL:');
            qrcode.generate(qr, { small: true });
        });

        client.on('ready', () => console.log('✅ BOT CONECTADO COM SUCESSO!'));

        await client.initialize();
        
        // Espera 40s para o WhatsApp carregar no servidor
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
        console.log("Tentando reiniciar em 1 minuto...");
        setTimeout(start, 60000);
    }
}

start();
