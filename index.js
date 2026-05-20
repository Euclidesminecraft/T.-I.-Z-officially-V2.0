import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Configurações de Ambiente
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || '';
const PHONE_NUMBER = process.env.PHONE_NUMBER; 

if (!PHONE_NUMBER) {
    console.error("❌ ERRO: Você esqueceu de colocar o PHONE_NUMBER nas variáveis de ambiente!");
    process.exit(1);
}

const lastUsed = new Map();

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        headless: 'new',
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

// Exibe QR Code se o código falhar
client.on('qr', (qr) => {
    console.log('--- OU ESCANEIE O QR CODE ---');
    qrcode.generate(qr, { small: true });
});

// Exibe o código de 8 dígitos para pareamento
client.on('code', (code) => {
    console.log('\n=========================================');
    console.log('CÓDIGO DE CONEXÃO NO WHATSAPP:');
    console.log(`👉 ${code} 👈`);
    console.log('=========================================\n');
});

client.on('ready', () => console.log('✅ Bot Online e Conectado!'));

client.on('message', async (msg) => {
    try {
        if (msg.fromMe || msg.isStatus) return;

        const chat = await msg.getChat();
        const body = msg.body.toLowerCase();

        // Lógica de Grupos: Só responde se marcar o bot ou usar comando
        if (chat.isGroup) {
            const isMentioned = msg.mentionedIds.includes(client.info.wid._serialized);
            if (!isMentioned && !body.startsWith('!bot')) return;
        }

        // Anti-Spam: 1 msg a cada 3 segundos
        const now = Date.now();
        if (lastUsed.has(msg.from) && (now - lastUsed.get(msg.from) < 3000)) return;
        lastUsed.set(msg.from, now);

        if (DEEPSEEK_KEY) {
            msg.react('⏳');
            const res = await axios.post('https://api.deepseek.com/v1/chat/completions', {
                model: "deepseek-chat",
                messages: [{ role: "user", content: msg.body }],
                max_tokens: 400
            }, {
                headers: { 'Authorization': `Bearer ${DEEPSEEK_KEY}` },
                timeout: 25000
            });

            await msg.reply(res.data.choices[0].message.content);
        }
    } catch (err) {
        console.log('⚠️ Erro ao responder:', err.message);
    }
});

// Inicialização com pedido de código
client.initialize().then(() => {
    setTimeout(async () => {
        if (!client.info) {
            try {
                const pairingCode = await client.requestPairingCode(PHONE_NUMBER);
                console.log('CÓDIGO SOLICITADO:', pairingCode);
            } catch (e) {
                console.log('Aguardando conexão...');
            }
        }
    }, 5000);
});
