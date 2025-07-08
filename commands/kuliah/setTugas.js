const { getContentType, downloadContentFromMessage } = require('@whiskeysockets/baileys');
// 🔄 DIPERBARUI: Path require yang benar
const { loadTugas, saveTugas, parseIndonesianDate, getSortedTasks, MEDIA_DIR } = require('../../utils/taskUtils');
const { format } = require('date-fns');
const { id } = require('date-fns/locale');
const path = require('path');
const fs = require('fs-extra');
const mime = require('mime-types');

module.exports = {
    name: 'set tugas',
    aliases: ['settugas', 'set'],
    description: 'Menyimpan jadwal atau tugas baru.',
    async execute(sock, msg, args) { // Menambahkan 'args' agar konsisten
        const groupJid = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        if (!msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
            return sock.sendMessage(groupJid, { text: '❌ Perintah ini harus digunakan dengan membalas (reply) pesan.' }, { quoted: msg });
        }

        const quotedMsg = msg.message.extendedTextMessage.contextInfo.quotedMessage;
        const quotedText = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || quotedMsg.imageMessage?.caption || quotedMsg.videoMessage?.caption || quotedMsg.documentMessage?.caption || '';

        if (!quotedText) {
            return sock.sendMessage(groupJid, { text: '❌ Gagal! Pesan yang Anda balas tidak memiliki teks/caption.' }, { quoted: msg });
        }

        const lines = quotedText.split('\n');
        const judul = lines[0].trim();
        const deskripsi = lines.slice(1).join('\n').trim();
        const deadlineDate = parseIndonesianDate(quotedText);

        if (!judul || !deskripsi || !deadlineDate) {
            return sock.sendMessage(groupJid, { text: '❌ Gagal! Format tidak sesuai. Pastikan ada Judul, Deskripsi, dan Tenggat.' }, { quoted: msg });
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
        
        // 🔄 DIPERBARUI: Menambahkan 'yyyy' untuk menampilkan tahun
        let replyText = `✅ *Jadwal berhasil disimpan!*\n\n` +
                        `📘 *Judul:* ${newTugas.judul}\n` +
                        `📝 *Deskripsi:* ${newTugas.deskripsi}\n` +
                        `📅 *Tenggat:* ${format(deadlineDate, 'd MMMM yyyy, HH:mm', { locale: id })}\n` +
                        `📎 *Lampiran:* ${newTugas.lampiran.length > 0 ? newTugas.lampiran[0] : 'Tidak ada'}`;
        
        const tugasGrup = getSortedTasks(groupJid);
        const taskNumber = tugasGrup.findIndex(t => t.id === newTugas.id) + 1;
        if (taskNumber > 0) {
            replyText += `\n\n_Tips: Untuk menambah lampiran lain, balas file/foto dengan "set lampiran ${taskNumber}"_`;
        }
        await sock.sendMessage(groupJid, { text: replyText }, { quoted: msg });
    }
};