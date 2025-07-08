const { getSortedTasks, MEDIA_DIR } = require('../../utils/taskUtils');
const path = require('path');
const fs = require('fs-extra');
const mime = require('mime-types');

module.exports = {
    name: 'ambil',
    aliases: ['ambillampiran'],
    description: 'Mengambil semua lampiran dari sebuah jadwal.',
    async execute(sock, msg, args) {
        const groupJid = msg.key.remoteJid;

        if (args.length !== 1 || isNaN(args[0])) {
            return sock.sendMessage(groupJid, { text: "Format salah. Gunakan `ambil [no jadwal]`.\nContoh: `ambil 1`" }, { quoted: msg });
        }
        
        const taskNumber = parseInt(args[0], 10);
        const tugasGrup = getSortedTasks(groupJid);
        if (taskNumber <= 0 || taskNumber > tugasGrup.length) {
            return sock.sendMessage(groupJid, { text: `❌ Jadwal dengan nomor ${taskNumber} tidak ditemukan.` }, { quoted: msg });
        }
        
        const tugas = tugasGrup[taskNumber - 1];
        if (!tugas.lampiran || tugas.lampiran.length === 0) {
            return sock.sendMessage(groupJid, { text: `Jadwal "${tugas.judul}" tidak memiliki lampiran.` }, { quoted: msg });
        }

        // 🔄 DIPERBARUI: Menggunakan `tugas.judul`
        await sock.sendMessage(groupJid, { text: `Mengirim ${tugas.lampiran.length} lampiran untuk jadwal "${tugas.judul}"...` }, { quoted: msg });

        for (const fileName of tugas.lampiran) {
            const filePath = path.join(MEDIA_DIR, groupJid, fileName);
            if (fs.existsSync(filePath)) {
                const mimeType = mime.lookup(filePath);
                
                // 🔄 DIPERBARUI: Menggunakan `tugas.judul`
                let messageOptions = { caption: `Lampiran untuk: ${tugas.judul}\nFile: ${fileName}`, fileName: fileName };
                
                if (mimeType && mimeType.startsWith('image/')) {
                    messageOptions.image = { url: filePath };
                } else if (mimeType && mimeType.startsWith('video/')) {
                    messageOptions.video = { url: filePath };
                } else {
                    messageOptions.document = { url: filePath };
                    messageOptions.mimetype = mimeType || 'application/octet-stream';
                }
                
                await sock.sendMessage(groupJid, messageOptions);
                await new Promise(res => setTimeout(res, 500)); // Jeda singkat
            } else {
                await sock.sendMessage(groupJid, { text: `⚠️ Maaf, file lampiran "${fileName}" tidak dapat ditemukan di server.` }, { quoted: msg });
            }
        }
    }
};