import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import puppeteer from 'puppeteer'; // Versão moderna
import dotenv from 'dotenv';

dotenv.config();

console.log("🚀 Motor Zero-Erro v11 - Moçambique no Comando!");

const PHONE_NUMBER = process.env.PHONE_NUMBER;

async function start() {
    try {
        console.log("1. Localizando navegador...");
        
        // A forma moderna de pegar o caminho do navegador no Puppeteer v22+
        const chromePath = puppeteer.executablePath();
        console.log(`📂 Chrome encontrado em: ${chromePath}`);

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
            console.log('⚠️ QR CODE DISPONÍVEL NO TERMINAL:');
            qrcode.generate(qr, { small: true });
        });

        client.on('ready', () => {
            console.log('✅✅ BOT CONECTADO E PRONTO! ✅✅');
        });

        await client.initialize();
        
        // Aguarda 40 segundos para o servidor estabilizar
        await new Promise(res => setTimeout(res, 40000));

        if (PHONE_NUMBER && !client.info) {
            console.log("3. Solicitando código para:", PHONE_NUMBER);
            const code = await client.requestPairingCode(PHONE_NUMBER);
            console.log('\n=========================================');
            console.log('👉 SEU CÓDIGO NO WHATSAPP:', code);
            console.log('=========================================\n');
        }

    } catch (err) {
        console.error("❌ ERRO NO ARRANQUE:", err.message);
        console.log("DICA: Verifique se o Puppeteer baixou o Chrome no log de 'Build'.");
        setTimeout(start, 60000);
    }
}

start();
