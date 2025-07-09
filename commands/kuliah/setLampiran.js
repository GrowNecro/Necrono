const { getContentType, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { getSortedTasks, loadTugas, saveTugas, MEDIA_DIR } = require('../../utils/taskUtils');
const { replyWithTyping } = require('../../utils/replyUtils');
const path = require('path');
const fs = require('fs-extra');
const mime = require('mime-types');

module.exports = {
    name: 'set lampiran',
    aliases: ['setlampiran', 'tambahlampiran'],
    description: 'Menambah lampiran ke item yang ada.',
    async execute(sock, msg, args) {
        const groupJid = msg.key.remoteJid;

        if (!msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
            return replyWithTyping(sock, msg, '❌ Perintah ini harus digunakan dengan membalas (reply) file.');
        }
        if (args.length !== 1 || isNaN(args[0])) {
            return replyWithTyping(sock, msg, "Format salah. Gunakan `set lampiran [nomor]`.");
        }
        
        const taskNumber = parseInt(args[0], 10);
        const tugasGrup = getSortedTasks(groupJid);
        if (taskNumber <= 0 || taskNumber > tugasGrup.length) {
            return replyWithTyping(sock, msg, `❌ Item dengan nomor ${taskNumber} tidak ditemukan.`);
        }
        
        const quotedMsg = msg.message.extendedTextMessage.contextInfo.quotedMessage;
        const quotedType = getContentType(quotedMsg);
        if (!['imageMessage', 'documentMessage', 'videoMessage'].includes(quotedType)) {
            return replyWithTyping(sock, msg, "❌ Gagal! Anda harus membalas pesan yang berisi file.");
        }
        
        try {
            const stream = await downloadContentFromMessage(quotedMsg[quotedType], quotedType.replace('Message', ''));
            let buffer = Buffer.from([]);
            for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }
            if (buffer.length === 0) throw new Error("Buffer kosong.");
            
            const groupMediaDir = path.join(MEDIA_DIR, groupJid);
            await fs.ensureDir(groupMediaDir);
            const originalFileName = quotedMsg[quotedType].fileName || 'file';
            const extension = path.extname(originalFileName) || `.${mime.extension(quotedMsg[quotedType].mimetype)}`;
            const fileName = `${Date.now()}${extension}`;
            const filePath = path.join(groupMediaDir, fileName);
            await fs.writeFile(filePath, buffer);
            
            const allTugas = loadTugas();
            const tugasToUpdate = tugasGrup[taskNumber - 1];
            const tugasIndex = allTugas[groupJid].findIndex(t => t.id === tugasToUpdate.id);
            if (tugasIndex !== -1) {
                if (!allTugas[groupJid][tugasIndex].lampiran) {
                    allTugas[groupJid][tugasIndex].lampiran = [];
                }
                allTugas[groupJid][tugasIndex].lampiran.push(fileName);
                saveTugas(allTugas);
                
                return replyWithTyping(sock, msg, `✅ Lampiran baru berhasil ditambahkan ke item *"${tugasToUpdate.judul}"*.`);
            }
        } catch (err) {
            console.error('Gagal mengunduh lampiran terpisah:', err);
            return replyWithTyping(sock, msg, '⚠️ Gagal memproses lampiran.');
        }
    }
};