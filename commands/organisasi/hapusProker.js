const { getSortedProker, loadProker, saveProker, MEDIA_DIR } = require('../../utils/prokerUtils');
const path = require('path');
const fs = require('fs-extra');

module.exports = {
    name: 'hapus proker',
    aliases: ['deleteproker'],
    description: 'Menghapus proker.',
    async execute(sock, msg, args) {
        const groupJid = msg.key.remoteJid;

        if (args.length !== 1 || isNaN(args[0])) {
            return sock.sendMessage(groupJid, { text: "Format salah. Gunakan `hapus proker [nomor]`." }, { quoted: msg });
        }
        
        const prokerNumber = parseInt(args[0], 10);
        const prokerGrup = getSortedProker(groupJid); // Menggunakan fungsi dan variabel proker

        if (prokerNumber <= 0 || prokerNumber > prokerGrup.length) {
            return sock.sendMessage(groupJid, { text: `❌ Proker dengan nomor ${prokerNumber} tidak ditemukan.` }, { quoted: msg });
        }

        const prokerToDelete = prokerGrup[prokerNumber - 1];
        const allProker = loadProker();
        
        if (prokerToDelete.lampiran && prokerToDelete.lampiran.length > 0) {
            prokerToDelete.lampiran.forEach(fileName => {
                const filePath = path.join(MEDIA_DIR, groupJid, fileName);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }

        const prokerIndex = allProker[groupJid].findIndex(p => p.id === prokerToDelete.id);
        if (prokerIndex > -1) {
            allProker[groupJid].splice(prokerIndex, 1);
        }
        
        saveProker(allProker);
        await sock.sendMessage(groupJid, { text: `✅ Proker "${prokerToDelete.nama}" berhasil dihapus.` }, { quoted: msg });
    }
};