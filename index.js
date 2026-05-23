import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

console.log("🚀 Motor Zero-Erro v13 - Localizando Navegador...");

const PHONE_NUMBER = process.env.PHONE_NUMBER;

// Função para tentar achar o navegador no sistema
function findChrome() {
    try {
        const path = execSync('which chromium').toString().trim();
        console.log(`📂 Navegador encontrado pelo sistema em: ${path}`);
        return path;
    } catch (e) {
        console.log("⚠️ Comando 'which chromium' falhou, tentando caminho padrão...");
        return 'chromium'; // Tenta o comando direto
    }
}

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        headless: 'new',
        executablePath: findChrome(),
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
    console.log('⚠️ QR CODE GERADO:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => console.log('✅ BOT CONECTADO COM SUCESSO!'));

async function start() {
    try {
        console.log("1. Tentando abrir o navegador...");
        await client.initialize();
        
        console.log("2. Navegador aberto! Aguardando 40s...");
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
        console.log("DICA: Se o erro for ENOENT, o Railway não instalou o Chromium.");
        setTimeout(start, 60000);
    }
}

start();
