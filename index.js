const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const { handleMessage } = require('./handler');
const { startReminderService } = require('./services/reminderService');
const fs = require('fs-extra'); // <-- Tambahkan baris ini
const path = require('path');   // <-- Tambahkan baris ini

// 🔄 DIPERBARUI: Membuat folder yang dibutuhkan secara otomatis saat start
console.log('Memastikan folder media dan export ada...');
fs.ensureDirSync(path.join(__dirname, 'media'));
fs.ensureDirSync(path.join(__dirname, 'export'));
console.log('✅ Folder siap.');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: ['Bot Tugas Kelas', 'Chrome', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log('Pindai QR Code ini:');
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(`Koneksi terputus: ${lastDisconnect.error}, menyambung kembali: ${shouldReconnect}`);
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('🤖 Bot berhasil terhubung!');
            startReminderService(sock);
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        handleMessage(sock, msg);
    });
}

startBot();