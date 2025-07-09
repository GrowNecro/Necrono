const { getContentType } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { loadTugas, saveTugas, parseIndonesianDate } = require('./utils/taskUtils');
const { format } = require('date-fns');
const { replyWithTyping } = require('./utils/replyUtils');

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

    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const originalText = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim();

    // 🔄 Logika Sesi Edit sekarang menggunakan replyWithTyping
    if (EDIT_SESSIONS[sender]) {
        const session = EDIT_SESSIONS[sender];
        const allTugas = loadTugas();
        if (!allTugas[chatId]) allTugas[chatId] = [];
        const tugasIndex = allTugas[chatId].findIndex(t => t.id === session.taskId);

        if (tugasIndex === -1) {
            delete EDIT_SESSIONS[sender];
            return replyWithTyping(sock, msg, "❌ Gagal, item tidak lagi ditemukan.");
        }
        if (originalText.toLowerCase() === 'batal') {
            delete EDIT_SESSIONS[sender];
            return replyWithTyping(sock, msg, "📝 Edit dibatalkan.");
        }

        switch (session.stage) {
            case 'pilih_bagian':
                const pilihan = parseInt(originalText, 10);
                if (pilihan === 1) { session.stage = 'edit_judul'; return replyWithTyping(sock, msg, "Silakan kirim judul yang baru."); }
                if (pilihan === 2) { session.stage = 'edit_deskripsi'; return replyWithTyping(sock, msg, "Silakan kirim deskripsi yang baru."); }
                if (pilihan === 3) { session.stage = 'edit_tenggat'; return replyWithTyping(sock, msg, "Silakan kirim tanggal yang baru."); }
                return replyWithTyping(sock, msg, "Pilihan tidak valid.");
            
            case 'edit_judul':
                allTugas[chatId][tugasIndex].judul = originalText;
                break;
            case 'edit_deskripsi':
                allTugas[chatId][tugasIndex].deskripsi = originalText;
                break;
            case 'edit_tenggat':
                const newDeadline = parseIndonesianDate(originalText);
                if (!newDeadline) return replyWithTyping(sock, msg, "❌ Format tanggal salah.");
                allTugas[chatId][tugasIndex].deadline = newDeadline.toISOString();
                break;
        }
        
        saveTugas(allTugas);
        delete EDIT_SESSIONS[sender];
        await replyWithTyping(sock, msg, "✅ Jadwal berhasil diperbarui!");
        return;
    }

    let textToProcess = originalText;
    const botCallNames = ['necrono', 'necro', 'nec', 'crono'];

    for (const callName of botCallNames) {
        if (textToProcess.toLowerCase().startsWith(callName + ' ')) {
            textToProcess = textToProcess.substring(callName.length).trim();
            break;
        }
    }

    if (!textToProcess) return;

    const allArgs = textToProcess.split(' ');
    let commandName, commandArgs;
    
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
            await replyWithTyping(sock, msg, 'Terjadi error saat menjalankan perintah.');
        }
    }
};

module.exports = { handleMessage, EDIT_SESSIONS };