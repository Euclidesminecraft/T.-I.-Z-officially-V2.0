import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';

dotenv.config();

console.log("🚀 Iniciando Motor Zero-Erro v4...");

// Use exatamente estes nomes, sem barras invertidas
const PHONE_NUMBER = process.env.PHONE_NUMBER;
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
    console.log('⚠️ QR CODE GERADO NO TERMINAL:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ CONECTADO! O bot está funcionando.');
});

async function iniciarConexao() {
    try {
        console.log("1. Abrindo navegador Chromium...");
        await client.initialize();
        
        console.log("2. Aguardando 30 segundos...");
        await new Promise(resolve => setTimeout(resolve, 30000));

        if (PHONE_NUMBER && !client.info) {
            console.log("3. Pedindo código para:", PHONE_NUMBER);
            const code = await client.requestPairingCode(PHONE_NUMBER);
            console.log('\n=========================================');
            console.log('👉 SEU CÓDIGO:', code);
            console.log('=========================================\n');
        }
    } catch (err) {
        console.error("❌ Erro no arranque:", err.message);
        setTimeout(iniciarConexao, 60000);
    }
}

iniciarConexao();
