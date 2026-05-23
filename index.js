import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';

dotenv.config();

console.log("🚀 Motor Zero-Erro v9 - A caçada ao Chrome!");

const PHONE_NUMBER = process.env.PHONE_NUMBER;

// Lista de caminhos possíveis no Railway
const paths = [
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "google-chrome-stable",
    "google-chrome",
    "chromium"
];

async function start() {
    let client;
    let connected = false;

    for (const path of paths) {
        if (connected) break;
        
        try {
            console.log(`🔍 Tentando abrir navegador em: ${path}`);
            client = new Client({
                authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
                puppeteer: {
                    headless: 'new',
                    executablePath: path,
                    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
                }
            });

            client.on('qr', (qr) => {
                console.log('⚠️ QR CODE GERADO:');
                qrcode.generate(qr, { small: true });
            });

            client.on('ready', () => console.log('✅ BOT CONECTADO!'));

            await client.initialize();
            connected = true;
            console.log(`✨ Sucesso com o caminho: ${path}`);
            
            // Espera o sistema estabilizar e pede o código
            setTimeout(async () => {
                if (PHONE_NUMBER && !client.info) {
                    try {
                        const code = await client.requestPairingCode(PHONE_NUMBER);
                        console.log('\n=========================================');
                        console.log('👉 SEU CÓDIGO:', code);
                        console.log('=========================================\n');
                    } catch (e) { console.log("Erro ao gerar código, tente o QR Code acima."); }
                }
            }, 30000);

        } catch (err) {
            console.log(`❌ Falha no caminho ${path}: ${err.message}`);
        }
    }

    if (!connected) {
        console.log("💀 Nenhum navegador encontrado. Reiniciando em 1 min...");
        setTimeout(start, 60000);
    }
}

start();
