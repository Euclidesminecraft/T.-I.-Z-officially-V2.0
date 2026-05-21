import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';

dotenv.config();

console.log("🚀 Iniciando o sistema...");

// Tenta pegar o caminho do Chromium do sistema ou da variável
const chromePath = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium';
const PHONE_NUMBER = process.env.PHONE_NUMBER;

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        headless: 'new',
        executablePath: chromePath,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process',
            '--no-zygote'
        ]
    }
});

client.on('qr', (qr) => {
    console.log('⚠️ QR CODE GERADO (Escaneie se o código não funcionar):');
    qrcode.generate(qr, { small: true });
});

client.on('code', (code) => {
    console.log('\n✅ SEU CÓDIGO DE PAREAMENTO:', code, '\n');
});

client.on('ready', () => console.log('✅ BOT CONECTADO COM SUCESSO!'));

client.on('auth_failure', msg => console.error('❌ FALHA NA AUTENTICAÇÃO:', msg));

// Inicialização com tratamento de erro
client.initialize().catch(err => {
    console.error("❌ ERRO AO INICIALIZAR PUPPETEER:", err.message);
    console.log("DICA: Verifique se as Variables PHONE_NUMBER e DEEPSEEK_API_KEY estão preenchidas no Railway.");
});

// Pedido de código com atraso para o servidor respirar
setTimeout(async () => {
    if (PHONE_NUMBER && !client.info) {
        try {
            console.log("Pedindo código para o número:", PHONE_NUMBER);
            const pairingCode = await client.requestPairingCode(PHONE_NUMBER);
            console.log('👉 DIGITE ESTE CÓDIGO:', pairingCode);
        } catch (e) {
            console.log('Aguardando conexão via QR ou Código...');
        }
    } else if (!PHONE_NUMBER) {
        console.log("⚠️ AVISO: Variável PHONE_NUMBER não encontrada. Use QR Code ou configure as Variables.");
    }
}, 10000);
