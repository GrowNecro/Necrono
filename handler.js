const { getContentType } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { loadTugas, saveTugas, parseIndonesianDate } = require('./utils/taskUtils'); // Hanya perlu taskUtils
const { format } = require('date-fns');

const commands = new Map();

function loadCommands(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            loadCommands(fullPath);
        } else if (file.name.endsWith('.js')) {
            try {
                const command = require(fullPath);
                if (command.name) {
                    commands.set(command.name.toLowerCase(), command);
                    if (command.aliases && Array.isArray(command.aliases)) {
                        command.aliases.forEach(alias => commands.set(alias.toLowerCase(), command));
                    }
                }
            } catch (error) {
                console.error(`Gagal memuat perintah dari file ${file.name}:`, error);
            }
        }
    }
}
loadCommands(path.join(__dirname, 'commands'));
console.log('✅ Perintah berhasil dimuat:', Array.from(commands.keys()));

const EDIT_SESSIONS = {};

const handleMessage = async (sock, msg) => {
    if (!msg.message || msg.key.fromMe) return;

    const groupJid = msg.key.remoteJid;
    if (!groupJid.endsWith('@g.us')) return;
    
    const sender = msg.key.participant || msg.key.remoteJid;
    const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim();
    const textLower = text.toLowerCase();
    
    // 🔄 Logika Sesi Edit Disederhanakan
    if (EDIT_SESSIONS[sender]) {
        const session = EDIT_SESSIONS[sender];
        const allTugas = loadTugas();
        if (!allTugas[groupJid]) allTugas[groupJid] = [];
        const tugasIndex = allTugas[groupJid].findIndex(t => t.id === session.taskId);

        if (tugasIndex === -1) {
            delete EDIT_SESSIONS[sender];
            return sock.sendMessage(groupJid, { text: "❌ Gagal, item tidak lagi ditemukan." }, { quoted: msg });
        }
        if (textLower === 'batal') {
            delete EDIT_SESSIONS[sender];
            return sock.sendMessage(groupJid, { text: "📝 Edit dibatalkan." }, { quoted: msg });
        }

        switch (session.stage) {
            case 'pilih_bagian':
                const pilihan = parseInt(text, 10);
                if (pilihan === 1) { session.stage = 'edit_judul'; return sock.sendMessage(groupJid, { text: "Silakan kirim judul yang baru." }, { quoted: msg }); }
                if (pilihan === 2) { session.stage = 'edit_deskripsi'; return sock.sendMessage(groupJid, { text: "Silakan kirim deskripsi yang baru." }, { quoted: msg }); }
                if (pilihan === 3) { session.stage = 'edit_tenggat'; return sock.sendMessage(groupJid, { text: "Silakan kirim tanggal yang baru." }, { quoted: msg }); }
                return sock.sendMessage(groupJid, { text: "Pilihan tidak valid." }, { quoted: msg });
            
            case 'edit_judul':
                allTugas[groupJid][tugasIndex].judul = text;
                break;
            case 'edit_deskripsi':
                allTugas[groupJid][tugasIndex].deskripsi = text;
                break;
            case 'edit_tenggat':
                const newDeadline = parseIndonesianDate(text);
                if (!newDeadline) return sock.sendMessage(groupJid, { text: "❌ Format tanggal salah." }, { quoted: msg });
                allTugas[groupJid][tugasIndex].deadline = newDeadline.toISOString();
                break;
        }
        
        saveTugas(allTugas);
        delete EDIT_SESSIONS[sender];
        await sock.sendMessage(groupJid, { text: "✅ Jadwal berhasil diperbarui!" }, { quoted: msg });
        return;
    }

    const allArgs = text.split(' ');
    let commandName, commandArgs;
    
    // Logika untuk mendeteksi perintah 1 atau 2 kata
    const twoWordCommand = `${allArgs[0]} ${allArgs[1]}`.toLowerCase();
    if (commands.has(twoWordCommand)) {
        commandName = twoWordCommand;
        commandArgs = allArgs.slice(2);
    } else if (commands.has(allArgs[0].toLowerCase())) {
        commandName = allArgs[0].toLowerCase();
        commandArgs = allArgs.slice(1);
    }

    const command = commands.get(commandName);

    if (command) {
        try {
            await command.execute(sock, msg, commandArgs, EDIT_SESSIONS); 
        } catch (error) {
            console.error(`Error saat menjalankan perintah ${commandName}:`, error);
            await sock.sendMessage(groupJid, { text: 'Terjadi error saat menjalankan perintah.' }, { quoted: msg });
        }
    }
};

module.exports = { handleMessage, EDIT_SESSIONS };