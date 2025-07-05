const { getContentType, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { loadProker, saveProker, parseIndonesianDate } = require('../../utils/prokerUtils');
const { format } = require('date-fns');
const { id } = require('date-fns/locale');
const path = require('path');
const fs = require('fs-extra');
const mime = require('mime-types');

module.exports = {
    name: 'set proker',
    description: 'Menyimpan program kerja baru.',
    async execute(sock, msg) {
        const groupJid = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        if (!msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
            return sock.sendMessage(groupJid, { text: '❌ Perintah ini harus digunakan dengan membalas (reply) pesan.' }, { quoted: msg });
        }

        const quotedMsg = msg.message.extendedTextMessage.contextInfo.quotedMessage;
        const quotedText = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || quotedMsg.imageMessage?.caption || quotedMsg.videoMessage?.caption || quotedMsg.documentMessage?.caption || '';

        if (!quotedText) return sock.sendMessage(groupJid, { text: '❌ Gagal! Pesan yang Anda balas tidak memiliki teks/caption proker.' }, { quoted: msg });
        
        const lines = quotedText.split('\n');
        const namaProker = lines[0].trim();
        const detailProker = lines.slice(1).join('\n').trim();
        const tanggalPelaksanaan = parseIndonesianDate(quotedText);

        if (!namaProker || !detailProker || !tanggalPelaksanaan) return sock.sendMessage(groupJid, { text: '❌ Gagal! Format proker tidak sesuai. Pastikan ada Nama Proker, Detail/PJ, dan Tanggal Pelaksanaan.' }, { quoted: msg });
        
        const tanggal = tanggalPelaksanaan.toISOString();
        const allProker = loadProker();
        if (!allProker[groupJid]) allProker[groupJid] = [];
        
        const newProker = {
            id: Date.now(),
            nama: namaProker,
            detail: detailProker,
            tanggal: tanggal,
            lampiran: [],
            pengingat: { '7d': false, '3d': false, '1d': false },
            ditambahkanOleh: sender
        };

        // Logika unduh lampiran (jika ada)
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
                    newProker.lampiran.push(fileName);
                }
            } catch (err) { console.error('Gagal mengunduh lampiran proker:', err); }
        }

        allProker[groupJid].push(newProker);
        saveProker(allProker);
        
        let replyText = `✅ *Proker berhasil dicatat!*\n\n` +
                        `🗓️ *Nama Proker:* ${newProker.nama}\n` +
                        `📝 *Detail/PJ:* ${newProker.detail}\n` +
                        `⏰ *Tanggal:* ${format(tanggalPelaksanaan, 'EEEE, d MMMM yyyy, HH:mm', { locale: id })}`;
        
        await sock.sendMessage(groupJid, { text: replyText }, { quoted: msg });
    }
};