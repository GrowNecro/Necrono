const { getContentType, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { getSortedTasks, loadTugas, saveTugas, MEDIA_DIR } = require('../../utils/taskUtils');
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
            return sock.sendMessage(groupJid, { text: '❌ Perintah ini harus digunakan dengan membalas (reply) file.' }, { quoted: msg });
        }
        if (args.length !== 1 || isNaN(args[0])) {
            return sock.sendMessage(groupJid, { text: "Format salah. Gunakan `set lampiran [nomor]`." }, { quoted: msg });
        }
        
        const taskNumber = parseInt(args[0], 10);
        const tugasGrup = getSortedTasks(groupJid);
        if (taskNumber <= 0 || taskNumber > tugasGrup.length) {
            return sock.sendMessage(groupJid, { text: `❌ Item dengan nomor ${taskNumber} tidak ditemukan.` }, { quoted: msg });
        }
        
        const quotedMsg = msg.message.extendedTextMessage.contextInfo.quotedMessage;
        const quotedType = getContentType(quotedMsg);
        if (!['imageMessage', 'documentMessage', 'videoMessage'].includes(quotedType)) {
            return sock.sendMessage(groupJid, { text: "❌ Gagal! Anda harus membalas pesan yang berisi file." }, { quoted: msg });
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
                
                // 🔄 DIPERBARUI: Menggunakan tugasToUpdate.judul
                return sock.sendMessage(groupJid, { text: `✅ Lampiran baru berhasil ditambahkan ke item *"${tugasToUpdate.judul}"*.` }, { quoted: msg });
            }
        } catch (err) {
            console.error('Gagal mengunduh lampiran terpisah:', err);
            return sock.sendMessage(groupJid, { text: '⚠️ Gagal memproses lampiran.' }, { quoted: msg });
        }
    }
};