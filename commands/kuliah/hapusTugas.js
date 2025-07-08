const { getSortedTasks, loadTugas, saveTugas, MEDIA_DIR } = require('../../utils/taskUtils');
const path = require('path');
const fs = require('fs-extra');

module.exports = {
    name: 'hapus',
    aliases: ['delete', 'hapusjadwal'],
    description: 'Menghapus jadwal atau tugas.',
    async execute(sock, msg, args) {
        const groupJid = msg.key.remoteJid;

        if (args.length !== 1 || isNaN(args[0])) {
            return sock.sendMessage(groupJid, { text: "Format salah. Gunakan `hapus [nomor]`.\nContoh: `hapus 1`" }, { quoted: msg });
        }
        
        const taskNumber = parseInt(args[0], 10);
        const tugasGrup = getSortedTasks(groupJid);

        if (taskNumber <= 0 || taskNumber > tugasGrup.length) {
            return sock.sendMessage(groupJid, { text: `❌ Item dengan nomor ${taskNumber} tidak ditemukan.` }, { quoted: msg });
        }

        const tugasToDelete = tugasGrup[taskNumber - 1];
        const allTugas = loadTugas();
        
        if (tugasToDelete.lampiran && tugasToDelete.lampiran.length > 0) {
            tugasToDelete.lampiran.forEach(fileName => {
                const filePath = path.join(MEDIA_DIR, groupJid, fileName);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`File lampiran dihapus: ${filePath}`);
                }
            });
        }

        const tugasIndex = allTugas[groupJid].findIndex(t => t.id === tugasToDelete.id);
        if (tugasIndex > -1) {
            allTugas[groupJid].splice(tugasIndex, 1);
        }
        
        saveTugas(allTugas);
        
        // 🔄 DIPERBARUI: Menggunakan tugas.judul
        await sock.sendMessage(groupJid, { text: `✅ Item "${tugasToDelete.judul}" berhasil dihapus.` }, { quoted: msg });
    }
};