const { getContentType, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { loadTugas, saveTugas, parseIndonesianDate, getSortedTasks, MEDIA_DIR } = require('../../utils/taskUtils');
const { replyWithTyping } = require('../../utils/replyUtils');
const { format } = require('date-fns');
const { id } = require('date-fns/locale');
const path = require('path');
const fs = require('fs-extra');
const mime = require('mime-types');

module.exports = {
    name: 'set tugas',
    aliases: ['settugas', 'set'],
    description: 'Menyimpan jadwal atau tugas baru.',
    async execute(sock, msg, args) {
        const groupJid = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        if (!msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
            return replyWithTyping(sock, msg, '❌ Perintah ini harus digunakan dengan membalas (reply) pesan.');
        }

        const quotedMsg = msg.message.extendedTextMessage.contextInfo.quotedMessage;
        const quotedText = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || quotedMsg.imageMessage?.caption || quotedMsg.videoMessage?.caption || quotedMsg.documentMessage?.caption || '';

        if (!quotedText) {
            return replyWithTyping(sock, msg, '❌ Gagal! Pesan yang Anda balas tidak memiliki teks/caption.');
        }

        const lines = quotedText.split('\n');
        const judul = lines[0].trim();
        const deskripsi = lines.slice(1).join('\n').trim();
        const deadlineDate = parseIndonesianDate(quotedText);

        if (!judul || !deskripsi || !deadlineDate) {
            return replyWithTyping(sock, msg, '❌ Gagal! Format tidak sesuai. Pastikan ada Judul, Deskripsi, dan Tenggat.');
        }
        
        const deadline = deadlineDate.toISOString();
        const allTugas = loadTugas();
        if (!allTugas[groupJid]) allTugas[groupJid] = [];
        
        const newTugas = {
            id: Date.now(),
            judul: judul,
            deskripsi,
            deadline,
            lampiran: [],
            pengingat: { '30d': false, '15d': false, '10d': false, '3d': false, '1d': false, '3h': false },
            ditambahkanOleh: sender
        };

        const quotedType = getContentType(quotedMsg);
        if (['imageMessage', 'documentMessage', 'videoMessage'].includes(quotedType)) {
            try {
                const stream = await downloadContentFromMessage(quotedMsg[quotedType], quotedType.replace('Message', ''));
                let buffer = Buffer.from([]);
                for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }
                if (buffer.length > 0) {
                    const groupMediaDir = path.join(MEDIA_DIR, groupJid);
                    await fs.ensureDir(groupMediaDir);
                    const originalFileName = quotedMsg[quotedType].fileName || 'file';
                    const extension = path.extname(originalFileName) || `.${mime.extension(quotedMsg[quotedType].mimetype)}`;
                    const fileName = `${Date.now()}${extension}`;
                    const filePath = path.join(groupMediaDir, fileName);
                    await fs.writeFile(filePath, buffer);
                    newTugas.lampiran.push(fileName);
                }
            } catch (err) { console.error('Gagal mengunduh lampiran otomatis:', err); }
        }

        allTugas[groupJid].push(newTugas);
        saveTugas(allTugas);
        
        let replyText = `✅ *Jadwal berhasil disimpan!*\n\n` +
                        `📘 *Judul:* ${newTugas.judul}\n` +
                        `📝 *Deskripsi:* ${newTugas.deskripsi}\n` +
                        `📅 *Tenggat:* ${format(deadlineDate, 'd MMMM yyyy, HH:mm', { locale: id })}\n` +
                        `📎 *Lampiran:* ${newTugas.lampiran.length > 0 ? newTugas.lampiran[0] : 'Tidak ada'}`;
        
        const tugasGrup = getSortedTasks(groupJid);
        const taskNumber = tugasGrup.findIndex(t => t.id === newTugas.id) + 1;
        if (taskNumber > 0 && !newTugas.lampiran.length) {
            replyText += `\n\n_Tips: Untuk menambah lampiran, balas file/foto dengan "set lampiran ${taskNumber}"_`;
        }
        
        await replyWithTyping(sock, msg, replyText);
    }
};