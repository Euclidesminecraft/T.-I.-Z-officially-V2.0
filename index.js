import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';

dotenv.config();

console.log("🚀 Iniciando Motor Zero-Erro v3...");

const PHONE_NUMBER = process.env.PHONE_NUMBER;
// No Railway com Nixpacks, apenas o nome do comando funciona
const chromePath = "google-chrome";

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
    console.log('⚠️ QR CODE DISPONÍVEL (Caso o código falhe):');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ SUCESSO! Bot conectado e ativo.');
});

async function iniciarConexao() {
    try {
        console.log("1. Ligando o navegador...");
        await client.initialize();
        
        console.log("2. Aguardando 40s para estabilizar...");
        await new Promise(resolve => setTimeout(resolve, 40000));

        if (PHONE_NUMBER && !client.info) {
            console.log("3. Solicitando código para:", PHONE_NUMBER);
            const code = await client.requestPairingCode(PHONE_NUMBER);
            console.log('\n=========================================');
            console.log('👉 SEU CÓDIGO NO WHATSAPP:', code);
            console.log('=========================================\n');
        }
    } catch (err) {
        console.error("❌ Erro:", err.message);
        if (err.message.includes("ENOENT")) {
            console.log("DICA: O Railway ainda não instalou o Chrome. Verifique o arquivo nixpacks.toml");
        }
        setTimeout(iniciarConexao, 60000);
    }
}

iniciarConexao();
